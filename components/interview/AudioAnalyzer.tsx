'use client';

import React, { useEffect, useState, useRef } from 'react';

export type AudioMetrics = {
  speechClarity: number; // 0-100 score
  speakingRate: number; // words per minute
  volumeLevel: number; // 0-100 score
  tonalVariation: number; // 0-100 score
  fillerWords: {
    count: number;
    instances: Array<{
      word: string;
      timestamp: number;
    }>;
  };
  longestPauseDuration: number; // in seconds
  averagePauseDuration: number; // in seconds
  responseLatency: number; // time between question and answer in seconds
  speakingPercentage: number; // percentage of time speaking vs silent
  isSpeakingTooFast: boolean;
  isSpeakingTooSlow: boolean;
  isSpeakingTooQuietly: boolean;
  isSpeakingMonotonously: boolean;
};

interface AudioAnalyzerProps {
  onMetricsUpdate: (metrics: AudioMetrics) => void;
  isActive: boolean;
  isInterviewerSpeaking: boolean;
}

const AudioAnalyzer: React.FC<AudioAnalyzerProps> = ({ 
  onMetricsUpdate, 
  isActive,
  isInterviewerSpeaking 
}) => {
  const [metrics, setMetrics] = useState<AudioMetrics>({
    speechClarity: 90,
    speakingRate: 150, // Average speaking rate is 125-150 wpm
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

  // Audio processing
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyzer, setAnalyzer] = useState<AnalyserNode | null>(null);
  const [microphone, setMicrophone] = useState<MediaStreamAudioSourceNode | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  
  // Refs for tracking speaking times
  const recordingStartTime = useRef<number>(Date.now());
  const lastSpeechTime = useRef<number>(Date.now());
  const speakingDuration = useRef<number>(0);
  const silenceDuration = useRef<number>(0);
  const pauses = useRef<number[]>([]);
  const isSpeaking = useRef<boolean>(false);
  const interviewerStopTime = useRef<number | null>(null);
  const wordCount = useRef<number>(0);
  const speechRecognition = useRef<SpeechRecognition | null>(null);
  
  // Initialize Web Speech API
  useEffect(() => {
    if (!isActive) return;
    
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported in this browser');
      return;
    }
    
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    speechRecognition.current = new SpeechRecognition();
    
    speechRecognition.current.continuous = true;
    speechRecognition.current.interimResults = true;
    speechRecognition.current.lang = 'en-US';
    
    speechRecognition.current.onstart = () => {
      setIsListening(true);
      recordingStartTime.current = Date.now();
      console.log('Speech recognition started');
    };
    
    speechRecognition.current.onend = () => {
      setIsListening(false);
      console.log('Speech recognition ended');
      
      // Restart if we're still active
      if (isActive && speechRecognition.current) {
        try {
          speechRecognition.current.start();
        } catch (error) {
          console.error('Error restarting speech recognition:', error);
        }
      }
    };
    
    speechRecognition.current.onresult = (event) => {
      let interimText = '';
      let finalText = transcript;
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        
        if (result.isFinal) {
          finalText += result[0].transcript + ' ';
          processNewSpeech(result[0].transcript);
        } else {
          interimText += result[0].transcript;
        }
      }
      
      setTranscript(finalText);
      setInterimTranscript(interimText);
    };
    
    speechRecognition.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };
    
    try {
      speechRecognition.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
    }
    
    return () => {
      if (speechRecognition.current) {
        try {
          speechRecognition.current.stop();
          setIsListening(false);
        } catch (error) {
          console.error('Error stopping speech recognition:', error);
        }
      }
    };
  }, [isActive, transcript]);
  
  // Initialize audio processing for volume and tone analysis
  useEffect(() => {
    if (!isActive) return;
    
    const initAudioAnalysis = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const source = context.createMediaStreamSource(stream);
        const analyzerNode = context.createAnalyser();
        
        analyzerNode.fftSize = 2048;
        source.connect(analyzerNode);
        
        setAudioContext(context);
        setAnalyzer(analyzerNode);
        setMicrophone(source);
        
        // Start analyzing audio
        analyzeAudio(analyzerNode);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };
    
    initAudioAnalysis();
    
    return () => {
      if (audioContext) {
        audioContext.close();
      }
      
      if (microphone) {
        microphone.disconnect();
      }
    };
  }, [isActive]);
  
  // Track interviewer speaking state to measure response latency
  useEffect(() => {
    if (isInterviewerSpeaking) {
      // Interviewer just started speaking
      isSpeaking.current = false;
    } else if (interviewerStopTime.current === null && !isInterviewerSpeaking) {
      // Interviewer just stopped speaking - start timing the response latency
      interviewerStopTime.current = Date.now();
    }
  }, [isInterviewerSpeaking]);
  
  // Process audio volume data
  const analyzeAudio = (analyzerNode: AnalyserNode) => {
    const bufferLength = analyzerNode.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    
    const checkAudioLevel = () => {
      analyzerNode.getByteTimeDomainData(dataArray);
      
      let sum = 0;
      // Calculate RMS (root mean square) as a good estimate of volume
      for (let i = 0; i < bufferLength; i++) {
        const amplitude = (dataArray[i] - 128) / 128;
        sum += amplitude * amplitude;
      }
      
      const rms = Math.sqrt(sum / bufferLength);
      const volume = Math.min(100, Math.max(0, rms * 400)); // Scale to 0-100
      
      // Detect if someone is speaking
      const wasSpeaking = isSpeaking.current;
      isSpeaking.current = volume > 15; // Threshold to consider speaking
      
      const currentTime = Date.now();
      const timeSinceLastCheck = (currentTime - lastSpeechTime.current) / 1000; // in seconds
      
      if (isSpeaking.current) {
        speakingDuration.current += timeSinceLastCheck;
        
        if (!wasSpeaking) {
          // Just started speaking again
          const pauseDuration = (currentTime - lastSpeechTime.current) / 1000;
          
          if (pauseDuration > 0.5 && pauseDuration < 20) { // Only track reasonable pauses
            pauses.current.push(pauseDuration);
            
            // If we have an interviewer stop time and this is the first time speaking since then
            if (interviewerStopTime.current !== null) {
              const responseLatency = (currentTime - interviewerStopTime.current) / 1000;
              
              setMetrics(prev => ({
                ...prev,
                responseLatency
              }));
              
              // Reset for next question
              interviewerStopTime.current = null;
            }
          }
        }
      } else {
        silenceDuration.current += timeSinceLastCheck;
      }
      
      // Update metrics related to speaking volume and patterns
      if (pauses.current.length > 0) {
        const longestPause = Math.max(...pauses.current);
        const avgPause = pauses.current.reduce((sum, val) => sum + val, 0) / pauses.current.length;
        
        const totalTime = speakingDuration.current + silenceDuration.current;
        const speakingPercentage = totalTime > 0 ? (speakingDuration.current / totalTime) * 100 : 0;
        
        // Calculate words per minute based on word count and speaking duration
        const speakingRate = speakingDuration.current > 0 
          ? (wordCount.current / (speakingDuration.current / 60)) 
          : 0;
        
        setMetrics(prev => ({
          ...prev,
          volumeLevel: volume,
          longestPauseDuration: longestPause,
          averagePauseDuration: avgPause,
          speakingPercentage,
          speakingRate,
          isSpeakingTooQuietly: volume < 30,
          isSpeakingTooFast: speakingRate > 180,
          isSpeakingTooSlow: speakingRate < 120 && wordCount.current > 20, // Only judge if we have enough data
        }));
      } else {
        setMetrics(prev => ({
          ...prev,
          volumeLevel: volume,
          isSpeakingTooQuietly: volume < 30
        }));
      }
      
      lastSpeechTime.current = currentTime;
      
      if (isActive) {
        requestAnimationFrame(checkAudioLevel);
      }
    };
    
    checkAudioLevel();
  };
  
  // Process new speech from the speech recognition
  const processNewSpeech = (text: string) => {
    if (!text) return;
    
    // Count words
    const words = text.trim().split(/\s+/);
    wordCount.current += words.length;
    
    // Detect filler words
    const fillerWords = ['um', 'uh', 'like', 'you know', 'so', 'actually', 'basically', 'literally'];
    const fillerInstances: Array<{ word: string; timestamp: number }> = [];
    
    words.forEach(word => {
      const lowerWord = word.toLowerCase();
      if (fillerWords.includes(lowerWord)) {
        fillerInstances.push({
          word: lowerWord,
          timestamp: Date.now()
        });
      }
    });
    
    if (fillerInstances.length > 0) {
      setMetrics(prev => ({
        ...prev,
        fillerWords: {
          count: prev.fillerWords.count + fillerInstances.length,
          instances: [...prev.fillerWords.instances, ...fillerInstances]
        }
      }));
    }
    
    // Update speech clarity based on confidence (would need real confidence values from API)
    // For now, we'll simulate speech clarity based on sentence formation
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const avgWordsPerSentence = sentences.length > 0 
      ? words.length / sentences.length 
      : 0;
    
    // People who speak clearly typically use 15-20 words per sentence on average
    // Too short or too long sentences might indicate unclear speech
    let clarityScore = 100;
    
    if (avgWordsPerSentence > 25) {
      clarityScore -= (avgWordsPerSentence - 25) * 2;
    } else if (avgWordsPerSentence < 5 && sentences.length > 2) {
      clarityScore -= (5 - avgWordsPerSentence) * 5;
    }
    
    // Too many filler words reduce clarity
    const fillerRatio = wordCount.current > 0 
      ? metrics.fillerWords.count / wordCount.current 
      : 0;
    
    clarityScore -= fillerRatio * 200; // Heavy penalty for filler words
    
    // Update metrics
    setMetrics(prev => ({
      ...prev,
      speechClarity: Math.max(0, Math.min(100, clarityScore))
    }));
    
    // Notify parent component
    onMetricsUpdate(metrics);
  };
  
  return null; // This component doesn't render anything visible
};

export default AudioAnalyzer; 