from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pathlib import Path
from typing import Optional
from .agent import AnimationAgent

# Create router
router = APIRouter(prefix="/ai-animation", tags=["AI Animation"])

# Initialize the animation agent
MEDIA_DIR = Path("media")
animation_agent = AnimationAgent(MEDIA_DIR)

class AnimationRequest(BaseModel):
    prompt: str

class AnimationResponse(BaseModel):
    code: str
    explanation: str
    video_url: Optional[str] = None  # Fix: Make it Optional and allow None

@router.post("/generate", response_model=AnimationResponse)
async def generate_animation(request: AnimationRequest):
    """
    Generate an AI-powered animation based on user prompt
    
    Args:
        request: AnimationRequest containing the user's prompt
        
    Returns:
        AnimationResponse with generated code, explanation, and video URL
    """
    if not request.prompt or not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt is required and cannot be empty")
    
    try:
        result = animation_agent.create_animation(request.prompt.strip())
        
        return AnimationResponse(
            code=result["code"],
            explanation=result["explanation"],
            video_url=result["video_url"]
        )
        
    except Exception as e:
        print(f"Error in generate_animation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating animation: {str(e)}")

@router.get("/media-info")
async def get_media_info():
    """
    Get information about files in the media directory for debugging
    
    Returns:
        Dictionary with media directory contents
    """
    try:
        return animation_agent.get_media_info()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting media info: {str(e)}")

@router.get("/health")
async def health_check():
    """
    Health check endpoint for the AI animation service
    
    Returns:
        Status information
    """
    return {
        "status": "healthy",
        "service": "AI Animation Generator",
        "media_directory": str(MEDIA_DIR.absolute())
    }