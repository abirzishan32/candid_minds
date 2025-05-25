from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import google.generativeai as genai
import os
import re
import subprocess
import uuid
import tempfile
import shutil
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up the API key
api_key = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set")


MEDIA_DIR = Path("media")
MEDIA_DIR.mkdir(exist_ok=True)

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files directory
app.mount("/media", StaticFiles(directory=str(MEDIA_DIR.absolute())), name="media")

class AnimationRequest(BaseModel):
    prompt: str

class AnimationResponse(BaseModel):
    code: str
    explanation: str
    video_url: str = None

def extract_python_code(text):
    """Extract Python code blocks from the text."""
    python_pattern = r"```(?:python)?\s*([\s\S]*?)```"
    matches = re.findall(python_pattern, text)
    
    if matches:
        return matches[0].strip()  # Return the first code block
    return ""

def sanitize_manim_code(code):
    """Sanitize the Manim code to ensure it's safe to execute"""
    # Basic sanitization - prevent imports outside of manim and basic libraries
    disallowed_imports = ['os.system', 'subprocess', 'eval', 'exec', 'shutil.rmtree', 'sys.exit']
    
    for item in disallowed_imports:
        if item in code:
            raise ValueError(f"Code contains disallowed operation: {item}")
    
    # Ensure the code creates a scene class that extends Scene
    if not re.search(r'class\s+\w+\(\s*Scene\s*\)', code):
        raise ValueError("Code must define a Scene class")
    
    return code

def render_animation(code, filename):
    """Render the Manim animation from the provided code."""
    # Create a temporary directory for the code
    with tempfile.TemporaryDirectory() as temp_dir:
        # Create a Python file with the code
        file_path = os.path.join(temp_dir, "animation_code.py")
        with open(file_path, "w") as f:
            f.write(code)
        
        # Get the Scene class name from the code
        scene_match = re.search(r'class\s+(\w+)\(\s*Scene\s*\)', code)
        if not scene_match:
            raise ValueError("Could not find Scene class in the code")
        
        scene_name = scene_match.group(1)
        
        # Run Manim to render the animation
        output_path = os.path.join(MEDIA_DIR, filename)
        
        command = [
            "manim", 
            file_path, 
            scene_name,
            "-o", filename,
            "--media_dir", str(MEDIA_DIR),
            "--quality", "m"  # Medium quality for faster rendering
        ]
        
        process = subprocess.run(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        if process.returncode != 0:
            print(f"Manim error: {process.stderr}")
            raise ValueError(f"Failed to render animation: {process.stderr}")
        
        # Return the path to the rendered video
        return f"/media/{filename}.mp4"
        
@app.get("/media-info")
async def media_info():
    """Debug endpoint to check media directory contents"""
    # Check media directory
    media_dir_path = MEDIA_DIR.absolute()
    
    # Recursively find all files in the media directory
    all_files = []
    for path in media_dir_path.rglob('*'):
        if path.is_file():
            relative_path = path.relative_to(media_dir_path)
            all_files.append(str(relative_path))
    
    return {
        "media_directory": str(media_dir_path),
        "file_count": len(all_files),
        "files": all_files
    }


@app.post("/generate-animation")
async def generate_animation(request: AnimationRequest):
    if not request.prompt:
        raise HTTPException(status_code=400, detail="Prompt is required")
    
    try:
        # Create the prompt for Gemini
        prompt_text = f"""
        Create a Manim animation to visualize the following: {request.prompt}
        
        Generate Python code that uses Manim library to create this visualization.
        The code should be complete, executable, and well-commented.
        Be sure to define a single Scene class that extends Scene.
        
        Also provide a brief explanation of how the animation works and what it demonstrates.
        
        Format your response as follows:
        1. Python code block (wrapped in ```python and ```)
        2. Explanation of the animation
        """
        
        # Generate response from Gemini
        response = model.generate_content(prompt_text)
        
        # Extract the Python code and explanation
        full_text = response.text
        code = extract_python_code(full_text)
        
        # Get explanation (everything after the code block)
        parts = full_text.split("```")
        if len(parts) >= 3:
            explanation = parts[-1].strip()
        else:
            explanation = "No explanation provided."
        
        # Sanitize and validate the code
        try:
            sanitized_code = sanitize_manim_code(code)
            
            # Generate a unique filename
            animation_id = str(uuid.uuid4())[:8]
            
            # Render the animation
            video_url = render_animation(sanitized_code, animation_id)
            
            return AnimationResponse(
                code=code,
                explanation=explanation,
                video_url=video_url
            )
            
        except ValueError as e:
            # If there's an issue with the code, return just the code and explanation
            return AnimationResponse(
                code=code,
                explanation=f"{explanation}\n\nNote: Could not render animation: {str(e)}"
            )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating animation: {str(e)}")

@app.get("/")
def read_root():
    return {"message": "Welcome to FastAPI 🚀"}


@app.get("/test-media")
async def test_media():
    # Create a simple test file
    test_file = Path(MEDIA_DIR) / "test.txt"
    test_file.write_text("This is a test file")
    return {"message": "Test file created", "url": "/media/test.txt"}