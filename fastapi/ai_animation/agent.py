import google.generativeai as genai
import os
import re
import subprocess
import uuid
import tempfile
from pathlib import Path
from typing import Optional, Tuple
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class AnimationAgent:
    def __init__(self, media_dir: Path):
        """Initialize the Animation Agent with Google Generative AI"""
        self.media_dir = media_dir
        self.media_dir.mkdir(exist_ok=True)
        
        # Set up the API key
        api_key = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
    
    def generate_manim_code(self, prompt: str) -> Tuple[str, str]:
        """
        Generate Manim code and explanation from a user prompt
        
        Args:
            prompt: User's request for animation
            
        Returns:
            Tuple of (code, explanation)
        """
        prompt_text = f"""
        Create a Manim animation to visualize the following: {prompt}
        
        Generate Python code that uses Manim library to create this visualization.
        The code should be complete, executable, and well-commented.
        Be sure to define a single Scene class that extends Scene.
        
        Important requirements:
        - Use only standard Manim imports and basic Python libraries
        - Create engaging, educational animations
        - Include smooth transitions and clear visual elements
        - Make the animation last 5-10 seconds
        - Use appropriate colors and styling
        
        Also provide a brief explanation of how the animation works and what it demonstrates.
        
        Format your response as follows:
        1. Python code block (wrapped in ```python and ```)
        2. Explanation of the animation
        """
        
        try:
            response = self.model.generate_content(prompt_text)
            full_text = response.text
            
            # Extract code and explanation
            code = self._extract_python_code(full_text)
            explanation = self._extract_explanation(full_text)
            
            return code, explanation
        except Exception as e:
            raise Exception(f"Failed to generate code: {str(e)}")
    
    def _extract_python_code(self, text: str) -> str:
        """Extract Python code blocks from the generated text"""
        python_pattern = r"```(?:python)?\s*([\s\S]*?)```"
        matches = re.findall(python_pattern, text)
        
        if matches:
            return matches[0].strip()
        return ""
    
    def _extract_explanation(self, text: str) -> str:
        """Extract explanation from the generated text"""
        parts = text.split("```")
        if len(parts) >= 3:
            return parts[-1].strip()
        return "No explanation provided."
    
    def sanitize_manim_code(self, code: str) -> str:
        """
        Sanitize the Manim code to ensure it's safe to execute
        
        Args:
            code: The generated Manim code
            
        Returns:
            Sanitized code
            
        Raises:
            ValueError: If code contains disallowed operations
        """
        # Basic sanitization - prevent dangerous imports and operations
        disallowed_imports = [
            'os.system', 'subprocess', 'eval', 'exec', 'shutil.rmtree', 
            'sys.exit', '__import__', 'open(', 'file(', 'input(',
            'raw_input(', 'compile(', 'globals(', 'locals('
        ]
        
        for item in disallowed_imports:
            if item in code:
                raise ValueError(f"Code contains disallowed operation: {item}")
        
        # Ensure the code creates a scene class that extends Scene
        if not re.search(r'class\s+\w+\(\s*Scene\s*\)', code):
            raise ValueError("Code must define a Scene class")
        
        # Ensure required imports are present
        if 'from manim import *' not in code and 'import manim' not in code:
            code = 'from manim import *\n\n' + code
        
        return code
    
    def render_animation(self, code: str, filename: str) -> Optional[str]:
        """
        Render the Manim animation from the provided code
        
        Args:
            code: Sanitized Manim code
            filename: Output filename (without extension)
            
        Returns:
            URL path to the rendered video or None if rendering fails
            
        Raises:
            ValueError: If rendering fails
        """
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
            
            # Ensure media directory structure exists
            videos_dir = self.media_dir / "videos"
            images_dir = self.media_dir / "images"
            texts_dir = self.media_dir / "texts"
            tex_dir = self.media_dir / "Tex"
            
            for dir_path in [videos_dir, images_dir, texts_dir, tex_dir]:
                dir_path.mkdir(exist_ok=True)
            
            # Fixed Manim command with correct quality parameter
            command = [
                "manim", 
                "render",  # Add explicit render command
                file_path, 
                scene_name,
                "-o", f"{filename}.mp4",
                "--media_dir", str(self.media_dir),
                "-q", "m",  # Fix: Use 'm' instead of 'medium_quality'
                "--fps", "30",
                "--format", "mp4",
                "--disable_caching"  # Prevent caching issues
            ]
            
            try:
                print(f"Running command: {' '.join(command)}")
                process = subprocess.run(
                    command,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    timeout=120  # 2 minute timeout
                )
                
                print(f"Manim stdout: {process.stdout}")
                print(f"Manim stderr: {process.stderr}")
                
                if process.returncode != 0:
                    print(f"Manim error: {process.stderr}")
                    raise ValueError(f"Failed to render animation: {process.stderr}")
                
                # Find the generated video file
                video_path = self._find_generated_video(filename)
                if video_path:
                    print(f"Video successfully generated at: {video_path}")
                    return video_path
                else:
                    print("Video file was not found after rendering")
                    raise ValueError("Video file was not generated successfully")
                    
            except subprocess.TimeoutExpired:
                raise ValueError("Animation rendering timed out")
            except Exception as e:
                print(f"Exception during rendering: {str(e)}")
                raise ValueError(f"Failed to render animation: {str(e)}")
    
    def _find_generated_video(self, filename: str) -> Optional[str]:
        """
        Find the generated video file in the media directory
        
        Args:
            filename: Base filename to search for
            
        Returns:
            URL path to the video file or None if not found
        """
        print(f"Searching for video file with base name: {filename}")
        
        # Search recursively for any mp4 file with the filename
        for path in self.media_dir.rglob(f"*{filename}*.mp4"):
            if path.is_file():
                relative_path = path.relative_to(self.media_dir)
                video_url = f"/media/{relative_path}".replace("\\", "/")  # Ensure forward slashes
                print(f"Found video at: {video_url}")
                return video_url
        
        # Search for any recently created mp4 file
        mp4_files = list(self.media_dir.rglob("*.mp4"))
        if mp4_files:
            # Sort by modification time, get the most recent
            latest_file = max(mp4_files, key=lambda x: x.stat().st_mtime)
            relative_path = latest_file.relative_to(self.media_dir)
            video_url = f"/media/{relative_path}".replace("\\", "/")
            print(f"Using most recent mp4 file: {video_url}")
            return video_url
        
        print("No video files found")
        return None
    
    def get_media_info(self) -> dict:
        """
        Get information about files in the media directory
        
        Returns:
            Dictionary with media directory information
        """
        media_dir_path = self.media_dir.absolute()
        
        # Recursively find all files in the media directory
        all_files = []
        mp4_files = []
        for path in media_dir_path.rglob('*'):
            if path.is_file():
                relative_path = path.relative_to(media_dir_path)
                all_files.append(str(relative_path))
                if path.suffix == '.mp4':
                    mp4_files.append(str(relative_path))
        
        return {
            "media_directory": str(media_dir_path),
            "file_count": len(all_files),
            "mp4_count": len(mp4_files),
            "all_files": all_files,
            "mp4_files": mp4_files
        }
    
    def create_animation(self, prompt: str) -> dict:
        """
        Complete pipeline to create an animation from a prompt
        
        Args:
            prompt: User's animation request
            
        Returns:
            Dictionary with code, explanation, and video_url
        """
        try:
            print(f"Creating animation for prompt: {prompt}")
            
            # Generate code and explanation
            code, explanation = self.generate_manim_code(prompt)
            
            if not code:
                return {
                    "code": "",
                    "explanation": "Failed to generate code for this prompt. Please try a different request.",
                    "video_url": None
                }
            
            print("Code generated successfully")
            
            # Sanitize the code
            try:
                sanitized_code = self.sanitize_manim_code(code)
                print("Code sanitized successfully")
                
                # Generate unique filename
                animation_id = str(uuid.uuid4())[:8]
                print(f"Generated animation ID: {animation_id}")
                
                # Render the animation
                video_url = self.render_animation(sanitized_code, animation_id)
                
                return {
                    "code": code,
                    "explanation": explanation,
                    "video_url": video_url
                }
                
            except ValueError as e:
                print(f"Error during code processing or rendering: {str(e)}")
                # If there's an issue with the code, return without video
                return {
                    "code": code,
                    "explanation": f"{explanation}\n\nNote: Could not render animation: {str(e)}",
                    "video_url": None
                }
                
        except Exception as e:
            print(f"Error in create_animation: {str(e)}")
            raise Exception(f"Error creating animation: {str(e)}")