# Pazhamozhi AI

AI tooling for **Pazhamozhi Pattu** (പഴമൊഴി പട്ടു), 
a saree and ethnic wear brand rooted in heritage. 
Built in public.

## Why this exists

Ethnic wear ecommerce is stuck in 2015 — generic search, no 
personalization, no understanding of fabric or occasion. 
I run the brand and I'm an AI engineer, so I'm closing that gap.

## What's working today

✅ **Semantic text search** — natural language queries return matching sarees  
   Example: `"wedding silk saree with gold zari border"` → finds Kanjivaram silks

✅ **Visual similarity search** — upload a saree image, find similar pieces  
   Example: upload an inspiration photo → returns the closest matches in catalog

✅ **Combined image + text embeddings** (60% visual, 40% textual weighting)

✅ **Local FAISS index** — fast, no API costs, runs on a laptop

✅ **FastAPI web service** wrapping the search with `/search/text`, `/search/image`, `/health`

## Coming next

- [ ] Search UI on the live store website
- [ ] WhatsApp AI assistant for fabric / blouse / shipping questions
- [ ] Auto-generated product descriptions in English, Malayalam, Tamil

## How to run

### Search from the CLI

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Search by text
python search.py --text "wedding silk with gold border"

# Search by image
python search.py --image catalog/images/PP001.jpeg --top-k 5
```

The FAISS index (`catalog/saree_index.faiss` + `catalog/saree_metadata.pkl`)
is committed, so it works out of the box. If you edit `catalog/catalog.csv`
or any image, regenerate it:

```bash
python embed_catalog.py
git add catalog/saree_index.faiss catalog/saree_metadata.pkl
```

### Add new sarees to the catalog (auto-generated metadata)

Typing fabric / colour / occasion / description for every new saree is
the slowest part of the workflow, so `add_sarees.py` does it via
Claude's vision API. Drop photos in `catalog/incoming/`, give it a
price, and it generates the catalog row for you.

```bash
# One-time:
export ANTHROPIC_API_KEY=sk-ant-...   # from https://console.anthropic.com/

# Each time you have new sarees:
cp my_new_sarees/*.jpeg catalog/incoming/

# Easiest — same price for the whole batch:
python add_sarees.py --default-price 2500

# Or — per-image prices via catalog/incoming/prices.csv
#   (see catalog/incoming/prices.csv.example for the format)
python add_sarees.py

# Preview without writing anything:
python add_sarees.py --default-price 2500 --dry-run
```

What it does, in order: looks at each image with Claude, generates
`name`, `fabric`, colours, `pattern`, `occasion`, `border_style`,
`blouse_included`, and a 2-4 sentence `description`; assigns the next
`PP###` id; moves the image into `catalog/images/`; appends the row to
`catalog/catalog.csv`; reruns `embed_catalog.py` so the FAISS index
picks up the new sarees. Commit the changes and push — the deploy
serves the new sarees on its next restart.

### Run the API locally

```bash
uvicorn api:app --reload --port 8000

# Then open http://localhost:8000/docs for the interactive Swagger UI.
```

### Run the test suite

```bash
pip install pytest
pytest tests/ -v
```

## Deploy

A Render Blueprint (`render.yaml`) is included for free-tier deploy.
After connecting the repo at <https://dashboard.render.com> → New →
Blueprint, the service builds with CLIP weights preloaded into the
build cache and exposes the same `/health`, `/search/text`,
`/search/image`, `/image/{filename}` endpoints publicly.

Live URL: <https://pazhamozhi-api.onrender.com>

Try it: <https://pazhamozhi-api.onrender.com/docs> — interactive Swagger UI for `/search/text`, `/search/image`, `/health`, and `/image/{filename}`. First request after a quiet period takes ~30 s while Render wakes the free-tier dyno.

## Frontend (search demo)

A React + Vite single-page demo lives in `frontend/`. It calls the
deployed API and renders results as a grid of saree cards, with text
search, example query chips, and drag-and-drop image search.

### Run locally

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

The app reads its API URL from `VITE_API_URL` (defaults to the live
Render URL above). To point at a local API, copy `.env.example` to
`.env.local` and edit.

### Build for production

```bash
cd frontend
npm run build       # outputs to frontend/dist/
```

### Deploy

Two paths, pick whichever fits your existing Netlify setup:

**Path A — drop into your existing Pazhamozhi Pattu Netlify site.**
After `npm run build`, copy `frontend/dist/*` into your existing
site's project at `/ai-search/` (or wherever you want it routed) and
redeploy. The Vite config uses `base: './'` so relative asset paths
work at any subpath.

**Path B — deploy `frontend/` as its own Netlify site.** A
`frontend/netlify.toml` is included; in Netlify, "Add new site → Import
existing project → this repo" with base directory `frontend` will
build and publish automatically. Set `VITE_API_URL` in the site's
environment variables.

## Current status

Week 2 — search API live, frontend ready to ship.

## Tech stack

Python · CLIP / SigLIP · FAISS · FastAPI · Netlify (frontend)

## Follow along

- Updates: [LinkedIn](#) *(add your link)*
- Store: [Instagram](#) · [Website](#) *(add your links)*

## License

MIT
