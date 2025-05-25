'use client';

import React, { useEffect, useState } from 'react';
import { VideoMetrics } from './VideoAnalyzer';
import { AudioMetrics } from './AudioAnalyzer';
import { FeedbackItem } from './FeedbackDisplay';

export type PerformanceMetric = {
  name: string;
  score: number; // 0-100
  category: 'communication' | 'presence' | 'content' | 'overall';
  details: string;
  improvementTips: string[];
  color: string;
};

interface PerformanceReportProps {
  videoMetrics: VideoMetrics;
  audioMetrics: AudioMetrics;
  feedbackHistory: FeedbackItem[];
  transcript: string;
  interviewDuration: number;
  goalSettings?: {
    eyeContact?: boolean;
    posture?: boolean;
    smiling?: boolean;
    speakingPace?: boolean;
    fillerWords?: boolean;
    responseTime?: boolean;
  };
}

const PerformanceReport: React.FC<PerformanceReportProps> = ({
  videoMetrics,
  audioMetrics,
  feedbackHistory,
  transcript,
  interviewDuration,
  goalSettings = {}
}) => {
  const [overallScore, setOverallScore] = useState(0);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [improvements, setImprovements] = useState<string[]>([]);

  // Generate performance metrics
  useEffect(() => {
    // Calculate individual metrics
    const metrics: PerformanceMetric[] = [];
    
    // Verbal Communication score
    const clarityScore = audioMetrics.speechClarity;
    const fillerWordPenalty = audioMetrics.fillerWords.count > 0 
      ? Math.min(30, audioMetrics.fillerWords.count * 2) 
      : 0;
    
    const verbalCommunicationScore = Math.max(0, Math.min(100, 
      clarityScore - fillerWordPenalty
    ));
    
    metrics.push({
      name: 'Verbal Communication',
      score: verbalCommunicationScore,
      category: 'communication',
      details: `Your speech clarity was ${clarityScore > 80 ? 'excellent' : clarityScore > 60 ? 'good' : 'needs improvement'}. ${
        audioMetrics.fillerWords.count > 10 
          ? `You used ${audioMetrics.fillerWords.count} filler words, which reduced your score.` 
          : audioMetrics.fillerWords.count > 0 
            ? `You used some filler words (${audioMetrics.fillerWords.count}), which slightly affected your score.` 
            : 'You used very few filler words, which is excellent.'
      }`,
      improvementTips: [
        audioMetrics.fillerWords.count > 5 ? 'Practice speaking without filler words like "um" and "uh"' : '',
        audioMetrics.speechClarity < 70 ? 'Work on articulating your words more clearly' : '',
        audioMetrics.isSpeakingTooFast ? 'Slow down your speaking pace slightly' : '',
        audioMetrics.isSpeakingTooSlow ? 'Try to speak with slightly more energy and pace' : '',
      ].filter(Boolean),
      color: verbalCommunicationScore > 80 ? '#22c55e' : verbalCommunicationScore > 60 ? '#eab308' : '#ef4444'
    });
    
    // Nonverbal Communication score
    const eyeContactScore = videoMetrics.eyeContact;
    const postureScore = videoMetrics.posture;
    const fidgetingPenalty = Math.min(25, videoMetrics.isFidgeting / 2);
    
    const nonverbalCommunicationScore = Math.max(0, Math.min(100, 
      (eyeContactScore + postureScore) / 2 - fidgetingPenalty
    ));
    
    metrics.push({
      name: 'Nonverbal Communication',
      score: nonverbalCommunicationScore,
      category: 'presence',
      details: `Your eye contact was ${eyeContactScore > 80 ? 'strong' : eyeContactScore > 60 ? 'good' : 'inconsistent'}. 
        Your posture was ${postureScore > 80 ? 'excellent' : postureScore > 60 ? 'good' : 'needs improvement'}.
        ${videoMetrics.isFidgeting > 50 ? 'You showed significant fidgeting during the interview.' : 
          videoMetrics.isFidgeting > 25 ? 'You showed some fidgeting during the interview.' : 
          'You maintained good stillness during the interview.'}`,
      improvementTips: [
        videoMetrics.eyeContact < 70 ? 'Practice maintaining more consistent eye contact' : '',
        videoMetrics.posture < 70 ? 'Work on maintaining a more upright posture' : '',
        videoMetrics.isFidgeting > 40 ? 'Try to reduce fidgeting and movement during interviews' : '',
      ].filter(Boolean),
      color: nonverbalCommunicationScore > 80 ? '#22c55e' : nonverbalCommunicationScore > 60 ? '#eab308' : '#ef4444'
    });
    
    // Response Quality score
    // This would typically be based on transcript analysis, but we'll use a simplified approach
    // In a real implementation, you'd use NLP to analyze the quality of responses
    const averageResponseLatency = audioMetrics.responseLatency;
    const speakingRateScore = !audioMetrics.isSpeakingTooFast && !audioMetrics.isSpeakingTooSlow ? 100 : 70;
    
    // Simple analysis of response length and complexity based on transcript
    const words = transcript.split(/\s+/).length;
    const sentences = (transcript.match(/[.!?]+/g) || []).length;
    const avgWordsPerSentence = sentences > 0 ? words / sentences : 0;
    
    // Ideal range is 15-20 words per sentence
    const sentenceStructureScore = avgWordsPerSentence >= 10 && avgWordsPerSentence <= 25 ? 100 : 
      avgWordsPerSentence < 10 ? 60 : 70;
    
    // Response latency score (higher is better, up to a point)
    // Too quick might mean not thinking, too slow might mean unprepared
    const latencyScore = averageResponseLatency >= 1 && averageResponseLatency <= 3 ? 100 :
      averageResponseLatency < 1 ? 80 : 
      averageResponseLatency <= 5 ? 85 : 70;
    
    const responseQualityScore = Math.round(
      (speakingRateScore + sentenceStructureScore + latencyScore) / 3
    );
    
    metrics.push({
      name: 'Response Quality',
      score: responseQualityScore,
      category: 'content',
      details: `Your speaking pace was ${!audioMetrics.isSpeakingTooFast && !audioMetrics.isSpeakingTooSlow ? 'well-balanced' : 
        audioMetrics.isSpeakingTooFast ? 'a bit fast' : 'a bit slow'}. 
        Your responses had an average of ${Math.round(avgWordsPerSentence)} words per sentence, which is ${
          avgWordsPerSentence >= 10 && avgWordsPerSentence <= 25 ? 'good' : 
          avgWordsPerSentence < 10 ? 'a bit brief' : 'a bit lengthy'
        }.
        Your response time was ${
          averageResponseLatency >= 1 && averageResponseLatency <= 3 ? 'excellent' : 
          averageResponseLatency < 1 ? 'very quick' : 
          averageResponseLatency <= 5 ? 'good' : 'a bit slow'
        }.`,
      improvementTips: [
        audioMetrics.isSpeakingTooFast ? 'Slow down your speaking pace to improve clarity' : '',
        audioMetrics.isSpeakingTooSlow ? 'Try to speak with slightly more energy and pace' : '',
        avgWordsPerSentence < 10 ? 'Try to elaborate more in your responses' : '',
        avgWordsPerSentence > 25 ? 'Try to be more concise and break up long sentences' : '',
        averageResponseLatency > 5 ? 'Work on reducing your response time to questions' : '',
        averageResponseLatency < 1 ? 'Consider taking a moment to formulate your thoughts before responding' : '',
      ].filter(Boolean),
      color: responseQualityScore > 80 ? '#22c55e' : responseQualityScore > 60 ? '#eab308' : '#ef4444'
    });
    
    // Calculate overall score
    const calculatedOverallScore = Math.round(
      (verbalCommunicationScore + nonverbalCommunicationScore + responseQualityScore) / 3
    );
    
    setOverallScore(calculatedOverallScore);
    setPerformanceMetrics(metrics);
    
    // Determine strengths and improvements
    const strengthsList: string[] = [];
    const improvementsList: string[] = [];
    
    metrics.forEach(metric => {
      if (metric.score >= 80) {
        strengthsList.push(`Strong ${metric.name.toLowerCase()}: ${metric.details.split('.')[0]}.`);
      }
      
      if (metric.score < 70) {
        improvementsList.push(...metric.improvementTips);
      }
    });
    
    // Add specific strengths
    if (audioMetrics.fillerWords.count < 5) {
      strengthsList.push('Minimal use of filler words.');
    }
    
    if (videoMetrics.inFramePercentage > 95) {
      strengthsList.push('Excellent camera presence throughout the interview.');
    }
    
    if (audioMetrics.volumeLevel > 60 && !audioMetrics.isSpeakingTooQuietly) {
      strengthsList.push('Good voice projection and volume.');
    }
    
    setStrengths(strengthsList);
    setImprovements(improvementsList);
    
  }, [videoMetrics, audioMetrics, feedbackHistory, transcript, interviewDuration]);

  // Format time (minutes:seconds)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-6">Interview Performance Report</h2>
      
      {/* Overall Score */}
      <div className="mb-8 flex items-center">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
            <circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke="#1f2937" 
              strokeWidth="10" 
            />
            <circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke={overallScore > 80 ? '#22c55e' : overallScore > 60 ? '#eab308' : '#ef4444'} 
              strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 45 * overallScore / 100} ${2 * Math.PI * 45 * (1 - overallScore / 100)}`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-3xl font-bold text-white">{overallScore}</span>
            <span className="text-xs text-gray-400">Overall Score</span>
          </div>
        </div>
        
        <div className="ml-8 flex-1">
          <h3 className="text-lg font-semibold text-white mb-2">Interview Summary</h3>
          <p className="text-gray-400 text-sm mb-2">Duration: {formatTime(interviewDuration)}</p>
          <p className="text-gray-400 text-sm">
            {overallScore > 80 
              ? 'Excellent performance! You demonstrated strong communication skills and interview presence.' 
              : overallScore > 60 
                ? 'Good performance with some areas for improvement.' 
                : 'This interview highlighted several areas where you can improve your performance.'}
          </p>
        </div>
      </div>
      
      {/* Performance Metrics */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Breakdown</h3>
        
        <div className="space-y-4">
          {performanceMetrics.map((metric, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-white">{metric.name}</h4>
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: metric.color }}
                  ></div>
                  <span 
                    className="font-bold" 
                    style={{ color: metric.color }}
                  >
                    {metric.score}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-3">{metric.details}</p>
              
              {metric.improvementTips.length > 0 && (
                <div className="mt-2">
                  <h5 className="text-xs uppercase tracking-wider text-gray-500 mb-1">Improvement Tips</h5>
                  <ul className="list-disc list-inside text-sm text-gray-400 pl-1">
                    {metric.improvementTips.map((tip, tipIndex) => (
                      <li key={tipIndex}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Strengths & Areas for Improvement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Strengths
          </h3>
          
          <ul className="list-disc list-inside text-sm text-gray-400 pl-1">
            {strengths.length > 0 ? (
              strengths.map((strength, index) => (
                <li key={index}>{strength}</li>
              ))
            ) : (
              <li>No specific strengths identified.</li>
            )}
          </ul>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
            <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Areas for Improvement
          </h3>
          
          <ul className="list-disc list-inside text-sm text-gray-400 pl-1">
            {improvements.length > 0 ? (
              improvements.map((improvement, index) => (
                <li key={index}>{improvement}</li>
              ))
            ) : (
              <li>No specific areas for improvement identified.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PerformanceReport; 