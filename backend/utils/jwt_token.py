# utils/jwt_token.py
import jwt
import os
from datetime import datetime, timedelta

SECRET = os.getenv("DB_SECRET_KEY", "dev-secret")

def generate_jwt_token(user_id, email, expires_in: int = 20*60):
    """
    Generate a USER jwt with a role field.
    - id: UUID of the user
    - email: user's email
    - role: "user"
    - exp: expiration (default 20 minutes)
    """
    payload = {
        "id": user_id,      
        "email": email,
        "role": "user",     
        "exp": datetime.utcnow() + timedelta(seconds=expires_in)
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")




""""
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



"""