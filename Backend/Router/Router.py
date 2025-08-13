from fastapi import APIRouter, HTTPException, File, UploadFile, Form, BackgroundTasks, Depends, Query, Header
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from PIL import Image
import io
import os
import shutil
from Controller.Controller import VideoGenerationController
from Config.settings import settings
from db.models import get_session, User
from Agents.voiceGeneration import VoiceGenerator
from jobs.job_utils import load_manifest, update_stage
from db.models import get_session
from db import crud

# Create the router
router = APIRouter(prefix="/api/video", tags=["video generation"])

# Initialize controller
controller = VideoGenerationController()

# Pydantic models for request validation
class VideoModeConfig(BaseModel):
    video_mode: bool = True
    job_id: Optional[str] = None

class ContentRequest(BaseModel):
    title: str
    video_mode: bool = True
    channel_type: Optional[str] = None
    job_id: Optional[str] = None

class ScriptRequest(BaseModel):
    title: str
    content: Optional[str] = None
    video_mode: bool = True
    channel_type: Optional[str] = None
    job_id: Optional[str] = None

class ImageGenerationRequest(BaseModel):
    prompts: List[str]
    video_mode: bool = True
    job_id: Optional[str] = None

class ImageModificationRequest(BaseModel):
    image_path: str
    prompt: str

class VoiceGenerationRequest(BaseModel):
    sentences: List[str]
    voice: Optional[str] = None
    video_mode: bool = True
    job_id: Optional[str] = None

class BGMusicRequest(BaseModel):
    music_path: str
    video_mode: bool = True
    job_id: Optional[str] = None

class CaptionsRequest(BaseModel):
    video_mode: bool = True
    job_id: Optional[str] = None

class FullPipelineRequest(BaseModel):
    title: str
    channel_type: Optional[str] = None
    voice: Optional[str] = None
    video_mode: bool = True

# Global video mode setting endpoint
@router.post("/set-video-mode")
async def set_video_mode(config: VideoModeConfig):
    """Set video mode for the entire process"""
    print("===========================================================")
    print(f"Setting video mode to: {config.video_mode}")
    print("===========================================================")    
    controller.set_video_mode(config.video_mode)
    return {"status": "success", "video_mode": config.video_mode}

# Routes
@router.post("/content", response_model=Dict[str, Any])
async def generate_content(request: ContentRequest, x_user_id: str | None = Header(default=None, convert_underscores=False)):
    """Generate content based on title"""
    # Update global video mode
    controller.set_video_mode(request.video_mode)
    
    result = await controller.generate_content(
        request.title, request.video_mode, request.channel_type, request.job_id, user_id=x_user_id
    )
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result["message"])
    
    # Add video_mode to response for client confirmation
    result["video_mode"] = request.video_mode
    return result

@router.post("/scripts", response_model=Dict[str, Any])
async def generate_scripts(request: ScriptRequest, x_user_id: str | None = Header(default=None, convert_underscores=False)):
    """Generate scripts based on content"""
    # Update global video mode
    controller.set_video_mode(request.video_mode)
    
    result = await controller.generate_scripts(
        request.title, request.content, request.video_mode, request.channel_type, request.job_id, user_id=x_user_id
    )
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result["message"])
    
    # Add video_mode to response for client confirmation
    result["video_mode"] = request.video_mode
    return result

@router.post("/images", response_model=Dict[str, Any])
async def generate_images(request: ImageGenerationRequest, x_user_id: str | None = Header(default=None, convert_underscores=False)):
    """Generate images based on prompts"""
    # Update global video mode
    controller.set_video_mode(request.video_mode)
    
    result = await controller.generate_images(request.prompts, request.video_mode, request.job_id, user_id=x_user_id)
    if result["status"] == "error":
        raise HTTPException(status_code=500, detail=result["message"])
    
    # Add video_mode to response for client confirmation
    result["video_mode"] = request.video_mode
    return result

@router.post("/modify-image", response_model=Dict[str, Any])
async def modify_image(request: ImageModificationRequest):
    """Modify an image using a prompt"""
    if not os.path.exists(request.image_path):
        raise HTTPException(status_code=404, detail="Image file not found")
    print("=================================")
    print(request.image_path)
    print(request.prompt)
    print("=================================")
    # Update global video mode
    
    result = await controller.modify_image(request.image_path, request.prompt)
    result["modified_image_path"] = request.image_path
    return result

@router.get("/image/{image_id}")
async def get_image(image_id: str):
    """Get a generated image by ID"""
    image_path = f"assets/images/{image_id}.png"
    if not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(image_path)

@router.post("/voices", response_model=Dict[str, Any])
async def generate_voices(request: VoiceGenerationRequest, x_user_id: str | None = Header(default=None, convert_underscores=False)):
    """Generate voice audio for scripts"""
    # Update global video mode
    controller.set_video_mode(request.video_mode)
    print("=================================")
    print(request.voice)
    print("=================================")
    result = await controller.generate_voices(
        request.sentences, request.voice, request.video_mode, request.job_id, user_id=x_user_id
    )
    if result.get("status") == "error":
        raise HTTPException(status_code=500, detail=result.get("message", "Voice generation failed"))
    result["video_mode"] = request.video_mode
    # Provide alias expected by older frontend code
    if "voice_files" in result and "voice_paths" not in result:
        result["voice_paths"] = result["voice_files"]
    return result

@router.get("/jobs/{job_id}", response_model=Dict[str, Any])
async def get_job(job_id: str):
    """Fetch the manifest/status for a job"""
    manifest = load_manifest(job_id)
    if not manifest:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"status": "success", "manifest": manifest}

@router.get("/user/{user_id}/jobs", response_model=Dict[str, Any])
async def list_user_jobs(user_id: str, limit: int = 25):
    """List jobs for a specific user_id (DB-backed)."""
    with get_session() as session:
        jobs = crud.list_user_jobs(session, user_id=user_id, limit=limit)
        return {"status": "success", "jobs": [
            {
                "id": j.id,
                "title": j.title,
                "status": j.status.value,
                "started_at": j.started_at.isoformat(),
                "finished_at": j.finished_at.isoformat() if j.finished_at else None,
                "video_mode": j.video_mode
            } for j in jobs
        ]}

@router.post("/pipeline", response_model=Dict[str, Any])
async def run_full_pipeline(request: FullPipelineRequest, x_user_id: str | None = Header(default=None, convert_underscores=False)):
    controller.set_video_mode(request.video_mode)
    result = await controller.generate_full_pipeline(
        title=request.title,
        channel_type=request.channel_type,
        voice=request.voice,
        video_mode=request.video_mode,
        user_id=x_user_id
    )
    if result.get("status") == "error":
        raise HTTPException(status_code=500, detail=result.get("error"))
    return result

class JobCompletionRequest(BaseModel):
    success: bool = True
    error: Optional[str] = None
    final_artifact: Optional[str] = None

@router.post("/jobs/{job_id}/complete", response_model=Dict[str, Any])
async def complete_job(job_id: str, body: JobCompletionRequest):
    """Mark a job as complete (success or failure) updating manifest."""
    manifest = load_manifest(job_id)
    if not manifest:
        raise HTTPException(status_code=404, detail="Job not found")
    info = {}
    if body.error:
        info["error"] = body.error
    update_stage(job_id, 'complete', body.success, info=info, artifact=body.final_artifact)
    new_manifest = load_manifest(job_id)
    return {"status": "success", "manifest": new_manifest}

@router.get("/voices/list", response_model=Dict[str, Any])
async def list_voices():
    """List available TTS voices for selection in frontend"""
    try:
        vg = VoiceGenerator()
        return {
            "status": "success",
            "available_voices": vg.get_available_voices(),
            "default_voice": vg.default_voice
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/custom-voice", response_model=Dict[str, Any])
async def upload_custom_voice(voice_file: UploadFile = File(...)):
    """Upload a custom voice model"""
    voice_dir = "assets/custom_voices"
    os.makedirs(voice_dir, exist_ok=True)
    
    file_path = f"{voice_dir}/{voice_file.filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(voice_file.file, buffer)
    
    return {"status": "success", "voice_path": file_path}

@router.post("/edit", response_model=Dict[str, Any])
async def edit_video(request: VideoModeConfig, background_tasks: BackgroundTasks, x_user_id: str | None = Header(default=None, convert_underscores=False)):
    """Edit the final video"""
    # Update global video mode
    controller.set_video_mode(request.video_mode)
    
    # Try to find the most recent job for this user to associate edit artifacts
    job_id = request.job_id or None
    try:
        if x_user_id:
            from jobs.job_utils import list_jobs
            jobs = [j for j in list_jobs(limit=50) if j.get('user_id') == x_user_id]
            if jobs:
                jobs.sort(key=lambda j: j.get('created_ts') or 0, reverse=True)
                job_id = jobs[0]['job_id']
    except Exception:
        pass
    # Run edit now (synchronous) so frontend can proceed to next step when ready
    result = await controller.edit_video(request.video_mode, job_id=job_id, user_id=x_user_id)
    if result.get('status') != 'success':
        raise HTTPException(status_code=500, detail=result.get('message','Edit failed'))
    return result

@router.post("/upload-music", response_model=Dict[str, Any])
async def upload_music(music_file: UploadFile = File(...)):
    """Upload a background music file"""
    try:
        # Create directory if it doesn't exist
        music_dir = "assets/music"
        os.makedirs(music_dir, exist_ok=True)
        
        # Generate a unique filename to avoid overwrites
        file_extension = os.path.splitext(music_file.filename)[1]
        unique_filename = f"bgmusic_{os.urandom(4).hex()}{file_extension}"
        file_path = f"{music_dir}/{unique_filename}"
        
        # Save the uploaded file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(music_file.file, buffer)
        
        return {
            "status": "success", 
            "message": "Music file uploaded successfully",
            "music_path": file_path
        }
    except Exception as e:
        return {"status": "error", "message": f"Failed to upload music file: {str(e)}"}
    
@router.post("/bgmusic", response_model=Dict[str, Any])
async def add_background_music(request: BGMusicRequest, x_user_id: str | None = Header(default=None, convert_underscores=False)):
    """Add background music to video (synchronous, returns artifact)"""
    if not os.path.exists(request.music_path):
        raise HTTPException(status_code=404, detail=f"Music file not found at path: {request.music_path}")
    controller.set_video_mode(request.video_mode)
    # Try to resolve a job_id for manifest association
    job_id = request.job_id or None
    try:
        from jobs.job_utils import list_jobs
        jobs = list_jobs(limit=50)
        if x_user_id:
            jobs = [j for j in jobs if j.get('user_id') == x_user_id]
        if jobs:
            jobs.sort(key=lambda j: j.get('created_ts') or 0, reverse=True)
            job_id = job_id or jobs[0]['job_id']
    except Exception:
        pass
    try:
        res = await controller.add_background_music(request.music_path, request.video_mode, job_id=job_id, user_id=x_user_id)
        if res.get('status') != 'success':
            raise HTTPException(status_code=500, detail=res.get('message','Music step failed'))
        return res
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/captions", response_model=Dict[str, Any])
async def add_captions(request: CaptionsRequest, x_user_id: str | None = Header(default=None, convert_underscores=False)):
    """Add captions to video (synchronous, returns artifact)"""
    controller.set_video_mode(request.video_mode)
    # Resolve job_id like /edit and /bgmusic
    job_id = request.job_id or None
    try:
        from jobs.job_utils import list_jobs
        jobs = list_jobs(limit=50)
        if x_user_id:
            jobs = [j for j in jobs if j.get('user_id') == x_user_id]
        if jobs:
            jobs.sort(key=lambda j: j.get('created_ts') or 0, reverse=True)
            job_id = job_id or jobs[0]['job_id']
    except Exception:
        pass
    res = await controller.add_captions(request.video_mode, job_id=job_id, user_id=x_user_id)
    if res.get('status') != 'success':
        raise HTTPException(status_code=500, detail=res.get('message','Captions step failed'))
    return res


@router.get("/video")
async def get_final_video(file: Optional[str] = Query(None)):
    """Get the final generated video"""
    # If file parameter is provided, use it, otherwise use the controller's video_mode
    if file:
        video_path = f"output/{file}"
    else:
        video_path = "output/standard_video.mp4" if controller.video_mode else "output/youtube_shorts.mp4"
    
    if not os.path.exists(video_path):
        raise HTTPException(status_code=404, detail=f"Video not found at {video_path}")
    
    return FileResponse(video_path)

# -------------------- User Gallery Endpoints --------------------

def _safe_user_dir(user_id: str) -> str:
    """Return a filesystem-safe directory for the given user_id.

    We sanitize rather than reject to support emails and typical IDs.
    Maps any character not in [A-Za-z0-9._-] to underscore.
    """
    safe = ''.join(c if (c.isalnum() or c in '._-') else '_' for c in (user_id or ''))
    if not safe:
        raise HTTPException(status_code=400, detail="Invalid user id")
    user_dir = os.path.join(settings.USER_OUTPUT_DIR, safe)
    os.makedirs(user_dir, exist_ok=True)
    return user_dir

@router.get("/user/{user_id}/gallery", response_model=Dict[str, Any])
async def list_user_gallery(user_id: str):
    """List generated video artifacts for a user (local filesystem)."""
    user_dir = _safe_user_dir(user_id)
    items: List[Dict[str, Any]] = []
    for fname in sorted(os.listdir(user_dir), reverse=True):
        fpath = os.path.join(user_dir, fname)
        if not os.path.isfile(fpath):
            continue
        if not fname.lower().endswith((".mp4", ".mov", ".mkv", ".webm", ".txt", ".srt")):
            continue
        stat = os.stat(fpath)
        thumb_name = fname + ".jpg"
        thumb_path = os.path.join(user_dir, thumb_name)
        if fname.lower().endswith((".mp4",".mov",".mkv",".webm")) and not os.path.exists(thumb_path):
            # Attempt thumbnail extraction (first frame) using moviepy fallback; if fails create placeholder
            try:
                from moviepy.editor import VideoFileClip  # type: ignore
                with VideoFileClip(fpath) as clip:
                    frame = clip.get_frame(min(1, clip.duration/2))
                    img = Image.fromarray(frame)
                    img.thumbnail((400,225))
                    img.save(thumb_path, 'JPEG', quality=70)
            except Exception:
                try:
                    # Placeholder gradient
                    img = Image.new('RGB', (400,225), (30,25,45))
                    img.save(thumb_path, 'JPEG', quality=70)
                except Exception:
                    pass
        items.append({
            "name": fname,
            "size": stat.st_size,
            "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            "url": f"/api/video/user/{user_id}/gallery/file/{fname}",
            "thumbnail": f"/api/video/user/{user_id}/gallery/thumb/{thumb_name}" if os.path.exists(thumb_path) else None
        })
    return {"status": "success", "items": items}

@router.get("/user/{user_id}/gallery/file/{filename}")
async def get_user_gallery_file(user_id: str, filename: str):
    user_dir = _safe_user_dir(user_id)
    # Prevent path traversal
    if any(x in filename for x in ('..','/','\\')):
        raise HTTPException(status_code=400, detail="Invalid filename")
    fpath = os.path.join(user_dir, filename)
    if not os.path.exists(fpath):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(fpath)

@router.get("/user/{user_id}/gallery/thumb/{filename}")
async def get_user_gallery_thumb(user_id: str, filename: str):
    user_dir = _safe_user_dir(user_id)
    if any(x in filename for x in ('..','/','\\')):
        raise HTTPException(status_code=400, detail="Invalid filename")
    fpath = os.path.join(user_dir, filename)
    if not os.path.exists(fpath):
        raise HTTPException(status_code=404, detail="Thumbnail not found")
    return FileResponse(fpath)

class RenameBody(BaseModel):
    new_name: str

@router.post("/user/{user_id}/gallery/rename/{filename}")
async def rename_user_gallery_file(user_id: str, filename: str, body: RenameBody):
    user_dir = _safe_user_dir(user_id)
    if any(x in filename for x in ('..','/','\\')):
        raise HTTPException(status_code=400, detail="Invalid filename")
    src = os.path.join(user_dir, filename)
    if not os.path.exists(src):
        raise HTTPException(status_code=404, detail="File not found")
    base, ext = os.path.splitext(filename)
    safe_new = ''.join(c for c in body.new_name if c.isalnum() or c in ('-','_'))[:60]
    if not safe_new:
        raise HTTPException(status_code=400, detail="Invalid new name")
    dest = os.path.join(user_dir, safe_new + ext)
    if os.path.exists(dest):
        raise HTTPException(status_code=400, detail="Target name exists")
    os.rename(src, dest)
    # Also rename thumbnail if exists
    thumb_old = src + '.jpg'
    thumb_new = dest + '.jpg'
    if os.path.exists(thumb_old):
        try: os.rename(thumb_old, thumb_new)
        except Exception: pass
    return {"status":"success","old":filename,"new":os.path.basename(dest)}

@router.delete("/user/{user_id}/gallery/file/{filename}")
async def delete_user_gallery_file(user_id: str, filename: str):
    user_dir = _safe_user_dir(user_id)
    if any(x in filename for x in ('..','/','\\')):
        raise HTTPException(status_code=400, detail="Invalid filename")
    fpath = os.path.join(user_dir, filename)
    if not os.path.exists(fpath):
        raise HTTPException(status_code=404, detail="File not found")
    os.remove(fpath)
    thumb = fpath + '.jpg'
    if os.path.exists(thumb):
        try: os.remove(thumb)
        except Exception: pass
    return {"status":"success"}

# Avatar upload
@router.post("/user/{user_id}/avatar")
async def upload_avatar(user_id: str, file: UploadFile = File(...)):
    _safe_user_dir(user_id)  # validate id
    ext = os.path.splitext(file.filename or '')[1].lower()
    if ext not in {'.png','.jpg','.jpeg','.webp'}:
        raise HTTPException(status_code=400, detail="Unsupported format")
    avatar_dir = settings.AVATARS_DIR
    os.makedirs(avatar_dir, exist_ok=True)
    fname = f"{user_id}{ext}"
    path = os.path.join(avatar_dir, fname)
    data = await file.read()
    # Basic size cap 5MB
    if len(data) > 5*1024*1024:
        raise HTTPException(status_code=400, detail="File too large")
    try:
        img = Image.open(io.BytesIO(data))
        img.thumbnail((512,512))
        img.save(path)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image data")
    # store filename
    with get_session() as session:
        u = session.get(User, user_id)
        if u:
            u.avatar_filename = fname
            session.commit()
    return {"status":"success","avatar_url":f"/api/video/user/{user_id}/avatar"}

@router.get("/user/{user_id}/avatar")
async def get_avatar(user_id: str):
    with get_session() as session:
        u = session.get(User, user_id)
        if not u or not u.avatar_filename:
            raise HTTPException(status_code=404, detail="No avatar")
        path = os.path.join(settings.AVATARS_DIR, u.avatar_filename)
        if not os.path.exists(path):
            raise HTTPException(status_code=404, detail="No avatar")
        return FileResponse(path)