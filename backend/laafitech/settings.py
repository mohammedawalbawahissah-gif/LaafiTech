"""
Django settings for the LaafiTech platform.
Distribution / agent / funder / payment / AI verification system for LaafiTech.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# --- Security -----------------------------------------------------------
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-only-insecure-key-change-me")
DEBUG = os.environ.get("DJANGO_DEBUG", "True") == "True"
ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "*").split(",")

# --- Applications ---------------------------------------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "rest_framework",
    "rest_framework.authtoken",
    "corsheaders",
    "django_filters",

    # LaafiTech apps
    "accounts",
    "agents",
    "inventory",
    "distributions",
    "funders",
    "payments",
    "ai_services",
    "reports",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "laafitech.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "laafitech.wsgi.application"

# --- Database (PostgreSQL via Railway in production) ----------------------
# NOTE: GPS coordinates are stored as plain decimal lat/lng fields (not PostGIS)
# to keep deployment simple on Railway's standard Postgres. Swap to PostGIS
# later if proximity/geo-queries become a real need.
# --- Database ---------------------------------------------------------
# Local dev defaults to SQLite (zero setup). Set DB_ENGINE=postgresql
# (and DB_NAME/DB_USER/DB_PASSWORD/DB_HOST/DB_PORT) to point at a real
# Postgres instance — that's what Railway production uses.
DB_ENGINE = os.environ.get("DB_ENGINE", "sqlite")

if DB_ENGINE == "postgresql":
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.environ.get("DB_NAME", "laafitech"),
            "USER": os.environ.get("DB_USER", "postgres"),
            "PASSWORD": os.environ.get("DB_PASSWORD", ""),
            "HOST": os.environ.get("DB_HOST", "localhost"),
            "PORT": os.environ.get("DB_PORT", "5432"),
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# --- Custom user model ----------------------------------------------------
AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "Africa/Accra"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- DRF -------------------------------------------------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 25,
    "DEFAULT_FILTER_BACKENDS": ["django_filters.rest_framework.DjangoFilterBackend"],
}

CORS_ALLOWED_ORIGINS = [o for o in os.environ.get("CORS_ALLOWED_ORIGINS", "").split(",") if o]

# --- Third-party integrations ----------------------------------------------

# Cloudinary (distribution photos)
CLOUDINARY_URL = os.environ.get("CLOUDINARY_URL", "")

# Resend (email)
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")

# MTN MoMo (native disbursement + collections)
MTN_MOMO_API_KEY = os.environ.get("MTN_MOMO_API_KEY", "")
MTN_MOMO_API_USER = os.environ.get("MTN_MOMO_API_USER", "")
MTN_MOMO_SUBSCRIPTION_KEY = os.environ.get("MTN_MOMO_SUBSCRIPTION_KEY", "")
MTN_MOMO_ENV = os.environ.get("MTN_MOMO_ENV", "sandbox")  # sandbox | production
MTN_MOMO_TARGET_ENV = os.environ.get("MTN_MOMO_TARGET_ENV", "sandbox")

# Hubtel (aggregator: Vodafone/AirtelTigo payouts + funder checkout: MoMo/card/bank)
HUBTEL_CLIENT_ID = os.environ.get("HUBTEL_CLIENT_ID", "")
HUBTEL_CLIENT_SECRET = os.environ.get("HUBTEL_CLIENT_SECRET", "")
HUBTEL_MERCHANT_ACCOUNT_NUMBER = os.environ.get("HUBTEL_MERCHANT_ACCOUNT_NUMBER", "")

# Anthropic (Claude API) - impact narratives + education assistant
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")
ANTHROPIC_MODEL = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-4-6")
