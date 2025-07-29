# oauth.py for handling OAuth login with Google and Facebook
# oauth.py for handling OAuth login with Google and Facebook
import os
import logging
import requests
from uuid import uuid4
from urllib.parse import urlencode
from flask import request, jsonify, Blueprint, redirect
from .models import User, db
from utils.jwt_token import generate_jwt_token

oauth_bp = Blueprint('oauth', __name__, url_prefix='/auth')
logging.basicConfig(level=logging.DEBUG)

def serialize_user(user):
    return {
        'id': str(user.id),
        'email': user.email,
        'full_name': user.full_name,
        'profile_image_url': user.profile_image_url
    }

# === Google Token-Based Login (Client-Side OAuth) ===
@oauth_bp.route('/google/login', methods=['POST'])
def google_login():
    token = request.json.get('token')
    if not token:
        return jsonify({'error': 'Missing Google token'}), 400

    res = requests.get(f"https://www.googleapis.com/oauth2/v3/tokeninfo?id_token={token}")
    if res.status_code != 200:
        return jsonify({'error': 'Invalid Google token'}), 401

    info = res.json()
    logging.debug(f"Google user info: {info}")

    email = info.get('email')
    picture = info.get('picture')
    name = info.get('name')

    if not email:
        return jsonify({'error': 'No email found in token payload'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(
            id=str(uuid4()),
            email=email,
            full_name=name,
            profile_image_url=picture,
            password_hash='oauth-login'
        )
        db.session.add(user)
        db.session.commit()

    jwt_token = generate_jwt_token(str(user.id), user.email)

    return jsonify({
        'message': 'Google login successful',
        'user': serialize_user(user),
        'token': jwt_token
    }), 200

# === Google Redirect-Based Login (GET) ===
@oauth_bp.route('/google/login', methods=['GET'])
def start_google_oauth():
    from urllib.parse import urlencode
    google_client_id = os.getenv("GOOGLE_CLIENT_ID")
    redirect_uri = "http://localhost:5000/auth/google/callback"

    query_params = {
        "client_id": google_client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent"
    }

    auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(query_params)
    return redirect(auth_url)

# === Google Redirect Callback ===
@oauth_bp.route('/google/callback')
def google_callback():
    from datetime import datetime
    from werkzeug.security import generate_password_hash

    code = request.args.get("code")
    if not code:
        return jsonify({'error': 'Missing code from Google'}), 400

    client_id = os.getenv("GOOGLE_CLIENT_ID")
    client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    redirect_uri = "http://localhost:5000/auth/google/callback"

    # Exchange code for access token
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": client_id,
        "client_secret": client_secret,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code"
    }

    token_res = requests.post(token_url, data=data)
    if token_res.status_code != 200:
        return jsonify({'error': 'Failed to exchange code'}), 400

    access_token = token_res.json().get("access_token")

    # Get user info
    userinfo_res = requests.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    if userinfo_res.status_code != 200:
        return jsonify({'error': 'Failed to get user info'}), 400

    info = userinfo_res.json()
    logging.debug(f"Google user info: {info}")

    email = info.get("email")
    name = info.get("name")
    picture = info.get("picture")

    if not email:
        return jsonify({'error': 'Email not provided'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(
            id=str(uuid4()),
            email=email,
            full_name=name,
            profile_image_url=picture,
            password_hash=generate_password_hash(str(uuid4())),
            created_at=datetime.utcnow()
        )
        db.session.add(user)
        db.session.commit()

    jwt_token = generate_jwt_token(str(user.id), user.email)
    return redirect(f"http://localhost:3000/profile/{user.id}?token={jwt_token}&name={user.full_name}")

# === Facebook Token-Based Login (Client-Side OAuth) ===
@oauth_bp.route('/facebook/login', methods=['POST'])
def facebook_login():
    access_token = request.json.get('access_token')
    if not access_token:
        return jsonify({'error': 'Missing Facebook token'}), 400

    fb_url = f"https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token={access_token}"
    res = requests.get(fb_url)
    if res.status_code != 200:
        return jsonify({'error': 'Invalid Facebook token'}), 401

    info = res.json()
    logging.debug(f"Facebook user info: {info}")

    email = info.get('email')
    picture = info.get('picture', {}).get('data', {}).get('url')
    name = info.get('name')

    if not email:
        return jsonify({'error': 'Facebook account does not have a public email'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(
            id=str(uuid4()),
            email=email,
            full_name=name,
            profile_image_url=picture,
            password_hash='oauth-login'
        )
        db.session.add(user)
        db.session.commit()

    jwt_token = generate_jwt_token(str(user.id), user.email)

    return jsonify({
        'message': 'Facebook login successful',
        'user': serialize_user(user),
        'token': jwt_token
    }), 200
