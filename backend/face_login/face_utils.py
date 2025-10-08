# backend/face/face_utils.py

import os
import numpy as np
import cv2
import requests
from huggingface_hub import snapshot_download
from insightface.app import FaceAnalysis

# --- Paths ---
# __file__ => backend/face_login/face_utils.py
_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # => backend
_MODELS_DIR = os.path.join(_BACKEND_DIR, "models")
_AURAFACE_DIR = os.path.join(_MODELS_DIR, "auraface")
os.makedirs(_AURAFACE_DIR, exist_ok=True)

def _ensure_auraface():
    """
    Make sure ONNX files + model.yaml exist in backend/models/auraface.
    InsightFace wants: root/<subdir>/name => backend/models/auraface
    So we return root = backend
    """
    required = [
        "scrfd_10g_bnkps.onnx",
        "2d106det.onnx",
        "1k3d68.onnx",
        "glintr100.onnx",
        "genderage.onnx",
    ]

    have_all = all(os.path.exists(os.path.join(_AURAFACE_DIR, f)) for f in required)

    if not have_all:
        try:
            # Download your hosted copy from HF (no GitHub download)
            snapshot_download(
                repo_id="chrisroubideaux/auraface-models",
                local_dir=_AURAFACE_DIR,
                local_dir_use_symlinks=False
            )
            print(f"[face_utils] Pulled AuraFace files from HF into {_AURAFACE_DIR}")
        except Exception as e:
            # If files still missing after failed download, raise
            still_missing = [f for f in required if not os.path.exists(os.path.join(_AURAFACE_DIR, f))]
            if still_missing:
                raise RuntimeError(
                    f"AuraFace ONNX files missing and HF download failed: {still_missing}\n{e}"
                )

    # Always ensure model.yaml exists (prevents InsightFace from trying GitHub)
    yaml_path = os.path.join(_AURAFACE_DIR, "model.yaml")
    with open(yaml_path, "w", encoding="utf-8") as f:
        f.write(
            "package: auraface\n"
            "files:\n"
            "  detection: scrfd_10g_bnkps.onnx\n"
            "  landmark_2d_106: 2d106det.onnx\n"
            "  landmark_3d_68: 1k3d68.onnx\n"
            "  recognition: glintr100.onnx\n"
            "  genderage: genderage.onnx\n"
        )

    print(f"[face_utils] AuraFace ready in {_AURAFACE_DIR}")
    # IMPORTANT: return the **backend** dir as the root
    return _BACKEND_DIR

# Prep files and set proper root
_ROOT_FOR_INSIGHTFACE = _ensure_auraface()
print(f"[face_utils] Using InsightFace root: {_ROOT_FOR_INSIGHTFACE}")

# Init
app = FaceAnalysis(
    name="auraface",
    root=_ROOT_FOR_INSIGHTFACE,  # backend (contains models/auraface)
)
app.prepare(ctx_id=-1, det_size=(640, 640))  # CPU; set 0 for CUDA if available


# ----------- Utilities -----------
def _bytes_to_cv2(image_bytes: bytes):
    arr = np.frombuffer(image_bytes, np.uint8)
    return cv2.imdecode(arr, cv2.IMREAD_COLOR)

def get_embedding_from_bytes(image_bytes: bytes):
    img = _bytes_to_cv2(image_bytes)
    faces = app.get(img)
    if not faces:
        return None
    return faces[0].normed_embedding.tolist()

def get_embedding_from_gcs(bucket: str, object_path: str):
    url = f"https://storage.googleapis.com/{bucket}/{object_path}"
    resp = requests.get(url, timeout=10)
    if resp.status_code != 200:
        return None
    return get_embedding_from_bytes(resp.content)

def cosine_similarity(emb1, emb2):
    v1, v2 = np.array(emb1), np.array(emb2)
    return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))
