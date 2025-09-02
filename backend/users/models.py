# users/models.py
import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from extensions import db
from memberships.models import MembershipPlan

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, index=True, nullable=False)
    password_hash = db.Column(db.String(512), nullable=False)

    bio = db.Column(db.Text)
    address = db.Column(db.String(255))
    phone_number = db.Column(db.String(20))
    profile_image_url = db.Column(db.String(255))

    age = db.Column(db.Integer)
    weight = db.Column(db.Float)
    height = db.Column(db.Float)
    gender = db.Column(db.String(20))
    fitness_goal = db.Column(db.String(100))
    activity_level = db.Column(db.String(50))
    experience_level = db.Column(db.String(50))
    medical_conditions = db.Column(db.Text)

    # ✅ Stripe fields (add these)
    stripe_customer_id = db.Column(db.String(255), index=True, unique=True, nullable=True)
    stripe_subscription_id = db.Column(db.String(255), index=True, unique=True, nullable=True)

    # ✅ Plan linkage
    membership_plan_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey('membership_plans.id', ondelete='SET NULL'),
        nullable=True,
        index=True,
    )
    membership_plan = db.relationship(
        "MembershipPlan",
        backref=db.backref("users", lazy="dynamic"),
        lazy="joined",
    )

    # Workout plans
    workout_plans = db.relationship(
        "WorkoutPlan", back_populates="user", cascade="all, delete-orphan"
    )

    is_active = db.Column(db.Boolean, default=True)
    deleted_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    @property
    def plan_name(self) -> str:
        return self.membership_plan.name if self.membership_plan else "Free"

    def to_me_dict(self):
        return {
            "id": str(self.id),
            "full_name": self.full_name,
            "email": self.email,
            "bio": self.bio,
            "address": self.address,
            "phone_number": self.phone_number,
            "profile_image_url": self.profile_image_url,
            "membership_plan_id": str(self.membership_plan_id) if self.membership_plan_id else None,
            "plan_name": self.membership_plan.name if self.membership_plan else "Free",
            "plan_price": self.membership_plan.price if self.membership_plan else 0.0,
            "plan_features": self.membership_plan.features if self.membership_plan else [],
            # optional to expose:
            # "stripe_customer_id": self.stripe_customer_id,
            # "stripe_subscription_id": self.stripe_subscription_id,
        }