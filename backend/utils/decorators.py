# decorators.py
# utils/decorators.py
import os
import jwt
from functools import wraps
from flask import request, jsonify
from users.models import User

def token_required(f):
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
            current_user = User.query.get(data['id'])  # ✅ Match with "id" from token

            if not current_user:
                return jsonify({'error': 'User not found'}), 401

        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'error': f'Server error: {str(e)}'}), 500

        return f(current_user, *args, **kwargs)

    return decorated

"""
import os
import jwt
from functools import wraps
from flask import request, jsonify
from users.models import User  # adjust to your structure

def token_required(f):
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
            current_user = User.query.get(data['user_id'])

            if not current_user:
                return jsonify({'error': 'User not found'}), 401

        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'error': f'Server error: {str(e)}'}), 500

        return f(current_user, *args, **kwargs)

    return decorated
    
    """
