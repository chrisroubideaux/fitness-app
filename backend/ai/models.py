# backend/ai/models.py

import uuid
from datetime import datetime, timezone
from sqlalchemy.dialects.postgresql import UUID
from extensions import db

class WorkoutPlan(db.Model):
    __tablename__ = 'workout_plans'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc)  
    )

    user = db.relationship("User", back_populates="workout_plans")

