"""
tests/test_api.py
-----------------
Smoke tests for the FastAPI service. Loads the app in-process via
fastapi.testclient — no separate uvicorn process needed.

Run from the repo root:
    pytest tests/

These tests load the real CLIP model and FAISS index, so the first run
takes ~10-20 s while the model downloads / loads into memory.
"""

import os

# Mirror the runtime quirk fix from the other scripts before any heavy imports.
os.environ.setdefault("KMP_DUPLICATE_LIB_OK", "TRUE")

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

REPO_ROOT = Path(__file__).resolve().parent.parent

# api.py uses relative paths ("catalog/saree_index.faiss"), so it expects to be
# imported with the repo root as the cwd. Switch before importing.
os.chdir(REPO_ROOT)

from api import app  # noqa: E402  (intentional: import after chdir)

KANJIVARAM_IDS = {"PP001", "PP002", "PP003", "PP004"}
EXPECTED_CATALOG_SIZE = 13


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert body["indexed_sarees"] == EXPECTED_CATALOG_SIZE


def test_root(client):
    r = client.get("/")
    assert r.status_code == 200
    body = r.json()
    assert body["service"] == "Pazhamozhi Pattu AI"
    assert body["indexed_sarees"] == EXPECTED_CATALOG_SIZE


def test_search_text_returns_kanjivaram_for_wedding_query(client):
    r = client.post(
        "/search/text",
        json={"query": "wedding silk saree with gold zari border", "top_k": 5},
    )
    assert r.status_code == 200
    results = r.json()
    assert len(results) == 5
    top = results[0]
    assert top["id"] in KANJIVARAM_IDS, (
        f"expected a Kanjivaram top hit for a wedding-silk query, got {top['id']}"
    )
    # image_url should be the served path for the matched filename
    assert top["image_url"] == f"/image/{top['filename']}"


def test_search_image_returns_self_as_top_hit(client):
    img_path = REPO_ROOT / "catalog" / "images" / "PP001.jpeg"
    assert img_path.exists(), f"missing test fixture: {img_path}"
    with open(img_path, "rb") as f:
        r = client.post(
            "/search/image",
            files={"file": ("PP001.jpeg", f, "image/jpeg")},
            data={"top_k": "5"},
        )
    assert r.status_code == 200
    results = r.json()
    assert len(results) == 5
    assert results[0]["id"] == "PP001", (
        f"expected self-match PP001 as top hit, got {results[0]['id']}"
    )


def test_search_image_rejects_non_image(client):
    r = client.post(
        "/search/image",
        files={"file": ("notes.txt", b"hello", "text/plain")},
    )
    assert r.status_code == 400


def test_image_endpoint_serves_jpeg(client):
    r = client.get("/image/PP001.jpeg")
    assert r.status_code == 200
    assert r.headers["content-type"].startswith("image/")


def test_image_endpoint_404_on_missing(client):
    r = client.get("/image/PP999.jpeg")
    assert r.status_code == 404


def test_image_endpoint_rejects_path_traversal(client):
    # Direct slash is rejected by the explicit guard in api.py
    r = client.get("/image/..%2Fapi.py")
    # FastAPI/Starlette decodes %2F before routing, so this hits the
    # "/" check in the handler. Either 400 (caught by guard) or 404
    # (treated as missing) is acceptable — the must-not is leaking api.py.
    assert r.status_code in (400, 404)
    if r.status_code == 200:
        assert b"FastAPI" not in r.content
