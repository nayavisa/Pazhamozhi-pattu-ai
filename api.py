"""
api.py
------
FastAPI web service that wraps the saree search.

Endpoints:
- GET  /              → API info
- GET  /health        → health check
- POST /search/text   → text query, returns top-k matches
- POST /search/image  → image upload, returns top-k matches
- GET  /image/{filename} → serve catalog images

Run locally:
    uvicorn api:app --reload --port 8000
"""

import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import io
import logging
import pickle
import time
from typing import Optional

import faiss
import numpy as np
import torch
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from PIL import Image
from pydantic import BaseModel
from transformers import CLIPModel, CLIPProcessor

LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger("pazhamozhi")


def _parse_origins(raw: str) -> list[str]:
    """Parse a comma-separated ALLOWED_ORIGINS env value. Empty / unset → ['*']."""
    items = [o.strip() for o in raw.split(",") if o.strip()]
    return items or ["*"]


ALLOWED_ORIGINS = _parse_origins(os.environ.get("ALLOWED_ORIGINS", "*"))

INDEX_FILE = "catalog/saree_index.faiss"
METADATA_FILE = "catalog/saree_metadata.pkl"
IMAGES_DIR = "catalog/images"
MODEL_NAME = "openai/clip-vit-base-patch32"


def extract_tensor(features):
    if isinstance(features, torch.Tensor):
        return features
    if hasattr(features, "pooler_output") and features.pooler_output is not None:
        return features.pooler_output
    if hasattr(features, "last_hidden_state"):
        return features.last_hidden_state.mean(dim=1)
    if hasattr(features, "image_embeds"):
        return features.image_embeds
    if hasattr(features, "text_embeds"):
        return features.text_embeds
    raise ValueError(f"Cannot extract tensor from {type(features)}")


# ============================================
# Load model + index ONCE at startup
# ============================================
print("Loading CLIP model...")
model = CLIPModel.from_pretrained(MODEL_NAME)
processor = CLIPProcessor.from_pretrained(MODEL_NAME)
model.eval()

print("Loading FAISS index...")
if not os.path.exists(INDEX_FILE):
    raise FileNotFoundError(
        f"Index not found at {INDEX_FILE}. Run `python embed_catalog.py` first."
    )
index = faiss.read_index(INDEX_FILE)
with open(METADATA_FILE, "rb") as f:
    metadata = pickle.load(f)

print(f"API ready. {index.ntotal} sarees indexed.")


# ============================================
# FastAPI app
# ============================================
app = FastAPI(
    title="Pazhamozhi Pattu AI",
    description="Semantic + visual search for saree catalog",
    version="0.1.0",
)

# CORS: open by default, tighten via ALLOWED_ORIGINS env var in production.
# Example: ALLOWED_ORIGINS="https://pazhamozhipattu.com,https://www.pazhamozhipattu.com"
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)
logger.info("CORS allow_origins=%s log_level=%s", ALLOWED_ORIGINS, LOG_LEVEL)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log every request as: METHOD path -> status (Xms)."""
    start = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - start) * 1000
    logger.info(
        "%s %s -> %d (%.0fms)",
        request.method,
        request.url.path,
        response.status_code,
        elapsed_ms,
    )
    return response


class TextSearchRequest(BaseModel):
    query: str
    top_k: int = 5


class SearchResult(BaseModel):
    score: float
    id: str
    name: str
    fabric: str
    primary_color: str
    occasion: str
    price: float
    filename: str
    image_url: str
    description: str


def search_index(query_vec: np.ndarray, top_k: int = 5):
    query_vec = query_vec.reshape(1, -1).astype("float32")
    scores, indices = index.search(query_vec, top_k)
    results = []
    for score, idx in zip(scores[0], indices[0]):
        s = metadata[idx]
        results.append(SearchResult(
            score=float(score),
            id=s["id"],
            name=s["name"],
            fabric=s["fabric"],
            primary_color=s["primary_color"],
            occasion=s["occasion"],
            price=float(s["price"]),
            filename=s["filename"],
            image_url=f"/image/{s['filename']}",
            description=s["description"],
        ))
    return results


@app.get("/")
def root():
    return {
        "service": "Pazhamozhi Pattu AI",
        "version": "0.1.0",
        "indexed_sarees": index.ntotal,
        "endpoints": [
            "GET /health",
            "POST /search/text",
            "POST /search/image",
            "GET /image/{filename}",
        ],
    }


@app.get("/health")
def health():
    return {"status": "ok", "indexed_sarees": index.ntotal}


@app.post("/search/text", response_model=list[SearchResult])
def search_text(req: TextSearchRequest):
    start = time.perf_counter()
    inputs = processor(text=[req.query], return_tensors="pt",
                       padding=True, truncation=True, max_length=77)
    with torch.no_grad():
        features = model.get_text_features(**inputs)
        features = extract_tensor(features)
        features = torch.nn.functional.normalize(features, dim=-1)
    results = search_index(features.squeeze().numpy(), top_k=req.top_k)
    elapsed_ms = (time.perf_counter() - start) * 1000
    if results:
        logger.info(
            "search/text query=%r top=%s score=%.3f (%.0fms)",
            req.query, results[0].id, results[0].score, elapsed_ms,
        )
    else:
        logger.info("search/text query=%r no_results (%.0fms)", req.query, elapsed_ms)
    return results


@app.post("/search/image", response_model=list[SearchResult])
async def search_image(
    file: UploadFile = File(...),
    top_k: int = Form(5),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image: {e}")

    start = time.perf_counter()
    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        features = model.get_image_features(**inputs)
        features = extract_tensor(features)
        features = torch.nn.functional.normalize(features, dim=-1)
    results = search_index(features.squeeze().numpy(), top_k=top_k)
    elapsed_ms = (time.perf_counter() - start) * 1000
    if results:
        logger.info(
            "search/image filename=%r bytes=%d top=%s score=%.3f (%.0fms)",
            file.filename, len(contents), results[0].id, results[0].score, elapsed_ms,
        )
    else:
        logger.info(
            "search/image filename=%r bytes=%d no_results (%.0fms)",
            file.filename, len(contents), elapsed_ms,
        )
    return results


@app.get("/image/{filename}")
def get_image(filename: str):
    # Basic safety: prevent path traversal
    if "/" in filename or ".." in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    path = os.path.join(IMAGES_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(path)
