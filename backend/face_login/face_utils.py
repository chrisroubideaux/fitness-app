# backend/face/face_utils.py
import numpy as np
import cv2
import requests
import os
from huggingface_hub import snapshot_download
from insightface.app import FaceAnalysis

# -----------------------------
# Ensure Hugging Face AuraFace is ready
# -----------------------------
def _ensure_auraface():
    model_root = "models"
    model_dir = os.path.join(model_root, "auraface")

    # Download if not already there
    if not os.path.exists(model_dir) or not os.listdir(model_dir):
        snapshot_download(
            "fal/AuraFace-v1",
            local_dir=model_dir,
            local_dir_use_symlinks=False
        )
        print(f"[face_utils] Downloaded AuraFace-v1 into {model_dir}")
    else:
        print(f"[face_utils] Using cached AuraFace in {model_dir}")

    # Ensure model.yaml exists
    yaml_path = os.path.join(model_dir, "model.yaml")
    if not os.path.exists(yaml_path):
        yaml_content = """package: auraface
files:
  detection: scrfd_10g_bnkps.onnx
  landmark_2d_106: 2d106det.onnx
  landmark_3d_68: 1k3d68.onnx
  recognition: glintr100.onnx
  genderage: genderage.onnx
"""
        with open(yaml_path, "w") as f:
            f.write(yaml_content)
        print(f"[face_utils] Created model.yaml in {model_dir}")

    return model_root

# -----------------------------
# Init InsightFace app
# -----------------------------
MODEL_ROOT = _ensure_auraface()

# Load AuraFace (from Hugging Face folder)
app = FaceAnalysis(name="auraface", root=MODEL_ROOT)
app.prepare(ctx_id=-1, det_size=(640, 640))  # ctx_id=-1 = CPU, change to 0 if using GPU


# -----------------------------
# Utilities
# -----------------------------
def _bytes_to_cv2(image_bytes: bytes):
    """Convert raw image bytes into a cv2 BGR image."""
    arr = np.frombuffer(image_bytes, np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)


def get_embedding_from_bytes(image_bytes: bytes):
    """Extract a 512-D normalized embedding from image bytes."""
    img = _bytes_to_cv2(image_bytes)
    faces = app.get(img)
    if not faces:
        return None
    return faces[0].normed_embedding.tolist()


def get_embedding_from_gcs(bucket: str, object_path: str):
    """
    Download image from GCS (public or signed URL style) and return embedding.
    Assumes Cloud Run has Storage Object Viewer permission.
    """
    url = f"https://storage.googleapis.com/{bucket}/{object_path}"
    resp = requests.get(url, timeout=10)
    if resp.status_code != 200:
        return None
    return get_embedding_from_bytes(resp.content)


def cosine_similarity(emb1, emb2):
    """Compute cosine similarity between two embeddings."""
    v1, v2 = np.array(emb1), np.array(emb2)
    return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))
