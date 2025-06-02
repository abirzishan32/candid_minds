from fastapi import APIRouter, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field
from typing import Dict, List, Any, Optional
import logging
import json
import os
from pathlib import Path

from .agent import LeetCodeVoiceAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/leetcode-qna", tags=["LeetCode Voice Interview"])

# Initialize the agent
try:
    voice_agent = LeetCodeVoiceAgent()
    logger.info("LeetCode Voice Agent initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize LeetCode Voice Agent: {str(e)}")
    voice_agent = None

# Request/Response Models
class StartInterviewRequest(BaseModel):
    user_id: str = Field(..., description="User ID")
    problem_data: Dict[str, Any] = Field(..., description="LeetCode problem data")
    language: str = Field(default="Python", description="Programming language")

class UserResponseRequest(BaseModel):
    interview_id: str = Field(..., description="Interview session ID")
    user_response: str = Field(..., description="User's response text")
    audio_input: bool = Field(default=False, description="Whether response came from audio")

class InterviewResponse(BaseModel):
    success: bool
    message: str = ""
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy" if voice_agent else "unhealthy",
        "service": "leetcode-voice-interview",
        "tts_available": voice_agent is not None,
        "audio_directory": str(voice_agent.audio_dir) if voice_agent else None
    }

@router.post("/start-interview", response_model=InterviewResponse)
async def start_interview(request: StartInterviewRequest):
    """Start a new LeetCode voice interview session"""
    
    try:
        if not voice_agent:
            raise HTTPException(
                status_code=500,
                detail="Voice agent not initialized"
            )
        
        logger.info(f"Starting interview for user {request.user_id} with problem: {request.problem_data.get('title', 'Unknown')}")
        
        result = await voice_agent.start_interview(
            problem_data=request.problem_data,
            user_id=request.user_id,
            language=request.language
        )
        
        if result["success"]:
            return InterviewResponse(
                success=True,
                message="Interview started successfully",
                data=result
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=result.get("error", "Failed to start interview")
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting interview: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start interview: {str(e)}"
        )

@router.post("/respond", response_model=InterviewResponse)
async def process_user_response(request: UserResponseRequest):
    """Process user response and get next question or feedback"""
    
    try:
        if not voice_agent:
            raise HTTPException(
                status_code=500,
                detail="Voice agent not initialized"
            )
        
        logger.info(f"Processing response for interview {request.interview_id}")
        
        result = await voice_agent.process_user_response(
            interview_id=request.interview_id,
            user_response=request.user_response,
            audio_input=request.audio_input
        )
        
        if result["success"]:
            return InterviewResponse(
                success=True,
                message="Response processed successfully",
                data=result
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "Failed to process response")
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing response: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process response: {str(e)}"
        )

@router.post("/end-interview/{interview_id}", response_model=InterviewResponse)
async def end_interview(interview_id: str):
    """End the interview and generate performance report"""
    
    try:
        if not voice_agent:
            raise HTTPException(
                status_code=500,
                detail="Voice agent not initialized"
            )
        
        logger.info(f"Ending interview {interview_id}")
        
        result = await voice_agent.end_interview(interview_id)
        
        if result["success"]:
            return InterviewResponse(
                success=True,
                message="Interview completed successfully",
                data=result
            )
        else:
            raise HTTPException(
                status_code=400,
                detail=result.get("error", "Failed to end interview")
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error ending interview: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to end interview: {str(e)}"
        )

@router.get("/interview-status/{interview_id}")
async def get_interview_status(interview_id: str):
    """Get current interview status"""
    
    try:
        if not voice_agent:
            raise HTTPException(
                status_code=500,
                detail="Voice agent not initialized"
            )
        
        result = voice_agent.get_interview_status(interview_id)
        
        if result["success"]:
            return JSONResponse(content=result)
        else:
            raise HTTPException(
                status_code=404,
                detail=result.get("error", "Interview not found")
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting interview status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get interview status: {str(e)}"
        )

@router.post("/speech-to-text")
async def speech_to_text_endpoint(audio_file: UploadFile = File(...)):
    """Convert uploaded audio file to text"""
    
    try:
        if not voice_agent:
            raise HTTPException(
                status_code=500,
                detail="Voice agent not initialized"
            )
        
        # Save uploaded file temporarily
        temp_path = voice_agent.audio_dir / f"temp_{audio_file.filename}"
        
        with open(temp_path, "wb") as buffer:
            content = await audio_file.read()
            buffer.write(content)
        
        # Convert to text
        text = await voice_agent.speech_to_text(str(temp_path))
        
        # Clean up temp file
        temp_path.unlink(missing_ok=True)
        
        return JSONResponse(content={
            "success": True,
            "text": text
        })
        
    except Exception as e:
        logger.error(f"Error in speech-to-text: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to convert speech to text: {str(e)}"
        )

@router.post("/text-to-speech")
async def text_to_speech_endpoint(request: Dict[str, str]):
    """Convert text to speech and return audio file path"""
    
    try:
        if not voice_agent:
            raise HTTPException(
                status_code=500,
                detail="Voice agent not initialized"
            )
        
        text = request.get("text", "")
        if not text:
            raise HTTPException(
                status_code=400,
                detail="Text is required"
            )
        
        audio_path = await voice_agent.text_to_speech(text)
        
        return JSONResponse(content={
            "success": True,
            "audio_path": f"/media/leetcode_audio/{Path(audio_path).name}"
        })
        
    except Exception as e:
        logger.error(f"Error in text-to-speech: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to convert text to speech: {str(e)}"
        )

@router.get("/audio/{filename}")
async def get_audio_file(filename: str):
    """Serve audio files"""
    
    try:
        if not voice_agent:
            raise HTTPException(
                status_code=500,
                detail="Voice agent not initialized"
            )
        
        audio_path = voice_agent.audio_dir / filename
        
        if not audio_path.exists():
            raise HTTPException(
                status_code=404,
                detail="Audio file not found"
            )
        
        return FileResponse(
            path=str(audio_path),
            media_type="audio/wav",
            filename=filename
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error serving audio file: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to serve audio file: {str(e)}"
        )

@router.post("/listen-microphone")
async def listen_from_microphone():
    """Listen to microphone input and return transcribed text"""
    
    try:
        if not voice_agent:
            raise HTTPException(
                status_code=500,
                detail="Voice agent not initialized"
            )
        
        text = await voice_agent.listen_from_microphone(timeout=10, phrase_timeout=5)
        
        return JSONResponse(content={
            "success": True,
            "text": text
        })
        
    except Exception as e:
        logger.error(f"Error listening from microphone: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to listen from microphone: {str(e)}"
        )

@router.delete("/cleanup-audio/{interview_id}")
async def cleanup_interview_audio(interview_id: str):
    """Clean up audio files for a completed interview"""
    
    try:
        if not voice_agent:
            raise HTTPException(
                status_code=500,
                detail="Voice agent not initialized"
            )
        
        # Find and delete audio files related to this interview
        audio_files = list(voice_agent.audio_dir.glob(f"*{interview_id}*"))
        deleted_count = 0
        
        for file_path in audio_files:
            try:
                file_path.unlink()
                deleted_count += 1
            except Exception as e:
                logger.warning(f"Failed to delete {file_path}: {str(e)}")
        
        return JSONResponse(content={
            "success": True,
            "deleted_files": deleted_count,
            "message": f"Cleaned up {deleted_count} audio files"
        })
        
    except Exception as e:
        logger.error(f"Error cleaning up audio files: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to clean up audio files: {str(e)}"
        )