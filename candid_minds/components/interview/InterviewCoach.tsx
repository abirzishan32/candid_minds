'use client';

import React, { useState, useEffect, useRef } from 'react';
import VideoAnalyzer, { VideoMetrics } from './VideoAnalyzer';
import AudioAnalyzer, { AudioMetrics } from './AudioAnalyzer';
import FeedbackDisplay, { FeedbackItem } from './FeedbackDisplay';
import PerformanceReport from './PerformanceReport';
import { motion, AnimatePresence } from 'framer-motion';

interface GoalSettings {
  eyeContact: boolean;
  posture: boolean;
  smiling: boolean;
  speakingPace: boolean;
  fillerWords: boolean;
  responseTime: boolean;
}

interface InterviewCoachProps {
  isActive: boolean;
  userName: string;
  showRealTimeFeedback?: boolean;
  cameraFeed?: React.RefObject<HTMLVideoElement | null>;
  onComplete?: (reportData: any) => void;
  isInterviewerSpeaking?: boolean;
}

const InterviewCoach: React.FC<InterviewCoachProps> = ({ 
  isActive, 
  userName,
  showRealTimeFeedback = true,
  cameraFeed,
  onComplete,
  isInterviewerSpeaking = false
}) => {
  // States for analytics
  const [videoMetrics, setVideoMetrics] = useState<VideoMetrics>({
    eyeContact: 100,
    posture: 100,
    facialExpressions: {
      neutral: 0.8,
      happy: 0.2,
      sad: 0,
      angry: 0,
      surprised: 0,
    },
    headPosition: {
      rotation: 0,
      tilt: 0,
    },
    lastSmileTimestamp: Date.now(),
    isLookingAway: false,
    isBadPosture: false,
    isFidgeting: 0,
    inFramePercentage: 100,
  });
  
  const [audioMetrics, setAudioMetrics] = useState<AudioMetrics>({
    speechClarity: 90,
    speakingRate: 150,
    volumeLevel: 70,
    tonalVariation: 75,
    fillerWords: {
      count: 0,
      instances: [],
    },
    longestPauseDuration: 0,
    averagePauseDuration: 0,
    responseLatency: 0,
    speakingPercentage: 60,
    isSpeakingTooFast: false,
    isSpeakingTooSlow: false,
    isSpeakingTooQuietly: false,
    isSpeakingMonotonously: false,
  });
  
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackItem[]>([]);
  const [transcript, setTranscript] = useState<string>('');
  const [interviewDuration, setInterviewDuration] = useState<number>(0);
  const [goalSettings, setGoalSettings] = useState<GoalSettings>({
    eyeContact: true,
    posture: true,
    smiling: true,
    speakingPace: true,
    fillerWords: true,
    responseTime: true,
  });
  
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showReport, setShowReport] = useState<boolean>(false);
  const startTimeRef = useRef<number | null>(null);
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Start/stop interview timer
  useEffect(() => {
    if (isActive && !startTimeRef.current) {
      startTimeRef.current = Date.now();
      
      // Start duration timer
      durationTimerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const duration = (Date.now() - startTimeRef.current) / 1000;
          setInterviewDuration(duration);
        }
      }, 1000);
    } else if (!isActive && startTimeRef.current) {
      // Stop timer
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
      
      const duration = (Date.now() - startTimeRef.current) / 1000;
      setInterviewDuration(duration);
      startTimeRef.current = null;
      
      // Show report if interview is complete
      if (duration > 60) { // Only show report if interview lasted at least a minute
        setShowReport(true);
        
        // Call onComplete callback if provided
        if (onComplete) {
          onComplete({
            videoMetrics,
            audioMetrics,
            feedbackHistory,
            transcript,
            interviewDuration: duration,
          });
        }
      }
    }
    
    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, [isActive, onComplete]);
  
  // Handle feedback collection
  const handleFeedbackAdd = (newFeedback: FeedbackItem) => {
    setFeedbackHistory(prev => [...prev, newFeedback]);
  };
  
  // Handle transcript updates
  const handleTranscriptUpdate = (newText: string) => {
    setTranscript(prev => prev + newText + ' ');
  };
  
  // Handlers for metrics updates
  const handleVideoMetricsUpdate = (metrics: VideoMetrics) => {
    setVideoMetrics(metrics);
  };
  
  const handleAudioMetricsUpdate = (metrics: AudioMetrics) => {
    setAudioMetrics(metrics);
  };
  
  // Toggle settings modal
  const toggleSettingsModal = () => {
    setShowSettingsModal(prev => !prev);
  };
  
  // Update goal settings
  const updateGoalSetting = (setting: keyof GoalSettings, value: boolean) => {
    setGoalSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <>
      {/* Analytics components (hidden from view) */}
      <VideoAnalyzer
        isActive={isActive}
        onMetricsUpdate={handleVideoMetricsUpdate}
        cameraFeed={cameraFeed}
      />
      
      <AudioAnalyzer
        isActive={isActive}
        onMetricsUpdate={handleAudioMetricsUpdate}
        isInterviewerSpeaking={isInterviewerSpeaking}
      />
      
      {/* Real-time feedback display */}
      {isActive && showRealTimeFeedback && (
        <FeedbackDisplay
          videoMetrics={videoMetrics}
          audioMetrics={audioMetrics}
          isActive={isActive}
          realTimeFeedback={showRealTimeFeedback}
          goalSettings={goalSettings}
        />
      )}
      
      {/* Settings button (fixed position) */}
      {isActive && !showReport && (
        <button
          onClick={toggleSettingsModal}
          className="fixed top-4 right-4 z-50 bg-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </button>
      )}
      
      {/* Settings modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
            onClick={() => setShowSettingsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-xl p-6 shadow-2xl max-w-md w-full mx-4"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Interview Coach Settings</h3>
              
              <div className="space-y-4 mb-6">
                <p className="text-gray-400 text-sm">Choose which aspects you want to focus on during this interview:</p>
                
                <div className="space-y-3">
                  {Object.entries(goalSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        id={key}
                        checked={value}
                        onChange={e => updateGoalSetting(key as keyof GoalSettings, e.target.checked)}
                        className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-primary-100 focus:ring-offset-gray-900 focus:ring-primary-100"
                      />
                      <label htmlFor={key} className="ml-3 text-gray-300">
                        {key === 'eyeContact' ? 'Eye Contact' :
                         key === 'posture' ? 'Posture & Body Language' :
                         key === 'smiling' ? 'Facial Expressions' :
                         key === 'speakingPace' ? 'Speaking Pace' :
                         key === 'fillerWords' ? 'Filler Words' :
                         key === 'responseTime' ? 'Response Time' : key}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 bg-primary-100 text-black rounded-lg font-medium"
                >
                  Save Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Performance report modal */}
      <AnimatePresence>
        {showReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full mx-auto my-8"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Your Interview Performance</h2>
                  <button
                    onClick={() => setShowReport(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <PerformanceReport
                  videoMetrics={videoMetrics}
                  audioMetrics={audioMetrics}
                  feedbackHistory={feedbackHistory}
                  transcript={transcript}
                  interviewDuration={interviewDuration}
                  goalSettings={goalSettings}
                />
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowReport(false)}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg mr-3"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      // Export or save report logic would go here
                      alert('Report saved');
                    }}
                    className="px-4 py-2 bg-primary-100 text-black rounded-lg font-medium"
                  >
                    Save Report
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InterviewCoach; 