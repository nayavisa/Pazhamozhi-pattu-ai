import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

import pandas as pd
import numpy as np
import torch
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import faiss
import pickle

CATALOG_CSV = "catalog/catalog.csv"
IMAGES_DIR = "catalog/images"
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


print("Loading CLIP model...")
model = CLIPModel.from_pretrained(MODEL_NAME)
processor = CLIPProcessor.from_pretrained(MODEL_NAME)
model.eval()
print("Model loaded.")

print(f"\nReading catalog from {CATALOG_CSV}...")
df = pd.read_csv(CATALOG_CSV)
print(f"Found {len(df)} sarees.")

print("\nGenerating embeddings...")
image_embeddings = []
text_embeddings = []
metadata = []

for idx, row in df.iterrows():
    image_path = os.path.join(IMAGES_DIR, row["filename"])
    if not os.path.exists(image_path):
        print(f"Skipping {row['id']}: image not found")
        continue

    print(f"  [{idx + 1}/{len(df)}] {row['id']} - {row['name']}")

    text_blob = (
        f"{row['name']}. Fabric: {row['fabric']}. "
        f"Primary color: {row['primary_color']}. Secondary color: {row['secondary_color']}. "
        f"Pattern: {row['pattern']}. Occasion: {row['occasion']}. "
        f"Border: {row['border_style']}. {row['description']}"
    )

    image = Image.open(image_path).convert("RGB")

    image_inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        image_features = model.get_image_features(**image_inputs)
        image_features = extract_tensor(image_features)
        image_features = torch.nn.functional.normalize(image_features, dim=-1)
    image_embeddings.append(image_features.squeeze().numpy())

    text_inputs = processor(text=[text_blob], return_tensors="pt",
                            padding=True, truncation=True, max_length=77)
    with torch.no_grad():
        text_features = model.get_text_features(**text_inputs)
        text_features = extract_tensor(text_features)
        text_features = torch.nn.functional.normalize(text_features, dim=-1)
    text_embeddings.append(text_features.squeeze().numpy())

    metadata.append(row.to_dict())

print("\nCombining image + text embeddings...")
image_embeddings = np.array(image_embeddings, dtype="float32")
text_embeddings = np.array(text_embeddings, dtype="float32")
combined = (0.6 * image_embeddings) + (0.4 * text_embeddings)
combined = combined / np.linalg.norm(combined, axis=1, keepdims=True)

print("Building FAISS index...")
index = faiss.IndexFlatIP(combined.shape[1])
index.add(combined)

faiss.write_index(index, INDEX_FILE)
with open(METADATA_FILE, "wb") as f:
    pickle.dump(metadata, f)

print(f"\nDone! {index.ntotal} sarees indexed.")
