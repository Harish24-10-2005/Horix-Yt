import os
from Agents.imageGeneration import ImageGenerator
from Config.settings import settings

def ImageGenService(api_key, prompts, video_mode: bool = False):
    # Prefer explicitly passed key, then settings, then env.
    final_key = api_key or settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
    if not final_key:
        raise RuntimeError("GEMINI_API_KEY not configured.")
    generator = ImageGenerator(final_key, video_mode=video_mode)
    generator.generate_all_images(prompts)
    return "Images generated successfully!"