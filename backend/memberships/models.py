# models.py for membership plans
# memberships/models.py

import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from extensions import db

class MembershipPlan(db.Model):
    __tablename__ = 'membership_plans'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(100), nullable=False, unique=True)
    price = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text, nullable=False)
    features = db.Column(db.JSON, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
