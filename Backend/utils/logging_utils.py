import json, time, logging
from typing import Any

logger = logging.getLogger("joblog")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(message)s')  # raw JSON per line
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

def log_event(job_id: str | None, stage: str, action: str, **fields: Any) -> None:
    """Emit a structured JSON log line for job stages."""
    payload = {
        "ts": round(time.time(), 3),
        "job_id": job_id,
        "stage": stage,
        "action": action,
        **fields,
    }
    try:
        logger.info(json.dumps(payload, ensure_ascii=False))
    except Exception:
        pass

class StageTimer:
    def __init__(self, job_id: str | None, stage: str):
        self.job_id = job_id
        self.stage = stage
        self.start = None
    def __enter__(self):
        self.start = time.perf_counter()
        log_event(self.job_id, self.stage, "start")
        return self
    def __exit__(self, exc_type, exc, tb):
        dur = None
        if self.start is not None:
            dur = round(time.perf_counter() - self.start, 3)
        success = exc_type is None
        log_event(self.job_id, self.stage, "end", success=success, duration_sec=dur, error=str(exc) if exc else None)
        return False
