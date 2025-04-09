"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaClock, FaCheck, FaTimes, FaArrowLeft, FaArrowRight, FaVideo, FaEye, FaInfoCircle } from "react-icons/fa";
import { toast } from "sonner";
import { getSkillAssessmentById } from "@/lib/actions/skill-assessment.action";
import { SkillAssessment, AssessmentQuestion } from "@/lib/actions/skill-assessment.action";
import EyeTrackingProctor from "@/components/skill-assessment/EyeTrackingProctor";
import ProctorConsentModal from "@/components/skill-assessment/ProctorConsentModal";
import DisqualificationScreen from "@/components/skill-assessment/DisqualificationScreen";

// Assessment status types
type AssessmentStatus = "intro" | "in-progress" | "results" | "disqualified";

// User answer type
type UserAnswer = {
  questionId: string;
  selectedOptions: string[];
  text?: string;
};

// Assessment result type
type AssessmentResult = {
  score: number;
  maxScore: number;
  percentage: number;
  isPassing: boolean;
  answersByQuestion: {
    questionId: string;
    correct: boolean;
    points: number;
    question: string;
    userAnswer: UserAnswer;
  }[];
};

export default function AssessmentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [assessment, setAssessment] = useState<SkillAssessment | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [assessmentStatus, setAssessmentStatus] = useState<AssessmentStatus>("intro");
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Anti-cheating states
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [proctorActive, setProctorActive] = useState(false);
  const [showProctorVideo, setShowProctorVideo] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Enhance handleCheatingDetected to accept a reason using useCallback
  const handleCheatingDetected = useCallback((reason: string = "Potential academic integrity violation") => {
    // Stop the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Clear localStorage timer data
    localStorage.removeItem(`assessment_end_time_${params.id}`);
    
    // Set assessment status to disqualified
    setAssessmentStatus("disqualified");
    
    // Store the reason for disqualification
    localStorage.setItem(`assessment_disqualification_reason_${params.id}`, reason);
    
    toast.error(`Assessment terminated due to ${reason}`, {
      duration: 5000,
    });
  }, [params.id]);

  // Add tab switching detection
  useEffect(() => {
    if (assessmentStatus !== "in-progress") return;
    
    // Handler for tab visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && assessmentStatus === "in-progress") {
        console.log("Tab switching detected - triggering disqualification");
        handleCheatingDetected("Tab switching detected");
      }
    };
    
    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [assessmentStatus, params.id, handleCheatingDetected]);

  // Prevent screenshots and copying
  useEffect(() => {
    if (assessmentStatus !== "in-progress") return;
    
    // Prevent screenshots by capturing PrintScreen, Cmd+Shift+3/4 etc.
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for PrintScreen key
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        handleCheatingDetected("Screenshot attempt detected");
        return;
      }
      
      // Check for Cmd+Shift+3/4/5 (Mac screenshot shortcuts)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) {
        e.preventDefault();
        handleCheatingDetected("Screenshot attempt detected");
        return;
      }
      
      // Check for Windows Snipping Tool shortcuts (Windows+Shift+S)
      if (e.shiftKey && e.key === 'S' && e.metaKey) {
        e.preventDefault();
        handleCheatingDetected("Screenshot attempt detected");
        return;
      }
    };
    
    // Detect programmatic screenshot attempts
    // This is a basic implementation - more sophisticated detection would be needed for production
    const detectProgrammaticScreenshot = () => {
      // Listen for media capture events that might indicate screenshots
      const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
      navigator.mediaDevices.getDisplayMedia = function(constraints) {
        handleCheatingDetected("Screen recording attempt detected");
        return Promise.reject(new Error('Screen capture denied by assessment security policy'));
      };
      
      return () => {
        navigator.mediaDevices.getDisplayMedia = originalGetDisplayMedia;
      };
    };
    
    // Prevent copy events
    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.error("Copying is not allowed during the assessment", { duration: 3000 });
    };
    
    // Prevent context menu (right-click)
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.error("Right-click is disabled during the assessment", { duration: 3000 });
    };
    
    // Prevent drag events (for dragging images or content)
    const preventDrag = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    
    // Prevent text selection
    const preventSelection = () => {
      if (assessmentStatus === "in-progress") {
        // Add a class to the body to prevent selection
        document.body.classList.add('no-select');
        
        // Apply to the specific content containers
        const assessmentContent = document.querySelector('.bg-gray-800');
        if (assessmentContent) {
          assessmentContent.classList.add('no-select');
        }
      }
    };
    
    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('copy', preventCopy);
    document.addEventListener('cut', preventCopy);
    document.addEventListener('paste', preventCopy);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('dragstart', preventDrag as any);
    document.addEventListener('drop', preventDrag as any);
    
    // Apply selection prevention
    preventSelection();
    
    // Apply programmatic screenshot detection
    const cleanupProgrammaticDetection = detectProgrammaticScreenshot();
    
    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('cut', preventCopy);
      document.removeEventListener('paste', preventCopy);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('dragstart', preventDrag as any);
      document.removeEventListener('drop', preventDrag as any);
      document.body.classList.remove('no-select');
      cleanupProgrammaticDetection();
    };
  }, [assessmentStatus, handleCheatingDetected]);

  // Fetch assessment data
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const response = await getSkillAssessmentById(params.id);
        console.log("Assessment response:", response);
        
        if (response && response.success && 'data' in response) {
          // Handle the assessment data with proper type conversion
          const assessmentData = {
            ...response.data,
            // Ensure questions is a string array as required by SkillAssessment
            questions: response.data.questions ? 
              (Array.isArray(response.data.questions) ? 
                response.data.questions.map(q => typeof q === 'string' ? q : q.id) : 
                []) : 
              []
          };
          
          setAssessment(assessmentData as SkillAssessment);
          
          // Store the actual question objects separately
          if (response.data.questions && Array.isArray(response.data.questions)) {
            console.log("Questions data:", response.data.questions);
            // Check if questions are objects with 'id' property or just strings
            const questionObjects = response.data.questions.filter(q => q && typeof q === 'object' && 'id' in q);
            console.log("Filtered question objects:", questionObjects);
            
            if (questionObjects.length > 0) {
              setQuestions(questionObjects as AssessmentQuestion[]);
            } else {
              // If no question objects found, try to load them from assessmentQuestions collection
              const questionIds = response.data.questions.filter(q => typeof q === 'string');
              console.log("Question IDs to fetch:", questionIds);
              
              // We need to fetch the actual question objects using their IDs
              try {
                const fetchedQuestions = await Promise.all(
                  questionIds.map(async (qId) => {
                    const questionDoc = await fetch(`/api/questions/${qId}`).then(res => res.json());
                    return questionDoc.data;
                  })
                );
                console.log("Fetched questions:", fetchedQuestions);
                
                const validQuestions = fetchedQuestions.filter(q => q !== null && q !== undefined);
                if (validQuestions.length > 0) {
                  setQuestions(validQuestions as AssessmentQuestion[]);
                } else {
                  setError("No questions found for this assessment");
                }
              } catch (fetchError) {
                console.error("Error fetching individual questions:", fetchError);
                setError("Failed to load assessment questions");
              }
            }
          } else {
            console.warn("No questions array found in response");
            setError("No questions found for this assessment");
          }
        } else {
          setError("Failed to load assessment");
        }
      } catch (err) {
        setError("Failed to load assessment. Please try again later.");
        console.error("Error fetching assessment:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [params.id]);

  // Handle timer
  useEffect(() => {
    if (assessmentStatus !== "in-progress" || !assessment) return;
    
    // Set initial time when starting the assessment
    if (startTimeRef.current === null) {
      const totalSeconds = assessment.duration * 60;
      setRemainingTime(totalSeconds);
      startTimeRef.current = Date.now();

      // Save expected end time to localStorage in case of page refresh
      localStorage.setItem(`assessment_end_time_${params.id}`, 
        (Date.now() + totalSeconds * 1000).toString());
    }

    // Start the timer
    timerRef.current = setInterval(() => {
      const endTime = parseInt(localStorage.getItem(`assessment_end_time_${params.id}`) || '0');
      const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
      
      setRemainingTime(remaining);
      
      // Time's up
      if (remaining === 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        calculateAndShowResults();
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [assessmentStatus, assessment, params.id]);

  // Show webcam consent modal before starting the assessment
  const prepareToStartAssessment = () => {
    if (!assessment) {
      toast.error("Assessment data is not available");
      return;
    }
    
    if (questions.length === 0) {
      toast.error("This assessment has no questions yet. Please try another assessment or check back later.");
      // Navigate back to the assessment list
      setTimeout(() => {
        router.push('/skill-assessment');
      }, 3000);
      return;
    }
    
    // Show the consent modal
    setShowConsentModal(true);
  };
  
  // Start the assessment after consent
  const startAssessment = () => {
    setAssessmentStatus("in-progress");
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    startTimeRef.current = null; // Reset start time
    setProctorActive(true); // Enable proctoring
  };

  // Handle webcam consent
  const handleConsentAccept = () => {
    setShowConsentModal(false);
    startAssessment();
  };
  
  const handleConsentDecline = () => {
    setShowConsentModal(false);
    toast.error("Webcam access is required to take this assessment");
    // Navigate back to the assessment list
    setTimeout(() => {
      router.push('/skill-assessment');
    }, 3000);
  };

  // Toggle showing the proctor video
  const toggleProctorVideo = () => {
    setShowProctorVideo(prev => !prev);
  };

  // Handle answer submission
  const handleAnswerSubmit = (answer: UserAnswer) => {
    // Save the answer
    setUserAnswers(prev => {
      const updatedAnswers = [...prev];
      const existingIndex = updatedAnswers.findIndex(a => a.questionId === answer.questionId);
      
      if (existingIndex >= 0) {
        updatedAnswers[existingIndex] = answer;
      } else {
        updatedAnswers.push(answer);
      }
      
      return updatedAnswers;
    });
    
    // Move to next question if not the last one
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Handle navigating to previous question
  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  // Handle navigating to next question
  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Submit the assessment and calculate results
  const submitAssessment = () => {
    calculateAndShowResults();
  };

  // Calculate and show the results
  const calculateAndShowResults = () => {
    if (!assessment || questions.length === 0) return;
    
    let totalPoints = 0;
    let earnedPoints = 0;
    const answersByQuestion = [];
    
    for (const question of questions) {
      totalPoints += question.points;
      
      const userAnswer = userAnswers.find(a => a.questionId === question.id);
      let isCorrect = false;
      
      // Check if answer is correct based on question type
      if (userAnswer) {
        if (question.type === "multiple-choice") {
          // For multiple choice questions
          if (question.answerType === "single") {
            // Single answer question
            const correctOptionId = question.options?.find(opt => opt.isCorrect)?.id;
            isCorrect = userAnswer.selectedOptions.length === 1 && 
                       userAnswer.selectedOptions[0] === correctOptionId;
          } else {
            // Multiple answers question
            const correctOptionIds = question.options?.filter(opt => opt.isCorrect).map(opt => opt.id) || [];
            const hasAllCorrect = correctOptionIds.every(id => userAnswer.selectedOptions.includes(id));
            const hasNoIncorrect = userAnswer.selectedOptions.every(id => 
              correctOptionIds.includes(id));
            isCorrect = hasAllCorrect && hasNoIncorrect;
          }
        } else if (question.type === "true-false") {
          // For true/false questions
          const correctOptionId = question.options?.find(opt => opt.isCorrect)?.id;
          isCorrect = userAnswer.selectedOptions.length === 1 && 
                     userAnswer.selectedOptions[0] === correctOptionId;
        }
        // Text and coding questions would require AI evaluation in a real implementation
      }
      
      if (isCorrect) earnedPoints += question.points;
      
      answersByQuestion.push({
        questionId: question.id,
        correct: isCorrect,
        points: isCorrect ? question.points : 0,
        question: question.question,
        userAnswer: userAnswer || { questionId: question.id, selectedOptions: [] }
      });
    }
    
    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const isPassing = percentage >= (assessment.passPercentage || 70);
    
    setResult({
      score: earnedPoints,
      maxScore: totalPoints,
      percentage,
      isPassing,
      answersByQuestion
    });
    
    // Clean up timer
    if (timerRef.current) clearInterval(timerRef.current);
    localStorage.removeItem(`assessment_end_time_${params.id}`);
    
    setAssessmentStatus("results");
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Current question
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto">
        {assessmentStatus === "disqualified" ? (
          <DisqualificationScreen assessmentId={params.id} />
        ) : loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-800 rounded w-1/4"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2"></div>
            <div className="h-64 bg-gray-800 rounded-xl"></div>
          </div>
        ) : error ? (
          <div className="text-center p-8">
            <div className="text-red-500 py-8">{error}</div>
            <button
              onClick={() => router.push('/skill-assessment')}
              className="mx-auto block px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-medium rounded-lg shadow-lg shadow-blue-900/20 transition-all duration-200"
            >
              Back to Assessments
            </button>
          </div>
        ) : !assessment ? (
          <div className="text-center p-8">
            <div className="text-red-500 py-8">Assessment not found</div>
            <button
              onClick={() => router.push('/skill-assessment')}
              className="mx-auto block px-6 py-3 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-medium rounded-lg shadow-lg shadow-blue-900/20 transition-all duration-200"
            >
              Back to Assessments
            </button>
          </div>
        ) : assessmentStatus === "intro" ? (
          <div>
            <button
              onClick={() => router.push('/skill-assessment')}
              className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 mb-8 group"
            >
              <FaArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
              <span>Back to Assessments</span>
            </button>
            
            <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <h1 className="text-2xl font-bold text-white mb-2">{assessment.title}</h1>
                <p className="text-gray-300 text-sm">{assessment.description}</p>
              </div>
              
              {assessment.longDescription && (
                <div className="p-6 border-b border-gray-800">
                  <h2 className="text-lg font-semibold text-white mb-2">About this Assessment</h2>
                  <p className="text-gray-300 text-sm">{assessment.longDescription}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5 bg-gray-800">
                <div className="bg-gray-900 p-6">
                  <h3 className="text-md font-medium text-white mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Assessment Details
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-center justify-between">
                      <span className="text-gray-400">Category</span>
                      <span className="text-blue-400 font-medium">{assessment.category}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-gray-400">Difficulty</span>
                      <span className="text-blue-400 font-medium">{assessment.difficulty}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-gray-400">Questions</span>
                      <span className="text-blue-400 font-medium">{questions.length}</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-gray-400">Time Limit</span>
                      <span className="text-blue-400 font-medium">{assessment.duration} minutes</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-gray-400">Passing Score</span>
                      <span className="text-blue-400 font-medium">{assessment.passPercentage}%</span>
                    </li>
                  </ul>
                </div>
                
                {assessment.prerequisites && assessment.prerequisites.length > 0 ? (
                  <div className="bg-gray-900 p-6">
                    <h3 className="text-md font-medium text-white mb-3 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Prerequisites
                    </h3>
                    <ul className="list-none space-y-2 text-sm">
                      {assessment.prerequisites.map((prereq, index) => (
                        <li key={index} className="flex items-center text-gray-300">
                          <span className="mr-2 text-blue-400">•</span>
                          {prereq}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-gray-900 p-6 flex flex-col items-center justify-center">
                    <div className="text-center max-w-xs">
                      <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FaCheck className="text-blue-400 w-5 h-5" />
                      </div>
                      <h3 className="text-md font-medium text-white mb-1">Ready to Begin</h3>
                      <p className="text-gray-400 text-sm">This assessment has no prerequisites. You can start immediately.</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <button
                  onClick={prepareToStartAssessment}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-medium rounded-lg shadow-lg shadow-blue-900/20 transition-all duration-200 flex items-center justify-center"
                >
                  <span>Start Assessment</span>
                  <FaArrowRight className="ml-2 w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : assessmentStatus === "results" ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-800">
              <h1 className="text-2xl font-bold text-white">Assessment Results</h1>
              <h2 className="text-md font-medium text-gray-400 mt-1">{assessment.title}</h2>
            </div>
            
            <div className="p-6 border-b border-gray-800">
              <div className="flex flex-col items-center justify-center py-8 px-4">
                <div className="relative mb-3">
                  <div className="w-32 h-32 rounded-full border-4 border-gray-700 flex items-center justify-center">
                    <div 
                      className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold"
                      style={{
                        background: `conic-gradient(${result?.isPassing ? '#10B981' : '#EF4444'} ${result?.percentage}%, #374151 0)`,
                      }}
                    >
                      <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center">
                        <span className={result?.isPassing ? "text-green-500" : "text-red-500"}>
                          {result?.percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`absolute -top-2 -right-2 rounded-full w-8 h-8 flex items-center justify-center ${result?.isPassing ? 'bg-green-500' : 'bg-red-500'}`}>
                    {result?.isPassing ? 
                      <FaCheck className="w-4 h-4 text-white" /> : 
                      <FaTimes className="w-4 h-4 text-white" />
                    }
                  </div>
                </div>
                <div className="text-xl mb-2">
                  {result?.isPassing ? (
                    <span className="text-green-500 font-semibold">Passed</span>
                  ) : (
                    <span className="text-red-500 font-semibold">Failed</span>
                  )}
                </div>
                <div className="text-gray-400 text-sm">
                  Score: {result?.score} / {result?.maxScore} points
                </div>
              </div>
            </div>
            
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-md font-medium text-white mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Question Summary
              </h3>
              
              <div className="space-y-3">
                {result?.answersByQuestion.map((item, index) => (
                  <div key={index} className="bg-gray-800/80 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-gray-400 text-sm">Question {index + 1}</span>
                          <div className={`ml-2 px-2 py-0.5 text-xs rounded-full ${item.correct ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {item.correct ? 'Correct' : 'Incorrect'}
                          </div>
                        </div>
                        <p className="text-white text-sm mt-1.5">{item.question}</p>
                      </div>
                      <div className="flex items-center">
                        {item.correct ? (
                          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                            <FaCheck className="w-3.5 h-3.5 text-green-400" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                            <FaTimes className="w-3.5 h-3.5 text-red-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 flex justify-center space-x-4">
              <button
                onClick={() => router.push('/skill-assessment')}
                className="py-3 px-6 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Assessments
              </button>
              <button
                onClick={() => {
                  setAssessmentStatus("intro");
                  setResult(null);
                }}
                className="py-3 px-6 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-600 hover:to-blue-500 text-white font-medium rounded-lg shadow-lg shadow-blue-900/20 transition-all duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          // In-progress UI
          <>
            <div className="flex justify-between items-center mb-5">
              <div className="bg-gray-900/80 border border-gray-800 rounded-full px-4 py-1.5 text-sm text-gray-300">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
              <div className="flex items-center bg-gray-900/80 border border-gray-800 rounded-full px-4 py-1.5">
                <div className={`mr-2 w-2 h-2 rounded-full ${remainingTime < 60 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}></div>
                <span className="text-sm font-mono text-gray-300">{formatTime(remainingTime)}</span>
              </div>
            </div>
            
            <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden mb-5">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-semibold text-white mb-2">
                  {currentQuestion?.question}
                </h2>
                
                <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="p-6">
                {currentQuestion?.type === "multiple-choice" && (
                  <div className="space-y-3">
                    {currentQuestion.answerType === "multiple" && (
                      <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-sm">
                        <div className="flex items-center">
                          <FaInfoCircle className="mr-2 flex-shrink-0" />
                          <p>This question has multiple correct answers. Select all that apply.</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 gap-3">
                      {currentQuestion.options?.map((option) => {
                        const isSelected = userAnswers.find(a => a.questionId === currentQuestion.id)?.selectedOptions.includes(option.id);
                        
                        return (
                          <div
                            key={option.id}
                            onClick={() => {
                              const selectedOptions = userAnswers.find(a => 
                                a.questionId === currentQuestion.id
                              )?.selectedOptions || [];
                              
                              let newSelectedOptions: string[];
                              
                              if (currentQuestion.answerType === "single") {
                                // For single choice, replace the selection
                                newSelectedOptions = [option.id];
                              } else {
                                // For multi-choice, toggle the selection
                                if (selectedOptions.includes(option.id)) {
                                  newSelectedOptions = selectedOptions.filter(id => id !== option.id);
                                } else {
                                  newSelectedOptions = [...selectedOptions, option.id];
                                }
                              }
                              
                              handleAnswerSubmit({
                                questionId: currentQuestion.id,
                                selectedOptions: newSelectedOptions
                              });
                            }}
                            className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? "bg-blue-600 text-white border border-blue-500 shadow-lg shadow-blue-900/20"
                                : "bg-gray-800 text-gray-300 hover:bg-gray-750 border border-gray-700"
                            }`}
                          >
                            <div className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 transition-colors ${
                              isSelected ? "bg-white text-blue-500" : "bg-gray-700 text-gray-600"
                            }`}>
                              {isSelected && <FaCheck className="w-3 h-3" />}
                            </div>
                            <span className="text-sm">{option.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {currentQuestion?.type === "true-false" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentQuestion.options?.map((option) => {
                      const isSelected = userAnswers.find(a => a.questionId === currentQuestion.id)?.selectedOptions.includes(option.id);
                      
                      return (
                        <div
                          key={option.id}
                          onClick={() => {
                            handleAnswerSubmit({
                              questionId: currentQuestion.id,
                              selectedOptions: [option.id]
                            });
                          }}
                          className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? "bg-blue-600 text-white border border-blue-500 shadow-lg shadow-blue-900/20"
                              : "bg-gray-800 text-gray-300 hover:bg-gray-750 border border-gray-700"
                          }`}
                        >
                          <div className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 transition-colors ${
                            isSelected ? "bg-white text-blue-500" : "bg-gray-700 text-gray-600"
                          }`}>
                            {isSelected && <FaCheck className="w-3 h-3" />}
                          </div>
                          <span className="text-sm">{option.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {(currentQuestion?.type === "text" || currentQuestion?.type === "coding") && (
                  <div className="space-y-4">
                    <textarea
                      value={userAnswers.find(a => a.questionId === currentQuestion.id)?.text || ""}
                      onChange={(e) => {
                        setUserAnswers(prev => {
                          const updatedAnswers = [...prev];
                          const existingIndex = updatedAnswers.findIndex(a => a.questionId === currentQuestion.id);
                          
                          const updatedAnswer = {
                            questionId: currentQuestion.id,
                            selectedOptions: [],
                            text: e.target.value
                          };
                          
                          if (existingIndex >= 0) {
                            updatedAnswers[existingIndex] = updatedAnswer;
                          } else {
                            updatedAnswers.push(updatedAnswer);
                          }
                          
                          return updatedAnswers;
                        });
                      }}
                      rows={8}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder={currentQuestion.type === "coding" ? "Write your code here..." : "Write your answer here..."}
                    />
                    {currentQuestion.type === "coding" && currentQuestion.codeSnippet && (
                      <div className="mt-3">
                        <div className="text-sm font-medium text-gray-300 mb-1 flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          Reference Code
                        </div>
                        <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto border border-gray-700">
                          {currentQuestion.codeSnippet}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <button
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                  currentQuestionIndex === 0
                    ? "bg-gray-800 text-gray-600 cursor-not-allowed opacity-50"
                    : "bg-gray-800 border border-gray-700 text-white hover:bg-gray-700"
                }`}
              >
                <FaArrowLeft className="w-4 h-4 mr-2" />
                <span>Previous</span>
              </button>
              
              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={goToNextQuestion}
                  className="flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-900/20 transition-all duration-200"
                >
                  <span>Next</span>
                  <FaArrowRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={submitAssessment}
                  className="flex items-center px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-lg shadow-lg shadow-green-900/20 transition-all duration-200"
                >
                  <span>Submit Assessment</span>
                  <FaCheck className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
            
            {/* Hidden eye tracking components */}
            <div className="hidden">
              {proctorActive && !showProctorVideo && (
                <EyeTrackingProctor
                  isActive={proctorActive}
                  onCheatingDetected={handleCheatingDetected}
                  showVideo={false}
                  disqualificationThreshold={5}
                />
              )}
            </div>
            
            <div className="fixed bottom-4 right-4">
              <div className="flex flex-col items-end space-y-2">
                {proctorActive && showProctorVideo && (
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-2 shadow-2xl overflow-hidden transition-all duration-300 hover:scale-105">
                    <EyeTrackingProctor
                      isActive={proctorActive}
                      onCheatingDetected={handleCheatingDetected}
                      showVideo={true}
                      disqualificationThreshold={5}
                    />
                  </div>
                )}
                
                {proctorActive && (
                  <button
                    onClick={toggleProctorVideo}
                    className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 border border-gray-700"
                    title={showProctorVideo ? "Hide webcam" : "Show webcam"}
                  >
                    {showProctorVideo ? <FaVideo /> : <FaEye />}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Proctor consent modal */}
      <ProctorConsentModal
        isOpen={showConsentModal}
        onAccept={handleConsentAccept}
        onDecline={handleConsentDecline}
      />
    </div>
  );
} 