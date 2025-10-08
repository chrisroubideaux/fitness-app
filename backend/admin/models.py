# admin/models.py
import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import UniqueConstraint, Index
from extensions import db
from memberships.models import MembershipPlan


class Admin(db.Model):
    __tablename__ = "admins"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Basic info
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)  # canonical email
    password_hash = db.Column(db.String(512), nullable=False)

    # Profile info
    bio = db.Column(db.Text)
    address = db.Column(db.String(255))
    phone_number = db.Column(db.String(20))
    profile_image_url = db.Column(db.String(255))   # portrait / avatar
    profile_banner_url = db.Column(db.String(255))  # wide hero-style image

    # Fitness fields
    age = db.Column(db.Integer)
    weight = db.Column(db.Float)
    height = db.Column(db.Float)
    gender = db.Column(db.String(20))
    fitness_goal = db.Column(db.String(100))
    activity_level = db.Column(db.String(50))
    experience_level = db.Column(db.String(50))   # Beginner / Intermediate / Advanced
    experience_years = db.Column(db.Integer)      # years of experience
    certifications = db.Column(db.Text)           # e.g. JSON or comma-separated
    specialties = db.Column(db.Text)              # e.g. "Strength, Yoga"
    medical_conditions = db.Column(db.Text)

    # Scheduling & training fields
    days = db.Column(db.String(255))     # e.g. "Mon, Wed, Fri"
    times = db.Column(db.String(255))    # e.g. "10am-11am, 6pm-7pm"
    group = db.Column(db.String(100))    # e.g. "Personal training", "Class size: 10-12"
    virtual_session = db.Column(db.Boolean, default=False)  # True if trainer offers online classes

    # Role & permissions
    role = db.Column(db.String(50), default="trainer_admin")

    # Membership association
    membership_plan_id = db.Column(UUID(as_uuid=True), db.ForeignKey("membership_plans.id"))
    membership_plan = db.relationship("MembershipPlan", backref="admins")

    # Social media links ✅
    facebook = db.Column(db.String(255))
    instagram = db.Column(db.String(255))
    youtube = db.Column(db.String(255))
    tiktok = db.Column(db.String(255))

    # System fields
    is_active = db.Column(db.Boolean, default=True)
    deleted_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # OAuth / federated identities
    identities = db.relationship(
        "AdminIdentity",
        backref="admin",
        lazy="dynamic",
        cascade="all, delete-orphan"
    )
    # Face embeddings (shared table)
    face_embeddings = db.relationship(
        "FaceEmbedding", back_populates="admin", cascade="all, delete-orphan"
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

class AdminFace(db.Model):
    __tablename__ = "admin_faces"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Link back to Admin
    admin_id = db.Column(UUID(as_uuid=True), db.ForeignKey("admins.id", ondelete="CASCADE"), nullable=False)
    admin = db.relationship("Admin", backref=db.backref("faces", lazy="dynamic", cascade="all, delete-orphan"))

    # Store embeddings vector as JSON (list of floats)
    embedding = db.Column(db.JSON, nullable=False)

    # Optional metadata
    image_url = db.Column(db.String(512))   # GCS URL of the face image
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

""""""""""

# admin/models.py
import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import UniqueConstraint, Index
from extensions import db
from memberships.models import MembershipPlan


class Admin(db.Model):
    __tablename__ = "admins"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Basic info
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)  # canonical email
    password_hash = db.Column(db.String(512), nullable=False)

    # Profile info
    bio = db.Column(db.Text)
    address = db.Column(db.String(255))
    phone_number = db.Column(db.String(20))
    profile_image_url = db.Column(db.String(255))   # portrait / avatar
    profile_banner_url = db.Column(db.String(255))  # wide hero-style image

    # Fitness fields
    age = db.Column(db.Integer)
    weight = db.Column(db.Float)
    height = db.Column(db.Float)
    gender = db.Column(db.String(20))
    fitness_goal = db.Column(db.String(100))
    activity_level = db.Column(db.String(50))
    experience_level = db.Column(db.String(50))   # Beginner / Intermediate / Advanced
    experience_years = db.Column(db.Integer)      # years of experience
    certifications = db.Column(db.Text)           # e.g. JSON or comma-separated
    specialties = db.Column(db.Text)              # e.g. "Strength, Yoga"
    medical_conditions = db.Column(db.Text)

    # Scheduling & training fields
    days = db.Column(db.String(255))     # e.g. "Mon, Wed, Fri"
    times = db.Column(db.String(255))    # e.g. "10am-11am, 6pm-7pm"
    group = db.Column(db.String(100))    # e.g. "Personal training", "Class size: 10-12"
    virtual_session = db.Column(db.Boolean, default=False)  # True if trainer offers online classes

    # Role & permissions
    role = db.Column(db.String(50), default="trainer_admin")

    # Membership association
    membership_plan_id = db.Column(UUID(as_uuid=True), db.ForeignKey("membership_plans.id"))
    membership_plan = db.relationship("MembershipPlan", backref="admins")

    # Social media links ✅
    facebook = db.Column(db.String(255))
    instagram = db.Column(db.String(255))
    youtube = db.Column(db.String(255))
    tiktok = db.Column(db.String(255))

    # System fields
    is_active = db.Column(db.Boolean, default=True)
    deleted_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # OAuth / federated identities
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

class AdminFace(db.Model):
    __tablename__ = "admin_faces"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Link back to Admin
    admin_id = db.Column(UUID(as_uuid=True), db.ForeignKey("admins.id", ondelete="CASCADE"), nullable=False)
    admin = db.relationship("Admin", backref=db.backref("faces", lazy="dynamic", cascade="all, delete-orphan"))

    # Store embeddings vector as JSON (list of floats)
    embedding = db.Column(db.JSON, nullable=False)

    # Optional metadata
    image_url = db.Column(db.String(512))   # GCS URL of the face image
    created_at = db.Column(db.DateTime, default=datetime.utcnow)





"""""""""
