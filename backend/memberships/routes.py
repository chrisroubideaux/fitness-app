# memberships/routes.py
# memberships/routes.py
from flask import Blueprint, request, jsonify
from extensions import db
from .models import MembershipPlan

membership_bp = Blueprint('memberships', __name__, url_prefix='/api/memberships')


# --- Helpers ---------------------------------------------------------------

def serialize_plan(plan: MembershipPlan):
    return {
        "id": plan.id,
        "name": plan.name,
        "price": float(plan.price) if plan.price is not None else 0.0,
        "description": plan.description,
        "features": plan.features or [],
    }

def coerce_features(val):
    # Ensure features is a list of strings
    if val is None:
        return []
    if isinstance(val, list):
        return val
    # Accept a comma-separated string as a fallback
    if isinstance(val, str):
        parts = [p.strip() for p in val.split(',') if p.strip()]
        return parts
    return []


# --- Preflight (explicit OPTIONS) -----------------------------------------

@membership_bp.route('/', methods=['OPTIONS'])
def memberships_preflight_collection():
    # CORS headers are added in app.after_request; 204 is fine
    return ("", 204)

@membership_bp.route('/<string:plan_id>', methods=['OPTIONS'])
def memberships_preflight_item(plan_id):
    return ("", 204)


# --- Collection ------------------------------------------------------------

# GET all membership plans
@membership_bp.route('/', methods=['GET'])
def get_all_memberships():
    plans = MembershipPlan.query.all()
    return jsonify([serialize_plan(p) for p in plans]), 200


# POST - create a new membership plan
@membership_bp.route('/', methods=['POST'])
def create_membership():
    data = request.get_json(silent=True) or {}

    required_fields = ['name', 'price']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    new_plan = MembershipPlan(
        name=data.get('name'),
        price=data.get('price'),
        description=data.get('description', ''),
        features=coerce_features(data.get('features')),
    )
    db.session.add(new_plan)
    db.session.commit()

    # Return the plan object (not wrapped) to match frontend expectations
    return jsonify(serialize_plan(new_plan)), 201


# --- Item ------------------------------------------------------------------

# GET a single membership by UUID
@membership_bp.route('/<string:plan_id>', methods=['GET'])
def get_membership(plan_id):
    plan = MembershipPlan.query.get(plan_id)
    if not plan:
        return jsonify({"error": "Membership plan not found"}), 404
    return jsonify(serialize_plan(plan)), 200


# PATCH - partial update (used by your admin UI)
@membership_bp.route('/<string:plan_id>', methods=['PATCH'])
def patch_membership(plan_id):
    plan = MembershipPlan.query.get(plan_id)
    if not plan:
        return jsonify({"error": "Membership plan not found"}), 404

    data = request.get_json(silent=True) or {}

    if 'name' in data:
        plan.name = data['name']
    if 'price' in data:
        plan.price = data['price']
    if 'description' in data:
        plan.description = data['description']
    if 'features' in data:
        plan.features = coerce_features(data['features'])

    db.session.commit()
    return jsonify(serialize_plan(plan)), 200


# PUT - full update (kept for compatibility)
@membership_bp.route('/<string:plan_id>', methods=['PUT'])
def update_membership(plan_id):
    plan = MembershipPlan.query.get(plan_id)
    if not plan:
        return jsonify({"error": "Membership plan not found"}), 404

    data = request.get_json(silent=True) or {}

    plan.name = data.get('name', plan.name)
    plan.price = data.get('price', plan.price)
    plan.description = data.get('description', plan.description)
    if 'features' in data:
        plan.features = coerce_features(data['features'])

    db.session.commit()
    return jsonify(serialize_plan(plan)), 200


# DELETE - remove a membership plan by UUID
@membership_bp.route('/<string:plan_id>', methods=['DELETE'])
def delete_membership(plan_id):
    plan = MembershipPlan.query.get(plan_id)
    if not plan:
        return jsonify({"error": "Membership plan not found"}), 404

    db.session.delete(plan)
    db.session.commit()
    return jsonify({"message": f"Membership plan '{plan.name}' deleted"}), 200

    

"""""""""""""""
from flask import Blueprint, request, jsonify
from .models import MembershipPlan, db

membership_bp = Blueprint('memberships', __name__, url_prefix='/api/memberships')

# GET all membership plans
@membership_bp.route('/', methods=['GET'])
def get_all_memberships():
    plans = MembershipPlan.query.all()
    return jsonify([
        {
            "id": plan.id,
            "name": plan.name,
            "price": plan.price,
            "description": plan.description,
            "features": plan.features
        }
        for plan in plans
    ]), 200

# GET a single membership by UUID
@membership_bp.route('/<string:plan_id>', methods=['GET'])
def get_membership(plan_id):
    plan = MembershipPlan.query.get(plan_id)
    if not plan:
        return jsonify({"error": "Membership plan not found"}), 404

    return jsonify({
        "id": plan.id,
        "name": plan.name,
        "price": plan.price,
        "description": plan.description,
        "features": plan.features
    }), 200

# POST - create a new membership plan
@membership_bp.route('/', methods=['POST'])
def create_membership():
    data = request.get_json()

    required_fields = ['name', 'price', 'description', 'features']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    new_plan = MembershipPlan(
        name=data['name'],
        price=data['price'],
        description=data['description'],
        features=data['features']
    )
    db.session.add(new_plan)
    db.session.commit()

    return jsonify({
        "message": "Membership plan created",
        "plan": {
            "id": new_plan.id,
            "name": new_plan.name,
            "price": new_plan.price,
            "description": new_plan.description,
            "features": new_plan.features
        }
    }), 201

# PUT - update a membership plan by UUID
@membership_bp.route('/<string:plan_id>', methods=['PUT'])
def update_membership(plan_id):
    plan = MembershipPlan.query.get(plan_id)
    if not plan:
        return jsonify({"error": "Membership plan not found"}), 404

    data = request.get_json()
    plan.name = data.get('name', plan.name)
    plan.price = data.get('price', plan.price)
    plan.description = data.get('description', plan.description)
    plan.features = data.get('features', plan.features)

    db.session.commit()

    return jsonify({
        "message": "Membership plan updated",
        "plan": {
            "id": plan.id,
            "name": plan.name,
            "price": plan.price,
            "description": plan.description,
            "features": plan.features
        }
    }), 200

# DELETE - remove a membership plan by UUID
@membership_bp.route('/<string:plan_id>', methods=['DELETE'])
def delete_membership(plan_id):
    print(f"Attempting to delete membership with ID: {plan_id}")
    plan = MembershipPlan.query.get(plan_id)

    if not plan:
        print("Plan not found.")
        return jsonify({"error": "Membership plan not found"}), 404

    db.session.delete(plan)
    db.session.commit()
    print(f"Deleted membership plan: {plan.name}")

    return jsonify({"message": f"Membership plan '{plan.name}' deleted"}), 200
    
"""""""""""