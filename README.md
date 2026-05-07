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

## Coming next

- [ ] FastAPI web service wrapping the search
- [ ] Search UI on the live store website
- [ ] WhatsApp AI assistant for fabric / blouse / shipping questions
- [ ] Auto-generated product descriptions in English, Malayalam, Tamil

## How to run

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# One-time: build the index
python embed_catalog.py

# Search by text
python search.py --text "wedding silk with gold border"

# Search by image
python search.py --image catalog/images/PP001.jpeg --top-k 5
```

## Current status

Week 1 — setting up the catalog embedding pipeline.

## Tech stack

Python · CLIP / SigLIP · FAISS · FastAPI · Netlify (frontend)

## Follow along

- Updates: [LinkedIn](#) *(add your link)*
- Store: [Instagram](#) · [Website](#) *(add your links)*

## License

MIT
