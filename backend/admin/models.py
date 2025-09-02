# admin/models.py
# admin/models.py

import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import UniqueConstraint, Index
from extensions import db
from memberships.models import MembershipPlan

class Admin(db.Model):
    __tablename__ = 'admins'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)   # canonical email
    password_hash = db.Column(db.String(512), nullable=False)

    bio = db.Column(db.Text)
    address = db.Column(db.String(255))
    phone_number = db.Column(db.String(20))
    profile_image_url = db.Column(db.String(255))

    # fitness fields...
    age = db.Column(db.Integer)
    weight = db.Column(db.Float)
    height = db.Column(db.Float)
    gender = db.Column(db.String(20))
    fitness_goal = db.Column(db.String(100))
    activity_level = db.Column(db.String(50))
    experience_level = db.Column(db.String(50))
    medical_conditions = db.Column(db.Text)

    membership_plan_id = db.Column(UUID(as_uuid=True), db.ForeignKey('membership_plans.id'))
    membership_plan = db.relationship("MembershipPlan", backref="admins")

    is_active = db.Column(db.Boolean, default=True)
    deleted_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # NEW: identities relationship
    identities = db.relationship(
        "AdminIdentity",
        backref="admin",
        lazy="dynamic",
        cascade="all, delete-orphan"
    )


class AdminIdentity(db.Model):
    __tablename__ = "admin_identities"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    admin_id = db.Column(UUID(as_uuid=True), db.ForeignKey("admins.id", ondelete="CASCADE"), nullable=False)

    provider = db.Column(db.String(40), nullable=False)           # "google", "facebook", etc.
    provider_user_id = db.Column(db.String(191), nullable=False)  # the provider's user id (sub)
    email_at_auth_time = db.Column(db.String(191))                # lowercased snapshot
    email_verified = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("provider", "provider_user_id", name="uq_admin_identity_provider_uid"),
        Index("ix_admin_identity_email_provider", "email_at_auth_time", "provider"),
    )


""""""""""
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
        
        
        
"""""""""
