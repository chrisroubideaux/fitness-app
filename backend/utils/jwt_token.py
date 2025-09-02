# utils/jwt_token.py
import jwt
import os
from datetime import datetime, timedelta

def generate_jwt_token(user_id, email):
    payload = {
        "id": user_id,  # ✅ Use "id" to match token_required
        "email": email,
        "exp": datetime.utcnow() + timedelta(minutes=20)
    }
    token = jwt.encode(payload, os.getenv("DB_SECRET_KEY"), algorithm="HS256")
    return token


""""
import jwt
import os
from datetime import datetime, timedelta

def generate_jwt_token(user_id, email):
    payload = {
        "id": user_id,  # ✅ Use "id" to match token_required
        "email": email,
        "exp": datetime.utcnow() + timedelta(minutes=20)
    }
    token = jwt.encode(payload, os.getenv("DB_SECRET_KEY"), algorithm="HS256")
    return token


"""