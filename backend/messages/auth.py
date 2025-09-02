# backend/messages/auth.py
import os
from typing import Tuple, Any
from flask import request
import jwt  # PyJWT
from jwt import InvalidTokenError, ExpiredSignatureError

from admin.models import Admin
from users.models import User

JWT_SECRET = os.getenv("DB_SECRET_KEY", "")
ALGO = "HS256"


class AuthError(Exception):
    pass


def _get_bearer_token() -> str:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise AuthError("Missing or invalid Authorization header")
    return auth.split(" ", 1)[1].strip()


def _decode(token: str) -> dict:
    if not JWT_SECRET:
        raise AuthError("Server misconfiguration: DB_SECRET_KEY not set")
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[ALGO])
    except ExpiredSignatureError:
        raise AuthError("Token expired")
    except InvalidTokenError:
        raise AuthError("Invalid token")


def resolve_principal() -> Tuple[str, Any]:
    """
    Returns ("admin", Admin) or ("user", User) based on the token.

    Supports your current payloads:
      - User token: {"id": <user_uuid>, ...}
      - Admin token: {"user_id": <admin_uuid>, ...}  <-- current
        (also supports {"admin_id": <admin_uuid>} if you change it later)
    """
    token = _get_bearer_token()
    payload = _decode(token)

    # Try ADMIN first (handles both 'admin_id' and your current 'user_id')
    admin_id = str(payload.get("admin_id") or payload.get("user_id") or "")
    if admin_id:
        admin = Admin.query.get(admin_id)
        if admin:
            return "admin", admin  # ✅ admin authenticated

    # Then USER
    user_id = str(payload.get("id") or "")
    if user_id:
        user = User.query.get(user_id)
        if user:
            return "user", user  # ✅ user authenticated

    # Nothing matched
    raise AuthError("Could not authenticate as admin or user")
