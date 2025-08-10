"""CRUD utilities for users and jobs."""
from __future__ import annotations
from sqlalchemy import select
from sqlalchemy.orm import Session
from .models import User, Job, JobStatus, VideoAsset
from datetime import datetime
from typing import Optional, List, Dict, Any

# Users

def get_or_create_user(db: Session, user_id: str, email: str, display_name: str | None = None) -> User:
    user = db.get(User, user_id)
    if user:
        return user
    user = User(id=user_id, email=email, display_name=display_name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    from sqlalchemy import select
    stmt = select(User).where(User.email==email)
    return db.execute(stmt).scalars().first()

def create_user_with_password(db: Session, user_id: str, email: str, password_hash: str, display_name: str | None = None) -> User:
    user = User(id=user_id, email=email, display_name=display_name, password_hash=password_hash)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# Jobs

def create_job_record(db: Session, job_id: str, user_id: str, title: str, channel_type: str | None, video_mode: bool) -> Job:
    job = Job(id=job_id, user_id=user_id, title=title, channel_type=channel_type, video_mode=video_mode)
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

def update_job_status(db: Session, job_id: str, status: JobStatus, error: str | None = None, meta_update: Dict[str, Any] | None = None):
    job = db.get(Job, job_id)
    if not job:
        return None
    job.status = status
    if status in (JobStatus.failed, JobStatus.completed):
        job.finished_at = datetime.utcnow()
    if error:
        job.error_summary = error
    if meta_update:
        # merge dicts
        job.meta = {**(job.meta or {}), **meta_update}
    db.commit()
    db.refresh(job)
    return job

def list_user_jobs(db: Session, user_id: str, limit: int = 50) -> List[Job]:
    stmt = select(Job).where(Job.user_id == user_id).order_by(Job.started_at.desc()).limit(limit)
    return list(db.execute(stmt).scalars())

def get_user_job(db: Session, user_id: str, job_id: str) -> Job | None:
    job = db.get(Job, job_id)
    if job and job.user_id == user_id:
        return job
    return None

# Video Assets
def add_video_asset(db: Session, asset_id: str, user_id: str, title: str, path: str, thumbnail: str | None, duration_sec: int | None, meta: Dict[str, Any] | None = None, job_id: str | None = None) -> VideoAsset:
    asset = VideoAsset(id=asset_id, user_id=user_id, title=title, path=path, thumbnail=thumbnail, duration_sec=duration_sec, meta=meta or {}, job_id=job_id)
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset

def list_video_assets(db: Session, user_id: str, limit: int = 40) -> List[VideoAsset]:
    from sqlalchemy import select
    stmt = select(VideoAsset).where(VideoAsset.user_id==user_id).order_by(VideoAsset.created_at.desc()).limit(limit)
    return list(db.execute(stmt).scalars())

def delete_video_asset(db: Session, user_id: str, asset_id: str) -> bool:
    asset = db.get(VideoAsset, asset_id)
    if not asset or asset.user_id != user_id:
        return False
    db.delete(asset)
    db.commit()
    return True
