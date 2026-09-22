"""
Configuration Module for Hospital Management System
Loads environment variables from .env file securely.
"""

import os
from dotenv import load_dotenv

# Load environment variables from the .env file if it exists
load_dotenv()

class Config:
    """Base application and Oracle Database configuration settings."""
    
    # Oracle Database Credentials
    ORACLE_USER = os.getenv("ORACLE_USER", "").strip()
    ORACLE_PASSWORD = os.getenv("ORACLE_PASSWORD", "").strip()
    ORACLE_HOST = os.getenv("ORACLE_HOST", "localhost").strip()
    ORACLE_PORT = int(os.getenv("ORACLE_PORT", "1521"))
    ORACLE_SERVICE_NAME = os.getenv("ORACLE_SERVICE_NAME", "XEPDB1").strip()
    
    # Flask Server Settings
    FLASK_PORT = int(os.getenv("FLASK_PORT", "5000"))
    FLASK_DEBUG = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1", "yes")

    @classmethod
    def is_configured(cls) -> bool:
        """Check if minimum required credentials (user and password) are supplied."""
        return bool(cls.ORACLE_USER and cls.ORACLE_PASSWORD)
