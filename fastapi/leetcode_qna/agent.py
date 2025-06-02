import os
import asyncio
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime
import json
import random

import torchaudio as ta
from chatterbox.tts import ChatterboxTTS
import speech_recognition as sr
import tempfile
from pathlib import Path

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LeetCodeVoiceAgent:
    def __init__(self):
        """Initialize the LeetCode Voice Interview Agent"""
        
        # Set up API keys
        self.google_api_key = os.getenv("GOOGLE_GENERATIVE_AI_API_KEY")
        if not self.google_api_key:
            raise ValueError("GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set")
        
        # Initialize LLM
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=self.google_api_key,
            temperature=0.7
        )
        
        # Initialize TTS model
        try:
            device = "cuda" if self._is_cuda_available() else "cpu"
            logger.info(f"Initializing ChatterboxTTS on {device}")
            self.tts_model = ChatterboxTTS.from_pretrained(device=device)
            logger.info("ChatterboxTTS initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize ChatterboxTTS: {str(e)}")
            raise
        
        # Initialize speech recognition
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        
        # Audio settings
        self.audio_dir = Path("media/leetcode_audio")
        self.audio_dir.mkdir(parents=True, exist_ok=True)
        
        # Interview state
        self.current_interview = None
        self.conversation_history = []
        
        # Question categories for different problem types
        self.question_templates = {
            "understanding": [
                "Can you explain your understanding of this problem in your own words?",
                "What are the key constraints we need to consider?",
                "Can you walk me through a few examples to show you understand the problem?"
            ],
            "approach": [
                "What approach would you take to solve this problem?",
                "Can you think of multiple ways to solve this?",
                "What data structures would be most helpful here?"
            ],
            "complexity": [
                "What's the time complexity of your approach?",
                "How about the space complexity?",
                "Can you optimize this further?",
                "Are there any trade-offs between time and space here?"
            ],
            "implementation": [
                "Can you walk through your implementation step by step?",
                "How would you handle edge cases?",
                "What would your main function look like?"
            ],
            "optimization": [
                "Is there a more efficient solution?",
                "What if the input size was much larger?",
                "How would you test this solution?"
            ]
        }
    
    def _is_cuda_available(self) -> bool:
        """Check if CUDA is available"""
        try:
            import torch
            return torch.cuda.is_available()
        except ImportError:
            return False
    
    async def generate_interview_questions(self, problem_data: Dict[str, Any], language: str = "Python") -> List[str]:
        """Generate interview questions based on the LeetCode problem"""
        
        try:
            problem_title = problem_data.get("title", "")
            problem_content = problem_data.get("content", "")
            difficulty = problem_data.get("difficulty", "Medium")
            
            # Create a comprehensive prompt for question generation
            prompt = ChatPromptTemplate.from_messages([
                SystemMessage(content=f"""You are an expert technical interviewer specializing in LeetCode problems. 
                Generate 6-8 interview questions for the following problem that test different aspects:

                1. Problem Understanding (1-2 questions)
                2. Solution Approach (2-3 questions) 
                3. Time & Space Complexity (1-2 questions)
                4. Implementation Details (1-2 questions)
                5. Edge Cases & Optimization (1 question)

                The candidate will be coding in {language}.
                Problem difficulty: {difficulty}

                Focus on:
                - Understanding the problem requirements
                - Algorithm design and approach
                - Complexity analysis
                - Implementation considerations
                - Edge cases and optimizations

                Return ONLY a JSON array of strings (questions), no other text or formatting.
                """),
                HumanMessage(content=f"""
                Problem Title: {problem_title}
                Problem Description: {problem_content[:1000]}...
                Difficulty: {difficulty}
                Language: {language}
                """)
            ])
            
            response = await self.llm.ainvoke(prompt.format_messages())
            
            # Parse the response
            try:
                questions = json.loads(response.content.strip())
                if isinstance(questions, list) and len(questions) > 0:
                    logger.info(f"Generated {len(questions)} questions for {problem_title}")
                    return questions
                else:
                    raise ValueError("Invalid questions format")
            except (json.JSONDecodeError, ValueError):
                # Fallback to template-based questions
                logger.warning("Failed to parse AI-generated questions, using template fallback")
                return self._generate_template_questions(problem_title, difficulty, language)
                
        except Exception as e:
            logger.error(f"Error generating questions: {str(e)}")
            return self._generate_template_questions(problem_title, difficulty, language)
    
    def _generate_template_questions(self, problem_title: str, difficulty: str, language: str) -> List[str]:
        """Generate fallback questions using templates"""
        questions = []
        
        # Select questions from each category
        questions.extend(random.sample(self.question_templates["understanding"], 2))
        questions.extend(random.sample(self.question_templates["approach"], 2))
        questions.extend(random.sample(self.question_templates["complexity"], 2))
        questions.extend(random.sample(self.question_templates["implementation"], 1))
        questions.extend(random.sample(self.question_templates["optimization"], 1))
        
        # Customize questions for the specific problem
        customized_questions = []
        for q in questions:
            if "this problem" in q:
                q = q.replace("this problem", f"the {problem_title} problem")
            if "your approach" in q:
                q = q.replace("your approach", f"your {language} approach")
            customized_questions.append(q)
        
        return customized_questions
    
    async def text_to_speech(self, text: str, output_filename: str = None) -> str:
        """Convert text to speech using ChatterboxTTS"""
        
        try:
            if not output_filename:
                output_filename = f"tts_{datetime.now().timestamp()}.wav"
            
            output_path = self.audio_dir / output_filename
            
            # Generate speech with optimal settings for interview context
            wav = self.tts_model.generate(
                text, 
                exaggeration=0.4,  # Slightly less dramatic for professional context
                cfg_weight=0.5     # Balanced pacing
            )
            
            # Save the audio file
            ta.save(str(output_path), wav, self.tts_model.sr)
            
            logger.info(f"Generated TTS audio: {output_path}")
            return str(output_path)
            
        except Exception as e:
            logger.error(f"Error in text-to-speech: {str(e)}")
            raise
    
    async def speech_to_text(self, audio_file_path: str) -> str:
        """Convert speech to text using speech_recognition"""
        
        try:
            with sr.AudioFile(audio_file_path) as source:
                audio = self.recognizer.record(source)
                text = self.recognizer.recognize_google(audio)
                logger.info(f"Transcribed: {text}")
                return text
        except sr.UnknownValueError:
            logger.warning("Could not understand audio")
            return "I couldn't understand that. Could you please repeat?"
        except sr.RequestError as e:
            logger.error(f"Speech recognition error: {str(e)}")
            return "Sorry, there was an error processing your speech."
    
    async def listen_from_microphone(self, timeout: int = 10, phrase_timeout: int = 5) -> str:
        """Listen to microphone input and convert to text"""
        
        try:
            with self.microphone as source:
                # Adjust for ambient noise
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
                logger.info("Listening...")
                
                # Listen for audio
                audio = self.recognizer.listen(source, timeout=timeout, phrase_time_limit=phrase_timeout)
                
                # Convert to text
                text = self.recognizer.recognize_google(audio)
                logger.info(f"Heard: {text}")
                return text
                
        except sr.WaitTimeoutError:
            return "No response heard. Please try speaking again."
        except sr.UnknownValueError:
            return "I couldn't understand that. Could you please repeat?"
        except sr.RequestError as e:
            logger.error(f"Speech recognition error: {str(e)}")
            return "Sorry, there was an error processing your speech."
    
    async def generate_feedback(self, question: str, user_response: str, context: Dict[str, Any]) -> str:
        """Generate contextual feedback for user responses"""
        
        try:
            prompt = ChatPromptTemplate.from_messages([
                SystemMessage(content="""You are an experienced technical interviewer providing feedback on a candidate's response to a LeetCode problem question.

                Provide constructive, encouraging feedback that:
                1. Acknowledges what the candidate did well
                2. Gently corrects any misconceptions
                3. Provides hints or guidance if needed
                4. Asks a follow-up question if appropriate
                5. Keeps the conversation flowing naturally

                Keep responses concise (2-3 sentences) and conversational.
                Be encouraging and professional.
                """),
                HumanMessage(content=f"""
                Interview Context:
                - Problem: {context.get('problem_title', 'N/A')}
                - Difficulty: {context.get('difficulty', 'N/A')}
                - Language: {context.get('language', 'N/A')}

                Question Asked: {question}
                
                Candidate's Response: {user_response}
                
                Please provide appropriate feedback.
                """)
            ])
            
            response = await self.llm.ainvoke(prompt.format_messages())
            return response.content.strip()
            
        except Exception as e:
            logger.error(f"Error generating feedback: {str(e)}")
            return "Thank you for your response. Let's continue with the next question."
    
    async def start_interview(self, problem_data: Dict[str, Any], user_id: str, language: str = "Python") -> Dict[str, Any]:
        """Start a new LeetCode interview session"""
        
        try:
            # Generate questions
            questions = await self.generate_interview_questions(problem_data, language)
            
            # Create interview session
            interview_session = {
                "id": f"interview_{datetime.now().timestamp()}",
                "user_id": user_id,
                "problem_data": problem_data,
                "language": language,
                "questions": questions,
                "current_question_index": 0,
                "responses": [],
                "feedback": [],
                "started_at": datetime.now().isoformat(),
                "status": "active"
            }
            
            self.current_interview = interview_session
            
            # Generate welcome message
            welcome_message = f"""
            Hello! I'll be conducting your technical interview today about the {problem_data.get('title', 'selected')} problem. 
            This is a {problem_data.get('difficulty', 'medium')} level problem, and you'll be working in {language}.
            
            I'll ask you several questions to understand your approach, and we'll discuss the solution together. 
            Feel free to think out loud as you work through the problem.
            
            Let's begin with the first question.
            """
            
            # Generate TTS for welcome message
            welcome_audio_path = await self.text_to_speech(welcome_message, f"welcome_{interview_session['id']}.wav")
            
            return {
                "success": True,
                "interview_id": interview_session["id"],
                "welcome_message": welcome_message,
                "welcome_audio_path": welcome_audio_path,
                "first_question": questions[0] if questions else "Let's start discussing the problem.",
                "total_questions": len(questions)
            }
            
        except Exception as e:
            logger.error(f"Error starting interview: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def process_user_response(self, interview_id: str, user_response: str, audio_input: bool = False) -> Dict[str, Any]:
        """Process user response and generate next question or feedback"""
        
        try:
            if not self.current_interview or self.current_interview["id"] != interview_id:
                return {"success": False, "error": "Interview session not found"}
            
            current_question_index = self.current_interview["current_question_index"]
            questions = self.current_interview["questions"]
            
            if current_question_index >= len(questions):
                return await self.end_interview(interview_id)
            
            current_question = questions[current_question_index]
            
            # Store user response
            self.current_interview["responses"].append({
                "question_index": current_question_index,
                "question": current_question,
                "response": user_response,
                "timestamp": datetime.now().isoformat()
            })
            
            # Generate feedback
            context = {
                "problem_title": self.current_interview["problem_data"].get("title"),
                "difficulty": self.current_interview["problem_data"].get("difficulty"),
                "language": self.current_interview["language"]
            }
            
            feedback = await self.generate_feedback(current_question, user_response, context)
            
            self.current_interview["feedback"].append({
                "question_index": current_question_index,
                "feedback": feedback,
                "timestamp": datetime.now().isoformat()
            })
            
            # Generate TTS for feedback
            feedback_audio_path = await self.text_to_speech(feedback, f"feedback_{interview_id}_{current_question_index}.wav")
            
            # Move to next question
            self.current_interview["current_question_index"] += 1
            next_question_index = self.current_interview["current_question_index"]
            
            if next_question_index < len(questions):
                next_question = questions[next_question_index]
                next_question_audio_path = await self.text_to_speech(next_question, f"question_{interview_id}_{next_question_index}.wav")
                
                return {
                    "success": True,
                    "feedback": feedback,
                    "feedback_audio_path": feedback_audio_path,
                    "next_question": next_question,
                    "next_question_audio_path": next_question_audio_path,
                    "question_number": next_question_index + 1,
                    "total_questions": len(questions),
                    "completed": False
                }
            else:
                # All questions completed
                return await self.end_interview(interview_id)
                
        except Exception as e:
            logger.error(f"Error processing user response: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def end_interview(self, interview_id: str) -> Dict[str, Any]:
        """End the interview and generate final report"""
        
        try:
            if not self.current_interview or self.current_interview["id"] != interview_id:
                return {"success": False, "error": "Interview session not found"}
            
            self.current_interview["status"] = "completed"
            self.current_interview["completed_at"] = datetime.now().isoformat()
            
            # Generate final assessment
            final_message = "Thank you for completing the interview! You did well discussing the problem and your approach. I'll now generate a detailed report of your performance."
            
            final_audio_path = await self.text_to_speech(final_message, f"final_{interview_id}.wav")
            
            # Generate performance report
            report = await self.generate_performance_report(self.current_interview)
            
            return {
                "success": True,
                "completed": True,
                "final_message": final_message,
                "final_audio_path": final_audio_path,
                "interview_data": self.current_interview,
                "performance_report": report
            }
            
        except Exception as e:
            logger.error(f"Error ending interview: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def generate_performance_report(self, interview_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a comprehensive performance report"""
        
        try:
            # Prepare context for report generation
            responses_text = "\n".join([
                f"Q{i+1}: {resp['question']}\nA: {resp['response']}\n"
                for i, resp in enumerate(interview_data["responses"])
            ])
            
            prompt = ChatPromptTemplate.from_messages([
                SystemMessage(content="""You are an expert technical interviewer generating a performance report for a LeetCode interview.

                Analyze the candidate's responses and provide:
                1. Overall Score (0-100)
                2. Category Scores for:
                   - Problem Understanding (0-20)
                   - Algorithm Design (0-20) 
                   - Time & Space Complexity (0-20)
                   - Implementation Knowledge (0-20)
                   - Communication & Clarity (0-20)
                3. Strengths (3-5 bullet points)
                4. Areas for Improvement (3-5 bullet points)
                5. Final Assessment (2-3 sentences)

                Return a JSON object with this structure:
                {
                    "overall_score": number,
                    "category_scores": {
                        "problem_understanding": number,
                        "algorithm_design": number,
                        "complexity_analysis": number,
                        "implementation_knowledge": number,
                        "communication": number
                    },
                    "strengths": [array of strings],
                    "areas_for_improvement": [array of strings],
                    "final_assessment": "string"
                }
                """),
                HumanMessage(content=f"""
                Interview Details:
                - Problem: {interview_data['problem_data'].get('title')}
                - Difficulty: {interview_data['problem_data'].get('difficulty')}
                - Language: {interview_data['language']}
                - Duration: {len(interview_data['responses'])} questions answered

                Questions and Responses:
                {responses_text}

                Please analyze and generate the performance report.
                """)
            ])
            
            response = await self.llm.ainvoke(prompt.format_messages())
            
            try:
                report = json.loads(response.content.strip())
                report["generated_at"] = datetime.now().isoformat()
                return report
            except json.JSONDecodeError:
                # Fallback report
                return self._generate_fallback_report(interview_data)
                
        except Exception as e:
            logger.error(f"Error generating performance report: {str(e)}")
            return self._generate_fallback_report(interview_data)
    
    def _generate_fallback_report(self, interview_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a basic fallback report if AI generation fails"""
        
        responses_count = len(interview_data["responses"])
        completion_rate = (responses_count / len(interview_data["questions"])) * 100
        
        return {
            "overall_score": min(75, 50 + (completion_rate * 0.25)),
            "category_scores": {
                "problem_understanding": 15,
                "algorithm_design": 14,
                "complexity_analysis": 13,
                "implementation_knowledge": 14,
                "communication": 16
            },
            "strengths": [
                "Completed the interview session",
                "Engaged with the questions",
                "Demonstrated problem-solving approach"
            ],
            "areas_for_improvement": [
                "Practice more complex algorithmic problems",
                "Work on time complexity analysis",
                "Improve communication of technical concepts"
            ],
            "final_assessment": f"You completed {responses_count} out of {len(interview_data['questions'])} questions and showed good engagement with the interview process.",
            "generated_at": datetime.now().isoformat()
        }
    
    def get_interview_status(self, interview_id: str) -> Dict[str, Any]:
        """Get current interview status"""
        
        if not self.current_interview or self.current_interview["id"] != interview_id:
            return {"success": False, "error": "Interview session not found"}
        
        return {
            "success": True,
            "interview_id": interview_id,
            "status": self.current_interview["status"],
            "current_question_index": self.current_interview["current_question_index"],
            "total_questions": len(self.current_interview["questions"]),
            "responses_count": len(self.current_interview["responses"])
        }