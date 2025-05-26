from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import json
import asyncio
import logging
from .agent import SystemDesignGenerationSystem

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/system-design", tags=["System Design"])

# Initialize the system design system
system_design_system = SystemDesignGenerationSystem()

class SystemDesignRequest(BaseModel):
    prompt: str

class SystemDesignResponse(BaseModel):
    analysis: Optional[dict] = None
    plantuml_code: str
    explanation: str
    diagram_url: Optional[str] = None
    d3_components: dict
    diagram_id: Optional[str] = None

class StreamingSystemDesignRequest(BaseModel):
    prompt: str

@router.post("/generate", response_model=SystemDesignResponse)
async def generate_system_design(request: SystemDesignRequest):
    """Generate a system design diagram based on user prompt (non-streaming)"""
    if not request.prompt or not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt is required and cannot be empty")
    
    try:
        logger.info(f"Generating system design for: {request.prompt[:100]}...")
        result = system_design_system.create_system_design(request.prompt.strip())
        
        return SystemDesignResponse(
            analysis=result["analysis"],
            plantuml_code=result["plantuml_code"],
            explanation=result["explanation"],
            diagram_url=result["diagram_url"],
            d3_components=result["d3_components"],
            diagram_id=result["diagram_id"]
        )
        
    except Exception as e:
        logger.error(f"Error in generate_system_design: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating system design: {str(e)}")

@router.post("/generate-stream")
async def generate_system_design_stream(request: StreamingSystemDesignRequest):
    """Generate a system design diagram with streaming progress updates"""
    if not request.prompt or not request.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt is required and cannot be empty")
    
    async def event_stream():
        try:
            logger.info(f"Starting streaming generation for: {request.prompt[:100]}...")
            for update in system_design_system.create_system_design_stream(request.prompt.strip()):
                # Format as Server-Sent Events
                event_data = json.dumps(update)
                yield f"data: {event_data}\n\n"
                
                # Small delay to prevent overwhelming the client
                await asyncio.sleep(0.1)
                
        except Exception as e:
            logger.error(f"Streaming error: {str(e)}")
            error_data = json.dumps({
                "status": "error",
                "error": f"Error generating system design: {str(e)}",
                "progress": -1,
                "stage": "error",
                "stage_description": "Generation failed"
            })
            yield f"data: {error_data}\n\n"
    
    return StreamingResponse(
        event_stream(),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Methods": "*",
        }
    )

@router.get("/health")
async def health_check():
    """Health check endpoint for the system design service"""
    return {
        "status": "healthy",
        "service": "System Design Generator (LangGraph)",
        "features": [
            "LangGraph workflow",
            "Streaming progress updates", 
            "Multi-stage processing",
            "PlantUML generation",
            "D3 component extraction",
            "Architecture analysis"
        ]
    }

@router.get("/health")
async def health_check():
    """
    Health check endpoint for the system design service
    
    Returns:
        Status information
    """
    return {
        "status": "healthy",
        "service": "System Design Generator (LangGraph)",
        "features": [
            "LangGraph workflow",
            "Streaming progress updates",
            "Multi-stage processing",
            "PlantUML generation",
            "D3 component extraction",
            "Architecture analysis"
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
                "stage": "analyze_requirements",
                "description": "Analyze system requirements and identify architecture patterns",
                "outputs": ["system_type", "scale", "key_components", "patterns"]
            },
            {
                "stage": "generate_plantuml", 
                "description": "Generate comprehensive PlantUML component diagram",
                "outputs": ["plantuml_code"]
            },
            {
                "stage": "generate_explanation",
                "description": "Create detailed architecture explanation and best practices",
                "outputs": ["explanation"]
            },
            {
                "stage": "create_diagram_url",
                "description": "Generate diagram URL and extract D3 components",
                "outputs": ["diagram_url", "d3_components", "diagram_id"]
            }
        ],
        "benefits": [
            "Comprehensive requirement analysis",
            "Professional PlantUML diagrams", 
            "Interactive D3 components",
            "Detailed technical explanations",
            "Architecture best practices",
            "Streaming progress updates"
        ]
    }