"""SQLAlchemy models for user-scoped jobs.

Using SQLite for now (Supabase Postgres later). Run init_db() at startup.
"""
from __future__ import annotations
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import (
    Column, String, DateTime, Enum, Boolean, ForeignKey, Integer, JSON, create_engine, Text
)
import enum

Base = declarative_base()

class JobStatus(str, enum.Enum):
    initialized = 'initialized'
    running = 'running'
    failed = 'failed'
    completed = 'completed'

class User(Base):
    __tablename__ = 'users'
    id = Column(String, primary_key=True)  # supply UUID from app
    email = Column(String, unique=True, index=True, nullable=False)
    display_name = Column(String, nullable=True)
    password_hash = Column(String, nullable=True)  # new for auth (nullable for legacy rows)
    avatar_filename = Column(String, nullable=True)
    api_keys = Column(JSON, default=dict, nullable=False)  # per-user provider keys (stored plain for now)
    theme_pref = Column(String, nullable=True)  # 'light' | 'dark' (null => default frontend)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    jobs = relationship('Job', back_populates='user', cascade='all,delete')

class Job(Base):
    __tablename__ = 'jobs'
    id = Column(String, primary_key=True)  # job uuid
    user_id = Column(String, ForeignKey('users.id', ondelete='CASCADE'), index=True, nullable=False)
    title = Column(String, nullable=False)
    channel_type = Column(String, nullable=True)
    video_mode = Column(Boolean, default=False, nullable=False)
    status = Column(Enum(JobStatus), default=JobStatus.initialized, nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    finished_at = Column(DateTime, nullable=True)
    error_summary = Column(Text, nullable=True)
    meta = Column(JSON, default=dict, nullable=False)
    user = relationship('User', back_populates='jobs')

# Simple engine helper (local sqlite by default)
_engine = None
SessionLocal = None

def init_db(database_url: str = 'sqlite:///./app.db'):
    global _engine, SessionLocal
    from sqlalchemy.orm import sessionmaker
    _engine = create_engine(database_url, future=True)
    SessionLocal = sessionmaker(bind=_engine, autocommit=False, autoflush=False, future=True)
    Base.metadata.create_all(_engine)
    # Simple runtime migration: add password_hash column if missing (SQLite only)
    try:
        with _engine.connect() as conn:
            res = conn.exec_driver_sql("PRAGMA table_info(users)")
            cols = [r[1] for r in res]
            if 'password_hash' not in cols:
                conn.exec_driver_sql("ALTER TABLE users ADD COLUMN password_hash VARCHAR")
            if 'avatar_filename' not in cols:
                conn.exec_driver_sql("ALTER TABLE users ADD COLUMN avatar_filename VARCHAR")
            if 'api_keys' not in cols:
                conn.exec_driver_sql("ALTER TABLE users ADD COLUMN api_keys JSON DEFAULT '{}' ")
            if 'theme_pref' not in cols:
                conn.exec_driver_sql("ALTER TABLE users ADD COLUMN theme_pref VARCHAR")
    except Exception:
        pass
    return _engine

# Dependency (FastAPI style) - if later integrated
from contextlib import contextmanager
@contextmanager
def get_session():
    if SessionLocal is None:
        init_db()
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
