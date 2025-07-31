# models/workout_session.py


import uuid
from datetime import datetime
from extensions import db
from sqlalchemy.dialects.postgresql import UUID

class WorkoutSession(db.Model):
    __tablename__ = 'workout_sessions'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)

    workout_type = db.Column(db.String(100))     # e.g., Cardio, Strength, Yoga
    duration_minutes = db.Column(db.Integer)     # Time spent working out
    calories_burned = db.Column(db.Float)        # Optional
    workout_date = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="workout_sessions")
