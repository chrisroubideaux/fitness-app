# backend/utils/jwt_token.py

import jwt
import os
from datetime import datetime, timedelta

SECRET = os.getenv("DB_SECRET_KEY", "dev-secret")

def generate_jwt_token(user_id, email, expires_in=3600*24 * 7):
    payload = {
        "id": user_id,          # ✅ Keep id
        "email": email,
        "role": "user",         # ✅ NEW: explicit role
        "exp": datetime.utcnow() + timedelta(seconds=expires_in)
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")
