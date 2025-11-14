# backend/payments/webhooks.py
import os
import stripe
from flask import Blueprint, request, jsonify, current_app
from extensions import db
from users.models import User
from memberships.models import MembershipPlan

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "")

stripe_webhooks_bp = Blueprint("stripe_webhooks", __name__, url_prefix="/api/payments")

def _get_event_from_request():
    """Verify the Stripe signature and return the event object."""
    payload = request.data
    sig_header = request.headers.get("Stripe-Signature", "")
    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")
    if not webhook_secret:
        # Fail loudly in dev; in prod you should always set this
        raise RuntimeError("STRIPE_WEBHOOK_SECRET not set")

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=sig_header,
            secret=webhook_secret,
        )
    except Exception as e:
        raise e
    return event

def _update_user_membership(user: User, plan_id: str | None):
    """Set the user's membership_plan_id and commit."""
    user.membership_plan_id = plan_id
    db.session.commit()

def _set_user_stripe_fields_if_present(user: User, *, customer_id: str | None, subscription_id: str | None):
    """Store Stripe IDs only if the columns exist on the User model."""
    dirty = False
    if customer_id and hasattr(user, "stripe_customer_id"):
        if getattr(user, "stripe_customer_id", None) != customer_id:
            setattr(user, "stripe_customer_id", customer_id)
            dirty = True
    if subscription_id and hasattr(user, "stripe_subscription_id"):
        if getattr(user, "stripe_subscription_id", None) != subscription_id:
            setattr(user, "stripe_subscription_id", subscription_id)
            dirty = True
    if dirty:
        db.session.commit()

@stripe_webhooks_bp.route("/webhook", methods=["POST"])
def stripe_webhook():
    try:
        event = _get_event_from_request()
    except Exception as e:
        # Signature verification or parsing failed
        return jsonify({"error": str(e)}), 400

    etype = event.get("type", "")
    data_object = event.get("data", {}).get("object", {})

    # --- 1) Checkout completed: attach plan to user ---
    if etype == "checkout.session.completed":
        session = data_object
        # We put these in metadata during checkout creation
        metadata = session.get("metadata") or {}
        plan_id = metadata.get("plan_id") or None
        user_id = metadata.get("user_id") or None

        # Also capture Stripe IDs
        customer_id = session.get("customer")  # cus_...
        subscription_id = session.get("subscription")  # sub_...

        # Fallback: if plan_id not in metadata, try to infer from the price
        if not plan_id:
            try:
                line_items = stripe.checkout.Session.list_line_items(session["id"], limit=1, expand=["data.price"])
                if line_items and line_items.data:
                    price_obj = line_items.data[0].price  # expanded
                    price_id = price_obj["id"] if price_obj else None
                    if price_id:
                        plan = MembershipPlan.query.filter_by(stripe_price_id=price_id).first()
                        if plan:
                            plan_id = str(plan.id)
            except Exception:
                # If Stripe retrieval fails, we simply skip this fallback
                pass

        # If we have a known user (logged-in checkout), attach the plan now
        if user_id and plan_id:
            user = User.query.get(user_id)
            if user:
                _update_user_membership(user, plan_id)
                _set_user_stripe_fields_if_present(
                    user, customer_id=customer_id, subscription_id=subscription_id
                )
        # If user_id is missing, it was a guest checkout.
        # Typically you’ll complete the linkage when the user signs up/logs in,
        # using the success URL’s query params or by looking up the session.

        return "", 200

    # --- 2) Subscription lifecycle (optional: only works if you store customer/sub IDs) ---
    # If your User model does NOT have stripe_customer_id / stripe_subscription_id, this is a no-op.
    elif etype in ("customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"):
        subscription = data_object
        customer_id = subscription.get("customer")
        status = subscription.get("status")  # 'active', 'canceled', 'past_due', etc.

        # Only proceed if we can match user by stored Stripe customer id.
        if hasattr(User, "stripe_customer_id"):
            user = User.query.filter_by(stripe_customer_id=customer_id).first()
            if user:
                # Keep subscription id if column exists
                _set_user_stripe_fields_if_present(
                    user, customer_id=customer_id, subscription_id=subscription.get("id")
                )

                # If canceled/ended, downgrade to Free (None)
                if etype == "customer.subscription.deleted" or status in ("canceled", "unpaid", "incomplete_expired"):
                    _update_user_membership(user, None)
                # If newly active but no plan set (edge case), you could try to infer the plan via price:
                elif status == "active" and not user.membership_plan_id:
                    try:
                        items = subscription.get("items", {}).get("data", [])
                        price_id = items[0]["price"]["id"] if items else None
                        if price_id:
                            plan = MembershipPlan.query.filter_by(stripe_price_id=price_id).first()
                            if plan:
                                _update_user_membership(user, str(plan.id))
                    except Exception:
                        pass

        return "", 200

    # --- 3) Other events (ack quickly) ---
    # invoice.paid / payment_intent.succeeded etc. are not strictly needed for toggling plans here.
    return "", 200
