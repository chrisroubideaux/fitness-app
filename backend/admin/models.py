# admin/models.py
import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from werkzeug.security import generate_password_hash, check_password_hash

from extensions import db
from memberships.models import MembershipPlan  # Ensure this stays below db import

class Admin(db.Model):
    __tablename__ = 'admins'

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
    activity_level = db.Column(db.String(50))
    experience_level = db.Column(db.String(50))
    medical_conditions = db.Column(db.Text)

    # Membership relation
    membership_plan_id = db.Column(UUID(as_uuid=True), db.ForeignKey('membership_plans.id'))
    membership_plan = db.relationship("MembershipPlan", backref="admins")

    # Soft-delete support
    is_active = db.Column(db.Boolean, default=True)
    deleted_at = db.Column(db.DateTime, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
