from Agents.voiceGeneration import VoiceGenerator
from dotenv import load_dotenv
from typing import List, Dict, Any

def VoiceGenService(sentences: List[str], Voice: str | None) -> Dict[str, Any]:
    """Generate voices for provided sentences using standard TTS only.

    Removed voice cloning feature; always returns own=False.
    """
    try:
        if not sentences:
            return {"status": "error", "message": "No sentences provided", "files": []}

        load_dotenv()
        generator = VoiceGenerator(Voices=Voice)
        try:
            valid_voice = generator.validate_voice(Voice)
        except ValueError as ve:
            print(str(ve))
            valid_voice = generator.default_voice
            print(f"Falling back to default voice: {valid_voice}")

        results = generator.generate_multiple_voices(sentences, voice=valid_voice)
        file_list = list(results.values())
        return {
            "status": "success",
            "files": file_list,
            "voice_used": valid_voice,
            "own": False
        }
    except Exception as e:
        return {"status": "error", "message": str(e), "files": []}