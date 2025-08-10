from Agents.captionAgent import transcribe_and_caption
from Config.settings import settings
from utils.exceptions import CaptionError
import os

def CaptionGenService(job_id: str | None = None, video_mode: bool = False):
    """Caption the latest video.

    In shorts mode prefer shorts with music -> shorts raw -> standard fallback.
    In long video mode prefer standard with music (if naming updated later) -> standard raw -> shorts fallback.
    """
    if video_mode:
        candidates = [
            os.path.join(settings.OUTPUT_DIR, "standard_video_with_music.mp4"),
            os.path.join(settings.OUTPUT_DIR, "standard_video.mp4"),
            os.path.join(settings.OUTPUT_DIR, "youtube_shorts_with_music.mp4"),
            os.path.join(settings.OUTPUT_DIR, "youtube_shorts.mp4"),
        ]
    else:
        candidates = [
            os.path.join(settings.OUTPUT_DIR, "youtube_shorts_with_music.mp4"),
            os.path.join(settings.OUTPUT_DIR, "youtube_shorts.mp4"),
            os.path.join(settings.OUTPUT_DIR, "standard_video.mp4"),
        ]
    video_path = next((p for p in candidates if os.path.exists(p)), candidates[0])
    return transcribe_and_caption(video_path, job_id=job_id, video_mode=video_mode)