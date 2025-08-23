# scripts/seed_stripe_prices.py
# payments/seed_stripe_prices.py
import os
import sys
from typing import Optional, Dict

from flask import Flask
from sqlalchemy.exc import IntegrityError

# Make sure we can import your project packages when running as a script
# (backend is the cwd in your example).
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import db + models from your app
from extensions import db                 # noqa: E402
from memberships.models import MembershipPlan  # noqa: E402


def create_app() -> Flask:
    """
    Minimal Flask app for running inside a script.
    Uses environment variables only (no config.py).
    """
    app = Flask(__name__)

    # DB connection string — set this in your env
    # e.g. postgresql+psycopg2://user:pass@localhost:5432/fitness
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "")
    if not app.config["SQLALCHEMY_DATABASE_URI"]:
        raise RuntimeError(
            "DATABASE_URL is not set. Example:\n"
            "  set DATABASE_URL=postgresql+psycopg2://user:pass@localhost:5432/fitness"
        )

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)
    return app


def env_prices() -> Dict[str, str]:
    """
    Read Stripe price IDs for known plan names from env.
    Add more mappings if you have more plans.
    """
    return {
        # plan_name(lowercase) -> env var value
        "pro": os.getenv("STRIPE_PRICE_PRO", "").strip(),
        "elite": os.getenv("STRIPE_PRICE_ELITE", "").strip(),
        # "starter": os.getenv("STRIPE_PRICE_STARTER", "").strip(),
    }


def pick_price_for_plan(plan_name: str, prices: Dict[str, str]) -> Optional[str]:
    key = plan_name.lower().strip()
    # exact match first
    if key in prices and prices[key]:
        return prices[key]
    # loose contains (e.g., "Pro 2025" -> "pro")
    for k, v in prices.items():
        if v and k in key:
            return v
    return None


def main() -> None:
    app = create_app()
    price_map = env_prices()

    if not any(price_map.values()):
        print(
            "No Stripe price IDs found in env.\n"
            "Set at least one of:\n"
            "  STRIPE_PRICE_PRO=price_XXXX\n"
            "  STRIPE_PRICE_ELITE=price_YYYY\n"
        )
        sys.exit(1)

    with app.app_context():
        plans = MembershipPlan.query.order_by(MembershipPlan.name.asc()).all()
        if not plans:
            print("No membership plans found in DB.")
            sys.exit(1)

        print(f"Found {len(plans)} plans. Seeding stripe_price_id where possible...\n")

        updated = 0
        skipped = 0
        for plan in plans:
            want = pick_price_for_plan(plan.name, price_map)
            if not want:
                print(f"⚠️  No env price configured for plan '{plan.name}'. Skipping.")
                skipped += 1
                continue

            if plan.stripe_price_id == want:
                print(f"=  '{plan.name}' already set to {want}")
                continue

            print(f"*  Setting '{plan.name}' stripe_price_id -> {want}")
            plan.stripe_price_id = want
            updated += 1

        if updated:
            try:
                db.session.commit()
                print(f"\n✅ Done. Updated {updated} plan(s). Skipped {skipped}.")
            except IntegrityError as e:
                db.session.rollback()
                print(
                    "\n❌ Commit failed due to IntegrityError (likely duplicate stripe_price_id). "
                    "Ensure each plan maps to a UNIQUE Stripe price id.\n"
                )
                raise
        else:
            print(f"\nℹ️  Nothing to update. Skipped {skipped}.")


if __name__ == "__main__":
    main()
