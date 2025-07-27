# routes.py for membership plans
from flask import Blueprint, jsonify, request
from .models import MembershipPlan, db

membership_bp = Blueprint('memberships', __name__, url_prefix='/api/memberships')


# ✅ New POST route to create a plan
@membership_bp.route('/', methods=['POST'])
def create_membership():
    data = request.get_json()

    # Validate required fields
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
    ])
