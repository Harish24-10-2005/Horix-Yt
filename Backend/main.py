from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from Router.Router import router
from Router.auth import auth_router
from db.models import init_db

# Create FastAPI app
app = FastAPI(
    title="Automated Video Generation API",
    description="API for generating YouTube videos using AI",
    version="1.0.0"
)

# Initialize database (SQLite default; replace with Postgres URL in prod)
init_db(os.getenv('DATABASE_URL', 'sqlite:///./app.db'))

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
os.makedirs("static", exist_ok=True)
os.makedirs("assets/images", exist_ok=True)
os.makedirs("assets/VoiceScripts", exist_ok=True)
os.makedirs("output", exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/assets", StaticFiles(directory="assets"), name="assets")
app.mount("/output", StaticFiles(directory="output"), name="output")

# Setup templates
templates = Jinja2Templates(directory="templates")

# Include API router
app.include_router(router)
app.include_router(auth_router)

# Home page
@app.get("/", response_class=HTMLResponse)
async def get_home_page(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# Lightweight health / readiness probe (used by Docker/Orchestrators)
@app.get("/health")
async def health():
    return {"status": "ok"}

# Run the app
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)