# YouTube Video Generator Frontend

A modern React application for generating complete YouTube videos using AI-driven backend services.

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
- **Framework:** React 19 (functional components & hooks)
- **Styling:** Styled Components + Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** React Icons

### Frontend ↔ Backend Integration
- **API Base URL:** defined in `src/App.js`:
```js
const API_ENDPOINT_BASE = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000/api/video';
```
- **Environment Variables:** override default via `.env` (see below)
- **API Calls:** use `fetch` with JSON request/response, centralized in `src/api` or directly in components.

## Environment Variables
Create a `.env` file at project root:
```
REACT_APP_API_ENDPOINT=http://localhost:8000/api/video
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

## API Endpoints
| Endpoint         | Method | Description                        | Request Body                                        | Response                                 |
|------------------|--------|------------------------------------|-----------------------------------------------------|------------------------------------------|
| `/content`       | POST   | Generate video ideas               | `{ title: string, channelType: string }`            | `{ ideas: string[] }`                    |
| `/scripts`       | POST   | Generate script & image prompts    | `{ ideas: string[] }`                               | `{ script: string, imagePrompts: string[] }` |
| `/images`        | POST   | Generate images from prompts       | `{ prompt: string }`                                | `{ images: string[] }`                   |
| `/modify-image`  | POST   | Modify a selected image            | `{ imageId: string, prompt: string }`               | `{ modifiedUrl: string }`                |
| `/voices`        | POST   | Generate or upload voiceovers      | `{ text: string, voiceType: string }`               | `{ audioUrl: string }`                   |
| `/upload-music`  | POST   | Upload background music            | `FormData{'file': File}`                            | `{ musicUrl: string }`                   |
| `/bgmusic`       | POST   | Merge music into video             | `{ videoId: string, musicUrl: string }`             | `{ videoWithMusicUrl: string }`          |
| `/captions`      | POST   | Generate captions                  | `{ videoId: string }`                               | `{ captionsFile: string }`               |
| `/video`         | GET    | Retrieve final assembled video      | Query param `?id=videoId`                           | Video file stream                       |

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

## Data Flow & Workflow
1. **User Input:** Title & channel type
2. **POST `/content`:** returns idea list
3. **POST `/scripts`:** returns script & prompts
4. **POST `/images`:** generates images for each prompt
5. **POST `/modify-image`:** optional image edits
6. **POST `/voices`:** generates narration audio
7. **POST `/upload-music` + `/bgmusic`:** upload and merge background music
8. **POST `/captions`:** generate captions
9. **GET `/video`:** download final assembled video

## Customization & Theming
- Toggle dark/light mode via the navbar switch
- Update logos and meta tags in `public/index.html`

## Deployment
1. Build for production:
   ```bash
npm run build
```
2. Deploy the `build/` folder to any static hosting (Netlify, Vercel, S3, etc.)

## Troubleshooting
- **CORS issues:** Ensure backend CORS is configured
- **API errors:** Check browser console and backend logs
- **Dependency issues:** Remove `node_modules` & `package-lock.json`, then `npm install`

## Contributing
1. Fork repo
2. Create branch: `git checkout -b feature/YourFeature`
3. Commit & push
4. Open a PR

## License
MIT License
