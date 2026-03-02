"""
database.py – Database connection setup.

"""

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ─── Database URL ─────────────────────────────────────────────────────────────
# os.getenv checks for an environment variable first.
# If not found, falls back to local SQLite file "hrms.db"
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hrms.db")

# SQLite needs this special flag. For PostgreSQL, remove the connect_args.
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

# SessionLocal is a factory – calling SessionLocal() gives you a DB session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class that all models inherit from (used by SQLAlchemy to track tables)
Base = declarative_base()
