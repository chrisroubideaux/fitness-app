# Admin OAuth
# admin/oauth.py
import os
import logging
import requests
from uuid import uuid4
from datetime import datetime
from urllib.parse import urlencode

from flask import request, jsonify, Blueprint, redirect, url_for
from werkzeug.security import generate_password_hash
from flask_dance.contrib.facebook import make_facebook_blueprint, facebook

from .models import Admin, db
from .jwt_token import generate_admin_jwt_token  # ✅ Correct relative import

admin_oauth_bp = Blueprint('admin_oauth', __name__, url_prefix='/auth/admin')
logging.basicConfig(level=logging.DEBUG)

# === Helper to serialize admin ===
def serialize_admin(admin):
    return {
        'id': str(admin.id),
        'email': admin.email,
        'full_name': admin.full_name,
        'profile_image_url': admin.profile_image_url
    }

# === GOOGLE OAuth Flow ===
@admin_oauth_bp.route('/google/login')
def start_google_oauth():
    query_params = {
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "redirect_uri": "http://localhost:5000/auth/admin/google/callback",
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent"
    }
    return redirect("https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(query_params))

@admin_oauth_bp.route('/google/callback')
def google_callback():
    code = request.args.get("code")
    if not code:
        return jsonify({'error': 'Missing code'}), 400

    token_res = requests.post("https://oauth2.googleapis.com/token", data={
        "code": code,
        "client_id": os.getenv("GOOGLE_CLIENT_ID"),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
        "redirect_uri": "http://localhost:5000/auth/admin/google/callback",
        "grant_type": "authorization_code"
    })

    if token_res.status_code != 200:
        return jsonify({'error': 'Token exchange failed'}), 400

    access_token = token_res.json().get("access_token")
    userinfo = requests.get("https://www.googleapis.com/oauth2/v3/userinfo", headers={
        "Authorization": f"Bearer {access_token}"
    }).json()

    email = userinfo.get("email")
    name = userinfo.get("name")
    picture = userinfo.get("picture")

    if not email:
        return jsonify({'error': 'Email not returned'}), 400

    admin = Admin.query.filter_by(email=email).first()
    if not admin:
        admin = Admin(
            id=str(uuid4()),
            email=email,
            full_name=name,
            profile_image_url=picture,
            password_hash=generate_password_hash(str(uuid4())),
            created_at=datetime.utcnow()
        )
        db.session.add(admin)
        db.session.commit()

    jwt_token = generate_admin_jwt_token(str(admin.id), admin.email)
    return redirect(f"http://localhost:3000/admin/{admin.id}?token={jwt_token}&name={admin.full_name}")

# === FACEBOOK OAuth Flow ===
@admin_oauth_bp.route('/facebook/login')
def start_facebook_oauth():
    return redirect(url_for("admin_facebook.login"))  # ✅ make sure this matches blueprint name in app.py

@admin_oauth_bp.route('/facebook/callback')
def facebook_callback():
    if not facebook.authorized:
        return redirect('/admin/login')

    resp = facebook.get('/me?fields=id,name,email,picture.type(large)')
    if not resp.ok:
        return jsonify({'error': 'Facebook API call failed'}), 400

    info = resp.json()
    email = info.get('email')
    name = info.get('name')
    picture = info.get('picture', {}).get('data', {}).get('url')

    if not email:
        return jsonify({'error': 'No email from Facebook'}), 400

    admin = Admin.query.filter_by(email=email).first()
    if not admin:
        admin = Admin(
            id=str(uuid4()),
            email=email,
            full_name=name,
            profile_image_url=picture,
            password_hash=generate_password_hash(str(uuid4())),
            created_at=datetime.utcnow()
        )
        db.session.add(admin)
        db.session.commit()

    jwt_token = generate_admin_jwt_token(str(admin.id), admin.email)
    return redirect(f"http://localhost:3000/admin/{admin.id}?token={jwt_token}&name={admin.full_name}")
