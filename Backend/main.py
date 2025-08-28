from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from Router.Router import router
from Router.auth import auth_router
from Config.settings import settings
from db.models import init_db
import asyncio

app = FastAPI(
    title="Automated Video Generation API",
    description="API for generating YouTube videos using AI",
    version="1.0.0"
)

init_db(os.getenv('DATABASE_URL', 'sqlite:///./app.db'))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(settings.ASSETS_DIR, exist_ok=True)
os.makedirs(settings.IMAGES_DIR, exist_ok=True)
os.makedirs(settings.VOICES_DIR, exist_ok=True)
os.makedirs(settings.OUTPUT_DIR, exist_ok=True)

app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/assets", StaticFiles(directory=settings.ASSETS_DIR), name="assets")
app.mount("/output", StaticFiles(directory=settings.OUTPUT_DIR), name="output")

templates = Jinja2Templates(directory="templates")

app.include_router(router)
app.include_router(auth_router)

@app.get("/", response_class=HTMLResponse)
async def get_home_page(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/health")
async def health():
    return {"status": "ok"}

if os.name == "nt":
    @app.on_event("startup")
    async def _install_loop_exception_filter() -> None:
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = asyncio.get_event_loop()
        prev = loop.get_exception_handler()

        def handler(loop, context): 
            exc = context.get("exception")
            msg = context.get("message", "")
            if isinstance(exc, ConnectionResetError) or ("WinError 10054" in str(exc) if exc else "WinError 10054" in msg):
                return
            if prev:
                prev(loop, context)
            else:
                loop.default_exception_handler(context)

        loop.set_exception_handler(handler)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)