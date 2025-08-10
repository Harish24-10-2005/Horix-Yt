"""Job manifest utilities.

Each job gets a directory jobs/<job_id>/ with a manifest.json tracking
stage status, artifacts, metadata. Controller expects:
 - create_job(title, video_mode, user_id?, channel_type?) -> manifest dict
 - update_stage(job_id, stage, success: bool, artifact?, info?)
 - load_manifest(job_id) -> manifest dict

Manifest shape example:
{
  "job_id": "abc123",
  "title": "My Video",
  "video_mode": false,
  "user_id": null,
  "channel_type": null,
  "created_ts": 1234567890.123,
  "stages": {
	 "content": {"success": true, "ts": 123..., "info": {...}},
	 "scripts": { ... },
	 ...
  },
  "artifacts": {"edit": "output/standard_video.mp4", ...},
  "complete": false
}
"""

from __future__ import annotations
import os, json, time, uuid, threading
from typing import Any, Dict, Optional
from utils.logging_utils import log_event

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
JOBS_ROOT = os.path.join(BASE_DIR)

_manifest_locks: Dict[str, threading.Lock] = {}

def _job_dir(job_id: str) -> str:
	return os.path.join(JOBS_ROOT, job_id)

def _manifest_path(job_id: str) -> str:
	return os.path.join(_job_dir(job_id), 'manifest.json')

def _get_lock(job_id: str) -> threading.Lock:
	if job_id not in _manifest_locks:
		_manifest_locks[job_id] = threading.Lock()
	return _manifest_locks[job_id]

def _write_manifest(job_id: str, data: Dict[str, Any]) -> None:
	path = _manifest_path(job_id)
	os.makedirs(os.path.dirname(path), exist_ok=True)
	tmp = path + '.tmp'
	with open(tmp, 'w', encoding='utf-8') as f:
		json.dump(data, f, ensure_ascii=False, indent=2)
	os.replace(tmp, path)

def _read_manifest(job_id: str) -> Dict[str, Any]:
	path = _manifest_path(job_id)
	if not os.path.exists(path):
		raise FileNotFoundError(f"Manifest not found for job {job_id}")
	with open(path, 'r', encoding='utf-8') as f:
		return json.load(f)

def create_job(title: str, video_mode: bool, user_id: Optional[str] = None, channel_type: Optional[str] = None) -> Dict[str, Any]:
	job_id = uuid.uuid4().hex[:12]
	job_path = _job_dir(job_id)
	os.makedirs(job_path, exist_ok=True)
	manifest = {
		'job_id': job_id,
		'title': title,
		'video_mode': bool(video_mode),
		'user_id': user_id,
		'channel_type': channel_type,
		'created_ts': round(time.time(), 3),
		'stages': {},  # stage_name -> {success, ts, info}
		'artifacts': {},
		'complete': False
	}
	with _get_lock(job_id):
		_write_manifest(job_id, manifest)
	log_event(job_id, 'job', 'create', title=title, video_mode=video_mode)
	return manifest

def update_stage(job_id: str, stage: str, success: bool, artifact: Optional[str] = None, info: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
	info = info or {}
	with _get_lock(job_id):
		manifest = _read_manifest(job_id)
		manifest['stages'][stage] = {
			'success': bool(success),
			'ts': round(time.time(), 3),
			'info': info
		}
		if artifact:
			manifest['artifacts'][stage] = artifact
		if stage == 'complete':
			manifest['complete'] = success
		_write_manifest(job_id, manifest)
	log_event(job_id, stage, 'update', success=success, artifact=artifact, **({'info': info} if info else {}))
	return manifest

def load_manifest(job_id: str) -> Dict[str, Any]:
	with _get_lock(job_id):
		return _read_manifest(job_id)

# Optional: cleanup utility
def list_jobs(limit: int = 50) -> list[dict[str, Any]]:
	jobs = []
	for name in sorted(os.listdir(JOBS_ROOT)):
		jp = os.path.join(JOBS_ROOT, name)
		if os.path.isdir(jp) and len(name) >= 8:
			mp = os.path.join(jp, 'manifest.json')
			if os.path.exists(mp):
				try:
					jobs.append(_read_manifest(name))
				except Exception:
					pass
		if len(jobs) >= limit:
			break
	return jobs

