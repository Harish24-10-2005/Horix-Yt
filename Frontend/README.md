# Frontend (React 19) – Horix-YT

Animated authenticated dashboard for AI‑assisted multi‑stage YouTube video generation, media gallery management (rename/delete with optimistic retry), avatar upload, and profile editing.

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Environment Variables](#environment-variables)
4. [Setup & Installation](#setup--installation)
5. [Running the App](#running-the-app)
6. [Project Structure](#project-structure)
7. [API Endpoints](#api-endpoints)
8. [Data Flow & Workflow](#data-flow--workflow)
9. [Customization & Theming](#customization--theming)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)
12. [Contributing](#contributing)
13. [License](#license)

## Overview
The YouTube Video Generator Frontend provides an interactive, guided workflow for content creators to generate scripts, images, voiceovers, background music, and assemble a complete video ready for YouTube upload.

## Architecture
- React 19 (functional + hooks)
- styled-components for scoped styling
- Framer Motion for transitions & gallery interactions
- Context providers: AuthContext, Pipeline/Workflow (if present)
- Optimistic UI + exponential backoff retry for gallery rename/delete

Auth token stored in `sessionStorage` (short-lived tab session by design). All protected views gate on presence + validity of token.

### Frontend ↔ Backend Integration
- API bases configured via env:
  - `REACT_APP_AUTH_BASE` (e.g. http://localhost:8000/api/auth)
  - `REACT_APP_API_BASE` (video pipeline endpoints) – fallback defaults if omitted
- **Environment Variables:** override default via `.env` (see below)
- **API Calls:** use `fetch` with JSON request/response, centralized in `src/api` or directly in components.

## Environment Variables
Example `.env`:
```
REACT_APP_AUTH_BASE=http://localhost:8000/api/auth
REACT_APP_API_BASE=http://localhost:8000/api/video
```
Restart the dev server after any changes.

## Setup & Installation
```bash
git clone <your-repo-url>
cd youtube-video-gen-frontend
npm install
```

## Running the App
```bash
npm start
```
Open http://localhost:3000 in your browser.

## Project Structure
```
youtube-video-gen-frontend/
├── public/
│   └── index.html
├── src/
│   ├── api/               # API wrapper modules
│   ├── components/        # Reusable UI components
│   ├── styles/            # Styled Components and Tailwind config
│   ├── App.js             # Main component with API config
│   └── index.js           # Entry point
├── .env                   # Environment variables
├── package.json
└── README.md
```

## Core Backend Endpoints Consumed
| Method | Path (base omitted) | Purpose |
|--------|---------------------|---------|
| POST | /auth/register | Create user |
| POST | /auth/login | Obtain token |
| GET  | /auth/me | Current user info |
| PATCH| /auth/profile | Update profile fields |
| POST | /auth/change-password | Change password |
| POST | /video/content | Generate outline/content |
| POST | /video/scripts | Generate scripts + prompts |
| POST | /video/images | Image artifacts |
| POST | /video/voices | Voice generation |
| GET  | /gallery/{user_id} | List archived videos |
| POST | /gallery/{user_id}/rename | Rename video |
| DELETE | /gallery/{user_id}/{video_name} | Delete video |
| GET | /gallery/{user_id}/thumb/{video_name} | Thumbnail |
| POST | /avatar | Upload avatar |
| GET | /avatar/{user_id} | Fetch avatar image |

### Sample API Call
```js
// src/api/content.js
export async function fetchContent(title, channelType) {
  const res = await fetch(`${API_ENDPOINT_BASE}/content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, channelType }),
  });
  if (!res.ok) throw new Error('Content generation failed');
  return res.json();
}
```

## Workflow (Simplified)
1. Auth gate (register / login) → token
2. Enter generation flow: content → scripts (+image prompts) → images → voices → (optional) music & captions → edit assembly
3. Final video archived under user gallery (appears after pipeline completes)
4. Gallery operations (rename/delete) update UI optimistically
5. Avatar upload updates backend; UI refresh forthcoming

## Customization & Theming
- Toggle dark/light mode via the navbar switch
- Update logos and meta tags in `public/index.html`

## Docker (via root compose)
Frontend image built with multi-stage Node → nginx. Serve with backend:
```powershell
docker compose up -d --build
```
Frontend served at http://localhost:3000 (nginx), proxying API calls directly to backend base (CORS open by default; tighten for production).

## Troubleshooting
| Issue | Cause | Fix |
|-------|-------|-----|
| Infinite redirect to login | Token missing/expired | Re-login; clear sessionStorage |
| Rename/delete stuck pending | Network or 4xx error | Inspect console; operation auto-retries 3x |
| Avatar not updating | Cache | Hard refresh (Ctrl+F5); future auto-invalidation planned |
| CORS failure | Wrong API base or backend down | Verify backend 8000 up & env vars correct |

## Contributing
1. Fork repo
2. Create branch: `git checkout -b feature/YourFeature`
3. Commit & push
4. Open a PR

## Security Notes
Current gallery/avatar requests not yet server-enforced for auth (planned). Avoid exposing public deployment until enforced.

## License
MIT
