# routes
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from uuid import uuid4
from .models import User, db
from utils.jwt_token import generate_jwt_token
from utils.decorators import token_required

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

    return jsonify({'message': 'User registered successfully', 'user_id': new_user.id}), 201


# LOGIN user (password-based)
@user_bp.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()

    if not user or not check_password_hash(user.password_hash, data.get('password')):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = generate_jwt_token(user.id, user.email)

    return jsonify({
        'message': 'Login successful',
        'user_id': user.id,
        'token': token
    }), 200


# GET all users (admin-only; protect this route)
@user_bp.route('/', methods=['GET'])
@token_required
def get_all_users():
    users = User.query.all()
    return jsonify([
        {
            'id': user.id,
            'full_name': user.full_name,
            'email': user.email,
            'bio': user.bio,
            'address': user.address,
            'phone': user.phone,
            'profile_image': user.profile_image,
            'membership_plan_id': user.membership_plan_id
        } for user in users
    ]), 200


# GET single user by ID (protect this route)
@user_bp.route('/<string:user_id>', methods=['GET'])
@token_required
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'id': user.id,
        'full_name': user.full_name,
        'email': user.email,
        'bio': user.bio,
        'address': user.address,
        'phone': user.phone,
        'profile_image': user.profile_image,
        'membership_plan_id': user.membership_plan_id
    }), 200


# UPDATE user (protect this route)
@user_bp.route('/<string:user_id>', methods=['PUT'])
@token_required
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    user.full_name = data.get('full_name', user.full_name)
    user.bio = data.get('bio', user.bio)
    user.address = data.get('address', user.address)
    user.phone = data.get('phone', user.phone)
    user.profile_image = data.get('profile_image', user.profile_image)
    user.age = data.get('age', user.age)
    user.weight = data.get('weight', user.weight)
    user.height = data.get('height', user.height)
    user.gender = data.get('gender', user.gender)
    user.fitness_goal = data.get('fitness_goal', user.fitness_goal)
    user.activity_level = data.get('activity_level', user.activity_level)
    user.experience_level = data.get('experience_level', user.experience_level)
    user.medical_conditions = data.get('medical_conditions', user.medical_conditions)
    user.membership_plan_id = data.get('membership_plan_id', user.membership_plan_id)

    db.session.commit()

    return jsonify({'message': 'User updated successfully'}), 200


# DELETE user (protect this route)
@user_bp.route('/<string:user_id>', methods=['DELETE'])
@token_required
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({'message': f"User '{user.full_name}' deleted"}), 200

# GET current user info using token
@user_bp.route('/me', methods=['GET'])
@token_required
def get_current_user():
    user_info = request.user  # Set by the decorator
    user = User.query.get(user_info['id'])

    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'id': user.id,
        'full_name': user.full_name,
        'email': user.email,
        'bio': user.bio,
        'address': user.address,
        'phone': user.phone,
        'profile_image': user.profile_image,
        'membership_plan_id': user.membership_plan_id
    }), 200

