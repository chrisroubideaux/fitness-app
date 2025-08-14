# routes.py
from flask_cors import cross_origin

from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from uuid import uuid4
from .models import User, db
from utils.jwt_token import generate_jwt_token
from utils.decorators import token_required
from flask import g
user_bp = Blueprint('users', __name__, url_prefix='/api/users')

# REGISTER a new user
@user_bp.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    required_fields = ['email', 'password', 'full_name']

    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400

    hashed_password = generate_password_hash(data['password'])

    new_user = User(
        id=str(uuid4()),
        full_name=data['full_name'],
        email=data['email'],
        password_hash=hashed_password,
        bio=data.get('bio'),
        address=data.get('address'),
        phone=data.get('phone'),
        profile_image=data.get('profile_image'),
        age=data.get('age'),
        weight=data.get('weight'),
        height=data.get('height'),
        gender=data.get('gender'),
        fitness_goal=data.get('fitness_goal'),
        activity_level=data.get('activity_level'),
        experience_level=data.get('experience_level'),
        medical_conditions=data.get('medical_conditions'),
        membership_plan_id=data.get('membership_plan_id')
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully', 'user_id': str(new_user.id)}), 201

# LOGIN user (password-based)
@user_bp.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()

    if not user or not check_password_hash(user.password_hash, data.get('password')):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = generate_jwt_token(str(user.id), user.email)

    return jsonify({
        'message': 'Login successful',
        'user_id': str(user.id),
        'token': token
    }), 200

# GET all users (admin-only)
# GET all users
@user_bp.route('/', methods=['GET'])
@token_required
def get_all_users(current_user):   # <- accept current_user
    users = User.query.all()
    return jsonify([
        {
          'id': current_user.id,
          'full_name': current_user.full_name,
          'email': current_user.email,
          'bio': current_user.bio,
          'address': current_user.address,
          'phone_number': current_user.phone_number,
          'profile_image_url': current_user.profile_image_url,
          'membership_plan_id': current_user.membership_plan_id
        } for user in users
    ]), 200


# GET single user by ID
@user_bp.route('/<string:user_id>', methods=['GET'])
@token_required
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'id': str(user.id),
        'full_name': user.full_name,
        'email': user.email,
        'bio': user.bio,
        'address': user.address,
        'phone': user.phone,
        'profile_image': user.profile_image,
        'membership_plan_id': user.membership_plan_id
    }), 200

# UPDATE user
# UPDATE user
@user_bp.route('/<string:user_id>', methods=['PUT'])
@token_required
def update_user(current_user, user_id):  # <-- current_user first
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json(silent=True) or {}

    # Accept both FE/BE key styles
    phone_val = data.get('phone_number', data.get('phone'))
    image_val = data.get('profile_image_url', data.get('profile_image'))

    if 'full_name' in data: user.full_name = data['full_name']
    if 'bio' in data: user.bio = data['bio']
    if 'address' in data: user.address = data['address']

    if phone_val is not None:
        if hasattr(user, 'phone_number'):
            user.phone_number = phone_val
        elif hasattr(user, 'phone'):
            user.phone = phone_val

    if image_val is not None:
        if hasattr(user, 'profile_image_url'):
            user.profile_image_url = image_val
        elif hasattr(user, 'profile_image'):
            user.profile_image = image_val

    for k in [
        'age','weight','height','gender','fitness_goal',
        'activity_level','experience_level','medical_conditions',
        'membership_plan_id'
    ]:
        if k in data:
            setattr(user, k, data[k])

    db.session.commit()

    # Return updated user in the same shape as /me
    return jsonify({
        'id': str(user.id),
        'full_name': user.full_name,
        'email': user.email,
        'bio': user.bio,
        'address': user.address,
        'phone_number': getattr(user, 'phone_number', None) or getattr(user, 'phone', None),
        'profile_image_url': getattr(user, 'profile_image_url', None) or getattr(user, 'profile_image', None),
        'membership_plan_id': user.membership_plan_id
    }), 200

# DELETE user
@user_bp.route('/<string:user_id>', methods=['DELETE'])
@token_required
def delete_user(current_user, user_id):
    # Prevent users from deleting other users' accounts
    if str(current_user.id) != user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({'message': f"User '{user.full_name}' deleted"}), 200


# GET current user info (from token)
@user_bp.route('/me', methods=['GET', 'OPTIONS'])
@token_required
def get_current_user(current_user):
    if request.method == 'OPTIONS':
        return '', 200  # respond OK to preflight

    return jsonify({
        'id': current_user.id,
        'full_name': current_user.full_name,
        'email': current_user.email,
        'bio': current_user.bio,
        'address': current_user.address,
        'phone_number': current_user.phone_number,
        'profile_image_url': current_user.profile_image_url,
        'membership_plan_id': current_user.membership_plan_id
    })
    
    
    
# test function
# --- BEGIN: Temporarily disabled robust update route ---
# import re
# from urllib.parse import urlparse
# from flask import Blueprint, request, jsonify
# from utils.decorators import token_required
# from .models import User, db
#
# # ... your existing blueprint etc ...
#
# def _clean_str(v):
#     if v is None:
#         return None
#     s = str(v).strip()
#     return s if s else None
#
# def _valid_http_url(u: str | None) -> bool:
#     if not u:
#         return True  # empty is allowed; means "clear it"
#     try:
#         p = urlparse(u)
#         return p.scheme in ("http", "https") and bool(p.netloc)
#     except Exception:
#         return False
#
# @user_bp.route('/<string:user_id>', methods=['PUT', 'OPTIONS'])
# @token_required
# def update_user(current_user, user_id):  # <-- NOTE: current_user first
#     # Handle CORS preflight cleanly
#     if request.method == 'OPTIONS':
#         return '', 200
#
#     # ✅ Authorization guard: owner or admin only
#     if str(current_user.id) != user_id and not getattr(current_user, "is_admin", False):
#         return jsonify({'error': 'Forbidden'}), 403
#
#     user = User.query.get(user_id)
#     if not user:
#         return jsonify({'error': 'User not found'}), 404
#
#     data = request.get_json(silent=True) or {}
#     errors: list[str] = []
#
#     # ---- Gather / normalize inputs (accept FE & BE keys) ----
#     full_name = _clean_str(data.get('full_name'))  # optional
#     bio       = _clean_str(data.get('bio'))
#     address   = _clean_str(data.get('address'))
#
#     phone_in  = data.get('phone_number', data.get('phone'))
#     image_in  = data.get('profile_image_url', data.get('profile_image'))
#
#     # ---- Validation rules ----
#     if full_name is not None and len(full_name) > 120:
#         errors.append('full_name too long (max 120)')
#
#     if bio is not None and len(bio) > 500:
#         errors.append('bio too long (max 500)')
#
#     if address is not None and len(address) > 200:
#         errors.append('address too long (max 200)')
#
#     phone_norm = None
#     if phone_in is not None:
#         p = _clean_str(phone_in)
#         if p:
#             digits = re.sub(r'\D', '', p)
#             if len(digits) == 11 and digits.startswith('1'):
#                 digits = digits[1:]
#             if len(digits) != 10:
#                 errors.append('phone must have 10 digits (US).')
#             else:
#                 phone_norm = digits
#         else:
#             phone_norm = None  # allow clearing
#
#     image_url_final = None
#     if image_in is not None:
#         img = _clean_str(image_in)
#         if img and not _valid_http_url(img):
#             errors.append('profile_image must be a valid http(s) URL.')
#         else:
#             image_url_final = img  # could be None to clear
#
#     if errors:
#         return jsonify({'error': 'Validation failed', 'details': errors}), 400
#
#     # ---- Apply updates only for provided fields ----
#     if 'full_name' in data:
#         user.full_name = full_name
#     if 'bio' in data:
#         user.bio = bio
#     if 'address' in data:
#         user.address = address
#
#     if phone_in is not None:
#         # accept either attribute name on your model
#         if hasattr(user, 'phone_number'):
#             user.phone_number = phone_norm
#         elif hasattr(user, 'phone'):
#             user.phone = phone_norm
#
#     if image_in is not None:
#         if hasattr(user, 'profile_image_url'):
#             user.profile_image_url = image_url_final
#         elif hasattr(user, 'profile_image'):
#             user.profile_image = image_url_final
#
#     # Optional extra fields (update only if present)
#     for k in [
#         'age', 'weight', 'height', 'gender', 'fitness_goal',
#         'activity_level', 'experience_level', 'medical_conditions',
#         'membership_plan_id'
#     ]:
#         if k in data:
#             setattr(user, k, data[k])
#
#     db.session.commit()
#
#     # ---- Return updated user in the same shape as /me ----
#     return jsonify({
#         'id': str(user.id),
#         'full_name': user.full_name,
#         'email': user.email,
#         'bio': user.bio,
#         'address': user.address,
#         'phone_number': getattr(user, 'phone_number', None) or getattr(user, 'phone', None),
#         'profile_image_url': getattr(user, 'profile_image_url', None) or getattr(user, 'profile_image', None),
#         'membership_plan_id': getattr(user, 'membership_plan_id', None),
#     }), 200
# --- END: Temporarily disabled robust update route ---
    
