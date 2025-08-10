"""Centralized application settings and lightweight path helpers.

Uses pydantic BaseSettings to allow environment variable overrides while
providing safe defaults. Load once and import `settings` everywhere instead
of scattering `os.getenv` calls and hard-coded paths.
"""
from __future__ import annotations

import os
try:
    # Lazy import so we don't hard fail if python-dotenv missing (though it's in requirements)
    from dotenv import load_dotenv  # type: ignore
    # Do not override already-set environment vars; load once at process start.
    load_dotenv(override=False)
except Exception:
    # Silent fallback; env vars may already be provided by the host environment.
    pass
from functools import lru_cache


class Settings:
    """Lightweight settings loader (no pydantic dependency).

    Reads environment variables once; provides directory helpers.
    """

    def __init__(self) -> None:
        # API keys
        self.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        self.GROQ_API_KEY1 = os.getenv("GROQ_API_KEY1")
        self.GROQ_API_KEY2 = os.getenv("GROQ_API_KEY2")
        self.GROQ_API_KEY3 = os.getenv("GROQ_API_KEY3")

        # Tooling binaries
        self.FFMPEG_PATH = os.getenv("FFMPEG_PATH", "ffmpeg")
        self.FFPROBE_PATH = os.getenv("FFPROBE_PATH", "ffprobe")

        # Directories
        self.ASSETS_DIR = os.getenv("ASSETS_DIR", "assets")
        self.IMAGES_DIR = os.getenv("IMAGES_DIR", os.path.join(self.ASSETS_DIR, "images"))
        self.VOICES_DIR = os.getenv("VOICES_DIR", os.path.join(self.ASSETS_DIR, "VoiceScripts"))
        self.MUSIC_DIR = os.getenv("MUSIC_DIR", os.path.join(self.ASSETS_DIR, "music"))
        self.OUTPUT_DIR = os.getenv("OUTPUT_DIR", "output")
        self.JOBS_DIR = os.getenv("JOBS_DIR", "jobs")

        # Flags
        self.CLEAN_ON_START = os.getenv("CLEAN_ON_START", "false").lower() == "true"

        self.ensure_directories()

    def ensure_directories(self) -> None:
        for d in {self.ASSETS_DIR, self.IMAGES_DIR, self.VOICES_DIR, self.MUSIC_DIR, self.OUTPUT_DIR, self.JOBS_DIR}:
            os.makedirs(d, exist_ok=True)

    # ---- External binary resolution ----
    def get_ffmpeg(self) -> str:
        # If a directory was provided, append executable name
        if os.path.isdir(self.FFMPEG_PATH):
            candidate = os.path.join(self.FFMPEG_PATH, 'ffmpeg.exe' if os.name == 'nt' else 'ffmpeg')
            return candidate
        return self.FFMPEG_PATH

    def get_ffprobe(self) -> str:
        if os.path.isdir(self.FFPROBE_PATH):
            candidate = os.path.join(self.FFPROBE_PATH, 'ffprobe.exe' if os.name == 'nt' else 'ffprobe')
            return candidate
        # If only FFMPEG_PATH dir set and no specific FFPROBE_PATH, reuse
        if self.FFPROBE_PATH == 'ffprobe' and os.path.isdir(self.FFMPEG_PATH):
            candidate = os.path.join(self.FFMPEG_PATH, 'ffprobe.exe' if os.name == 'nt' else 'ffprobe')
            return candidate
        return self.FFPROBE_PATH


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
