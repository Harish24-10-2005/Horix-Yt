# Backend (FastAPI) – Horix-YT

AI‑assisted multi‑stage YouTube video generation & media management API. Provides content ideation, script + image prompt generation, placeholder image & TTS synthesis, video assembly hook points, gallery archival, avatars, and user authentication.

## 1. Capabilities
- Auth: register / login / profile update / change password (PBKDF2 + HMAC token)
- User avatar upload & serving (resized)
- Video pipeline endpoints (content, scripts, images, voices, edit placeholder, captions)
- Unified prototype endpoint `/api/video/pipeline`
- Per-job manifest JSON (`jobs/<id>/manifest.json`) + structured stage logs
- Per-user video archival + on-demand thumbnail generation & caching
- Gallery operations: list, stream video, get thumbnail, rename, delete
- Settings bootstrap & lightweight runtime DB column migration
- Docker image with ffmpeg installed

## 2. Directory Overview
| Path | Purpose |
|------|---------|
| Config/ | Settings loader & environment resolution |
| Router/ | FastAPI routers (video, auth, gallery, avatar) |
| Controller/ | Orchestrates multi-stage pipeline |
| Services/ | Adaptors/wrappers for Agents (LLM, audio, etc.) |
| Agents/ | Prompting, generation, media transformation logic |
| db/ | Models, CRUD, DB init & migrations |
| jobs/ | Per-job manifests & utilities |
| assets/ | Generated / input assets (images, VoiceScripts, music, avatars) |
| output/ | Assembled videos & user archives |
| static/, templates/ | Static + Jinja templates (root page) |
| smoke_test.py | Offline test (monkeypatched external calls) |

## 3. Install & Run (Local)
```powershell
cd Backend
python -m venv .venv
& .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
# (optional) set API keys
$env:GEMINI_API_KEY = 'sk-...'
uvicorn main:app --reload --port 8000
```
Docs: http://localhost:8000/docs

## 4. Auth Flow
1. POST `/api/auth/register` (email, password)
2. POST `/api/auth/login` -> returns `{ token, user }`
3. Client sends `Authorization: Bearer <token>` for protected routes (to be enforced on gallery soon)
4. `/api/auth/me`, `/api/auth/profile`, `/api/auth/change-password`

## 5. Key Endpoints (Selection)
| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/video/content | Generate outline/content |
| POST | /api/video/scripts | Scripts + image prompts |
| POST | /api/video/images | Placeholder image artifacts |
| POST | /api/video/voices | Voice file generation (mock / TTS) |
| POST | /api/video/pipeline | Run chained prototype pipeline |
| GET  | /api/video/jobs/{id} | Manifest retrieval |
| GET  | /api/gallery/{user_id} | List archived videos |
| POST | /api/gallery/{user_id}/rename | Rename video file |
| DELETE | /api/gallery/{user_id}/{video_name} | Delete video |
| GET | /api/gallery/{user_id}/thumb/{video_name} | Thumbnail (auto-generate) |
| POST | /api/avatar | Upload avatar |
| GET | /api/avatar/{user_id} | Serve avatar image |

## 6. Running Tests
```powershell
& .\.venv\Scripts\Activate.ps1
python smoke_test.py      # Full stubbed pipeline
python test_content.py    # Content stage check
```
Extend with pytest for additional coverage.

## 7. Logging & Manifests
Each stage emits structured JSON log lines (stdout) including: `ts`, `job_id`, `stage`, `action`, `success`, and optional `info`. Manifests aggregate artifacts & timing for post‑hoc debugging.

## 8. Configuration
Environment variables (optional overrides):
- `GEMINI_API_KEY`, `GROQ_API_KEY1..3`
- `FFMPEG_PATH`, `FFPROBE_PATH`
- `ASSETS_DIR`, `OUTPUT_DIR`, `USER_OUTPUT_DIR`, `AVATARS_DIR`, `JOBS_DIR`
- `CLEAN_ON_START` (bool) – if implemented for cleanup logic

## 9. Docker
Build via top-level compose:
```powershell
docker compose build backend
docker compose up -d backend
```
Mounts persist `output/`, `assets/`, `jobs/` between restarts.

## 10. Gallery Notes
- Thumbnails produced lazily via moviepy (frame extraction) or placeholder gradient fallback.
- Rename & delete endpoints include basic sanitization; further auth checks recommended.
- Files stored under: `output/users/<user_id>/<uuid>_<originalname>.mp4`

## 11. Roadmap
- Enforce auth dependency on gallery & avatar endpoints
- Background worker (Celery / RQ / asyncio tasks) for heavy steps
- Proper video assembly & caption rendering pipeline (currently stub/placeholder in parts)
- Metrics (Prometheus) + health checks
- Rate limiting, audit logs, improved error taxonomy
- JWT or refresh token rotation strategy

## 12. Troubleshooting
| Issue | Cause | Resolution |
|-------|-------|------------|
| ImportError fastapi | Wrong venv | Activate `.venv` before running scripts |
| Email validation error | Missing `email-validator` | Reinstall requirements (now listed) |
| Slow first thumbnail | First decode | Subsequent hits cached file |
| 401 auth failures | Expired token | Re-login & resend Authorization header |

## 13. License
MIT (adjust as needed).

---
For UI & usage patterns see root README and `Frontend/README.md`.
