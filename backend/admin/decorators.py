# import os
import jwt
from functools import wraps
from flask import request, jsonify
from admin.models import Admin  # ✅ Adjusted import for Admin model

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
            return jsonify({'error': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, os.getenv('DB_SECRET_KEY'), algorithms=["HS256"])
            current_admin = Admin.query.get(data['user_id'])

            if not current_admin:
                return jsonify({'error': 'Admin not found'}), 401

        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'error': f'Server error: {str(e)}'}), 500

        return f(current_admin, *args, **kwargs)

    return decorated
