# backend/face_login/routes.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from .models import FaceEmbedding
from users.models import User
from .face_utils import get_embedding_from_bytes, get_embedding_from_gcs, cosine_similarity
from utils.jwt_token import generate_jwt_token
from gcs_client import upload_file_to_gcs  # ✅ import our util
import os, uuid

face_bp = Blueprint("face", __name__, url_prefix="/api/face")

# -----------------------------
# Register one or multiple faces for the logged-in user
# -----------------------------
@face_bp.route("/register", methods=["POST"])
@jwt_required()
def register_face():
    user_id = get_jwt_identity()
    bucket = os.getenv("GCS_BUCKET")

    embeddings = []
    image_urls = []  # ✅ new list to store uploaded image URLs

    # Option A: direct file upload(s)
    if "image" in request.files:
        files = request.files.getlist("image")  # accept multiple
        for f in files:
            # Get embedding
            emb = get_embedding_from_bytes(f.read())
            if emb is not None:
                embeddings.append(emb)

            # Reset file pointer for upload
            f.stream.seek(0)

            # Upload to GCS under user folder
            filename = f"face-login/{user_id}/{uuid.uuid4()}.jpg"
            url = upload_file_to_gcs(f, filename)
            image_urls.append(url)

    # Option B: GCS path(s) passed in JSON
    elif request.is_json:
        gcs_paths = request.json.get("gcs_paths") or []
        for path in gcs_paths:
            emb = get_embedding_from_gcs(bucket, path)
            if emb is not None:
                embeddings.append(emb)
            # Construct public URL from bucket + path
            image_urls.append(f"https://storage.googleapis.com/{bucket}/{path}")

    if not embeddings:
        return jsonify({"error": "No face detected"}), 400

    new_ids = []
    for emb in embeddings:
        new_emb = FaceEmbedding(user_id=user_id, embedding=emb)
        db.session.add(new_emb)
        db.session.flush()  # get id before commit
        new_ids.append(str(new_emb.id))

    db.session.commit()

    # ✅ Issue token for immediate consistency
    user = User.query.get(user_id)
    token = generate_jwt_token(str(user.id), user.email)

    return jsonify({
        "message": f"{len(new_ids)} face(s) registered successfully",
        "embedding_ids": new_ids,
        "uploaded_images": image_urls,   # ✅ new
        "user_id": str(user.id),
        "user_email": user.email,
        "full_name": user.full_name,
        "token": token
    }), 201


# -----------------------------
# Login with face
# -----------------------------
@face_bp.route("/login", methods=["POST"])
def login_face():
    bucket = os.getenv("GCS_BUCKET")

    embedding = None
    if "image" in request.files:
        embedding = get_embedding_from_bytes(request.files["image"].read())
    elif request.is_json and request.json.get("gcs_path"):
        embedding = get_embedding_from_gcs(bucket, request.json["gcs_path"])

    if not embedding:
        return jsonify({"match": False, "reason": "no_face"}), 400

    best_user, best_score = None, -1.0
    users = User.query.all()

    for user in users:
        for emb in user.face_embeddings:
            score = cosine_similarity(embedding, emb.embedding)
            if score > best_score:
                best_score, best_user = score, user

    threshold = 0.35
    if best_score > (1 - threshold) and best_user:
        token = generate_jwt_token(str(best_user.id), best_user.email)
        return jsonify({
            "match": True,
            "score": round(best_score, 4),
            "token": token,
            "user_id": str(best_user.id),
            "user_email": best_user.email,
            "full_name": best_user.full_name,
        }), 200

    return jsonify({"match": False, "score": round(best_score, 4)}), 401




"""""""""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from .models import FaceEmbedding
from users.models import User
from .face_utils import get_embedding_from_bytes, get_embedding_from_gcs, cosine_similarity
from utils.jwt_token import generate_jwt_token   # ✅ your user token util
import os
from google.cloud import storage
from gcs_client import upload_file_to_gcs  # ✅ import our util


face_bp = Blueprint("face", __name__, url_prefix="/api/face")

# -----------------------------
# Register one or multiple faces for the logged-in user
# -----------------------------
@face_bp.route("/register", methods=["POST"])
@jwt_required()
def register_face():
    user_id = get_jwt_identity()
    bucket = os.getenv("GCS_BUCKET")

    embeddings = []

    # Option A: direct file upload(s)
    if "image" in request.files:
        files = request.files.getlist("image")  # accept multiple
        for f in files:
            emb = get_embedding_from_bytes(f.read())
            if emb is not None:
                embeddings.append(emb)

    # Option B: GCS path(s)
    elif request.is_json:
        gcs_paths = request.json.get("gcs_paths") or []
        for path in gcs_paths:
            emb = get_embedding_from_gcs(bucket, path)
            if emb is not None:
                embeddings.append(emb)

    if not embeddings:
        return jsonify({"error": "No face detected"}), 400

    new_ids = []
    for emb in embeddings:
        new_emb = FaceEmbedding(user_id=user_id, embedding=emb)
        db.session.add(new_emb)
        db.session.flush()  # get id before commit
        new_ids.append(str(new_emb.id))

    db.session.commit()

    # ✅ Issue token for immediate consistency
    user = User.query.get(user_id)
    token = generate_jwt_token(str(user.id), user.email)

    return jsonify({
        "message": f"{len(new_ids)} face(s) registered successfully",
        "embedding_ids": new_ids,
        "user_id": str(user.id),
        "user_email": user.email,
        "full_name": user.full_name,
        "token": token
    }), 201


# -----------------------------
# Login with face
# -----------------------------
@face_bp.route("/login", methods=["POST"])
def login_face():
    bucket = os.getenv("GCS_BUCKET")

    embedding = None
    if "image" in request.files:
        embedding = get_embedding_from_bytes(request.files["image"].read())
    elif request.is_json and request.json.get("gcs_path"):
        embedding = get_embedding_from_gcs(bucket, request.json["gcs_path"])

    if not embedding:
        return jsonify({"match": False, "reason": "no_face"}), 400

    best_user, best_score = None, -1.0
    users = User.query.all()

    for user in users:
        for emb in user.face_embeddings:
            score = cosine_similarity(embedding, emb.embedding)
            if score > best_score:
                best_score, best_user = score, user

    threshold = 0.35
    if best_score > (1 - threshold) and best_user:
        # ✅ Use same JWT util as OAuth
        token = generate_jwt_token(str(best_user.id), best_user.email)
        return jsonify({
            "match": True,
            "score": round(best_score, 4),
            "token": token,
            "user_id": str(best_user.id),
            "user_email": best_user.email,
            "full_name": best_user.full_name,
        }), 200

    return jsonify({"match": False, "score": round(best_score, 4)}), 401
    
"""""
