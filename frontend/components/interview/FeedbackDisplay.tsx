'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VideoMetrics } from './VideoAnalyzer';
import { AudioMetrics } from './AudioAnalyzer';

export type FeedbackType = 'posture' | 'eyeContact' | 'smiling' | 'volume' | 'pace' | 'fillerWords' | 'clarity' | 'responseTime';

export type FeedbackItem = {
  id: string;
  type: FeedbackType;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
  dismissed?: boolean;
};

interface FeedbackDisplayProps {
  videoMetrics: VideoMetrics;
  audioMetrics: AudioMetrics;
  isActive: boolean;
  realTimeFeedback: boolean;
  goalSettings?: {
    eyeContact?: boolean;
    posture?: boolean;
    smiling?: boolean;
    speakingPace?: boolean;
    fillerWords?: boolean;
    responseTime?: boolean;
  };
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({
  videoMetrics,
  audioMetrics,
  isActive,
  realTimeFeedback,
  goalSettings = {
    eyeContact: true,
    posture: true, 
    smiling: true,
    speakingPace: true,
    fillerWords: true,
    responseTime: true
  }
}) => {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [activeTip, setActiveTip] = useState<FeedbackItem | null>(null);
  const [lastFeedbackTime, setLastFeedbackTime] = useState<Record<FeedbackType, number>>({
    posture: 0,
    eyeContact: 0,
    smiling: 0,
    volume: 0,
    pace: 0,
    fillerWords: 0,
    clarity: 0,
    responseTime: 0
  });

  // Generate feedback based on metrics
  useEffect(() => {
    if (!isActive || !realTimeFeedback) return;

    const currentTime = Date.now();
    const newFeedbackItems: FeedbackItem[] = [];
    
    // Check posture feedback
    if (
      goalSettings.posture && 
      videoMetrics.isBadPosture && 
      currentTime - lastFeedbackTime.posture > 30000 // Only every 30 seconds
    ) {
      newFeedbackItems.push({
        id: `posture-${currentTime}`,
        type: 'posture',
        message: 'Try to sit up straight and keep your shoulders back',
        severity: videoMetrics.posture < 50 ? 'high' : 'medium',
        timestamp: currentTime
      });
      setLastFeedbackTime(prev => ({ ...prev, posture: currentTime }));
    }
    
    // Check eye contact feedback
    if (
      goalSettings.eyeContact && 
      videoMetrics.isLookingAway &&
      currentTime - lastFeedbackTime.eyeContact > 20000
    ) {
      newFeedbackItems.push({
        id: `eye-${currentTime}`,
        type: 'eyeContact',
        message: 'Try to maintain eye contact with the interviewer',
        severity: videoMetrics.eyeContact < 50 ? 'high' : 'medium',
        timestamp: currentTime
      });
      setLastFeedbackTime(prev => ({ ...prev, eyeContact: currentTime }));
    }
    
    // Check smiling feedback
    if (
      goalSettings.smiling && 
      currentTime - videoMetrics.lastSmileTimestamp > 90000 && // No smile in 90 seconds
      currentTime - lastFeedbackTime.smiling > 60000 // Only remind once a minute
    ) {
      newFeedbackItems.push({
        id: `smile-${currentTime}`,
        type: 'smiling',
        message: 'Remember to smile occasionally to build rapport',
        severity: 'low',
        timestamp: currentTime
      });
      setLastFeedbackTime(prev => ({ ...prev, smiling: currentTime }));
    }
    
    // Check volume feedback
    if (
      audioMetrics.isSpeakingTooQuietly &&
      currentTime - lastFeedbackTime.volume > 30000
    ) {
      newFeedbackItems.push({
        id: `volume-${currentTime}`,
        type: 'volume',
        message: 'Try to speak a bit louder and more clearly',
        severity: 'medium',
        timestamp: currentTime
      });
      setLastFeedbackTime(prev => ({ ...prev, volume: currentTime }));
    }
    
    // Check speaking pace feedback
    if (
      goalSettings.speakingPace && 
      (audioMetrics.isSpeakingTooFast || audioMetrics.isSpeakingTooSlow) &&
      currentTime - lastFeedbackTime.pace > 30000
    ) {
      const message = audioMetrics.isSpeakingTooFast 
        ? 'Try to slow down your speaking pace a bit' 
        : 'Try to speak a bit more quickly and energetically';
        
      newFeedbackItems.push({
        id: `pace-${currentTime}`,
        type: 'pace',
        message,
        severity: 'medium',
        timestamp: currentTime
      });
      setLastFeedbackTime(prev => ({ ...prev, pace: currentTime }));
    }
    
    // Check filler words feedback
    if (
      goalSettings.fillerWords && 
      audioMetrics.fillerWords.count > 5 &&
      currentTime - lastFeedbackTime.fillerWords > 45000
    ) {
      newFeedbackItems.push({
        id: `filler-${currentTime}`,
        type: 'fillerWords',
        message: 'Try to reduce filler words like "um" and "uh"',
        severity: audioMetrics.fillerWords.count > 10 ? 'high' : 'medium',
        timestamp: currentTime
      });
      setLastFeedbackTime(prev => ({ ...prev, fillerWords: currentTime }));
    }
    
    // Check response time feedback
    if (
      goalSettings.responseTime && 
      audioMetrics.responseLatency > 5 && // Taking more than 5 seconds to respond
      audioMetrics.responseLatency < 15 && // But not more than 15 seconds (which might be a thoughtful pause)
      currentTime - lastFeedbackTime.responseTime > 60000 // Once per minute max
    ) {
      newFeedbackItems.push({
        id: `response-${currentTime}`,
        type: 'responseTime',
        message: 'Try to respond a bit more promptly to questions',
        severity: 'low',
        timestamp: currentTime
      });
      setLastFeedbackTime(prev => ({ ...prev, responseTime: currentTime }));
    }
    
    // Check speech clarity feedback
    if (
      audioMetrics.speechClarity < 70 &&
      currentTime - lastFeedbackTime.clarity > 45000
    ) {
      newFeedbackItems.push({
        id: `clarity-${currentTime}`,
        type: 'clarity',
        message: 'Try to articulate your words more clearly',
        severity: audioMetrics.speechClarity < 50 ? 'high' : 'medium',
        timestamp: currentTime
      });
      setLastFeedbackTime(prev => ({ ...prev, clarity: currentTime }));
    }
    
    // Add new feedback items
    if (newFeedbackItems.length > 0) {
      setFeedbackItems(prev => [...prev, ...newFeedbackItems]);
    }
  }, [videoMetrics, audioMetrics, isActive, realTimeFeedback, goalSettings, lastFeedbackTime]);
  
  // Update active tip
  useEffect(() => {
    if (!isActive || !realTimeFeedback || feedbackItems.length === 0) {
      setActiveTip(null);
      return;
    }
    
    // Get the most recent high-priority tip, or any tip if there are no high-priority ones
    const undismissedItems = feedbackItems.filter(item => !item.dismissed);
    if (undismissedItems.length === 0) {
      setActiveTip(null);
      return;
    }
    
    // Sort by severity and recency
    const sortedItems = [...undismissedItems].sort((a, b) => {
      // Sort by severity first
      const severityOrder = { high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      
      if (severityDiff !== 0) return severityDiff;
      
      // Then by timestamp (most recent first)
      return b.timestamp - a.timestamp;
    });
    
    setActiveTip(sortedItems[0]);
    
    // Auto-dismiss after 10 seconds
    const tipId = sortedItems[0].id;
    const timer = setTimeout(() => {
      setFeedbackItems(prev => 
        prev.map(item => 
          item.id === tipId ? { ...item, dismissed: true } : item
        )
      );
    }, 10000);
    
    return () => clearTimeout(timer);
  }, [feedbackItems, isActive, realTimeFeedback]);
  
  // Render feedback tip
  const renderTip = () => {
    if (!activeTip) return null;
    
    const iconMap: Record<FeedbackType, string> = {
      posture: '🧍',
      eyeContact: '👁️',
      smiling: '😊',
      volume: '🔊',
      pace: '🏃',
      fillerWords: '💬',
      clarity: '🗣️',
      responseTime: '⏱️'
    };
    
    const severityColors = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500'
    };
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex items-center p-3 rounded-lg bg-gray-800 border-l-4 shadow-lg max-w-md"
        style={{ borderLeftColor: activeTip.severity === 'high' ? '#ef4444' : activeTip.severity === 'medium' ? '#eab308' : '#3b82f6' }}
      >
        <div className="mr-3 text-xl">{iconMap[activeTip.type]}</div>
        <div className="flex-1">
          <p className="text-white text-sm">{activeTip.message}</p>
        </div>
        <button 
          onClick={() => {
            setFeedbackItems(prev => 
              prev.map(item => 
                item.id === activeTip.id ? { ...item, dismissed: true } : item
              )
            );
          }}
          className="ml-2 text-gray-400 hover:text-white focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </motion.div>
    );
  };
  
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <AnimatePresence>
        {isActive && realTimeFeedback && activeTip && renderTip()}
      </AnimatePresence>
    </div>
  );
};

export default FeedbackDisplay; 