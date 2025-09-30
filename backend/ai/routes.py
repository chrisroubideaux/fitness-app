 # ai/routes.py
from flask import Blueprint, request, jsonify
from ai.workout_generator import generate_workout_plan
from ai.models import WorkoutPlan
from extensions import db
from ai.decorators import token_required
from datetime import timezone

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')


@ai_bp.route('/generate-workout', methods=['POST'])
@token_required
def generate_and_save_workout(current_user):
    data = request.get_json()

    required_fields = ['goal', 'age', 'gender', 'weight', 'height', 'activity_level', 'experience_level']
    missing = [field for field in required_fields if field not in data]
    if missing:
        return jsonify({'error': f"Missing fields: {', '.join(missing)}"}), 400

    try:
        plan = generate_workout_plan(data)

        # Save to DB with UTC-aware timestamp
        new_plan = WorkoutPlan(
            user_id=current_user.id,
            content=plan
        )
        db.session.add(new_plan)
        db.session.commit()

        return jsonify({
            'message': 'Workout plan generated and saved',
            'plan_id': str(new_plan.id),
            'workout_plan': plan
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@ai_bp.route('/my-workout-plans', methods=['GET'])
@token_required
def get_my_workout_plans(current_user):
    plans = (
        WorkoutPlan.query
        .filter_by(user_id=current_user.id)
        .order_by(WorkoutPlan.created_at.desc())
        .all()
    )

    return jsonify({
        'workout_plans': [
            {
                'id': str(plan.id),
                'content': plan.content,
                # ✅ Force proper UTC ISO string with Z at the end
                'created_at': plan.created_at.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
            }
            for plan in plans
        ]
    }), 200


@ai_bp.route('/delete-workout-plan/<plan_id>', methods=['DELETE'])
@token_required
def delete_workout_plan(current_user, plan_id):
    try:
        plan = WorkoutPlan.query.filter_by(id=plan_id, user_id=current_user.id).first()

        if not plan:
            return jsonify({'error': 'Workout plan not found or not authorized'}), 404

        db.session.delete(plan)
        db.session.commit()

        return jsonify({'message': 'Workout plan deleted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

