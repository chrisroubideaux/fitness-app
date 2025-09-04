# admin/decorators.py
# admin/decorators.py
import os
import jwt
from functools import wraps
from flask import request, jsonify
from admin.models import Admin

SECRET = os.getenv("DB_SECRET_KEY")

def _extract_bearer_token():
    # Primary: Authorization: Bearer <token>
    auth = request.headers.get("Authorization", "")
    if auth:
        parts = auth.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            return parts[1]
    # Legacy/alt header support
    return request.headers.get("x-access-tokens")

def admin_token_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # Let CORS preflights pass
        if request.method == "OPTIONS":
            return ("", 200)

        token = _extract_bearer_token()
        if not token:
            print("❌ No token found in Authorization/x-access-tokens.")
            return jsonify({"error": "Token is missing"}), 401

        try:
            payload = jwt.decode(token, SECRET, algorithms=["HS256"])
            print("🔐 Admin JWT payload:", payload)
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expired"}), 401
        except Exception as e:
            print(f"❌ JWT decode error: {e}")
            return jsonify({"error": "Invalid token"}), 401

        # Must be an admin token
        role = payload.get("role")
        if role and role != "admin":
            # If a role is present and not admin -> forbidden
            return jsonify({"error": "Forbidden: not an admin token"}), 403

        # Prefer new claim, but be forgiving for older tokens
        admin_id = payload.get("admin_id") or payload.get("user_id") or payload.get("id")
        if not admin_id:
            return jsonify({"error": "Invalid token payload: admin_id missing"}), 401

        admin = Admin.query.get(admin_id)
        if not admin:
            print("❌ Admin not found in DB:", admin_id)
            return jsonify({"error": "Admin not found"}), 404

        return fn(admin, *args, **kwargs)

    return wrapper



"""""""""
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
    
    
    
"""""""""
