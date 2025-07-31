# routes.py for admin
# admin/routes.py
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from uuid import uuid4
from extensions import db
from .models import Admin
from users.models import User  
from .jwt_token import generate_admin_jwt_token
from .decorators import admin_token_required  # ✅ admin-specific decorator

admin_bp = Blueprint('admins', __name__, url_prefix='/api/admins')

# REGISTER a new admin
@admin_bp.route('/register', methods=['POST'])
def register_admin():
    data = request.get_json()
    required_fields = ['email', 'password', 'full_name']

    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing field: {field}'}), 400

    if Admin.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400

    hashed_password = generate_password_hash(data['password'])

    new_admin = Admin(
        id=str(uuid4()),
        full_name=data['full_name'],
        email=data['email'],
        password_hash=hashed_password,
        bio=data.get('bio'),
        address=data.get('address'),
        phone_number=data.get('phone'),
        profile_image_url=data.get('profile_image'),
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

    db.session.add(new_admin)
    db.session.commit()

    return jsonify({'message': 'Admin registered successfully', 'admin_id': str(new_admin.id)}), 201

# LOGIN admin
@admin_bp.route('/login', methods=['POST'])
def login_admin():
    data = request.get_json()
    admin = Admin.query.filter_by(email=data.get('email')).first()

    if not admin or not check_password_hash(admin.password_hash, data.get('password')):
        return jsonify({'error': 'Invalid email or password'}), 401

    token = generate_admin_jwt_token(str(admin.id), admin.email)

    return jsonify({
        'message': 'Login successful',
        'admin_id': str(admin.id),
        'token': token
    }), 200

# GET all admins
@admin_bp.route('/', methods=['GET'])
@admin_token_required
def get_all_admins(current_admin):
    admins = Admin.query.all()
    return jsonify([
        {
            'admin_id': str(admin.id),
            'full_name': admin.full_name,
            'email': admin.email,
            'bio': admin.bio,
            'address': admin.address,
            'phone_number': admin.phone_number,
            'profile_image_url': admin.profile_image_url,
            'membership_plan_id': admin.membership_plan_id
        } for admin in admins
    ]), 200

# GET single admin by ID
@admin_bp.route('/<string:admin_id>', methods=['GET'])
@admin_token_required
def get_admin(current_admin, admin_id):
    admin = Admin.query.get(admin_id)
    if not admin:
        return jsonify({'error': 'Admin not found'}), 404

    return jsonify({
        'admin_id': str(admin.id),
        'full_name': admin.full_name,
        'email': admin.email,
        'bio': admin.bio,
        'address': admin.address,
        'phone_number': admin.phone_number,
        'profile_image_url': admin.profile_image_url,
        'membership_plan_id': admin.membership_plan_id
    }), 200

# UPDATE admin
@admin_bp.route('/<string:admin_id>', methods=['PUT'])
@admin_token_required
def update_admin(current_admin, admin_id):
    admin = Admin.query.get(admin_id)
    if not admin:
        return jsonify({'error': 'Admin not found'}), 404

    data = request.get_json()
    admin.full_name = data.get('full_name', admin.full_name)
    admin.bio = data.get('bio', admin.bio)
    admin.address = data.get('address', admin.address)
    admin.phone_number = data.get('phone', admin.phone_number)
    admin.profile_image_url = data.get('profile_image', admin.profile_image_url)
    admin.age = data.get('age', admin.age)
    admin.weight = data.get('weight', admin.weight)
    admin.height = data.get('height', admin.height)
    admin.gender = data.get('gender', admin.gender)
    admin.fitness_goal = data.get('fitness_goal', admin.fitness_goal)
    admin.activity_level = data.get('activity_level', admin.activity_level)
    admin.experience_level = data.get('experience_level', admin.experience_level)
    admin.medical_conditions = data.get('medical_conditions', admin.medical_conditions)
    admin.membership_plan_id = data.get('membership_plan_id', admin.membership_plan_id)

    db.session.commit()

    return jsonify({'message': 'Admin updated successfully'}), 200

# DELETE admin
@admin_bp.route('/<string:admin_id>', methods=['DELETE'])
@admin_token_required
def delete_admin(current_admin, admin_id):
    admin = Admin.query.get(admin_id)
    if not admin:
        return jsonify({'error': 'Admin not found'}), 404

    db.session.delete(admin)
    db.session.commit()

    return jsonify({'message': f"Admin '{admin.full_name}' deleted"}), 200

# GET current logged-in admin (token-based)
@admin_bp.route('/me', methods=['GET', 'OPTIONS'])
@admin_token_required
def get_current_admin(current_admin):
    if request.method == 'OPTIONS':
        return '', 200

    return jsonify({
        'admin_id': current_admin.id,
        'full_name': current_admin.full_name,
        'email': current_admin.email,
        'bio': current_admin.bio,
        'address': current_admin.address,
        'phone_number': current_admin.phone_number,
        'profile_image_url': current_admin.profile_image_url,
        'membership_plan_id': current_admin.membership_plan_id
        
    })
    
# DELETE any user (admin only)
@admin_bp.route('/delete_user/<string:user_id>', methods=['DELETE'])
@admin_token_required
def delete_any_user(current_admin, user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({'message': f"Admin '{current_admin.full_name}' deleted user '{user.full_name}'"}), 200
    
    
# LOGOUT admin (frontend handles token deletion)
@admin_bp.route('/logout', methods=['POST'])
@admin_token_required
def logout_admin(current_admin):
    return jsonify({'message': 'Admin logged out successfully'}), 200


