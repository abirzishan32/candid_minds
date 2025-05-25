'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import * as posenet from '@tensorflow-models/posenet';
import '@tensorflow/tfjs';

export type VideoMetrics = {
  eyeContact: number; // 0-100 score
  posture: number; // 0-100 score
  facialExpressions: {
    neutral: number;
    happy: number;
    sad: number;
    angry: number;
    surprised: number;
  };
  headPosition: {
    rotation: number; // degrees from center
    tilt: number; // degrees from upright
  };
  lastSmileTimestamp: number;
  isLookingAway: boolean;
  isBadPosture: boolean;
  isFidgeting: number; // 0-100 score of movement amount
  inFramePercentage: number; // percentage of time face is detected in frame
};

interface VideoAnalyzerProps {
  onMetricsUpdate: (metrics: VideoMetrics) => void;
  isActive: boolean;
  cameraFeed?: React.RefObject<HTMLVideoElement | null>; // Updated to accept null
}

const VideoAnalyzer: React.FC<VideoAnalyzerProps> = ({ 
  onMetricsUpdate, 
  isActive,
  cameraFeed 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [metrics, setMetrics] = useState<VideoMetrics>({
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

  // Frame history to detect movement/fidgeting
  const frameHistory = useRef<Array<faceapi.FaceDetection>>([]);
  const positionHistory = useRef<Array<posenet.Pose>>([]);
  const framesWithFace = useRef<number>(0);
  const totalFrames = useRef<number>(0);

  // Load models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        
        setModelsLoaded(true);
        console.log('Face API models loaded');
      } catch (error) {
        console.error('Error loading face-api models:', error);
      }
    };
    
    loadModels();
  }, []);

  // Set up video stream
  useEffect(() => {
    if (!isActive || !modelsLoaded) return;
    
    // If we're using an external camera feed, don't create our own
    if (cameraFeed && cameraFeed.current) {
      setStreamActive(true);
      return;
    }
    
    let stream: MediaStream | null = null;
    
    const setupCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: 'user',
          },
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };
    
    setupCamera();
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStreamActive(false);
      }
    };
  }, [isActive, modelsLoaded, cameraFeed]);

  // Analyze video feed
  useEffect(() => {
    if (!streamActive || !isActive) return;
    
    const video = cameraFeed?.current || videoRef.current;
    if (!video || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);
    
    let animationFrameId: number;
    let lastPoseEstimation: posenet.Pose | null = null;
    let poseNetModel: posenet.PoseNet | null = null;
    
    // Load PoseNet model
    posenet.load().then(model => {
      poseNetModel = model;
    });
    
    const analyze = async () => {
      if (!video.paused && !video.ended && video.readyState >= 2) {
        totalFrames.current += 1;
        
        // Face detection
        const detections = await faceapi.detectAllFaces(
          video, 
          new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks().withFaceExpressions();
        
        // Posture analysis with PoseNet (if model is loaded)
        let pose: posenet.Pose | null = null;
        if (poseNetModel) {
          pose = await poseNetModel.estimateSinglePose(video);
          if (pose) {
            positionHistory.current.push(pose);
            if (positionHistory.current.length > 30) { // Keep last 30 frames (1 second at 30fps)
              positionHistory.current.shift();
            }
            lastPoseEstimation = pose;
          }
        }
        
        // Process analysis results
        if (detections.length > 0) {
          framesWithFace.current += 1;
          const detection = detections[0]; // Focus on the first face found
          
          // Track face detections for movement analysis
          frameHistory.current.push(detection.detection);
          if (frameHistory.current.length > 30) { // Keep last 30 frames
            frameHistory.current.shift();
          }
          
          // Calculate metrics
          const updatedMetrics = {
            ...metrics,
            facialExpressions: detection.expressions,
            inFramePercentage: (framesWithFace.current / totalFrames.current) * 100,
            lastSmileTimestamp: detection.expressions.happy > 0.5 ? Date.now() : metrics.lastSmileTimestamp,
          };
          
          // Calculate eye contact by checking if eyes are visible and directed forward
          const landmarks = detection.landmarks;
          const leftEye = landmarks.getLeftEye();
          const rightEye = landmarks.getRightEye();
          
          // Eye direction calculation is complex, this is simplified
          const eyeWidth = Math.abs(leftEye[3].x - leftEye[0].x);
          const eyeHeight = Math.abs(leftEye[4].y - leftEye[1].y);
          const eyeRatio = eyeHeight / eyeWidth;
          
          // If eyes are too closed or person is looking down, reduce eye contact score
          updatedMetrics.eyeContact = eyeRatio < 0.28 ? 50 : 100;
          updatedMetrics.isLookingAway = eyeRatio < 0.25;
          
          // Head position analysis
          const jawline = landmarks.getJawOutline();
          const faceWidth = Math.abs(jawline[jawline.length - 1].x - jawline[0].x);
          const faceHeight = Math.abs(landmarks.getNose()[0].y - jawline[Math.floor(jawline.length / 2)].y);
          
          // If face width to height ratio changes, head is likely tilted
          const headAspectRatio = faceWidth / faceHeight;
          
          updatedMetrics.headPosition = {
            rotation: (headAspectRatio - 1.3) * 45, // Approximate rotation in degrees
            tilt: 0, // Would need more complex 3D analysis for accurate tilt
          };
          
          // Analyze posture using PoseNet results
          if (pose && pose.keypoints) {
            const shoulders = [
              pose.keypoints.find(kp => kp.part === 'leftShoulder'),
              pose.keypoints.find(kp => kp.part === 'rightShoulder')
            ];
            
            const nose = pose.keypoints.find(kp => kp.part === 'nose');
            
            if (shoulders[0] && shoulders[1] && nose) {
              // Check if shoulders are level
              const shoulderDiff = Math.abs(shoulders[0].position.y - shoulders[1].position.y);
              
              // Check if head is positioned above shoulders
              const shoulderY = (shoulders[0].position.y + shoulders[1].position.y) / 2;
              const noseAboveShouldersDistance = shoulderY - nose.position.y;
              
              // Calculate posture score
              let postureScore = 100;
              
              // If shoulders are not level, reduce score
              if (shoulderDiff > 20) {
                postureScore -= shoulderDiff / 2;
              }
              
              // If head is too far forward or tilted, reduce score
              if (noseAboveShouldersDistance < 50) {
                postureScore -= (50 - noseAboveShouldersDistance);
              }
              
              updatedMetrics.posture = Math.max(0, Math.min(100, postureScore));
              updatedMetrics.isBadPosture = postureScore < 70;
            }
          }
          
          // Calculate fidgeting score based on movement variance
          if (frameHistory.current.length > 10) {
            const movements = [];
            
            for (let i = 1; i < frameHistory.current.length; i++) {
              const prev = frameHistory.current[i - 1];
              const curr = frameHistory.current[i];
              
              // Calculate movement between frames
              const movement = Math.sqrt(
                Math.pow(curr.box.x - prev.box.x, 2) + 
                Math.pow(curr.box.y - prev.box.y, 2)
              );
              
              movements.push(movement);
            }
            
            // Calculate standard deviation of movement
            const avg = movements.reduce((sum, val) => sum + val, 0) / movements.length;
            const variance = movements.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / movements.length;
            const stdDev = Math.sqrt(variance);
            
            // Map standard deviation to fidgeting score (0-100)
            updatedMetrics.isFidgeting = Math.min(100, stdDev * 5);
          }
          
          // Update state and notify parent
          setMetrics(updatedMetrics);
          onMetricsUpdate(updatedMetrics);
          
          // Visualize results
          // const resizedDetections = faceapi.resizeResults(detections, displaySize);
          // canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
          // faceapi.draw.drawDetections(canvas, resizedDetections);
          // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        } else {
          // If no face detected, update in-frame percentage
          const updatedMetrics = {
            ...metrics,
            inFramePercentage: (framesWithFace.current / totalFrames.current) * 100,
            isLookingAway: true,
          };
          
          setMetrics(updatedMetrics);
          onMetricsUpdate(updatedMetrics);
        }
      }
      
      // Continue analysis loop
      animationFrameId = requestAnimationFrame(analyze);
    };
    
    analyze();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [streamActive, isActive, metrics, onMetricsUpdate, cameraFeed]);

  return (
    <div className="relative hidden">
      {!cameraFeed && (
        <video
          ref={videoRef}
          width="640"
          height="480"
          autoPlay
          muted
          playsInline
        />
      )}
      <canvas ref={canvasRef} width="640" height="480" className="absolute top-0 left-0" />
    </div>
  );
};

export default VideoAnalyzer; 