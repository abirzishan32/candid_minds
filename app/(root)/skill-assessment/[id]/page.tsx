"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaClock, FaCheck, FaTimes, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { toast } from "sonner";
import { getSkillAssessmentById } from "@/lib/actions/skill-assessment.action";
import { SkillAssessment, AssessmentQuestion } from "@/lib/actions/skill-assessment.action";

// Assessment status types
type AssessmentStatus = "intro" | "in-progress" | "results";

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
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

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

  // Start the assessment
  const startAssessment = () => {
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
    
    setAssessmentStatus("in-progress");
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    startTimeRef.current = null; // Reset start time
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-800 rounded w-1/4"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2"></div>
            <div className="h-64 bg-gray-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-red-500 text-center py-8">{error}</div>
          <button
            onClick={() => router.push('/skill-assessment')}
            className="mx-auto block px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  // If assessment not found
  if (!assessment) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-red-500 text-center py-8">Assessment not found</div>
          <button
            onClick={() => router.push('/skill-assessment')}
            className="mx-auto block px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Back to Assessments
          </button>
        </div>
      </div>
    );
  }

  // Current question
  const currentQuestion = questions[currentQuestionIndex];
  
  // Introduction screen
  if (assessmentStatus === "intro") {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/skill-assessment')}
            className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 mb-8"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span>Back to Assessments</span>
          </button>
          
          <div className="bg-gray-800 rounded-lg p-8 mb-8">
            <h1 className="text-3xl font-bold text-white mb-4">{assessment.title}</h1>
            <p className="text-gray-300 mb-6">{assessment.description}</p>
            
            {assessment.longDescription && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-2">About this Assessment</h2>
                <p className="text-gray-300">{assessment.longDescription}</p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-white mb-2">Assessment Details</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center justify-between">
                    <span>Category:</span>
                    <span className="text-blue-400">{assessment.category}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Difficulty:</span>
                    <span className="text-blue-400">{assessment.difficulty}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Questions:</span>
                    <span className="text-blue-400">{questions.length}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Time Limit:</span>
                    <span className="text-blue-400">{assessment.duration} minutes</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Passing Score:</span>
                    <span className="text-blue-400">{assessment.passPercentage}%</span>
                  </li>
                </ul>
              </div>
              
              {assessment.prerequisites && assessment.prerequisites.length > 0 && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-white mb-2">Prerequisites</h3>
                  <ul className="list-disc pl-5 text-gray-300">
                    {assessment.prerequisites.map((prereq, index) => (
                      <li key={index}>{prereq}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <button
              onClick={startAssessment}
              className="w-full py-3 px-4 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition-colors"
            >
              Start Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Results screen
  if (assessmentStatus === "results") {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-8">
            <h1 className="text-3xl font-bold text-white mb-4">Assessment Results</h1>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">{assessment.title}</h2>
              
              <div className="flex flex-col items-center justify-center py-8 px-4 bg-gray-700 rounded-lg mb-6">
                <div className="text-6xl font-bold mb-2">
                  {result?.isPassing ? (
                    <span className="text-green-500">{result?.percentage}%</span>
                  ) : (
                    <span className="text-red-500">{result?.percentage}%</span>
                  )}
                </div>
                <div className="text-xl mb-4">
                  {result?.isPassing ? (
                    <span className="text-green-500">Passed</span>
                  ) : (
                    <span className="text-red-500">Failed</span>
                  )}
                </div>
                <div className="text-gray-300">
                  Score: {result?.score} / {result?.maxScore} points
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-white mb-4">Question Summary</h3>
              
              <div className="space-y-4">
                {result?.answersByQuestion.map((item, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 pr-4">
                        <p className="text-white font-medium">Question {index + 1}</p>
                        <p className="text-gray-300 mt-1">{item.question}</p>
                      </div>
                      <div className="flex items-center">
                        {item.correct ? (
                          <div className="flex items-center bg-green-500/10 text-green-500 px-3 py-1 rounded-full">
                            <FaCheck className="w-4 h-4 mr-1" />
                            <span>Correct</span>
                          </div>
                        ) : (
                          <div className="flex items-center bg-red-500/10 text-red-500 px-3 py-1 rounded-full">
                            <FaTimes className="w-4 h-4 mr-1" />
                            <span>Incorrect</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => router.push('/skill-assessment')}
                className="py-3 px-6 bg-gray-700 text-white font-medium rounded-md hover:bg-gray-600 transition-colors"
              >
                Back to Assessments
              </button>
              <button
                onClick={() => {
                  setAssessmentStatus("intro");
                  setResult(null);
                }}
                className="py-3 px-6 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Assessment in progress - Show question
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="text-gray-300">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          <div className="flex items-center bg-red-500/10 text-red-500 px-3 py-1 rounded-full">
            <FaClock className="w-4 h-4 mr-2" />
            <span>{formatTime(remainingTime)}</span>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            {currentQuestion?.question}
          </h2>
          
          {currentQuestion?.type === "multiple-choice" && (
            <div className="space-y-3">
              {currentQuestion.answerType === "multiple" && (
                <div className="mb-4 p-3 bg-blue-500/10 text-blue-400 rounded-md">
                  <p className="text-sm">This question has multiple correct answers. Select all that apply.</p>
                </div>
              )}
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
                    className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-500 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    <div className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 ${
                      isSelected ? "bg-white text-blue-500" : "bg-gray-600 text-gray-300"
                    }`}>
                      {isSelected && <FaCheck className="w-3 h-3" />}
                    </div>
                    <span>{option.text}</span>
                  </div>
                );
              })}
            </div>
          )}
          
          {currentQuestion?.type === "true-false" && (
            <div className="space-y-3">
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
                    className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-500 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    <div className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 ${
                      isSelected ? "bg-white text-blue-500" : "bg-gray-600 text-gray-300"
                    }`}>
                      {isSelected && <FaCheck className="w-3 h-3" />}
                    </div>
                    <span>{option.text}</span>
                  </div>
                );
              })}
            </div>
          )}
          
          {(currentQuestion?.type === "text" || currentQuestion?.type === "coding") && (
            <div className="space-y-3">
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
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white"
                placeholder={currentQuestion.type === "coding" ? "Write your code here..." : "Write your answer here..."}
              />
              {currentQuestion.type === "coding" && currentQuestion.codeSnippet && (
                <div className="mt-3">
                  <div className="text-sm font-medium text-gray-300 mb-1">
                    Reference Code:
                  </div>
                  <pre className="bg-gray-900 p-4 rounded-md text-sm text-gray-300 overflow-x-auto">
                    {currentQuestion.codeSnippet}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <button
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center px-4 py-2 rounded-md ${
              currentQuestionIndex === 0
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-gray-700 text-white hover:bg-gray-600"
            }`}
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            <span>Previous</span>
          </button>
          
          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={goToNextQuestion}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <span>Next</span>
              <FaArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              onClick={submitAssessment}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              <span>Submit Assessment</span>
              <FaCheck className="w-4 h-4 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 