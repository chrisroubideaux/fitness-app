from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "372e423789fa"
down_revision = "0aefb9ebe773"
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table("chats", schema=None) as batch_op:
        batch_op.add_column(sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True))
        batch_op.add_column(sa.Column("is_guest", sa.Boolean(), nullable=True))
        batch_op.alter_column(
            "email",
            existing_type=sa.VARCHAR(length=120),
            nullable=True,
        )
        batch_op.create_index(batch_op.f("ix_chats_email"), ["email"], unique=False)
        batch_op.create_index(batch_op.f("ix_chats_user_id"), ["user_id"], unique=False)
        batch_op.create_foreign_key(
            None,
            "users",
            ["user_id"],
            ["id"],
            ondelete="SET NULL",
        )

    # Backfill existing rows so old chats become guest chats
    op.execute("UPDATE chats SET is_guest = TRUE WHERE is_guest IS NULL")

    with op.batch_alter_table("chats", schema=None) as batch_op:
        batch_op.alter_column(
            "is_guest",
            existing_type=sa.Boolean(),
            nullable=False,
            server_default=sa.text("true"),
        )


def downgrade():
    with op.batch_alter_table("chats", schema=None) as batch_op:
        batch_op.drop_constraint(None, type_="foreignkey")
        batch_op.drop_index(batch_op.f("ix_chats_user_id"))
        batch_op.drop_index(batch_op.f("ix_chats_email"))
        batch_op.alter_column(
            "email",
            existing_type=sa.VARCHAR(length=120),
            nullable=False,
        )
        batch_op.drop_column("is_guest")
        batch_op.drop_column("user_id")