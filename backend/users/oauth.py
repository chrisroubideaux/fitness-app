# backend/users/oauth.py

import os
import logging
import requests
from uuid import uuid4
from datetime import datetime
from urllib.parse import urlencode

from flask import request, jsonify, Blueprint, redirect, url_for, session
from werkzeug.security import generate_password_hash
from flask_dance.contrib.facebook import make_facebook_blueprint, facebook

from .models import User
from extensions import db
from utils.jwt_token import generate_jwt_token

oauth_bp = Blueprint('oauth', __name__, url_prefix='/auth')
logging.basicConfig(level=logging.DEBUG)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")

# === Serialize User (optional helper) ===
def serialize_user(user):
    return {
        'id': str(user.id),
        'email': user.email,
        'full_name': user.full_name,
        'profile_image_url': user.profile_image_url
    }

# ==============================
# GOOGLE OAuth Redirect Flow
# ==============================

@oauth_bp.route('/google/login', methods=['GET'])
def start_google_oauth():
   
    
    google_client_id = os.getenv("GOOGLE_CLIENT_ID")
    redirect_uri = "http://localhost:5000/auth/google/callback"

    # carry planId from the frontend (e.g. /auth/google/login?planId=uuid-or-free)
    plan_id = request.args.get("planId")

    query_params = {
        "client_id": google_client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
        # put planId in state so it's echoed back to our callback
        "state": plan_id or ""
    }

    auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(query_params)
    return redirect(auth_url)


@oauth_bp.route('/google/callback')
def google_callback():
    code = request.args.get("code")
    plan_id_from_state = request.args.get("state") or None  # recovered planId
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

    # Redirect back to frontend with token, and if we have a planId, include it
    # plus a flag your UI can use to auto-resume checkout.
    qs = f"?token={jwt_token}&name={user.full_name}"
    if plan_id_from_state:
        qs += f"&planId={plan_id_from_state}&resumeCheckout=1"

    # You can land on home or profile; profile already stores the token in your app.
    return redirect(f"{FRONTEND_URL}/profile/{user.id}{qs}")


# ==================================
# FACEBOOK OAuth Redirect Flow
# ==================================

@oauth_bp.route('/facebook/login', methods=['GET'])
def start_facebook_oauth():
    # Trigger Facebook login and stash planId in Flask session
    
    plan_id = request.args.get("planId")
    if plan_id:
        session['pending_plan_id'] = plan_id
    # 'facebook' is the blueprint name created by Flask-Dance elsewhere
    return redirect(url_for("facebook.login"))


@oauth_bp.route('/facebook/callback')
def facebook_callback():
    if not facebook.authorized:
        return redirect('/login')

    # Fetch user info from Facebook
    resp = facebook.get('/me?fields=id,name,email,picture.type(large)')
    if not resp.ok:
        return jsonify({'error': 'Facebook API call failed'}), 400

    info = resp.json()
    logging.debug(f"Facebook user info: {info}")

    email = info.get('email')
    name = info.get('name')
    picture = (info.get('picture') or {}).get('data', {}).get('url')

    if not email:
        return jsonify({'error': 'No email returned from Facebook'}), 400

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

    # Recover and clear any pending planId we stashed before redirect
    plan_id = session.pop('pending_plan_id', None)

    qs = f"?token={jwt_token}&name={user.full_name}"
    if plan_id:
        qs += f"&planId={plan_id}&resumeCheckout=1"

    return redirect(f"{FRONTEND_URL}/profile/{user.id}{qs}")











"""""


import os
import logging
import requests
from uuid import uuid4
from datetime import datetime
from urllib.parse import urlencode

from flask import request, jsonify, Blueprint, redirect, url_for, session
from werkzeug.security import generate_password_hash
from flask_dance.contrib.facebook import make_facebook_blueprint, facebook

from .models import User
from extensions import db
from utils.jwt_token import generate_jwt_token

oauth_bp = Blueprint('oauth', __name__, url_prefix='/auth')
logging.basicConfig(level=logging.DEBUG)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")

# === Serialize User (optional helper) ===
def serialize_user(user):
    return {
        'id': str(user.id),
        'email': user.email,
        'full_name': user.full_name,
        'profile_image_url': user.profile_image_url
    }

# ==============================
# GOOGLE OAuth Redirect Flow
# ==============================

@oauth_bp.route('/google/login', methods=['GET'])
def start_google_oauth():
   
    
    google_client_id = os.getenv("GOOGLE_CLIENT_ID")
    redirect_uri = "http://localhost:5000/auth/google/callback"

    # carry planId from the frontend (e.g. /auth/google/login?planId=uuid-or-free)
    plan_id = request.args.get("planId")

    query_params = {
        "client_id": google_client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
        # put planId in state so it's echoed back to our callback
        "state": plan_id or ""
    }

    auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(query_params)
    return redirect(auth_url)


@oauth_bp.route('/google/callback')
def google_callback():
    code = request.args.get("code")
    plan_id_from_state = request.args.get("state") or None  # recovered planId
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

    # Redirect back to frontend with token, and if we have a planId, include it
    # plus a flag your UI can use to auto-resume checkout.
    qs = f"?token={jwt_token}&name={user.full_name}"
    if plan_id_from_state:
        qs += f"&planId={plan_id_from_state}&resumeCheckout=1"

    # You can land on home or profile; profile already stores the token in your app.
    return redirect(f"{FRONTEND_URL}/profile/{user.id}{qs}")


# ==================================
# FACEBOOK OAuth Redirect Flow
# ==================================

@oauth_bp.route('/facebook/login', methods=['GET'])
def start_facebook_oauth():

    Trigger Facebook login and stash planId in Flask session
    to recover it in the callback.
    
    plan_id = request.args.get("planId")
    if plan_id:
        session['pending_plan_id'] = plan_id
    # 'facebook' is the blueprint name created by Flask-Dance elsewhere
    return redirect(url_for("facebook.login"))


@oauth_bp.route('/facebook/callback')
def facebook_callback():
    if not facebook.authorized:
        return redirect('/login')

    # Fetch user info from Facebook
    resp = facebook.get('/me?fields=id,name,email,picture.type(large)')
    if not resp.ok:
        return jsonify({'error': 'Facebook API call failed'}), 400

    info = resp.json()
    logging.debug(f"Facebook user info: {info}")

    email = info.get('email')
    name = info.get('name')
    picture = (info.get('picture') or {}).get('data', {}).get('url')

    if not email:
        return jsonify({'error': 'No email returned from Facebook'}), 400

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

    # Recover and clear any pending planId we stashed before redirect
    plan_id = session.pop('pending_plan_id', None)

    qs = f"?token={jwt_token}&name={user.full_name}"
    if plan_id:
        qs += f"&planId={plan_id}&resumeCheckout=1"

    return redirect(f"{FRONTEND_URL}/profile/{user.id}{qs}")




"""""