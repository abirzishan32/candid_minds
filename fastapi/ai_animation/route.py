from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from pathlib import Path
from typing import Optional
import json
import asyncio
from .agent import AnimationGenerationSystem, AnimationAgent

# Create router
router = APIRouter(prefix="/ai-animation", tags=["AI Animation"])

# Initialize the animation system
MEDIA_DIR = Path("media")
animation_system = AnimationGenerationSystem(MEDIA_DIR)
animation_agent = AnimationAgent(MEDIA_DIR)  # Legacy support

class AnimationRequest(BaseModel):
    prompt: str

class AnimationResponse(BaseModel):
    code: str
    explanation: str
    video_url: Optional[str] = None

class StreamingAnimationRequest(BaseModel):
    prompt: str

@router.post("/generate", response_model=AnimationResponse)
async def generate_animation(request: AnimationRequest):
    """
    Generate an AI-powered animation based on user prompt (non-streaming)
    
    Args:
        request: AnimationRequest containing the user's prompt
        
    Returns:
        AnimationResponse with generated code, explanation, and video URL
    """
    if not request.prompt or not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt is required and cannot be empty")
    
    try:
        result = animation_system.create_animation(request.prompt.strip())
        
        return AnimationResponse(
            code=result["code"],
            explanation=result["explanation"],
            video_url=result["video_url"]
        )
        
    except Exception as e:
        print(f"Error in generate_animation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating animation: {str(e)}")

@router.post("/generate-stream")
async def generate_animation_stream(request: StreamingAnimationRequest):
    """
    Generate an AI-powered animation with streaming progress updates
    
    Args:
        request: StreamingAnimationRequest containing the user's prompt
        
    Returns:
        Server-sent events stream with progress updates
    """
    if not request.prompt or not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt is required and cannot be empty")
    
    async def event_stream():
        try:
            for update in animation_system.create_animation_stream(request.prompt.strip()):
                # Format as Server-Sent Events
                event_data = json.dumps(update)
                yield f"data: {event_data}\n\n"
                
                # Small delay to prevent overwhelming the client
                await asyncio.sleep(0.1)
                
        except Exception as e:
            error_data = json.dumps({
                "status": "error",
                "error": f"Error generating animation: {str(e)}",
                "progress": -1
            })
            yield f"data: {error_data}\n\n"
    
    return StreamingResponse(
        event_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

@router.get("/media-info")
async def get_media_info():
    """
    Get information about files in the media directory for debugging
    
    Returns:
        Dictionary with media directory contents
    """
    try:
        return animation_system.get_media_info()
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
        "service": "AI Animation Generator (LangGraph)",
        "media_directory": str(MEDIA_DIR.absolute()),
        "features": [
            "LangGraph workflow",
            "Streaming progress updates",
            "Multi-stage processing",
            "Advanced prompt analysis"
        ]
    }

@router.get("/workflow-info")
async def get_workflow_info():
    """
    Get information about the LangGraph workflow stages
    
    Returns:
        Dictionary with workflow information
    """
    return {
        "workflow_stages": [
            {
                "stage": "analyze_prompt",
                "description": "Analyze user request and determine animation requirements",
                "outputs": ["animation_type", "complexity", "key_concepts", "manim_objects"]
            },
            {
                "stage": "generate_code", 
                "description": "Generate optimized Manim code based on analysis",
                "outputs": ["generated_code", "explanation"]
            },
            {
                "stage": "sanitize_code",
                "description": "Validate and secure the generated code",
                "outputs": ["sanitized_code"]
            },
            {
                "stage": "render_animation",
                "description": "Render the animation using Manim",
                "outputs": ["video_url", "animation_id"]
            }
        ],
        "benefits": [
            "Better error handling and recovery",
            "Progress tracking through stages",
            "Structured prompt analysis",
            "Optimized code generation",
            "Secure code execution"
        ]
    }