# ai/token.py
# ai/decorators.py

from functools import wraps
from flask import request, jsonify
import jwt
import os
from users.models import User

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'Authorization' in request.headers:
            bearer = request.headers['Authorization']
            print(f"🔐 Raw Authorization header: {bearer}")  # ✅ Log the raw header
            token = bearer.split(" ")[1] if " " in bearer else bearer
            print(f"🎯 Extracted token: {token}")  # ✅ Log the extracted token

        if not token:
            print("❌ No token provided")
            return jsonify({'error': 'Token is missing'}), 401

        try:
            data = jwt.decode(token, os.getenv("DB_SECRET_KEY"), algorithms=["HS256"])
            print(f"✅ JWT payload: {data}")  # ✅ Log decoded payload
            current_user = User.query.filter_by(id=data['id']).first()
            if not current_user:
                print("❌ User not found in DB")
                return jsonify({'error': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            print("⏳ Token expired")
            return jsonify({'error': 'Token expired'}), 401
        except Exception as e:
            print(f"❌ JWT decode error: {str(e)}")
            return jsonify({'error': 'Invalid token'}), 401

        return f(current_user, *args, **kwargs)
    return decorated
