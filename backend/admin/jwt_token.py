# admin/jwt_token.py
import jwt
import os
from datetime import datetime, timedelta

def generate_admin_jwt_token(admin_id, email):
    payload = {
        "user_id": admin_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(minutes=20)
    }
    token = jwt.encode(payload, os.getenv("DB_SECRET_KEY"), algorithm="HS256")
    return token


""""""""""
import jwt
import os
from datetime import datetime, timedelta

def generate_admin_jwt_token(admin_id, email):
    payload = {
        "user_id": admin_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(minutes=20)
    }
    token = jwt.encode(payload, os.getenv("DB_SECRET_KEY"), algorithm="HS256")
    return token
"""""