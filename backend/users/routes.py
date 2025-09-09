# backend/users/routes.py
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from uuid import uuid4
from admin.models import Admin

from .models import User, db
from utils.jwt_token import generate_jwt_token
from utils.decorators import token_required

user_bp = Blueprint('users', __name__, url_prefix='/api/users')


# -------------------------
# Helpers
# -------------------------
def _norm_user_dict(u: User) -> dict:
    """Return a consistent shape for the frontend, including plan details."""
    return {
        "id": str(u.id),
        "full_name": u.full_name,
        "email": u.email,
        "bio": u.bio,
        "address": u.address,
        "phone_number": getattr(u, "phone_number", None),
        "profile_image_url": getattr(u, "profile_image_url", None),
        "membership_plan_id": str(u.membership_plan_id) if u.membership_plan_id else None,
        # Helpful extras for the Memberships tab (safe even if no plan):
        "plan_name": u.membership_plan.name if getattr(u, "membership_plan", None) else "Free",
        "plan_price": u.membership_plan.price if getattr(u, "membership_plan", None) else 0.0,
        "plan_features": u.membership_plan.features if getattr(u, "membership_plan", None) else [],
    }


def _get_val(data: dict, *keys, default=None):
    """Return first present key from `keys` in `data`."""
    for k in keys:
        if k in data:
            return data[k]
    return default


# -------------------------
# REGISTER
# -------------------------
@user_bp.route('/register', methods=['POST'])
def register_user():
    data = request.get_json() or {}
    required_fields = ['email', 'password', 'full_name']

    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400

    hashed_password = generate_password_hash(data['password'])

    # Accept FE/BE key styles and write to the new model columns.
    phone_val = _get_val(data, 'phone_number', 'phone')
    image_val = _get_val(data, 'profile_image_url', 'profile_image')

    new_user = User(
        id=str(uuid4()),
        full_name=data['full_name'],
        email=data['email'],
        password_hash=hashed_password,

        bio=data.get('bio'),
        address=data.get('address'),
        phone_number=phone_val,
        profile_image_url=image_val,

        age=data.get('age'),
        weight=data.get('weight'),
        height=data.get('height'),
        gender=data.get('gender'),
        fitness_goal=data.get('fitness_goal'),
        activity_level=data.get('activity_level'),
        experience_level=data.get('experience_level'),
        medical_conditions=data.get('medical_conditions'),
        membership_plan_id=data.get('membership_plan_id'),
    )

    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully', 'user_id': str(new_user.id)}), 201


# -------------------------
# LOGIN
# -------------------------
@user_bp.route('/login', methods=['POST'])
def login_user():
    data = request.get_json() or {}
    user = User.query.filter_by(email=data.get('email')).first()

    if not user or not check_password_hash(user.password_hash, data.get('password', '')):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = generate_jwt_token(str(user.id), user.email)
    return jsonify({
        'message': 'Login successful',
        'user_id': str(user.id),
        'token': token
    }), 200


# -------------------------
# GET all users (protected)
# -------------------------
@user_bp.route('/', methods=['GET'])
@token_required
def get_all_users(current_user):
    users = User.query.all()
    return jsonify([_norm_user_dict(u) for u in users]), 200


# -------------------------
# GET single user by ID (protected)
# -------------------------
@user_bp.route('/<string:user_id>', methods=['GET'])
@token_required
def get_user(current_user, user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify(_norm_user_dict(user)), 200


# -------------------------
# UPDATE user (protected)
# -------------------------
@user_bp.route('/<string:user_id>', methods=['PUT'])
@token_required
def update_user(current_user, user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Optional: prevent editing others (uncomment if desired)
    # if str(current_user.id) != user_id:
    #     return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json(silent=True) or {}

    # Accept both FE/BE key styles
    phone_val = _get_val(data, 'phone_number', 'phone')
    image_val = _get_val(data, 'profile_image_url', 'profile_image')

    if 'full_name' in data: user.full_name = data['full_name']
    if 'bio' in data: user.bio = data['bio']
    if 'address' in data: user.address = data['address']

    if phone_val is not None:
        user.phone_number = phone_val

    if image_val is not None:
        user.profile_image_url = image_val

    # Extra fields if provided
    for k in [
        'age', 'weight', 'height', 'gender', 'fitness_goal',
        'activity_level', 'experience_level', 'medical_conditions',
        'membership_plan_id'
    ]:
        if k in data:
            setattr(user, k, data[k])

    db.session.commit()

    return jsonify(_norm_user_dict(user)), 200


# -------------------------
# DELETE user (protected)
# -------------------------
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


# -------------------------
# GET current user (protected)
# -------------------------
@user_bp.route('/me', methods=['GET', 'OPTIONS'])
@token_required
def get_current_user(current_user):
    if request.method == 'OPTIONS':
        return '', 200
    # With relationship eager-loaded (lazy="joined") you’ll also get plan_* here
    return jsonify(_norm_user_dict(current_user)), 200

@user_bp.route('/admins', methods=['GET'])
def list_admins_for_users():
    """Allow users to fetch a directory of admins to start messaging."""
    limit = request.args.get("limit", type=int)
    q = Admin.query
    if limit:
        q = q.limit(limit)

    admins = q.all()
    return jsonify([{
        "id": str(a.id),
        "full_name": a.full_name,
        "email": a.email,
        "profile_image_url": getattr(a, "profile_image_url", None)
    } for a in admins]), 200