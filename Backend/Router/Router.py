from fastapi import APIRouter, HTTPException, File, UploadFile, Form, BackgroundTasks, Depends, Query, Header
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import shutil
from Controller.Controller import VideoGenerationController
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

class CaptionsRequest(BaseModel):
    video_mode: bool = True

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
async def edit_video(request: VideoModeConfig, background_tasks: BackgroundTasks):
    """Edit the final video"""
    # Update global video mode
    controller.set_video_mode(request.video_mode)
    
    # Run in background task as it might take time
    await controller.edit_video(request.video_mode)
    return {"status": "success", "message": "Video editing started in background", "video_mode": request.video_mode}

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
async def add_background_music(request: BGMusicRequest, background_tasks: BackgroundTasks):
    """Add background music to video"""
    # Check if the file exists
    if not os.path.exists(request.music_path):
        raise HTTPException(status_code=404, detail=f"Music file not found at path: {request.music_path}")
    
    # Update global video mode
    controller.set_video_mode(request.video_mode)
    
    try:
        # Run in background task as it might take time
        await controller.add_background_music(request.music_path, request.video_mode)
        return {
            "status": "success", 
            "message": "Background music added successfully", 
            "video_mode": request.video_mode
        }
    except Exception as e:
        return {"status": "error", "message": f"Failed to add background music: {str(e)}"}

@router.post("/captions", response_model=Dict[str, Any])
async def add_captions(request: CaptionsRequest, background_tasks: BackgroundTasks):
    """Add captions to video"""
    # Update global video mode
    controller.set_video_mode(request.video_mode)
    
    # Run in background task as it might take time
    background_tasks.add_task(controller.add_captions, request.video_mode)
    return {
        "status": "success", 
        "message": "Adding captions started in background", 
        "video_mode": request.video_mode
    }


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