# payments/routes.py
# payments/routes.py
import os
import stripe
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
from sqlalchemy import func

from utils.decorators import token_required_optional  # optional auth
from memberships.models import MembershipPlan
from users.models import User
from extensions import db

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

payments_bp = Blueprint("payments", __name__, url_prefix="/api/payments")

ALLOWED_ORIGINS = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]


def _frontend_domain() -> str:
    # Always without trailing slash
    return (os.environ.get("FRONTEND_URL", "http://localhost:3000") or "").rstrip("/")


# ---------------------------
# Create Stripe Checkout Session
# ---------------------------
@payments_bp.route("/checkout", methods=["POST", "OPTIONS"])
@cross_origin(
    origins=ALLOWED_ORIGINS,
    methods=["POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)
@token_required_optional
def create_checkout_session(current_user=None):
    if request.method == "OPTIONS":
        return "", 200

    data = request.get_json() or {}
    raw_plan_id = data.get("plan_id")
    success_path = data.get("success_path", "/welcome")
    cancel_path = data.get("cancel_path", "/")

    domain = _frontend_domain()

    # --- Normalize the plan id: treat "", None, "free/basic/null/none" as free flow ---
    plan_id_str = ("" if raw_plan_id is None else str(raw_plan_id)).strip()
    if not plan_id_str or plan_id_str.lower() in {"free", "basic", "null", "none"}:
        # No paid checkout → just bounce to your success page (client can attach free plan UI-side)
        return jsonify({"url": f"{domain}{success_path}?planId=free"}), 200

    # --- Paid plan path ---
    plan = MembershipPlan.query.get(plan_id_str)
    if not plan:
        return jsonify({"error": f"Unknown plan_id: {plan_id_str}"}), 400
    if not getattr(plan, "stripe_price_id", None):
        return jsonify({"error": f"Plan '{plan.name}' has no stripe_price_id configured"}), 400

    try:
        session = stripe.checkout.Session.create(
            mode="subscription",  # or "payment" for one-time
            line_items=[{"price": plan.stripe_price_id, "quantity": 1}],
            success_url=f"{domain}{success_path}?planId={plan.id}&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{domain}{cancel_path}",
            allow_promotion_codes=True,
            automatic_tax={"enabled": True},
            customer_email=current_user.email if current_user else None,
            metadata={
                "plan_id": str(plan.id),
                "user_id": str(current_user.id) if current_user else "",
            },
        )
        # Prefer returning sessionId for stripe.redirectToCheckout
        return jsonify({"sessionId": session["id"]}), 200

    except stripe.error.StripeError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------
# Client calls this after Stripe success redirect to bind membership
# ---------------------------
@payments_bp.route("/confirm", methods=["GET", "OPTIONS"])
@cross_origin(
    origins=ALLOWED_ORIGINS,
    methods=["GET", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)
@token_required_optional
def confirm_checkout(current_user=None):
    if request.method == "OPTIONS":
        return "", 200

    session_id = request.args.get("session_id")
    # accept either plan_id or planId
    plan_id = request.args.get("plan_id") or request.args.get("planId")
    if not session_id:
        return jsonify({"error": "Missing session_id"}), 400

    try:
        session = stripe.checkout.Session.retrieve(
            session_id, expand=["subscription", "customer", "customer_details"]
        )
    except Exception as e:
        return jsonify({"error": f"Unable to retrieve session: {e}"}), 400

    if session.get("payment_status") not in ("paid", "no_payment_required"):
        return jsonify({"error": "Payment not completed"}), 400

    # ---- Resolve user ----
    meta = session.get("metadata") or {}
    user = None

    # 1) metadata user_id (if started logged-in)
    if meta.get("user_id"):
        user = User.query.get(meta["user_id"])

    # 2) token user
    if not user and current_user:
        user = current_user

    # 3) email fallback
    if not user:
        email = None
        cust = session.get("customer")
        if isinstance(cust, dict):
            email = cust.get("email")
        if not email:
            email = (session.get("customer_details") or {}).get("email")
        if email:
            user = User.query.filter(func.lower(User.email) == email.lower()).first()

    if not user:
        return jsonify({"error": "Could not resolve user to attach membership"}), 400

    # ---- Resolve plan ----
    if not plan_id:
        plan_id = meta.get("plan_id")
    plan = MembershipPlan.query.get(plan_id) if plan_id else None
    if not plan:
        return jsonify({"error": "Could not resolve plan"}), 400

    # ---- Persist Stripe IDs ----
    stripe_customer_id = None
    cust_obj = session.get("customer")
    if isinstance(cust_obj, str):
        stripe_customer_id = cust_obj
    elif isinstance(cust_obj, dict):
        stripe_customer_id = cust_obj.get("id")

    stripe_subscription_id = None
    if session.get("mode") == "subscription":
        sub = session.get("subscription")
        stripe_subscription_id = sub if isinstance(sub, str) else (sub or {}).get("id")

    if hasattr(user, "stripe_customer_id") and stripe_customer_id:
        if not user.stripe_customer_id:
            user.stripe_customer_id = stripe_customer_id
    if hasattr(user, "stripe_subscription_id"):
        user.stripe_subscription_id = stripe_subscription_id

    # ✅ Attach membership with UUID value
    user.membership_plan_id = plan.id
    db.session.commit()

    return jsonify(
        {
            "message": "Membership updated",
            "user_id": str(user.id),
            "plan_id": str(plan.id),
            "stripe_customer_id": stripe_customer_id,
            "stripe_subscription_id": stripe_subscription_id,
        }
    ), 200


# ---------------------------
# Create Billing Portal session (manage/cancel)
# ---------------------------
@payments_bp.route("/portal", methods=["POST", "OPTIONS"])
@cross_origin(
    origins=ALLOWED_ORIGINS,
    methods=["POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)
@token_required_optional
def billing_portal(current_user=None):
    if request.method == "OPTIONS":
        return "", 200

    if not current_user or not getattr(current_user, "stripe_customer_id", None):
        return jsonify({"error": "No Stripe customer on file"}), 400

    try:
        portal = stripe.billing_portal.Session.create(
            customer=current_user.stripe_customer_id,
            return_url=f"{_frontend_domain()}/profile/{current_user.id}",
        )
        return jsonify({"url": portal.url}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ---------------------------
# Stripe Webhook – source of truth
# (Ensure you don't also register another webhook route elsewhere.)
# ---------------------------
@payments_bp.route("/webhook", methods=["POST"])
def stripe_webhook():
    endpoint_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")
    if not endpoint_secret:
        return jsonify({"error": "Missing STRIPE_WEBHOOK_SECRET"}), 400

    payload = request.data
    sig = request.headers.get("Stripe-Signature")

    try:
        event = stripe.Webhook.construct_event(payload, sig, endpoint_secret)
    except Exception as e:
        return jsonify({"error": str(e)}), 400

    # Helpers
    def plan_from_price_id(price_id: str | None):
        if not price_id:
            return None
        return MembershipPlan.query.filter_by(stripe_price_id=price_id).first()

    def find_user(*, user_id=None, customer_id=None, subscription_id=None, email=None):
        if user_id:
            u = User.query.get(user_id)
            if u:
                return u
        if customer_id:
            u = User.query.filter_by(stripe_customer_id=customer_id).first()
            if u:
                return u
        if subscription_id:
            u = User.query.filter_by(stripe_subscription_id=subscription_id).first()
            if u:
                return u
        if email:
            u = User.query.filter(func.lower(User.email) == (email or "").lower()).first()
            if u:
                return u
        return None

    def attach_membership(u: User, *, subscription_id=None, customer_id=None, price_id=None):
        if customer_id and getattr(u, "stripe_customer_id", None) != customer_id:
            u.stripe_customer_id = customer_id
        if subscription_id:
            u.stripe_subscription_id = subscription_id

        plan = plan_from_price_id(price_id) if price_id else None
        if plan:
            u.membership_plan_id = plan.id  # UUID, not str
        db.session.commit()

    def downgrade_user(u: User):
        u.stripe_subscription_id = None
        u.membership_plan_id = None
        db.session.commit()

    etype = event["type"]
    obj = event["data"]["object"]

    # 1) Checkout success
    if etype == "checkout.session.completed":
        session = obj
        customer_id = session.get("customer")
        subscription_id = session.get("subscription")
        metadata = session.get("metadata") or {}
        user_id = metadata.get("user_id") or None

        # email fallback
        email = None
        if isinstance(session.get("customer_details"), dict):
            email = session["customer_details"].get("email")
        if not email and isinstance(session.get("customer"), dict):
            email = session["customer"].get("email")

        # price id from the subscription
        price_id = None
        try:
            if subscription_id:
                sub = stripe.Subscription.retrieve(subscription_id, expand=["items.data.price"])
                items = (sub.get("items") or {}).get("data") or []
                if items:
                    price_id = (items[0].get("price") or {}).get("id")
        except Exception:
            pass

        user = find_user(user_id=user_id, customer_id=customer_id, subscription_id=subscription_id, email=email)
        if user:
            attach_membership(user, subscription_id=subscription_id, customer_id=customer_id, price_id=price_id)
        return jsonify({"ok": True})

    # 2) Subscription created/updated
    elif etype in ("customer.subscription.created", "customer.subscription.updated"):
        sub = obj
        customer_id = sub.get("customer")
        subscription_id = sub.get("id")
        status = sub.get("status")
        items = (sub.get("items") or {}).get("data") or []
        price_id = (items[0].get("price") or {}).get("id") if items else None

        user = find_user(customer_id=customer_id, subscription_id=subscription_id)
        if not user:
            return jsonify({"ok": True})

        if status in ("active", "trialing", "past_due"):
            attach_membership(user, subscription_id=subscription_id, customer_id=customer_id, price_id=price_id)
        elif status in ("canceled", "unpaid", "incomplete_expired"):
            downgrade_user(user)
        else:
            attach_membership(user, subscription_id=subscription_id, customer_id=customer_id, price_id=price_id)

        return jsonify({"ok": True})

    # 3) Subscription deleted
    elif etype == "customer.subscription.deleted":
        sub = obj
        customer_id = sub.get("customer")
        subscription_id = sub.get("id")
        user = find_user(customer_id=customer_id, subscription_id=subscription_id)
        if user:
            downgrade_user(user)
        return jsonify({"ok": True})

    # Acknowledge all others
    return jsonify({"ok": True})
