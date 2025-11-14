# admin/face_routes.py

from flask import Blueprint, request, jsonify
from extensions import db
from gcs_client import upload_file_to_gcs
from admin.models import Admin
from admin.jwt_token import generate_admin_jwt_token
from face.face_utils import get_embedding_from_bytes, get_embedding_from_gcs, cosine_similarity
from face.models import FaceEmbedding   # ✅ shared embeddings table
from admin.decorators import admin_token_required
import os, uuid

admin_face_bp = Blueprint("admin_face", __name__, url_prefix="/api/admin/face")

# -----------------------------
# Register face(s) for an admin
# -----------------------------
@admin_face_bp.route("/register", methods=["POST"])
@admin_token_required
def register_admin_face(current_admin):
    bucket = os.getenv("GCS_BUCKET")
    embeddings, image_urls = [], []

    # Option A: file upload(s)
    if "image" in request.files:
        files = request.files.getlist("image")
        for f in files:
            emb = get_embedding_from_bytes(f.read())
            if emb is not None:
                embeddings.append(emb)

            # reset pointer for upload
            f.stream.seek(0)
            filename = f"face-login/admins/{current_admin.id}/{uuid.uuid4()}.jpg"
            url = upload_file_to_gcs(f, filename)
            image_urls.append(url)

    # Option B: pre-existing GCS paths
    elif request.is_json:
        gcs_paths = request.json.get("gcs_paths") or []
        for path in gcs_paths:
            emb = get_embedding_from_gcs(bucket, path)
            if emb is not None:
                embeddings.append(emb)
            image_urls.append(f"https://storage.googleapis.com/{bucket}/{path}")

    if not embeddings:
        return jsonify({"error": "No face detected"}), 400

    new_ids = []
    for emb in embeddings:
        new_emb = FaceEmbedding(admin_id=current_admin.id, embedding=emb)
        db.session.add(new_emb)
        db.session.flush()
        new_ids.append(str(new_emb.id))

    db.session.commit()

    token = generate_admin_jwt_token(str(current_admin.id), current_admin.email)

    return jsonify({
        "message": f"{len(new_ids)} face(s) registered successfully for admin",
        "embedding_ids": new_ids,
        "uploaded_images": image_urls,
        "admin_id": str(current_admin.id),
        "email": current_admin.email,
        "full_name": current_admin.full_name,
        "token": token
    }), 201


# -----------------------------
# Login admin with face
# -----------------------------
@admin_face_bp.route("/login", methods=["POST"])
def login_admin_face():
    bucket = os.getenv("GCS_BUCKET")

    embedding = None
    if "image" in request.files:
        embedding = get_embedding_from_bytes(request.files["image"].read())
    elif request.is_json and request.json.get("gcs_path"):
        embedding = get_embedding_from_gcs(bucket, request.json["gcs_path"])

    if not embedding:
        return jsonify({"match": False, "reason": "no_face"}), 400

    best_admin, best_score = None, -1.0
    admins = Admin.query.all()

    for admin in admins:
        for emb in admin.face_embeddings:  # ✅ works since relationship is defined
            score = cosine_similarity(embedding, emb.embedding)
            if score > best_score:
                best_score, best_admin = score, admin

    threshold = 0.35
    if best_score > (1 - threshold) and best_admin:
        token = generate_admin_jwt_token(str(best_admin.id), best_admin.email)
        return jsonify({
            "match": True,
            "score": round(best_score, 4),
            "token": token,
            "admin_id": str(best_admin.id),
            "email": best_admin.email,
            "full_name": best_admin.full_name,
        }), 200

    return jsonify({"match": False, "score": round(best_score, 4)}), 401
