"""
add_sarees.py — Auto-generate catalog rows from saree images.

You drop new saree photos into `catalog/incoming/`, optionally pair them with
prices, and this script does the boring part:

  1. Reads every image in catalog/incoming/
  2. Asks Claude (vision) to look at the photo and return a structured JSON
     row matching the catalog schema — name, fabric, colors, pattern,
     occasion, border, description.
  3. Assigns the next sequential PP### id, renames the image to <id>.<ext>,
     and moves it into catalog/images/.
  4. Appends a row to catalog/catalog.csv.
  5. Optionally re-runs embed_catalog.py so the FAISS index picks up the
     new sarees.

Prices
------
The model cannot reliably guess price, so you provide it. In priority order:

  1. catalog/incoming/prices.csv  (columns: filename,price)
  2. --default-price <int>        (applied to every image without a row)
  3. Interactive prompt           (only if neither of the above covers it)

Usage
-----
  # Drop sarees in catalog/incoming/, then:
  export ANTHROPIC_API_KEY=sk-ant-...
  python add_sarees.py --default-price 2500

  # Dry run (no files written, no CSV touched):
  python add_sarees.py --default-price 2500 --dry-run

  # Skip the FAISS rebuild (do it manually later):
  python add_sarees.py --default-price 2500 --no-rebuild

  # Keep the originals in catalog/incoming/ (don't move them):
  python add_sarees.py --default-price 2500 --keep-incoming

Environment
-----------
  ANTHROPIC_API_KEY   required
  ANTHROPIC_MODEL     optional, defaults to claude-sonnet-4-5
"""

from __future__ import annotations

import argparse
import base64
import csv
import json
import mimetypes
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

try:
    from anthropic import Anthropic
except ImportError:
    sys.exit(
        "Missing dependency: anthropic.\n"
        "Install it with:  pip install anthropic\n"
        "(or:  pip install -r requirements.txt)"
    )

# ---------------------------------------------------------------------------
# Paths and constants

ROOT = Path(__file__).resolve().parent
CATALOG_CSV = ROOT / "catalog" / "catalog.csv"
IMAGES_DIR = ROOT / "catalog" / "images"
INCOMING_DIR = ROOT / "catalog" / "incoming"
PRICES_CSV = INCOMING_DIR / "prices.csv"
EMBED_SCRIPT = ROOT / "embed_catalog.py"

DEFAULT_MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-6")

# CSV columns — must exactly match the existing catalog.csv header
CSV_COLUMNS = [
    "id",
    "filename",
    "name",
    "product_line",
    "fabric",
    "primary_color",
    "secondary_color",
    "pattern",
    "occasion",
    "border_style",
    "blouse_included",
    "price",
    "description",
]

# Which keys we ask the LLM to produce (everything except id/filename/price,
# which the script handles itself).
LLM_KEYS = [
    "name",
    "product_line",
    "fabric",
    "primary_color",
    "secondary_color",
    "pattern",
    "occasion",
    "border_style",
    "blouse_included",
    "description",
]

ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".webp"}

# ---------------------------------------------------------------------------
# Prompt — the schema description + few-shot examples lifted from the
# existing catalog so new rows match the house style.

SYSTEM_PROMPT = """You are a meticulous textile cataloger for an Indian saree
brand called Pazhamozhi Pattu. You look at a single saree photograph and
output a strict JSON object describing it for a product catalog. You never
include any commentary, never wrap the JSON in markdown fences, and never
output anything outside the JSON object.

Output schema (all values are strings except blouse_included which is "yes"
or "no"):

{
  "name":            "Short, evocative product title (3-9 words). Mention the
                      hero colour and fabric. Example: 'Mauve Pink Black and
                      Maroon Silk Saree'.",
  "product_line":    "snake_case product family. Use 'kanjivaram_silk' for
                      heavy silk weaves, 'printed_linen' for casual linens
                      with prints, 'cotton_handloom' for plain cottons,
                      'organza' for sheer organza, 'banarasi_silk' for
                      Banarasi-style. If unsure, pick the closest match — do
                      NOT invent a new family unless the saree clearly
                      doesn't fit any of the above.",
  "fabric":          "One word: silk, linen, cotton, organza, georgette,
                      chiffon, etc.",
  "primary_color":   "snake_case dominant body colour. Examples: black,
                      mauve_pink, sky_blue, yellow, maroon, olive_green.",
  "secondary_color": "snake_case secondary / pallu / contrast colour. Same
                      naming style. If multiple, join with underscores:
                      'yellow_gold' or 'black_maroon_gold'.",
  "pattern":         "snake_case pattern descriptor. Examples:
                      zari_floral_motif, zari_butta, flamingo_tropical_print,
                      temple_border, paisley_butta, plain.",
  "occasion":        "One of: wedding, festive, casual, office, party,
                      everyday.",
  "border_style":    "snake_case border descriptor. Examples:
                      gold_zari_heavy, silver_zari_light, plain_self,
                      contrast_temple, gold_zari_medium.",
  "blouse_included": "'yes' if a blouse piece is visibly part of the saree
                      set or contrast blouse is shown; otherwise 'no'.",
  "description":     "2-4 sentence product description in the brand's
                      voice — warm, specific, and grounded in what's
                      actually visible. Mention fabric, the colours, the
                      border, and one or two occasions it suits. Avoid
                      hyperbole, avoid prices, avoid first-person."
}

Style guide from the existing catalog (match this voice):

- "Stunning black and yellow Kanjivaram silk saree with rich gold zari work.
   Features traditional floral motifs throughout the body and an elaborate
   gold zari border with intricate paisley and floral patterns. The yellow
   pallu contrasts beautifully with the black body. Perfect for weddings and
   grand festive occasions."

- "Breezy sky blue linen saree featuring playful pink flamingo and tropical
   foliage prints. Comes with a contrasting pink printed blouse piece. Light
   silver zari border. Perfect for daytime casual outings, brunches, office
   wear, and summer events."

Return ONLY the JSON object. Nothing else."""

USER_PROMPT = (
    "Analyse this saree photo and return the JSON object exactly as "
    "specified. Be precise about what you can actually see — do not invent "
    "details that aren't visible in the image."
)

# ---------------------------------------------------------------------------
# Helpers


def log(msg: str) -> None:
    print(msg, flush=True)


def next_id(existing_ids: list[str]) -> str:
    """Return the next PP### id after the highest one already in the CSV."""
    max_n = 0
    for pid in existing_ids:
        m = re.match(r"PP(\d+)$", pid.strip())
        if m:
            n = int(m.group(1))
            if n > max_n:
                max_n = n
    return f"PP{max_n + 1:03d}"


def read_existing_ids() -> list[str]:
    if not CATALOG_CSV.exists():
        return []
    with CATALOG_CSV.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return [row["id"] for row in reader if row.get("id")]


def load_prices_csv() -> dict[str, int]:
    """Read catalog/incoming/prices.csv if present. Returns {filename: price}."""
    if not PRICES_CSV.exists():
        return {}
    prices: dict[str, int] = {}
    with PRICES_CSV.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            fname = (row.get("filename") or "").strip()
            price_raw = (row.get("price") or "").strip()
            if not fname or not price_raw:
                continue
            try:
                prices[fname] = int(float(price_raw))
            except ValueError:
                log(f"  ! prices.csv: skipping bad row for {fname!r} (price={price_raw!r})")
    return prices


def resolve_price(
    filename: str,
    prices_map: dict[str, int],
    default_price: int | None,
    interactive: bool,
) -> int | None:
    """Decide what price to use for a given incoming image."""
    if filename in prices_map:
        return prices_map[filename]
    if default_price is not None:
        return default_price
    if interactive:
        while True:
            raw = input(f"  ? Price (INR) for {filename}: ").strip()
            if not raw:
                log("    (skipping — no price entered)")
                return None
            try:
                return int(float(raw))
            except ValueError:
                log("    Not a number, try again.")
    return None


def encode_image_b64(path: Path) -> tuple[str, str]:
    """Return (base64_data, media_type) for the Anthropic image content block."""
    media_type, _ = mimetypes.guess_type(path.name)
    if media_type is None:
        # Fall back based on extension
        ext = path.suffix.lower()
        media_type = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp",
        }.get(ext, "image/jpeg")
    data = base64.standard_b64encode(path.read_bytes()).decode("ascii")
    return data, media_type


def extract_json_object(text: str) -> dict:
    """Pull the first {...} JSON object out of model output, even if wrapped."""
    # Fast path — straight JSON
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    # Strip ```json fences if present
    fenced = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.S)
    if fenced:
        return json.loads(fenced.group(1))
    # Greedy outermost braces
    first = text.find("{")
    last = text.rfind("}")
    if first != -1 and last != -1 and last > first:
        return json.loads(text[first : last + 1])
    raise ValueError("Model output did not contain a JSON object")


def validate_row(row: dict) -> tuple[bool, str]:
    """Check that the LLM returned every required key and they're plausible."""
    missing = [k for k in LLM_KEYS if k not in row or row[k] is None]
    if missing:
        return False, f"missing keys: {', '.join(missing)}"
    if row.get("blouse_included") not in ("yes", "no"):
        return False, f"blouse_included must be 'yes' or 'no', got {row.get('blouse_included')!r}"
    if len(str(row.get("description", "")).strip()) < 30:
        return False, "description is suspiciously short"
    return True, ""


def call_claude(client: Anthropic, model: str, image_path: Path) -> dict:
    """Send one image to Claude and parse the JSON it returns."""
    b64, media_type = encode_image_b64(image_path)
    resp = client.messages.create(
        model=model,
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": b64,
                        },
                    },
                    {"type": "text", "text": USER_PROMPT},
                ],
            }
        ],
    )
    # Concatenate all text blocks the model returned
    text = "".join(
        block.text for block in resp.content if getattr(block, "type", None) == "text"
    )
    if not text.strip():
        raise ValueError("Model returned no text content")
    return extract_json_object(text)


def list_incoming() -> list[Path]:
    if not INCOMING_DIR.exists():
        return []
    return sorted(
        p
        for p in INCOMING_DIR.iterdir()
        if p.is_file() and p.suffix.lower() in ALLOWED_EXTS
    )


# ---------------------------------------------------------------------------
# Main


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Generate catalog rows for new saree images using Claude vision.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--default-price",
        type=int,
        default=None,
        help="Price (INR) applied to any image not listed in prices.csv.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print what would happen but don't write CSV or move files.",
    )
    parser.add_argument(
        "--keep-incoming",
        action="store_true",
        help="Don't move processed images out of catalog/incoming/.",
    )
    parser.add_argument(
        "--no-rebuild",
        action="store_true",
        help="Skip running embed_catalog.py at the end.",
    )
    parser.add_argument(
        "--non-interactive",
        action="store_true",
        help="Fail (rather than prompt) when a price is missing.",
    )
    parser.add_argument(
        "--model",
        default=DEFAULT_MODEL,
        help=f"Anthropic model to use (default: {DEFAULT_MODEL}).",
    )
    args = parser.parse_args()

    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        log("ERROR: ANTHROPIC_API_KEY is not set in your environment.")
        log("       Get a key from https://console.anthropic.com/ and either")
        log("       `export ANTHROPIC_API_KEY=sk-ant-...` or add it to .env.")
        return 1

    INCOMING_DIR.mkdir(parents=True, exist_ok=True)
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    incoming = list_incoming()
    if not incoming:
        log(f"No images found in {INCOMING_DIR.relative_to(ROOT)}/")
        log("Drop .jpg / .jpeg / .png / .webp files in there and re-run.")
        return 0

    prices_map = load_prices_csv()
    log(f"Found {len(incoming)} image(s) in catalog/incoming/")
    if prices_map:
        log(f"  prices.csv covers {len(prices_map)} of them")
    if args.default_price is not None:
        log(f"  default price for the rest: ₹{args.default_price}")

    client = Anthropic(api_key=api_key)
    existing_ids = read_existing_ids()

    log(f"\nUsing model: {args.model}")
    log("Generating catalog rows...\n")

    new_rows: list[dict] = []
    moves: list[tuple[Path, Path]] = []  # (src, dst) for images to move

    for idx, src_path in enumerate(incoming, start=1):
        log(f"[{idx}/{len(incoming)}] {src_path.name}")

        price = resolve_price(
            src_path.name,
            prices_map,
            args.default_price,
            interactive=not args.non_interactive,
        )
        if price is None:
            log(f"  -> skipped (no price available)")
            continue

        try:
            raw = call_claude(client, args.model, src_path)
        except Exception as e:
            log(f"  -> Claude call failed: {e}")
            continue

        ok, why = validate_row(raw)
        if not ok:
            log(f"  -> invalid LLM output ({why}); skipping")
            log(f"     raw: {json.dumps(raw, ensure_ascii=False)[:200]}...")
            continue

        # Reserve an ID and a destination filename
        new_id = next_id(existing_ids + [r["id"] for r in new_rows])
        ext = src_path.suffix.lower()
        if ext == ".jpg":
            ext = ".jpeg"  # match existing naming convention
        new_filename = f"{new_id}{ext}"

        row = {
            "id": new_id,
            "filename": new_filename,
            "name": raw["name"].strip(),
            "product_line": raw["product_line"].strip(),
            "fabric": raw["fabric"].strip(),
            "primary_color": raw["primary_color"].strip(),
            "secondary_color": raw["secondary_color"].strip(),
            "pattern": raw["pattern"].strip(),
            "occasion": raw["occasion"].strip(),
            "border_style": raw["border_style"].strip(),
            "blouse_included": raw["blouse_included"].strip(),
            "price": price,
            "description": " ".join(raw["description"].split()).strip(),
        }
        new_rows.append(row)
        moves.append((src_path, IMAGES_DIR / new_filename))

        log(f"  -> {new_id}: {row['name']}")
        log(f"     fabric={row['fabric']}, colors={row['primary_color']}/{row['secondary_color']},")
        log(f"     occasion={row['occasion']}, pattern={row['pattern']}, price=₹{price}")

    if not new_rows:
        log("\nNothing to write — every image was skipped.")
        return 1

    log(f"\n{len(new_rows)} new row(s) ready.")

    if args.dry_run:
        log("\n--dry-run set — NOT writing catalog.csv, NOT moving images.")
        log("Here's what would land in catalog.csv:\n")
        for row in new_rows:
            log(f"  {row['id']},{row['filename']},{row['name']},...,₹{row['price']}")
        return 0

    # Append to catalog.csv
    csv_existed = CATALOG_CSV.exists()
    CATALOG_CSV.parent.mkdir(parents=True, exist_ok=True)
    with CATALOG_CSV.open("a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS, quoting=csv.QUOTE_MINIMAL)
        if not csv_existed:
            writer.writeheader()
        for row in new_rows:
            writer.writerow(row)
    log(f"Appended {len(new_rows)} row(s) to {CATALOG_CSV.relative_to(ROOT)}")

    # Move (or copy, if --keep-incoming) images
    for src, dst in moves:
        if args.keep_incoming:
            shutil.copy2(src, dst)
        else:
            shutil.move(str(src), str(dst))
    verb = "Copied" if args.keep_incoming else "Moved"
    log(f"{verb} {len(moves)} image(s) into {IMAGES_DIR.relative_to(ROOT)}/")

    # Rebuild FAISS index unless told not to
    if args.no_rebuild:
        log("\n--no-rebuild set — skipping FAISS index rebuild.")
        log(f"Run it manually when ready:  python {EMBED_SCRIPT.name}")
    else:
        log("\nRebuilding FAISS index (this takes a minute on CPU)...")
        rc = subprocess.call([sys.executable, str(EMBED_SCRIPT)], cwd=str(ROOT))
        if rc != 0:
            log(f"embed_catalog.py exited with code {rc} — index may be stale.")
            return rc

    log("\nDone. Don't forget to commit:")
    log("  git add catalog/catalog.csv catalog/images/ catalog/saree_index.faiss catalog/saree_metadata.pkl")
    log('  git commit -m "Add new sarees"')
    log("  git push")
    return 0


if __name__ == "__main__":
    sys.exit(main())
