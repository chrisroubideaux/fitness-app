# users/models.py
import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from werkzeug.security import generate_password_hash, check_password_hash

from extensions import db
from memberships.models import MembershipPlan  # 👈 Must be below db import to avoid circular import
# User model (add this inside the class)


class User(db.Model):
    # Inside class User:
    __tablename__ = 'users'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(512), nullable=False)

    # Optional profile info
    bio = db.Column(db.Text)
    address = db.Column(db.String(255))
    phone_number = db.Column(db.String(20))
    profile_image_url = db.Column(db.String(255))

    # Fitness profile fields
    age = db.Column(db.Integer)
    weight = db.Column(db.Float)
    height = db.Column(db.Float)
    gender = db.Column(db.String(20))
    fitness_goal = db.Column(db.String(100))
    activity_level = db.Column(db.String(50))       # e.g., Sedentary, Moderate, Active
    experience_level = db.Column(db.String(50))     # e.g., Beginner, Intermediate, Advanced
    medical_conditions = db.Column(db.Text)

    # Membership relationship
    membership_plan_id = db.Column(UUID(as_uuid=True), db.ForeignKey('membership_plans.id'))
    membership_plan = db.relationship("MembershipPlan", backref="users")
    
     # Workout plans relationship ✅
    workout_plans = db.relationship("WorkoutPlan", back_populates="user", cascade="all, delete-orphan")

    # Audit fields
    is_active = db.Column(db.Boolean, default=True)  # Soft-delete flag
    deleted_at = db.Column(db.DateTime, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
