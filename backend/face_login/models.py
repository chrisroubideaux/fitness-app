# backend/face/models.py
# backend/face/models.py
import uuid
from sqlalchemy.dialects.postgresql import UUID, ARRAY, FLOAT
from extensions import db


class FaceEmbedding(db.Model):
    __tablename__ = "face_embeddings"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Either user OR admin
    user_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )
    admin_id = db.Column(   # ✅ NEW
        UUID(as_uuid=True),
        db.ForeignKey("admins.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )

    embedding = db.Column(ARRAY(FLOAT), nullable=False)  # 512 floats from AuraFace
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # relationships
    user = db.relationship("User", back_populates="face_embeddings")
    admin = db.relationship("Admin", back_populates="face_embeddings")  # ✅ NEW

    def __repr__(self):
        return f"<FaceEmbedding user_id={self.user_id} admin_id={self.admin_id} id={self.id}>"

""""""""""
import uuid
from sqlalchemy.dialects.postgresql import UUID, ARRAY, FLOAT
from extensions import db


class FaceEmbedding(db.Model):
    __tablename__ = "face_embeddings"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(
        UUID(as_uuid=True),
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    embedding = db.Column(ARRAY(FLOAT), nullable=False)  # 512 floats from AuraFace
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    # relationship back to User
    user = db.relationship("User", back_populates="face_embeddings")

    def __repr__(self):
        return f"<FaceEmbedding user_id={self.user_id} id={self.id}>"
"""""