import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import argparse
import pickle
import numpy as np
import torch
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import faiss

INDEX_FILE = "catalog/saree_index.faiss"
METADATA_FILE = "catalog/saree_metadata.pkl"
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


def load_model():
    print("Loading CLIP model...")
    model = CLIPModel.from_pretrained(MODEL_NAME)
    processor = CLIPProcessor.from_pretrained(MODEL_NAME)
    model.eval()
    return model, processor


def load_index():
    if not os.path.exists(INDEX_FILE):
        raise FileNotFoundError(f"Index not found. Run embed_catalog.py first.")
    index = faiss.read_index(INDEX_FILE)
    with open(METADATA_FILE, "rb") as f:
        metadata = pickle.load(f)
    return index, metadata


def embed_text(model, processor, text):
    inputs = processor(text=[text], return_tensors="pt",
                       padding=True, truncation=True, max_length=77)
    with torch.no_grad():
        features = model.get_text_features(**inputs)
        features = extract_tensor(features)
        features = torch.nn.functional.normalize(features, dim=-1)
    return features.squeeze().numpy().astype("float32")


def embed_image(model, processor, image_path):
    image = Image.open(image_path).convert("RGB")
    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        features = model.get_image_features(**inputs)
        features = extract_tensor(features)
        features = torch.nn.functional.normalize(features, dim=-1)
    return features.squeeze().numpy().astype("float32")


def search(query_vec, index, metadata, top_k=5):
    query_vec = query_vec.reshape(1, -1)
    scores, indices = index.search(query_vec, top_k)
    return [{"score": float(s), "saree": metadata[i]} for s, i in zip(scores[0], indices[0])]


def print_results(results):
    print(f"\nTop {len(results)} matches:\n")
    for i, r in enumerate(results, 1):
        s = r["saree"]
        print(f"  {i}. {s['name']}")
        print(f"     ID: {s['id']} | Fabric: {s['fabric']} | Color: {s['primary_color']} | Occasion: {s['occasion']}")
        print(f"     Price: Rs {s['price']} | Score: {r['score']:.3f}")
        print(f"     Image: {s['filename']}\n")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--text", type=str)
    parser.add_argument("--image", type=str)
    parser.add_argument("--top-k", type=int, default=5)
    args = parser.parse_args()

    if not args.text and not args.image:
        parser.error("Provide either --text or --image")

    model, processor = load_model()
    index, metadata = load_index()

    if args.text:
        print(f"\nSearching for: '{args.text}'")
        query_vec = embed_text(model, processor, args.text)
    else:
        print(f"\nSearching with image: {args.image}")
        query_vec = embed_image(model, processor, args.image)

    print_results(search(query_vec, index, metadata, top_k=args.top_k))


if __name__ == "__main__":
    main()
