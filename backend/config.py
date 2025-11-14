# backend/config.py
import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    # -----------------------------------------------------
    # Core App + Security
    # -----------------------------------------------------
    SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key")

    # Database
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "fitness_app")

    SQLALCHEMY_DATABASE_URI = (
        f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # -----------------------------------------------------
    # JWT / Auth
    # -----------------------------------------------------
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=6)

    # -----------------------------------------------------
    # API / CORS
    # -----------------------------------------------------
    CORS_HEADERS = "Content-Type"
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
    API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:5000")

    # -----------------------------------------------------
    # 💬 Lena AI Auto-Response Settings
    # -----------------------------------------------------
    AUTO_ADMIN_ENABLED = os.getenv("AUTO_ADMIN_ENABLED", "true").lower() == "true"

    # Fixed Lena system admin ID (UUID in your DB)
    SYSTEM_ADMIN_ID = os.getenv(
        "SYSTEM_ADMIN_ID",
        "00000000-0000-0000-0000-000000000002"
    )

    # Lena persona prompt (used when generating AI replies)
    LENA_PERSONA = os.getenv(
        "LENA_PERSONA",
        (
            "You are Lena — a kind, empathetic AI fitness trainer and "
            "virtual assistant for the FitByLena app. You provide helpful, "
            "motivational responses about workouts, membership plans, and wellness."
        ),
    )

    # Toxicity filter settings
    TOXICITY_THRESHOLD = float(os.getenv("TOXICITY_THRESHOLD", "0.6"))

    # Optional external API keys (already safe if empty)
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    HUGGINGFACE_TOKEN = os.getenv("HUGGINGFACE_TOKEN", "")

    # -----------------------------------------------------
    # Misc / Logging
    # -----------------------------------------------------
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
