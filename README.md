# Horix-YT Full Stack (FastAPI + React)

End-to-end AI assisted YouTube content generation & media management platform. Backend (FastAPI) orchestrates multi‑stage pipeline (ideation ➜ scripts ➜ images ➜ voice ➜ edit ➜ captions ➜ archive) with per‑user galleries, avatars, auth & job manifests. Frontend (React 19) delivers animated UX with authentication gate, profile management, media gallery (rename/delete with optimistic retries), thumbnail previews, and avatar upload.

## 1. Features Overview
### Backend
- FastAPI modular routers (`/api/video/*`, `/api/auth/*`, gallery & avatar endpoints)
- PBKDF2 password hashing + signed HMAC bearer tokens (stateless auth)
- Profile: get/update, change password, avatar upload & serving
- Video generation pipeline (staged endpoints + unified pipeline prototype)
- Per-job manifest JSON (traceability & structured logging)
- Per-user archival of rendered videos + on-demand thumbnail generation
- Gallery operations (list, stream, thumbnail, rename, delete)
- Automatic directory bootstrap & light runtime "migration" for new DB columns
- Dockerized (multi-stage, ffmpeg available)

### Frontend
- React 19 functional architecture, Context providers (Auth, Pipeline)
- Framer Motion + styled-components for polished transitions
- Auth pages (register/login) with validation & animated panels
- Protected routes post-login, session storage token persistence
- Profile hub: tabs (Profile / Security / Gallery)
- Gallery grid with modal preview, inline rename, delete, optimistic UI + exponential retry
- Avatar upload (auto refresh forthcoming) and placeholder fallback
- Toast / inline status badges for async operations

## 2. Monorepo Layout
```
Backend/              FastAPI app & services
Frontend/             React app (build served separately via nginx in container)
assets/               Root shared asset seed (optional)
output/               (Root-level) convenience; backend uses Backend/output
jobs/                 (Root-level) convenience; backend uses Backend/jobs
README.md             (This file)
```
Backend key subfolders: `Agents/`, `Services/`, `Controller/`, `Router/`, `db/`, `Config/`, `jobs/`, `assets/`, `output/`.

## 3. Quick Start (Local Dev)
### Backend
```powershell
cd Backend
python -m venv .venv
& .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
# (Optional) set API keys: $env:GEMINI_API_KEY="..." etc.
uvicorn main:app --reload --port 8000
```
Visit: http://localhost:8000/docs

Run smoke test (offline monkeypatched pipeline):
```powershell
python smoke_test.py
```

### Frontend
```powershell
cd Frontend
npm install
npm start
```
Visit: http://localhost:3000

## 4. Docker Compose
Prereqs: Docker Desktop.
```powershell
docker compose build
# Provide env vars or .env file in project root for GEMINI / GROQ keys
docker compose up -d
```
Services:
- Backend: http://localhost:8000
- Frontend (nginx): http://localhost:3000

## 5. Environment Variables
Backend (examples):
- GEMINI_API_KEY, GROQ_API_KEY1..3
- FFMPEG_PATH, FFPROBE_PATH (default ffmpeg/ffprobe on PATH)
- OUTPUT_DIR, USER_OUTPUT_DIR, AVATARS_DIR (override paths as needed)

Frontend:
- REACT_APP_AUTH_BASE (e.g. http://localhost:8000/api/auth)
- REACT_APP_API_BASE (if added; otherwise internal default)

Place in root `.env` for docker compose or per app `.env`.

## 6. Auth Flow (Summary)
1. User registers (`/api/auth/register`) → hashed password stored
2. Login returns token (HMAC signed, expiry embedded)
3. Frontend stores token in `sessionStorage` & sets auth header for API calls
4. Protected components redirect to login if token invalid/expired

## 7. Gallery & Media
- Rendered video copied to `output/users/<user_id>/<uuid>_<original>`
- Thumbnail auto-generated on first request and cached alongside (`.jpg`)
- Endpoints provide listing metadata (size, mtime, friendly name)
- Rename & delete validated, optimistic UI with rollback if final failure

## 8. Testing
Fast checks:
```powershell
cd Backend
& .\.venv\Scripts\Activate.ps1
python smoke_test.py
python test_content.py
```
(Extend with pytest for broader coverage.)

## 9. Planned Enhancements
- Enforce auth middleware on gallery & avatar endpoints (currently permissive)
- Avatar display refresh on upload (frontend binding)
- Background job queue for heavy video assembly
- Pagination & lazy loading for large galleries
- Centralized error boundary + logging dashboard
- Rate limiting & audit events

## 10. Troubleshooting
| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| 401 on protected calls | Missing/expired token | Re-login; ensure header `Authorization: Bearer <token>` |
| Thumbnails slow first time | On-demand generation | Subsequent loads use cached file |
| Smoke test fails on email validator | Missing dependency | Reinstall requirements (`pip install -r requirements.txt`) |
| Cannot import fastapi | Wrong venv active | Activate `.venv` then retry |

## 11. Security Notes
Current token is HMAC custom; consider migrating to JWT (PyJWT) or session cookies with refresh rotation. Add authorization checks to media endpoints before production deployment.

## 12. License
MIT (adjust if needed).

---
This top-level README summarizes both backend and frontend. See `Backend/README.md` and `Frontend/README.md` for deeper, domain-specific details.
