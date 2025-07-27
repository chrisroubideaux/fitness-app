# routes.py for membership plans
from flask import Blueprint, jsonify
from .models import MembershipPlan, db

membership_bp = Blueprint('memberships', __name__, url_prefix='/api/memberships')

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
