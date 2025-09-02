"""placeholder for conversations/messages that was removed

Revision ID: 0512e75ad873
Revises: 0d3899eba1ae
Create Date: 2025-09-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0512e75ad873"
down_revision = "0d3899eba1ae"
branch_labels = None
depends_on = None


def upgrade():
    # This is intentionally empty; the original migration was deleted.
    pass


def downgrade():
    # This is intentionally empty.
    pass
