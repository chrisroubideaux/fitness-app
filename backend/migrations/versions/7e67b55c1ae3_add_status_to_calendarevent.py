"""Add status to CalendarEvent

Revision ID: 7e67b55c1ae3
Revises: b590adb727ed
Create Date: 2025-09-15 09:24:14.607279

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7e67b55c1ae3'
down_revision = 'b590adb727ed'
branch_labels = None
depends_on = None


def upgrade():
    # Add column with a default so existing rows get a value
    with op.batch_alter_table('calendar_events', schema=None) as batch_op:
        batch_op.add_column(
            sa.Column('status', sa.String(length=50), nullable=False, server_default='pending')
        )


def downgrade():
    with op.batch_alter_table('calendar_events', schema=None) as batch_op:
        batch_op.drop_column('status')
