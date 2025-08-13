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
import shutil


class Settings:
    """Lightweight settings loader (no pydantic dependency).

    Reads environment variables once; provides directory helpers.
    """

    def __init__(self) -> None:
        # ---- API keys ----
        self.GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        self.GROQ_API_KEY1 = os.getenv("GROQ_API_KEY1")
        self.GROQ_API_KEY2 = os.getenv("GROQ_API_KEY2")
        self.GROQ_API_KEY3 = os.getenv("GROQ_API_KEY3")

        # ---- Tooling binaries ----
        self.FFMPEG_PATH = os.getenv("FFMPEG_PATH", "ffmpeg")
        self.FFPROBE_PATH = os.getenv("FFPROBE_PATH", "ffprobe")

    # ---- Directories ----
    # Detect repository root (one level up from Backend/)
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    repo_root = os.path.abspath(os.path.join(backend_dir, ".."))
    main_assets = os.path.join(repo_root, "assets")
    # Default assets to the MAIN repo assets folder when present
    default_assets = main_assets if os.path.isdir(main_assets) else os.path.join(backend_dir, "assets")
    self.ASSETS_DIR = os.path.abspath(os.getenv("ASSETS_DIR", default_assets))
    self.IMAGES_DIR = os.path.abspath(os.getenv("IMAGES_DIR", os.path.join(self.ASSETS_DIR, "images")))
    self.VOICES_DIR = os.path.abspath(os.getenv("VOICES_DIR", os.path.join(self.ASSETS_DIR, "VoiceScripts")))
    self.MUSIC_DIR = os.path.abspath(os.getenv("MUSIC_DIR", os.path.join(self.ASSETS_DIR, "music")))
    self.OUTPUT_DIR = os.path.abspath(os.getenv("OUTPUT_DIR", os.path.join(repo_root, "output")))
    self.USER_OUTPUT_DIR = os.path.abspath(os.getenv("USER_OUTPUT_DIR", os.path.join(self.OUTPUT_DIR, "users")))
    self.AVATARS_DIR = os.path.abspath(os.getenv("AVATARS_DIR", os.path.join(self.ASSETS_DIR, "avatars")))
    self.CUSTOM_VOICES_DIR = os.path.abspath(os.getenv("CUSTOM_VOICES_DIR", os.path.join(self.ASSETS_DIR, "custom_voices")))
    self.JOBS_DIR = os.path.abspath(os.getenv("JOBS_DIR", os.path.join(repo_root, "jobs")))

        # ---- Flags ----
        self.CLEAN_ON_START = os.getenv("CLEAN_ON_START", "false").lower() == "true"

        self.ensure_directories()

    # ---- Helpers ----
    def ensure_directories(self) -> None:
        dirs = [
            self.ASSETS_DIR,
            self.IMAGES_DIR,
            self.VOICES_DIR,
            self.MUSIC_DIR,
            self.OUTPUT_DIR,
            self.JOBS_DIR,
            self.USER_OUTPUT_DIR,
            self.AVATARS_DIR,
        ]
        for d in dirs:
            os.makedirs(d, exist_ok=True)

    # ---- External binary resolution ----
    def get_ffmpeg(self) -> str:
        # Sanitize common misconfigurations (e.g., quoted paths)
        path = (self.FFMPEG_PATH or '').strip()
        if len(path) >= 2 and path[0] == path[-1] and path[0] in ('"', "'"):
            path = path[1:-1]
        # If a directory is provided, point to the binary inside it
        if os.path.isdir(path):
            return os.path.join(path, 'ffmpeg.exe' if os.name == 'nt' else 'ffmpeg')
        # If ends with bin (common), join binary even if os.path.isdir cannot verify
        if os.name == 'nt' and path.lower().rstrip('\\/') .endswith('bin'):
            return os.path.join(path, 'ffmpeg.exe')
        # If plain "ffmpeg" but not on PATH, try Windows fallbacks
        if os.name == 'nt' and path.lower() == 'ffmpeg':
            # 1) Respect FFMPEG_HOME env var (points to install root)
            home = os.getenv('FFMPEG_HOME')
            if home:
                cand = os.path.join(home, 'bin', 'ffmpeg.exe')
                if os.path.exists(cand):
                    return cand
            # 2) Standard C:\ffmpeg\bin
            cand = os.path.join('C:\\ffmpeg', 'bin', 'ffmpeg.exe')
            if os.path.exists(cand):
                return cand
            # 3) C:\ffmpeg\<distribution>\bin
            try:
                base = 'C:\\ffmpeg'
                if os.path.isdir(base):
                    for name in os.listdir(base):
                        cand = os.path.join(base, name, 'bin', 'ffmpeg.exe')
                        if os.path.exists(cand):
                            return cand
            except Exception:
                pass
        # If missing extension but .exe exists next to it, use that (Windows)
        if os.name == 'nt' and path and not path.lower().endswith('.exe'):
            cand = path + '.exe'
            if os.path.exists(cand):
                return cand
        # Try PATH resolution as a final fallback
        found = shutil.which(path)
        if found:
            return found
        return path or 'ffmpeg'

    def get_ffprobe(self) -> str:
        path = (self.FFPROBE_PATH or '').strip()
        if len(path) >= 2 and path[0] == path[-1] and path[0] in ('"', "'"):
            path = path[1:-1]
        if os.path.isdir(path):
            return os.path.join(path, 'ffprobe.exe' if os.name == 'nt' else 'ffprobe')
        if path == 'ffprobe' and os.path.isdir(self.FFMPEG_PATH):
            return os.path.join(self.FFMPEG_PATH, 'ffprobe.exe' if os.name == 'nt' else 'ffprobe')
        if os.name == 'nt' and path.lower() == 'ffprobe':
            home = os.getenv('FFMPEG_HOME')
            if home:
                cand = os.path.join(home, 'bin', 'ffprobe.exe')
                if os.path.exists(cand):
                    return cand
            cand = os.path.join('C:\\ffmpeg', 'bin', 'ffprobe.exe')
            if os.path.exists(cand):
                return cand
            try:
                base = 'C:\\ffmpeg'
                if os.path.isdir(base):
                    for name in os.listdir(base):
                        cand = os.path.join(base, name, 'bin', 'ffprobe.exe')
                        if os.path.exists(cand):
                            return cand
            except Exception:
                pass
        # If a bin directory-like string provided
        if os.name == 'nt' and path.lower().rstrip('\\/') .endswith('bin'):
            return os.path.join(path, 'ffprobe.exe')
        # If missing extension but .exe exists next to it, use that (Windows)
        if os.name == 'nt' and path and not path.lower().endswith('.exe'):
            cand = path + '.exe'
            if os.path.exists(cand):
                return cand
        found = shutil.which(path)
        if found:
            return found
        return path or 'ffprobe'


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
