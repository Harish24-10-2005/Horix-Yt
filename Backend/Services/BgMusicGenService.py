from Agents.bgMusicAgent import VideoMusicSynchronizer
from Config.settings import settings
import os

def BgMusicGenService(music_path: str):
    """Attach background music to the most recent core video output.

    Chooses shorts or standard path based on presence; falls back gracefully.
    """
    synchronizer = VideoMusicSynchronizer(music_path)
    # Prefer shorts variant then standard
    candidate_paths = [
        os.path.join(settings.OUTPUT_DIR, "youtube_shorts.mp4"),
        os.path.join(settings.OUTPUT_DIR, "standard_video.mp4"),
    ]
    video_path = next((p for p in candidate_paths if os.path.exists(p)), candidate_paths[0])
    return synchronizer.sync_music_to_video(video_path)