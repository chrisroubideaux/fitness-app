# backend/messages/auth.py

import os
from typing import Tuple, Any
from flask import request
import jwt
from jwt import InvalidTokenError, ExpiredSignatureError

from admin.models import Admin
from users.models import User

JWT_SECRET = os.getenv("DB_SECRET_KEY", "dev-secret")
ALGO = "HS256"

class AuthError(Exception):
    pass

def _get_bearer_token() -> str:
    auth = request.headers.get("Authorization", "")
    print(f"[AUTH] Authorization header seen by server: {auth[:40]}...")  # DEBUG
    if not auth.startswith("Bearer "):
        raise AuthError("Missing or invalid Authorization header")
    return auth.split(" ", 1)[1].strip()

def _decode(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGO])
        print(f"[AUTH] Decoded JWT payload: {payload}")  # DEBUG
        return payload
    except ExpiredSignatureError:
        raise AuthError("Token expired")
    except InvalidTokenError:
        raise AuthError("Invalid token")

def resolve_principal() -> Tuple[str, Any]:
    token = _get_bearer_token()
    payload = _decode(token)

    role = payload.get("role")
    print(f"[AUTH] role in token: {role}")  # DEBUG

    if role == "admin":
        admin_id = payload.get("admin_id") or payload.get("id")  # accept legacy
        print(f"[AUTH] resolved admin_id: {admin_id}")  # DEBUG
        if not admin_id:
            raise AuthError("Admin token missing admin_id")
        admin = Admin.query.get(str(admin_id))
        if not admin:
            raise AuthError("Admin not found")
        print(f"[AUTH] authenticated ADMIN {admin.email}")  # DEBUG
        return "admin", admin

    if role == "user":
        user_id = payload.get("id")
        print(f"[AUTH] resolved user_id: {user_id}")  # DEBUG
        if not user_id:
            raise AuthError("User token missing id")
        user = User.query.get(str(user_id))
        if not user:
            raise AuthError("User not found")
        print(f"[AUTH] authenticated USER {user.email}")  # DEBUG
        return "user", user

    raise AuthError("Invalid role in token")

