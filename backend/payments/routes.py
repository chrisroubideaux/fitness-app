# payments/routes.py

import os
import stripe
from flask import Blueprint, request, jsonify
from sqlalchemy import func
from utils.decorators import token_required_optional  # optional auth
from memberships.models import MembershipPlan
from users.models import User
from extensions import db
from datetime import datetime, timezone



stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

payments_bp = Blueprint("payments", __name__, url_prefix="/api/payments")

# Toggle Automatic Tax via env (enable only if your test-mode origin address is set in Stripe)
ENABLE_AUTO_TAX = os.getenv("STRIPE_AUTOMATIC_TAX", "0").lower() in ("1", "true", "yes")


def _frontend_domain() -> str:
    return (os.environ.get("FRONTEND_URL", "http://localhost:3000") or "").rstrip("/")


# --- helper: validate any saved Stripe customer id for this account ---
def _validated_customer_id(current_user):
    """Return a usable Stripe customer id for this account, or None if stale/invalid."""
    if not current_user or not getattr(current_user, "stripe_customer_id", None):
        return None
    try:
        cust = stripe.Customer.retrieve(current_user.stripe_customer_id)
        return cust["id"]
    except stripe.error.InvalidRequestError:
        # Stale or wrong-account customer; ignore it so Checkout creates a fresh one
        return None


# ---------------------------
# Create Stripe Checkout Session
# ---------------------------
@payments_bp.route("/checkout", methods=["POST", "OPTIONS"])
@token_required_optional
def create_checkout_session(current_user=None):
    if request.method == "OPTIONS":
        return "", 200

    data = request.get_json() or {}
    raw_plan_id = data.get("plan_id")
    # default to your actual success page
    success_path = data.get("success_path", "/billing/success")
    cancel_path = data.get("cancel_path", "/")

    domain = _frontend_domain()

    # Treat "", None, "free/basic/null/none" as free
    plan_id_str = ("" if raw_plan_id is None else str(raw_plan_id)).strip()
    if not plan_id_str or plan_id_str.lower() in {"free", "basic", "null", "none"}:
        return jsonify({"url": f"{domain}{success_path}?planId=free"}), 200

    # Paid plan
    plan = MembershipPlan.query.get(plan_id_str)
    if not plan:
        return jsonify({"error": f"Unknown plan_id '{plan_id_str}'"}), 400

    if not getattr(plan, "stripe_price_id", None):
        return jsonify({
            "error": "MissingStripePriceId",
            "message": f"Plan '{plan.name}' (id={plan.id}) has no stripe_price_id configured. "
                       f"Please add a valid Stripe Price ID in your DB or when creating the plan."
        }), 400

    # Validate any saved customer id (avoid 400 if it's from a different account)
    customer_id = _validated_customer_id(current_user)
    customer_email = (current_user.email if current_user else None)

    try:
        session_args = {
            "mode": "subscription",
            "line_items": [{"price": plan.stripe_price_id, "quantity": 1}],
            "success_url": f"{domain}{success_path}?planId={plan.id}&session_id={{CHECKOUT_SESSION_ID}}",
            "cancel_url": f"{domain}{cancel_path}",
            "allow_promotion_codes": True,
            "metadata": {
                "plan_id": str(plan.id),
                "user_id": str(current_user.id) if current_user else "",
            },
        }

        # Only pass one of these
        if customer_id:
            session_args["customer"] = customer_id
        elif customer_email:
            session_args["customer_email"] = customer_email

        # Conditionally enable Automatic Tax if configured
        if ENABLE_AUTO_TAX:
            session_args["automatic_tax"] = {"enabled": True}
            # Optional: require address so taxes can be calculated accurately
            session_args["billing_address_collection"] = "required"

        session = stripe.checkout.Session.create(**session_args)
        # Return both so the client can prefer hosted URL (avoids pk/sk/account mismatch issues)
        return jsonify({"sessionId": session["id"], "url": session.get("url")}), 200

    except stripe.error.StripeError as e:
        # Better error reporting: show Stripe's friendly message
        msg = getattr(e, "user_message", None) or str(e)
        try:
            err = e.json_body.get("error", {})  
            print("StripeError:", {
                "message": err.get("message"),
                "code": err.get("code"),
                "param": err.get("param"),
                "type": err.get("type"),
            })
        except Exception:
            print("StripeError:", msg)
        return jsonify({"error": "StripeError", "message": msg}), 400
    except Exception as e:
        print("ServerError:", repr(e))
        return jsonify({"error": "ServerError", "message": str(e)}), 500


# ---------------------------
# Client calls this after Stripe success redirect to bind membership
# ---------------------------
@payments_bp.route("/confirm", methods=["GET", "OPTIONS"])
@token_required_optional
def confirm_checkout(current_user=None):
    if request.method == "OPTIONS":
        return "", 200

    session_id = request.args.get("session_id")
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

    # Resolve user
    meta = session.get("metadata") or {}
    user = None
    if meta.get("user_id"):
        user = User.query.get(meta["user_id"])
    if not user and current_user:
        user = current_user
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

    # Resolve plan
    if not plan_id:
        plan_id = meta.get("plan_id")
    plan = MembershipPlan.query.get(plan_id) if plan_id else None
    if not plan:
        return jsonify({"error": "Could not resolve plan"}), 400

    # Persist Stripe IDs
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
# NEW: Change plan (1-click upgrade/downgrade)
# ---------------------------
@payments_bp.route("/change-plan", methods=["POST", "OPTIONS"])
@token_required_optional
def change_plan(current_user=None):
    if request.method == "OPTIONS":
        return "", 200

    if not current_user or not getattr(current_user, "stripe_subscription_id", None):
        return jsonify({"error": "No active subscription on file"}), 400

    data = request.get_json() or {}
    plan_id = (data.get("plan_id") or "").strip()
    if not plan_id:
        return jsonify({"error": "Missing plan_id"}), 422

    plan = MembershipPlan.query.get(plan_id)
    if not plan or not plan.stripe_price_id:
        return jsonify({"error": "Target plan invalid or not billable"}), 400

    try:
        sub = stripe.Subscription.retrieve(
            current_user.stripe_subscription_id, expand=["items.data"]
        )
        items = (sub.get("items") or {}).get("data") or []
        if not items:
            return jsonify({"error": "Subscription has no items"}), 400

        item_id = items[0]["id"]
        # If already on this price, do nothing
        current_price = (items[0].get("price") or {}).get("id")
        if current_price == plan.stripe_price_id:
            return jsonify({"ok": True, "subscription_id": sub["id"], "noop": True}), 200

        updated = stripe.Subscription.modify(
            sub["id"],
            items=[{"id": item_id, "price": plan.stripe_price_id}],
            proration_behavior="create_prorations",
        )
        # Webhook will update user.membership_plan_id
        return jsonify({"ok": True, "subscription_id": updated["id"]}), 200

    except stripe.error.StripeError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------
# NEW: Cancel subscription (switch to Free)
# ---------------------------
@payments_bp.route("/cancel", methods=["POST", "OPTIONS"])
@token_required_optional
def cancel_subscription(current_user=None):
    if request.method == "OPTIONS":
        return "", 200

    if not current_user or not getattr(current_user, "stripe_subscription_id", None):
        return jsonify({"error": "No active subscription on file"}), 400

    data = request.get_json() or {}
    at_period_end = bool(data.get("at_period_end", True)) 

    try:
        if at_period_end:
            stripe.Subscription.modify(
                current_user.stripe_subscription_id,
                cancel_at_period_end=True,
            )
        else:
            stripe.Subscription.delete(current_user.stripe_subscription_id)

        return jsonify({"ok": True}), 200
    except stripe.error.StripeError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------
# Stripe Webhook – source of truth
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
            u.membership_plan_id = plan.id
        db.session.commit()

    def downgrade_user(u: User):
        u.stripe_subscription_id = None
        u.membership_plan_id = None
        db.session.commit()

    etype = event["type"]
    obj = event["data"]["object"]

    if etype == "checkout.session.completed":
        session = obj
        customer_id = session.get("customer")
        subscription_id = session.get("subscription")
        metadata = session.get("metadata") or {}
        user_id = metadata.get("user_id") or None

        email = None
        if isinstance(session.get("customer_details"), dict):
            email = session["customer_details"].get("email")
        if not email and isinstance(session.get("customer"), dict):
            email = session["customer"].get("email")

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

    elif etype == "customer.subscription.deleted":
        sub = obj
        customer_id = sub.get("customer")
        subscription_id = sub.get("id")
        user = find_user(customer_id=customer_id, subscription_id=subscription_id)
        if user:
            downgrade_user(user)
        return jsonify({"ok": True})

    return jsonify({"ok": True})

# --- Subscription summary (next bill date & amount) ---
# --- Subscription summary (next bill date & amount) ---
@payments_bp.route("/summary", methods=["GET", "OPTIONS"])
@token_required_optional
def subscription_summary(current_user=None):
    if request.method == "OPTIONS":
        return "", 200

    if not current_user:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        # Resolve plan name from DB (fallback to "Free")
        plan_id = getattr(current_user, "membership_plan_id", None)
        plan_name = "Free"
        try:
            if plan_id:
                p = MembershipPlan.query.get(plan_id)
                if p and p.name:
                    plan_name = p.name
        except Exception as db_e:
            print("[/summary] DB plan lookup failed:", repr(db_e))

        sub_id = getattr(current_user, "stripe_subscription_id", None)
        if not sub_id:
            return jsonify({
                "has_subscription": False,
                "plan": {"id": plan_id, "name": plan_name},
                "next_bill": None
            }), 200

        # Retrieve subscription; handle "no such subscription" gracefully
        try:
            sub = stripe.Subscription.retrieve(
                sub_id,
                expand=["items.data.price.product"]
            )
        except stripe.error.InvalidRequestError as e:
            print("[/summary] subscription retrieve error:", getattr(e, "user_message", str(e)))
            return jsonify({
                "has_subscription": False,
                "plan": {"id": plan_id, "name": plan_name},
                "next_bill": None
            }), 200

        status = sub.get("status")
        period_end_unix = sub.get("current_period_end")
        cancel_at_period_end = bool(sub.get("cancel_at_period_end"))

        # If DB didn't give a name, derive from Stripe product/nickname
        if plan_name == "Free":
            items = (sub.get("items") or {}).get("data") or []
            if items:
                price = items[0].get("price") or {}
                product = price.get("product")
                nickname = price.get("nickname")
                if isinstance(product, dict) and product.get("name"):
                    plan_name = product["name"]
                elif nickname:
                    plan_name = nickname

        # Figure next amount
        amount = None
        currency = None
        if status in ("active", "trialing", "past_due"):
            try:
                upcoming = stripe.Invoice.upcoming(subscription=sub_id)
                amount = upcoming.get("total") or upcoming.get("amount_due")
                currency = (upcoming.get("currency") or "usd").lower()
            except stripe.error.StripeError as inv_e:
                print("[/summary] invoice.upcoming fallback:", getattr(inv_e, "user_message", str(inv_e)))
                items = (sub.get("items") or {}).get("data") or []
                if items:
                    price = items[0].get("price") or {}
                    unit = price.get("unit_amount")
                    qty = items[0].get("quantity") or 1
                    if unit is not None:
                        amount = unit * qty
                        currency = (price.get("currency") or "usd").lower()

        date_iso = None
        if isinstance(period_end_unix, int):
            date_iso = datetime.fromtimestamp(period_end_unix, tz=timezone.utc).isoformat()

        return jsonify({
            "has_subscription": status in ("active", "trialing", "past_due"),
            "plan": {"id": plan_id, "name": plan_name},
            "next_bill": {
                "amount": amount,
                "currency": currency,
                "date_unix": period_end_unix,
                "date_iso": date_iso,
            },
            "status": status,
            "cancel_at_period_end": cancel_at_period_end,
        }), 200

    except stripe.error.StripeError as e:
        msg = getattr(e, "user_message", None) or str(e)
        print("[/summary] StripeError:", msg)
        return jsonify({"error": "StripeError", "message": msg}), 400
    except Exception as e:
        # Final safety: never 500 the UI
        print("[/summary] ServerError:", repr(e))
        return jsonify({
            "has_subscription": False,
            "plan": {"id": getattr(current_user, "membership_plan_id", None), "name": "Free"},
            "next_bill": None
        }), 200
