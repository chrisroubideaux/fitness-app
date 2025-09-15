# backend/appointments/email_utils.py
import smtplib
from email.mime.text import MIMEText
import os

def send_email(to_address, subject, body):
    """
    Send an email using SMTP credentials from environment variables.
    Falls back gracefully if SMTP fails (prints instead of crashing).
    """

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = os.getenv("SMTP_FROM", "noreply@fitbylena.com")
    msg["To"] = to_address

    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_pass = os.getenv("SMTP_PASS", "")

    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
            server.starttls()
            if smtp_user and smtp_pass:
                server.login(smtp_user, smtp_pass)
            server.sendmail(msg["From"], [msg["To"]], msg.as_string())
        print(f"✅ Email sent to {to_address}")
        return True
    except Exception as e:
        print(f"⚠️ Email failed to {to_address}: {e}")
        print("Email body was:\n", body)
        return False
