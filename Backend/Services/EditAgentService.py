from Agents.editAgent import VideoEditor
from utils.exceptions import EditError

def EditAgentService(video_mode: bool = False) -> str:
    editor = VideoEditor(video_mode=video_mode)
    try:
        return editor.create_final_video(
            image_dir='assets/images',
            voice_dir='assets/VoiceScripts',
            video_mode=video_mode
        )
    except ValueError as e:
        guidance = (
            f"{e}\nEnsure: images count matches expectation and voice scripts present."
        )
        raise EditError(guidance) from e
    except Exception as e:
        raise EditError(str(e)) from e