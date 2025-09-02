# admin/decorators.py
import os
import jwt
from functools import wraps
from flask import request, jsonify
from admin.models import Admin
def admin_token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == 'OPTIONS':
            return '', 200

        token = None
        if 'Authorization' in request.headers:
            parts = request.headers['Authorization'].split()
            if len(parts) == 2 and parts[0] == 'Bearer':
                token = parts[1]

        if not token:
            print("❌ No token found in Authorization header.")
            return jsonify({'error': 'Token is missing!'}), 401

        try:
            decoded = jwt.decode(token, os.getenv('DB_SECRET_KEY'), algorithms=["HS256"])
            print("🔐 JWT payload:", decoded)

            current_admin = Admin.query.get(decoded['user_id'])
            if not current_admin:
                print("❌ Admin not found in DB.")
                return jsonify({'error': 'Admin not found'}), 401

        except Exception as e:
            print(f"❌ JWT decode error: {str(e)}")
            return jsonify({'error': f'Invalid token or server error: {str(e)}'}), 401

        return f(current_admin, *args, **kwargs)

    return decorated
