"""Utility script to purge generated / ephemeral artifacts.

Run manually: python remove_generated.py
Only removes known safe-to-regenerate items.
"""
from __future__ import annotations
import shutil, os, pathlib

ROOT = pathlib.Path(__file__).parent

DIRS = [
    'output',
    'sampleoutput',
    'jobs',
    '__pycache__',
    'VoiceScriptsExample',
]

FILES = [
    'modified_image.png',
    'music_sync_cache.json',
    'output.srt',
    'output_groq.srt',
    'gemini_generation.log',
    'tempCodeRunnerFile.py',
]

def remove_path(p: pathlib.Path):
    if not p.exists():
        return
    if p.is_dir():
        shutil.rmtree(p, ignore_errors=True)
    else:
        try:
            p.unlink()
        except OSError:
            pass

def main():
    removed = []
    for d in DIRS:
        dp = ROOT / d
        if dp.exists():
            remove_path(dp)
            removed.append(str(dp))
    for f in FILES:
        fp = ROOT / f
        if fp.exists():
            remove_path(fp)
            removed.append(str(fp))
    print("Removed artifacts:")
    for r in removed:
        print(" -", r)
    if not removed:
        print("Nothing to remove.")

if __name__ == '__main__':
    main()
