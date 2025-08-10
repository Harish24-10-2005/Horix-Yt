from Agents.contentAgent import ContentAgent
from Agents.scriptsAgent import ScriptAgent
import re
import json
from typing import Tuple, List, Dict, Any
import math

_JSON_FENCE_RE = re.compile(r"```json\s*(\{.*?\})\s*```", re.DOTALL)

def _extract_json_block(text: str) -> dict:
    """Extract the first JSON fenced block; fallback to first balanced braces.

    Returns empty dict on failure instead of raising.
    """
    match = _JSON_FENCE_RE.search(text)
    raw = None
    if match:
        raw = match.group(1)
    else:
        # Fallback: try to locate first '{' and last '}' to capture a JSON object
        start = text.find('{')
        end = text.rfind('}')
        if start != -1 and end != -1 and end > start:
            raw = text[start:end+1]
    if not raw:
        return {}
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {}

def _estimate_durations(voice_scripts: List[str], voice_meta: List[Dict[str, Any]], images_per_script: int) -> List[Dict[str, Any]]:
    """Generate a timing plan estimating duration for each voice script and subdivision per image.

    Uses words / pace_hint_wpm. Distributes segment duration proportionally (opening 30%, middle 40%, conclusion 30% for 3-image sets; for 5-image sets: 15%,20%,30%,20%,15%).
    Falls back gracefully if metadata missing.
    """
    timing = []
    # Distribution templates
    if images_per_script == 3:
        dist = [0.30, 0.40, 0.30]
        seg_labels = ["opening", "middle", "conclusion"]
    elif images_per_script == 5:
        dist = [0.15, 0.20, 0.30, 0.20, 0.15]
        seg_labels = ["hook", "build", "core", "shift", "payoff"]
    else:
        # uniform
        dist = [1/images_per_script]*images_per_script
        seg_labels = [f"part_{i+1}" for i in range(images_per_script)]

    for idx, script_text in enumerate(voice_scripts, start=1):
        meta = next((m for m in voice_meta if isinstance(m, dict) and m.get("index") == idx), {}) if voice_meta else {}
        words = len(script_text.split()) if script_text else 0
        wpm = meta.get("pace_hint_wpm") or meta.get("pace") or 160
        duration_sec = (words / max(wpm, 1)) * 60.0 if words else 0
        # Minimum sensible duration guard
        if duration_sec < 2 and words:
            duration_sec = max(2, words / 3.0)  # assume ~3 words/sec fallback
        # Build image timing slices
        accumulated = 0.0
        image_slices = []
        for d, label in zip(dist, seg_labels):
            slice_dur = duration_sec * d
            image_slices.append({
                "segment": label,
                "duration_sec": round(slice_dur, 2),
                "start_offset_sec": round(accumulated, 2)
            })
            accumulated += slice_dur
        # Normalize rounding drift
        drift = accumulated - duration_sec
        if abs(drift) > 0.01 and image_slices:
            image_slices[-1]["duration_sec"] = round(image_slices[-1]["duration_sec"] - drift, 2)
        timing.append({
            "script_index": idx,
            "estimated_words": words,
            "pace_wpm": wpm,
            "estimated_duration_sec": round(duration_sec, 2),
            "tone": meta.get("tone"),
            "primary_emotion": meta.get("primary_emotion"),
            "audio_background_suggestion": meta.get("audio_background_suggestion"),
            "slices": image_slices
        })
    return timing

def ScriptsGenService(title: str, content: str = None, video_mode: bool = False, channelType: str = None) -> Dict[str, Any]:
    """Generate scripts + prompts + enriched metadata.

    Returns dict with:
      raw_script (str)
      voice_scripts (List[str])
      image_prompts (List[str])
      voice_meta (List[dict]) optional
      image_prompts_detailed (List[dict]) optional
      timing_plan (List[dict]) computed
    """
    script_agent = ScriptAgent()
    if not content:
        content_agent = ContentAgent()
        content = content_agent.generate_content(title, video_mode=video_mode, channelType=channelType)

    script = script_agent.generate_Scripts_Gemini(content, video_mode=video_mode)
    data = _extract_json_block(script)
    voice_scripts = data.get("voice_scripts", []) if isinstance(data, dict) else []
    image_prompts = data.get("image_prompts", []) if isinstance(data, dict) else []
    voice_meta = data.get("voice_meta", []) if isinstance(data, dict) else []
    image_prompts_detailed = data.get("image_prompts_detailed", []) if isinstance(data, dict) else []

    # Decide images per script for timing (long-form 3, shorts 5)
    images_per_script = 3 if video_mode else 5 if voice_scripts and len(image_prompts) == len(voice_scripts)*5 else (len(image_prompts)//len(voice_scripts) if voice_scripts else 0)
    timing_plan = _estimate_durations(voice_scripts, voice_meta, images_per_script) if voice_scripts else []

    return {
        "raw_script": script,
        "voice_scripts": voice_scripts,
        "image_prompts": image_prompts,
        "voice_meta": voice_meta,
        "image_prompts_detailed": image_prompts_detailed,
        "timing_plan": timing_plan
    }