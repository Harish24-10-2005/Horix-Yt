"""Basic smoke test for the video generation API without external API calls.

This test monkeypatches content & script generation plus image/voice services
to avoid hitting real LLM / TTS / image APIs, ensuring the pipeline wiring
works and responses have expected structure.
"""
import os
from fastapi.testclient import TestClient

from main import app  # noqa: E402

# --- Monkeypatch agents/services that call external APIs ---
import Agents.contentAgent as content_agent_mod  # noqa: E402
import Agents.scriptsAgent as scripts_agent_mod  # noqa: E402
import Services.ImageGenService as image_service_mod  # noqa: E402
import Services.VoiceGenService as voice_service_mod  # noqa: E402
from Config.LLMs.Gemini.gemini_2_0_flash_thinking_exp_01_21 import GeminiLLM  # noqa: E402


def fake_generate_content(self, title: str, video_mode: bool = False, channelType: str = None, model: str = None):
    return f"[\"Intro about {title}\", \"Body segment\", \"Conclusion\"]"


def fake_generate_scripts(self, content: str, video_mode: bool = False, model: str = None):
    # Return a fenced JSON block similar to real output
    return (
        "```json\n" +
        '{"voice_scripts": ["Script 1", "Script 2", "Script 3"],' +
        ' "image_prompts": ["Image 1", "Image 2", "Image 3", "Image 4", "Image 5", "Image 6", "Image 7", "Image 8", "Image 9"]}' +
        "\n```"
    )


def fake_image_service(api_key, prompts, video_mode: bool = False):
    # Simulate image files creation
    os.makedirs('assets/images', exist_ok=True)
    for i, _ in enumerate(prompts, 1):
        path = f"assets/images/image_{i}.png"
        if not os.path.exists(path):
            with open(path, 'wb') as f:
                f.write(b"fake")
    return "Images generated successfully!"


def fake_voice_service(sentences, Voice, own: bool = False):
    os.makedirs('assets/VoiceScripts', exist_ok=True)
    for i, _ in enumerate(sentences, 1):
        path = f"assets/VoiceScripts/voicescript{i}.wav"
        if not os.path.exists(path):
            with open(path, 'wb') as f:
                f.write(b"RIFF....WAVEfake")
    return "Success"


# Apply monkeypatches
content_agent_mod.ContentAgent.generate_content = fake_generate_content
scripts_agent_mod.ScriptAgent.generate_Scripts_Gemini = fake_generate_scripts
image_service_mod.ImageGenService = fake_image_service  # override factory function name
voice_service_mod.VoiceGenService = fake_voice_service
GeminiLLM._call = lambda self, prompt, stop=None: "```json\n{\"voice_scripts\":[\"Script 1\",\"Script 2\",\"Script 3\"],\"image_prompts\":[\"Image 1\",\"Image 2\",\"Image 3\",\"Image 4\",\"Image 5\",\"Image 6\",\"Image 7\",\"Image 8\",\"Image 9\"]}\n```"


client = TestClient(app)


def run_smoke():
    r = client.post('/api/video/content', json={"title": "Test Title", "video_mode": True, "channel_type": "Tech"})
    assert r.status_code == 200, r.text
    r2 = client.post('/api/video/scripts', json={"title": "Test Title", "content": r.json()["content"], "video_mode": True, "channel_type": "Tech"})
    assert r2.status_code == 200
    data2 = r2.json()
    # Allow >=3 scripts (some generators may return an extra segment)
    assert len(data2["voice_scripts"]) >= 3
    # Generate images
    r3 = client.post('/api/video/images', json={"prompts": ["p1", "p2", "p3"], "video_mode": True})
    assert r3.status_code == 200
    # Generate voices
    r4 = client.post('/api/video/voices', json={"sentences": ["Line 1", "Line 2", "Line 3"], "video_mode": True})
    assert r4.status_code == 200
    return {"content": r.json(), "scripts": data2, "images": r3.json(), "voices": r4.json()}


if __name__ == "__main__":
    summary = run_smoke()
    print("SMOKE TEST SUMMARY:\n", summary)
