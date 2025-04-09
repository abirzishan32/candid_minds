'use client';

import React, { useState, useRef, useEffect } from 'react';
import InterviewCoach from '@/components/interview/InterviewCoach';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { FiMic, FiVideo, FiSettings, FiHelpCircle, FiCpu, FiMessageCircle, FiX, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'sonner';

export default function InterviewCoachingPage() {
  const { data: session, status } = useSession({ required: false });
  const [isInterviewActive, setIsInterviewActive] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [isPreparingInterview, setIsPreparingInterview] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasMediaPermission, setHasMediaPermission] = useState<boolean | null>(null);

  const questions = [
    "Tell me about yourself.",
    "What are your greatest strengths?",
    "Describe a challenging situation at work and how you handled it.",
    "Why are you interested in this role?",
    "Where do you see yourself in 5 years?"
  ];

  // Setup camera
  useEffect(() => {
    if (isInterviewActive) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setHasMediaPermission(true);
            setIsVideoReady(true);
            
            // Add a small delay before setting audio ready to simulate setup
            setTimeout(() => setIsAudioReady(true), 1500);
            
            // Show initial tips as a toast notification
            toast.info("Tip: Maintain eye contact with the camera for better engagement", {
              duration: 5000,
            });
          }
        })
        .catch((err) => {
          console.error('Error accessing media devices:', err);
          setHasMediaPermission(false);
        });
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [isInterviewActive]);

  const startInterview = (mode: string) => {
    setSelectedMode(mode);
    setIsPreparingInterview(true);
    
    // Simulate interview preparation
    setTimeout(() => {
      setIsPreparingInterview(false);
      setIsInterviewActive(true);
      // Show tips after 10 seconds into the interview
      setTimeout(() => {
        toast.info("Tip: Speak clearly and at a moderate pace for better analysis", {
          duration: 5000,
        });
      }, 10000);
    }, 2000);
  };

  const endInterview = () => {
    setIsInterviewActive(false);
    setSelectedMode(null);
    setCurrentQuestion(0);
    setIsAudioReady(false);
    setIsVideoReady(false);
  };

  const handleReportComplete = (reportData: any) => {
    console.log('Interview completed, report data:', reportData);
    toast.success("Interview session completed! Check your performance report.", {
      duration: 5000,
    });
  };

  const goToNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setIsResponding(true);
      
      // Simulate AI processing time
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setIsResponding(false);
        
        // Show random feedback tip
        const tips = [
          "Great job maintaining eye contact!",
          "Try to reduce filler words like 'um' and 'uh'",
          "Your speaking pace is excellent",
          "Consider varying your tone for more engagement"
        ];
        
        toast.info(tips[Math.floor(Math.random() * tips.length)], {
          duration: 5000,
        });
      }, 1500);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (hasMediaPermission === false) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6 flex flex-col items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Camera and Microphone Access Required</h1>
          <p className="mb-6 text-gray-400">
            To use the AI Interview Coach, please allow access to your camera and microphone.
            This is necessary for analyzing your interview performance.
          </p>
          <button
            onClick={() => setHasMediaPermission(null)}
            className="px-6 py-3 bg-primary-100 text-black rounded-lg font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto p-6">
        {!isInterviewActive ? (
          <>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold mb-2"
            >
              AI Interview Coach
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.2 } }}
              className="text-gray-400 mb-8"
            >
              Practice your interview skills with our AI-powered coach that provides real-time feedback and performance analysis.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
              <motion.div
                whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" }}
                className="bg-gray-900 p-6 rounded-xl shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-green-500/20 p-3 rounded-lg mr-3">
                    <FiMessageCircle className="text-green-500" size={24} />
                  </div>
                  <h3 className="text-xl font-bold">Practice Mode</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Get comfortable with the interview process. Receive gentle feedback to build confidence.
                </p>
                <ul className="text-gray-400 text-sm mb-6">
                  <li className="flex items-center mb-2">
                    <FiCheckCircle className="text-green-500 mr-2" />
                    <span>Beginner-friendly feedback</span>
                  </li>
                  <li className="flex items-center mb-2">
                    <FiCheckCircle className="text-green-500 mr-2" />
                    <span>Basic questions</span>
                  </li>
                  <li className="flex items-center">
                    <FiCheckCircle className="text-green-500 mr-2" />
                    <span>Supportive coaching</span>
                  </li>
                </ul>
                <button
                  onClick={() => startInterview('practice')}
                  className="w-full px-4 py-2 bg-primary-100 text-black rounded-lg font-medium transition-all hover:bg-primary-200"
                >
                  Start Practice
                </button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" }}
                className="bg-gray-900 p-6 rounded-xl shadow-lg border border-primary-100"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-blue-500/20 p-3 rounded-lg mr-3">
                    <FiCpu className="text-blue-500" size={24} />
                  </div>
                  <h3 className="text-xl font-bold">Standard Interview</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Realistic interview experience with balanced feedback to improve your skills.
                </p>
                <ul className="text-gray-400 text-sm mb-6">
                  <li className="flex items-center mb-2">
                    <FiCheckCircle className="text-blue-500 mr-2" />
                    <span>Detailed performance metrics</span>
                  </li>
                  <li className="flex items-center mb-2">
                    <FiCheckCircle className="text-blue-500 mr-2" />
                    <span>Moderate difficulty questions</span>
                  </li>
                  <li className="flex items-center">
                    <FiCheckCircle className="text-blue-500 mr-2" />
                    <span>Real-time feedback</span>
                  </li>
                </ul>
                <button
                  onClick={() => startInterview('standard')}
                  className="w-full px-4 py-2 bg-primary-100 text-black rounded-lg font-medium transition-all hover:bg-primary-200"
                >
                  Start Interview
                </button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" }}
                className="bg-gray-900 p-6 rounded-xl shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <div className="bg-purple-500/20 p-3 rounded-lg mr-3">
                    <FiHelpCircle className="text-purple-500" size={24} />
                  </div>
                  <h3 className="text-xl font-bold">Expert Mode</h3>
                </div>
                <p className="text-gray-400 mb-4">
                  Challenging interview with detailed feedback for experienced candidates.
                </p>
                <ul className="text-gray-400 text-sm mb-6">
                  <li className="flex items-center mb-2">
                    <FiCheckCircle className="text-purple-500 mr-2" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center mb-2">
                    <FiCheckCircle className="text-purple-500 mr-2" />
                    <span>Challenging scenario questions</span>
                  </li>
                  <li className="flex items-center">
                    <FiCheckCircle className="text-purple-500 mr-2" />
                    <span>Critical feedback</span>
                  </li>
                </ul>
                <button
                  onClick={() => startInterview('expert')}
                  className="w-full px-4 py-2 bg-primary-100 text-black rounded-lg font-medium transition-all hover:bg-primary-200"
                >
                  Start Expert Mode
                </button>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.5 } }}
              className="bg-gray-900 p-6 rounded-xl"
            >
              <h2 className="text-xl font-bold mb-4">Previous Sessions</h2>
              {session ? (
                <div className="text-gray-400">
                  <p>You haven't completed any coaching sessions yet.</p>
                </div>
              ) : (
                <div className="text-gray-400">
                  <p>Sign in to save your interview coaching sessions.</p>
                </div>
              )}
            </motion.div>
          </>
        ) : (
          <div className="flex flex-col h-screen -mt-6 -mx-6">
            {/* Interview room header */}
            <div className="flex justify-between items-center p-4 bg-gray-900">
              <h2 className="text-xl font-bold flex items-center">
                {selectedMode === 'practice' ? 
                  <><FiMessageCircle className="text-green-500 mr-2" /> Practice Interview</> : 
                 selectedMode === 'expert' ? 
                  <><FiHelpCircle className="text-purple-500 mr-2" /> Expert Interview</> : 
                  <><FiCpu className="text-blue-500 mr-2" /> Standard Interview</>}
              </h2>
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowInstructions(!showInstructions)}
                  className="flex items-center px-3 py-2 bg-gray-800 text-white rounded-lg"
                >
                  <FiHelpCircle className="mr-2" /> Help
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={endInterview}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  <FiX className="mr-2" /> End Interview
                </motion.button>
              </div>
            </div>

            {/* Main interview area */}
            <div className="flex flex-grow relative">
              {/* Left sidebar - Status indicators */}
              <div className="w-16 bg-gray-900 border-r border-gray-800 flex flex-col items-center pt-6 space-y-6">
                <div className="flex flex-col items-center">
                  <div className={`rounded-full p-2 ${isVideoReady ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                    <FiVideo className={isVideoReady ? 'text-green-500' : 'text-yellow-500'} />
                  </div>
                  <span className="text-xs mt-1">{isVideoReady ? 'Video On' : 'Starting...'}</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className={`rounded-full p-2 ${isAudioReady ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                    <FiMic className={isAudioReady ? 'text-green-500' : 'text-yellow-500'} />
                  </div>
                  <span className="text-xs mt-1">{isAudioReady ? 'Audio On' : 'Starting...'}</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="rounded-full p-2 bg-purple-500/20">
                    <FiCpu className="text-purple-500" />
                  </div>
                  <span className="text-xs mt-1">AI Coach</span>
                </div>
              </div>
              
              {/* Video container */}
              <div className="w-2/3 bg-black relative">
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  muted
                  className="w-full h-full object-cover"
                />
                
                {/* Status and feedback indicators */}
                <div className="absolute top-4 left-4 right-4 flex justify-between">
                  <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-lg text-sm flex items-center">
                    <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                    Recording
                  </div>
                  
                  <div className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-lg text-sm">
                    Question {currentQuestion + 1} of {questions.length}
                  </div>
                </div>
                
                {/* Interview coach integration */}
                <InterviewCoach
                  isActive={isInterviewActive && isAudioReady && isVideoReady}
                  userName={session?.user?.name || 'User'}
                  showRealTimeFeedback={true}
                  cameraFeed={videoRef}
                  onComplete={handleReportComplete}
                />
                
                {/* Feedback tips overlay */}
                <AnimatePresence>
                  {showTips && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-lg p-3 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-primary-100 font-medium mb-1">Coaching Tips</h4>
                          <p className="text-sm text-gray-300">Speak clearly and maintain eye contact with the camera for best results.</p>
                        </div>
                        <button 
                          onClick={() => setShowTips(false)}
                          className="text-gray-400 hover:text-white"
                        >
                          <FiX />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Sidebar with interview content */}
              <div className="w-1/3 bg-gray-900 flex flex-col">
                <div className="p-4 border-b border-gray-800">
                  <h3 className="text-lg font-bold mb-1">Current Question</h3>
                  <div className="p-4 bg-gray-800 rounded-lg mb-3">
                    <p className="font-medium text-lg">{questions[currentQuestion]}</p>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <button
                      onClick={goToPreviousQuestion}
                      disabled={currentQuestion === 0}
                      className={`px-4 py-2 rounded-lg ${currentQuestion === 0 ? 'bg-gray-700 text-gray-500' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
                    >
                      Previous
                    </button>
                    
                    <button
                      onClick={goToNextQuestion}
                      disabled={currentQuestion === questions.length - 1 || isResponding}
                      className={`px-4 py-2 rounded-lg flex items-center ${currentQuestion === questions.length - 1 || isResponding ? 'bg-gray-700 text-gray-500' : 'bg-primary-100 text-black hover:bg-primary-200'}`}
                    >
                      {isResponding ? (
                        <>
                          <span className="animate-spin h-4 w-4 mr-2 border-2 border-gray-500 border-t-white rounded-full"></span>
                          Processing...
                        </>
                      ) : (
                        'Next Question'
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="p-4 flex-grow overflow-y-auto">
                  <h3 className="text-lg font-bold mb-3">All Questions</h3>
                  <div className="space-y-3">
                    {questions.map((q, idx) => (
                      <div 
                        key={idx}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${idx === currentQuestion ? 'bg-primary-100/20 border border-primary-100' : 'bg-gray-800 hover:bg-gray-700'}`}
                        onClick={() => setCurrentQuestion(idx)}
                      >
                        <div className="flex items-center">
                          <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-700 rounded-full mr-2 text-xs">
                            {idx + 1}
                          </span>
                          <p className="font-medium">{q}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-4 border-t border-gray-800 bg-gray-800">
                  <h4 className="font-medium mb-2">Interview Progress</h4>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div className="bg-primary-100 h-2.5 rounded-full" style={{width: `${((currentQuestion + 1) / questions.length) * 100}%`}}></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Question {currentQuestion + 1} of {questions.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Preparing interview overlay */}
      {isPreparingInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="mb-4">
              <svg className="animate-spin h-12 w-12 text-primary-100 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Preparing Your Interview</h2>
            <p className="text-gray-400">Setting up the AI coach and interview environment...</p>
          </div>
        </div>
      )}
      
      {/* Instructions modal */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => setShowInstructions(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 p-6 rounded-xl max-w-xl w-full mx-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">How to Use the Interview Coach</h3>
                <button 
                  onClick={() => setShowInstructions(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-primary-100 mb-1">Getting Started</h4>
                  <p className="text-gray-300 text-sm">Ensure your camera and microphone are working. The AI needs to see and hear you clearly for accurate feedback.</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-primary-100 mb-1">During the Interview</h4>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• Speak clearly and at a normal pace</li>
                    <li>• Look at the camera to maintain virtual eye contact</li>
                    <li>• Answer each question thoroughly</li>
                    <li>• Use the Next Question button to progress</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-primary-100 mb-1">Feedback</h4>
                  <p className="text-gray-300 text-sm">The AI analyzes your facial expressions, posture, speaking pace, and content. You'll receive real-time feedback and a comprehensive report at the end.</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowInstructions(false)}
                className="w-full mt-6 px-4 py-2 bg-primary-100 text-black rounded-lg font-medium"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 