from typing import List, Optional, Dict, Any
import os
import traceback
from fastapi import HTTPException
from Services.BgMusicGenService import BgMusicGenService
from Services.ContentGenService import ContentGenService
from Services.ScriptsGenService import ScriptsGenService
from Services.ImageGenService import ImageGenService
from Services.ModifyImageService import ModifyImageService  
from Services.VoiceGenService import VoiceGenService
from Services.EditAgentService import EditAgentService
from utils.exceptions import EditError
from Services.CaptionGenService import CaptionGenService
from utils.exceptions import CaptionError
from Config.settings import settings
from jobs.job_utils import create_job, update_stage, load_manifest
import uuid
from utils.logging_utils import StageTimer, log_event
import shutil

class VideoGenerationController:
    """Controller for automated video generation process"""
    
    def __init__(self):
        self.video_mode = False
        self.active_jobs = {}
    
    def set_video_mode(self, video_mode: bool) -> None:
        """Set video mode for the entire process (normalized to bool)."""
        self.video_mode = bool(video_mode)
    
    async def generate_content(self, title: str, video_mode: Optional[bool] = None, channel_type: Optional[str] = None, job_id: Optional[str] = None, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Generate content based on title"""
        try:
            effective_video_mode = video_mode if video_mode is not None else self.video_mode
            if not job_id:
                manifest = create_job(title, effective_video_mode, user_id=user_id, channel_type=channel_type)
                job_id = manifest['job_id']
                self.active_jobs[job_id] = True
            # content = ContentGenService(title, effective_video_mode, channel_type)
# ==============================================fake data ==============================================================

            # ORIGINAL IMPLEMENTATION (commented out for fake data mode):
            # content = ContentGenService(title, effective_video_mode, channel_type)
            # FAKE DATA: lightweight deterministic placeholder content
            content = (
                f"Overview for '{title}': This is placeholder generated content for testing. "
                f"Channel type: {channel_type or 'general'}. Video mode: {'standard' if effective_video_mode else 'shorts'}. "
                "Sections: 1) Hook 2) Main Points 3) Call To Action."
            )
# ==============================================fake data ==============================================================

            update_stage(job_id, 'content', True, info={"channel_type": channel_type})
            return {"status": "success", "content": content, "video_mode": effective_video_mode, "job_id": job_id}
        except Exception as e:
            if job_id:
                update_stage(job_id, 'content', False, info={"error": str(e)})
            return {"status": "error", "message": str(e), "trace": traceback.format_exc()}
    
    async def generate_scripts(self, title: str, content: Optional[str] = None, 
                        video_mode: Optional[bool] = None, channel_type: Optional[str] = None, job_id: Optional[str] = None, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Generate scripts based on content"""
        try:
            effective_video_mode = video_mode if video_mode is not None else self.video_mode
            if not job_id:
                manifest = create_job(title, effective_video_mode, user_id=user_id, channel_type=channel_type)
                job_id = manifest['job_id']
                self.active_jobs[job_id] = True
            # result = ScriptsGenService(title, content, effective_video_mode, channel_type)

# ==============================================fake data ==============================================================
            # ORIGINAL IMPLEMENTATION (commented out for fake data mode):
            # result = ScriptsGenService(title, content, effective_video_mode, channel_type)
            # Fake script generation: derive simple segments from title/content
            base_topic = title or 'Untitled'
            main_script = (
                f"INTRO: Welcome! Today we explore {base_topic}.\n"
                f"POINT 1: Key insight about {base_topic}.\n"
                f"POINT 2: Another useful fact on {base_topic}.\n"
                "CALL TO ACTION: Like & Subscribe for more placeholder demos."
            )
            # Split voice scripts by lines (excluding empty)
            voice_scripts = [s.strip() for s in main_script.split('\n') if s.strip()]
            image_prompts = [
                f"Cinematic illustration of {base_topic} concept",
                f"Abstract background representing {base_topic}",
                f"Engaging infographic about {base_topic}"
            ]
            timing_plan = [
                {"segment": i+1, "seconds": 5} for i in range(len(voice_scripts))
            ]
            voice_meta = [{"index": i, "est_duration": 5} for i in range(len(voice_scripts))]
            result = {
                "raw_script": main_script,
                "voice_scripts": voice_scripts,
                "image_prompts": image_prompts,
                "voice_meta": voice_meta,
                "image_prompts_detailed": image_prompts,
                "timing_plan": timing_plan
            }
# ==============================================fake data ==============================================================

            voice_scripts = result.get("voice_scripts", [])
            update_stage(job_id, 'scripts', True, info={"voice_scripts": len(voice_scripts), "fake": False})
            return {
                "status": "success",
                "script": result.get("raw_script"),
                "voice_scripts": result.get("voice_scripts", []),
                "image_prompts": result.get("image_prompts", []),
                "voice_meta": result.get("voice_meta", []),
                "image_prompts_detailed": result.get("image_prompts_detailed", []),
                "timing_plan": result.get("timing_plan", []),
                "video_mode": effective_video_mode,
                "job_id": job_id
            }
        except Exception as e:
            if job_id:
                update_stage(job_id, 'scripts', False, info={"error": str(e)})
            return {"status": "error", "message": str(e), "trace": traceback.format_exc()}
    
    async def generate_images(self, prompts: List[str], video_mode: Optional[bool] = None, job_id: Optional[str] = None, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Generate images based on prompts"""
        try:
            effective_video_mode = video_mode if video_mode is not None else self.video_mode

            image_dir = settings.IMAGES_DIR
            os.makedirs(image_dir, exist_ok=True)
            api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
            # result = ImageGenService(api_key, prompts, effective_video_mode)
            image_paths = [f"{image_dir}/image_{i}.png" for i in range(1, len(prompts)+1)]
            
            update_stage(job_id, 'images', True, info={"count": len(prompts)}) if job_id else None
            return {
                "status": "success", 
                "message": "result",
                "image_paths": image_paths,
                "video_mode": effective_video_mode,
                "job_id": job_id
            }
        except Exception as e:
            if job_id:
                update_stage(job_id, 'images', False, info={"error": str(e)})
            return {"status": "error", "message": str(e), "trace": traceback.format_exc()}
    
    async def modify_image(self, image_path: str, prompt: str) -> Dict[str, Any]:
        """Modify an image using a prompt (Corrected)"""
        try:
            ModifyImageService(image_path, prompt)
            modified_path = image_path
            return {
                "status": "success",
                "modified_image_path": modified_path,
                "video_mode": False 
            }
        except FileNotFoundError as e:
             print(f"Error: Image file not found - {e}")
             raise HTTPException(status_code=404, detail=f"Image file not found: {image_path}")
        except Exception as e:
            return {"status": "error", "message": f"Internal error during modification: {str(e)}", "trace": traceback.format_exc()}
    
    async def generate_voices(self, sentences: List[str], voice: Optional[str] = None, video_mode: Optional[bool] = None, job_id: Optional[str] = None, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Generate voice audio for scripts"""
        try:
            effective_video_mode = video_mode if video_mode is not None else self.video_mode
            
            voice_dir = settings.VOICES_DIR
            os.makedirs(voice_dir, exist_ok=True)
            # result = VoiceGenService(sentences, voice)
# ==============================================fake data ==============================================================

            # Fake / fallback result: use existing files in VoiceScripts directory (no real TTS)
            # Collect existing audio files
            existing = [f for f in os.listdir(voice_dir) if f.lower().endswith((".wav", ".mp3"))]
            files: List[str] = []
            if existing:
                files = [os.path.join(voice_dir, f) for f in existing]
            else:
                # Create placeholder silent wav files (very small) corresponding to sentences
                import wave, contextlib
                import struct
                sample_rate = 8000
                duration_sec = 1
                n_samples = sample_rate * duration_sec
                for idx, _ in enumerate(sentences or ["placeholder"]):
                    fname = os.path.join(voice_dir, f"voicescript{idx+1}.wav")
                    with wave.open(fname, 'w') as wf:
                        wf.setnchannels(1)
                        wf.setsampwidth(2)  # 16-bit
                        wf.setframerate(sample_rate)
                        silence = struct.pack('<h', 0)
                        for _ in range(n_samples):
                            wf.writeframesraw(silence)
                    files.append(fname)
            result = {
                "status": "success",
                "files": files,
                "voice_used": voice or "default_fake"
            }
# ==============================================fake data ==============================================================

            if result.get("status") != "success":
                update_stage(job_id, 'voices', False, info={"error": result.get('message')}) if job_id else None
                return {"status": "error", "message": result.get("message", "Voice generation failed"), "job_id": job_id}
            update_stage(job_id, 'voices', True, info={"count": len(result.get('files', []))}) if job_id else None
            return {
                "status": "success",
                "voice_files": result.get("files", []),
                "voice_used": result.get("voice_used"),
                "own": False,
                "video_mode": effective_video_mode,
                "job_id": job_id
            }
        except Exception as e:
            if job_id:
                update_stage(job_id, 'voices', False, info={"error": str(e)})
            return {"status": "error", "message": str(e), "trace": traceback.format_exc()}
    
    async def edit_video(self, video_mode: Optional[bool] = None, job_id: Optional[str] = None, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Edit the final video"""
        try:
            output = settings.OUTPUT_DIR
            os.makedirs(output, exist_ok=True)
            effective_video_mode = video_mode if video_mode is not None else self.video_mode
            # Run edit agent and capture output path; pass job_id for logging/manifest correlation
            # video_path = EditAgentService(video_mode=effective_video_mode, job_id=job_id)
            video_path = "output/standard_video.mp4"
            # Archive to per-user gallery if user_id provided
            if user_id:
                try:
                    from Config.settings import settings as global_settings
                    safe_dir = os.path.join(global_settings.USER_OUTPUT_DIR, user_id)
                    os.makedirs(safe_dir, exist_ok=True)
                    if os.path.exists(video_path):
                        base_name = os.path.basename(video_path)
                        # Timestamped copy to avoid overwrite
                        ts = uuid.uuid4().hex[:8]
                        target_name = f"{ts}_{base_name}"
                        target_path = os.path.join(safe_dir, target_name)
                        shutil.copy2(video_path, target_path)
                except Exception:
                    pass  # Non-fatal
            
            update_stage(job_id, 'edit', True, artifact=video_path) if job_id else None
            return {
                "status": "success", 
                "video_path": video_path,
                "video_mode": effective_video_mode,
                "job_id": job_id
            }
        except Exception as e:
            if job_id:
                update_stage(job_id, 'edit', False, info={"error": str(e)})
            return {"status": "error", "message": str(e), "trace": traceback.format_exc()}
    
    async def add_background_music(self, music_path: str, video_mode: Optional[bool] = None, job_id: Optional[str] = None, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Add background music to video"""
        try:
            effective_video_mode = video_mode if video_mode is not None else self.video_mode
            final_video = BgMusicGenService(music_path)
            # Archive to per-user gallery if user_id provided
            if user_id and final_video and os.path.exists(final_video):
                try:
                    from Config.settings import settings as global_settings
                    safe_dir = os.path.join(global_settings.USER_OUTPUT_DIR, ''.join(c if (c.isalnum() or c in '._-') else '_' for c in user_id))
                    os.makedirs(safe_dir, exist_ok=True)
                    base_name = os.path.basename(final_video)
                    ts = uuid.uuid4().hex[:8]
                    target_name = f"{ts}_{base_name}"
                    target_path = os.path.join(safe_dir, target_name)
                    shutil.copy2(final_video, target_path)
                except Exception:
                    pass
            update_stage(job_id, 'music', True, artifact=final_video) if job_id else None
            return {
                "status": "success",
                "video_with_music": final_video,
                "video_mode": effective_video_mode,
                "job_id": job_id
            }
        except Exception as e:
            if job_id:
                update_stage(job_id, 'music', False, info={"error": str(e)})
            return {"status": "error", "message": str(e), "trace": traceback.format_exc()}
    
    async def add_captions(self, video_mode: Optional[bool] = None, job_id: Optional[str] = None, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Add captions to video"""
        try:
            # Use provided video_mode or fallback to controller's video_mode
            effective_video_mode = video_mode if video_mode is not None else self.video_mode
            # CaptionGenService might adjust caption style based on video_mode
            try:
                captioned_video = CaptionGenService(job_id=job_id, video_mode=effective_video_mode)
                # Archive to per-user gallery if user_id provided
                if user_id and captioned_video and os.path.exists(captioned_video):
                    try:
                        from Config.settings import settings as global_settings
                        safe_dir = os.path.join(global_settings.USER_OUTPUT_DIR, ''.join(c if (c.isalnum() or c in '._-') else '_' for c in user_id))
                        os.makedirs(safe_dir, exist_ok=True)
                        base_name = os.path.basename(captioned_video)
                        ts = uuid.uuid4().hex[:8]
                        target_name = f"{ts}_{base_name}"
                        target_path = os.path.join(safe_dir, target_name)
                        shutil.copy2(captioned_video, target_path)
                    except Exception:
                        pass
                update_stage(job_id, 'captions', True, artifact=captioned_video) if job_id else None
            except CaptionError as ce:
                if job_id:
                    update_stage(job_id, 'captions', False, info={"error": str(ce)})
                return {"status": "error", "message": str(ce)}
            return {
                "status": "success", 
                "captioned_video": captioned_video,
                "video_mode": effective_video_mode,
                "job_id": job_id
            }
        except Exception as e:
            if job_id:
                update_stage(job_id, 'captions', False, info={"error": str(e)})
            return {"status": "error", "message": str(e), "trace": traceback.format_exc()}

    async def generate_full_pipeline(self, title: str, channel_type: Optional[str] = None, voice: Optional[str] = None, video_mode: Optional[bool] = None, quick: bool = False, user_id: Optional[str] = None) -> Dict[str, Any]:
        effective_video_mode = video_mode if video_mode is not None else self.video_mode
        manifest = create_job(title, effective_video_mode, user_id=user_id, channel_type=channel_type)
        job_id = manifest['job_id']
        self.active_jobs[job_id] = True
        summary: Dict[str, Any] = {"job_id": job_id, "video_mode": effective_video_mode}

        try:
            if quick:
                with StageTimer(job_id, 'content'):
                    dummy_content = f"Quick test content for: {title}"
                    update_stage(job_id, 'content', True, info={"quick": True, "channel_type": channel_type})
                    summary['content'] = dummy_content
                with StageTimer(job_id, 'scripts'):
                    dummy_scripts = ["This is a quick test sentence one.", "And this is sentence two."]
                    update_stage(job_id, 'scripts', True, info={"voice_scripts": len(dummy_scripts), "quick": True})
                    summary['scripts'] = dummy_scripts
                    summary['image_prompts'] = ["abstract background", "gradient pattern"]
                with StageTimer(job_id, 'images'):
                    image_dir = settings.IMAGES_DIR
                    os.makedirs(image_dir, exist_ok=True)
                    image_paths = [f"{image_dir}/quick_{i}.png" for i in range(1, 3)]
                    update_stage(job_id, 'images', True, info={"count": len(image_paths), "quick": True, "skipped_generation": True})
                    summary['image_paths'] = image_paths
                with StageTimer(job_id, 'voices'):
                    voice_dir = settings.VOICES_DIR
                    os.makedirs(voice_dir, exist_ok=True)
                    voice_files = []
                    for i in range(1, 3):
                        vf = f"{voice_dir}/quick_voice{i}.wav"
                        if not os.path.exists(vf):
                            with open(vf, 'wb') as f:
                                f.write(b'RIFF\x24\x00\x00\x00WAVEfmt ')
                        voice_files.append(vf)
                    update_stage(job_id, 'voices', True, info={"count": len(voice_files), "quick": True, "skipped_generation": True})
                    summary['voice_files'] = voice_files
                with StageTimer(job_id, 'edit'):
                    output_dir = settings.OUTPUT_DIR
                    os.makedirs(output_dir, exist_ok=True)
                    video_path = f"{output_dir}/quick_placeholder.txt"
                    with open(video_path, 'w', encoding='utf-8') as f:
                        f.write("Quick mode placeholder video artifact")
                    update_stage(job_id, 'edit', True, artifact=video_path)
                    summary['video_path'] = video_path
                with StageTimer(job_id, 'music'):
                    update_stage(job_id, 'music', True, info={"skipped": True, "quick": True})
                with StageTimer(job_id, 'captions'):
                    srt_path = f"{settings.OUTPUT_DIR}/quick_subs.srt"
                    if not os.path.exists(srt_path):
                        with open(srt_path, 'w', encoding='utf-8') as f:
                            f.write("1\n00:00:00,000 --> 00:00:01,000\nQuick test.\n")
                    update_stage(job_id, 'captions', True, artifact=srt_path, info={"quick": True, "skipped_burn": True})
                    summary['captioned_video'] = srt_path
                update_stage(job_id, 'complete', True, info={"quick": True})
                log_event(job_id, 'complete', 'final_quick', success=True)
                summary['status'] = 'success'
                summary['manifest'] = load_manifest(job_id)
                return summary

            with StageTimer(job_id, 'content'):
                content = ContentGenService(title, effective_video_mode, channel_type)
                update_stage(job_id, 'content', True, info={"channel_type": channel_type})
                summary['content'] = content
            with StageTimer(job_id, 'scripts'):
                scripts_result = ScriptsGenService(title, content, effective_video_mode, channel_type)
                update_stage(job_id, 'scripts', True, info={"voice_scripts": len(scripts_result.get('voice_scripts', []))})
                summary['scripts'] = scripts_result.get('voice_scripts')
                summary['image_prompts'] = scripts_result.get('image_prompts')
            prompts = summary.get('image_prompts') or []
            with StageTimer(job_id, 'images'):
                image_dir = settings.IMAGES_DIR
                os.makedirs(image_dir, exist_ok=True)
                image_paths = [f"{image_dir}/image_{i}.png" for i in range(1, len(prompts)+1)]
                update_stage(job_id, 'images', True, info={"count": len(image_paths)})
                summary['image_paths'] = image_paths
            with StageTimer(job_id, 'voices'):
                vr = VoiceGenService(scripts_result.get('voice_scripts', []), voice)
                if vr.get('status') != 'success':
                    update_stage(job_id, 'voices', False, info={"error": vr.get('message')})
                    raise RuntimeError(f"Voice stage failed: {vr.get('message')}")
                update_stage(job_id, 'voices', True, info={"count": len(vr.get('files', []))})
                summary['voice_files'] = vr.get('files')
            with StageTimer(job_id, 'edit'):
                try:
                    video_path = EditAgentService(video_mode=effective_video_mode, job_id=job_id)
                    update_stage(job_id, 'edit', True, artifact=video_path)
                    summary['video_path'] = video_path
                except EditError as ee:
                    update_stage(job_id, 'edit', False, info={"error": str(ee)})
                    raise
            with StageTimer(job_id, 'music'):
                update_stage(job_id, 'music', True, info={"skipped": True})
            with StageTimer(job_id, 'captions'):
                try:
                    captioned_video = CaptionGenService(job_id=job_id, video_mode=effective_video_mode)
                    update_stage(job_id, 'captions', True, artifact=captioned_video)
                    summary['captioned_video'] = captioned_video
                except CaptionError as ce:
                    update_stage(job_id, 'captions', False, info={"error": str(ce)})
                    raise
            update_stage(job_id, 'complete', True)
            log_event(job_id, 'complete', 'final', success=True)
            summary['status'] = 'success'
        except Exception as e:
            log_event(job_id, 'pipeline', 'error', error=str(e))
            update_stage(job_id, 'complete', False, info={"error": str(e)})
            summary['status'] = 'error'
            summary['error'] = str(e)
        summary['manifest'] = load_manifest(job_id)
        return summary