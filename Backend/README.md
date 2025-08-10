# YouTube Video Generation Service

Structured FastAPI-based pipeline for automated YouTube (shorts & long-form) content: content ideation, script generation, image prompt scaffolding, TTS, video assembly, music integration, captions, and job manifest tracking.

## Key Features
- Per-job manifest (jobs/<id>/manifest.json) with stage outcomes & artifacts.
- Unified pipeline endpoint `/api/video/pipeline` (synchronous prototype).
- Structured JSON logging per stage (utils/logging_utils.py).
- Voice generation via Groq TTS with key rotation.
- Timing metadata from script generation (voice pacing + image slice estimates).

## Directory Overview
- Config/: Settings loader (no pydantic) with directory auto-creation.
- Controller/: Orchestration logic + full pipeline method.
- Services/: Thin service layer around Agents (content, scripts, voices, edit, captions, music).
- Agents/: Model-facing & media logic (LLM prompts, TTS, editing, captioning).
- jobs/: Job utilities (create/update/load manifest).
- utils/: Logging & shared exceptions.
- output/: Produced videos & intermediates.
- assets/: Input / generated assets (images, VoiceScripts, music).

## Quick Start
```powershell
# Activate env (example)
& .\Scripts\Activate.ps1

# Run API (note: current pipeline endpoint is CPU/IO heavy and blocking)
python -m uvicorn main:app --host 0.0.0.0 --port 8000
```

Submit content stage:
```powershell
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/api/video/content -ContentType 'application/json' -Body '{"title":"Why small habits matter","video_mode":false}'
```

Run full pipeline:
```powershell
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/api/video/pipeline -ContentType 'application/json' -Body '{"title":"Focus power story","video_mode":false}'
```

Check job manifest:
```powershell
Invoke-RestMethod -Method Get -Uri http://127.0.0.1:8000/api/video/jobs/<job_id>
```

## Next Steps Toward Production
1. Background processing & async queue (Celery/RQ or internal worker) for pipeline endpoint.
2. Robust error propagation for caption & edit subprocesses (already partially in place for edit).
3. Authentication / rate limiting / allowed origins.
4. Metrics & health endpoints.
5. Tests (pytest + FastAPI TestClient) for each stage and failure path.
6. Containerization + CI pipeline.
7. Cleanup job for stale manifests & large artifacts.

## Testing Without Server
Two helper scripts exist:
- `test_job_flow.py` (content + scripts + manifest check)
- `test_full_pipeline.py` (runs full pipeline, logs durations)

## Logging
Each stage emits start/end JSON lines (logger name `joblog`). Example:
```json
{"ts": 1234567890.123, "job_id": "abc123", "stage": "scripts", "action": "end", "success": true, "duration_sec": 12.345}
```

## Voice Generation
Only standard Groq TTS is supported (cloning feature removed to simplify dependencies and footprint).

## Disclaimer
Current image generation & music stages are placeholders; integrate real generation logic and update EditAgentService expectations before production use.
