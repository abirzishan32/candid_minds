"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  opacity: number;
}

interface DataStream {
  x: number;
  y: number;
  speed: number;
  width: number;
  opacity: number;
  color: string;
}

interface LoadingAnimationProps {
  progress?: number;
  stage?: string;
  stageDescription?: string;
}

export function LoadingAnimation({ 
  progress = 0, 
  stage = "starting", 
  stageDescription = "Initializing..." 
}: LoadingAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const dataStreamsRef = useRef<DataStream[]>([]);
  const [animationTime, setAnimationTime] = useState(0);

  // Map stages to phase indices and get appropriate messages
  const getPhaseFromStage = (stage: string): number => {
    switch (stage) {
      case "starting":
      case "analysis_complete":
        return 0;
      case "code_generated":
      case "code_sanitized":
        return 1;
      case "render_complete":
      default:
        return 2;
    }
  };

  const getPhaseMessages = (stage: string): string[] => {
    switch (stage) {
      case "starting":
        return ["Initializing AI system...", "⚡", "Starting up..."];
      case "analysis_complete":
        return ["Analyzing your concept...", "🧠", "Understanding requirements..."];
      case "code_generated":
        return ["Generating visualization code...", "⚡", "Writing Manim code..."];
      case "code_sanitized":
        return ["Optimizing and validating...", "🔧", "Securing code execution..."];
      case "render_complete":
        return ["Rendering video frames...", "🎬", "Creating final animation..."];
      default:
        return ["Processing...", "⚙️", "Working on your request..."];
    }
  };

  const phase = getPhaseFromStage(stage);
  const [phaseMessage, phaseIcon, phaseSubtext] = getPhaseMessages(stage);

  // Use provided stageDescription if available, otherwise fall back to our mapping
  const displayMessage = stageDescription !== "Initializing..." ? stageDescription : phaseMessage;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < 50; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width / window.devicePixelRatio,
          y: Math.random() * canvas.height / window.devicePixelRatio,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: Math.random() * 100,
          maxLife: 100,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.5 + 0.2
        });
      }
    };

    // Initialize data streams
    const initDataStreams = () => {
      dataStreamsRef.current = [];
      for (let i = 0; i < 15; i++) {
        dataStreamsRef.current.push({
          x: Math.random() * canvas.width / window.devicePixelRatio,
          y: -50,
          speed: Math.random() * 3 + 2,
          width: Math.random() * 3 + 1,
          opacity: Math.random() * 0.7 + 0.3,
          color: Math.random() > 0.5 ? '#8B5CF6' : '#3B82F6'
        });
      }
    };

    initParticles();
    initDataStreams();

    // Animation loop
    const animate = (time: number) => {
      setAnimationTime(time);
      
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // Draw grid background
      drawGrid(ctx, width, height, time);

      // Draw particles
      drawParticles(ctx, time, width, height);

      // Draw data streams
      drawDataStreams(ctx, height);

      // Draw central hub
      drawCentralHub(ctx, width / 2, height / 2, time);

      // Draw neural connections
      drawNeuralConnections(ctx, width, height, time);

      // Draw video frame visualization
      drawVideoFrames(ctx, width, height, time);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', setCanvasSize);
    };
  }, []);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const gridSize = 30;
    const opacity = 0.1 + Math.sin(time * 0.001) * 0.05;
    
    ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
    ctx.lineWidth = 0.5;
    ctx.setLineDash([2, 4]);

    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  };

  const drawParticles = (ctx: CanvasRenderingContext2D, time: number, width: number, height: number) => {
    particlesRef.current.forEach((particle, index) => {
      particle.life += 1;
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Boundary check and reset
      if (particle.life >= particle.maxLife || particle.x < 0 || particle.x > width || particle.y < 0 || particle.y > height) {
        particle.life = 0;
        particle.x = Math.random() * width;
        particle.y = Math.random() * height;
      }

      const lifeRatio = particle.life / particle.maxLife;
      const opacity = particle.opacity * (1 - lifeRatio) * (0.7 + Math.sin(time * 0.005 + index) * 0.3);

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 3
      );
      gradient.addColorStop(0, `rgba(139, 92, 246, ${opacity})`);
      gradient.addColorStop(1, `rgba(139, 92, 246, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.fill();
    });
  };

  const drawDataStreams = (ctx: CanvasRenderingContext2D, height: number) => {
    dataStreamsRef.current.forEach(stream => {
      stream.y += stream.speed;

      if (stream.y > height + 50) {
        stream.y = -50;
        stream.x = Math.random() * ctx.canvas.width / window.devicePixelRatio;
      }

      // Draw binary code stream
      ctx.fillStyle = stream.color;
      ctx.font = '10px monospace';
      ctx.globalAlpha = stream.opacity;
      
      const binaryString = Math.random().toString(2).substr(2, 8);
      ctx.fillText(binaryString, stream.x, stream.y);
      
      ctx.globalAlpha = 1;
    });
  };

  const drawCentralHub = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number) => {
    const baseRadius = 40;
    const pulseRadius = baseRadius + Math.sin(time * 0.003) * 10;

    // Outer glow
    const outerGlow = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, pulseRadius * 2
    );
    outerGlow.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
    outerGlow.addColorStop(0.5, 'rgba(59, 130, 246, 0.2)');
    outerGlow.addColorStop(1, 'rgba(139, 92, 246, 0)');

    ctx.fillStyle = outerGlow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Main hub with progress-based intensity
    const intensity = Math.max(0.3, progress / 100);
    const mainGradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, pulseRadius
    );
    mainGradient.addColorStop(0, `rgba(139, 92, 246, ${0.8 * intensity})`);
    mainGradient.addColorStop(0.7, `rgba(59, 130, 246, ${0.6 * intensity})`);
    mainGradient.addColorStop(1, `rgba(139, 92, 246, ${0.2 * intensity})`);

    ctx.fillStyle = mainGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
    ctx.fill();

    // Inner core
    ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * intensity})`;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
    ctx.fill();

    // Rotating rings with progress-based speed
    const speedMultiplier = 1 + (progress / 100);
    for (let i = 0; i < 3; i++) {
      const ringRadius = pulseRadius + 20 + i * 15;
      const rotation = time * 0.001 * (i + 1) * (i % 2 === 0 ? 1 : -1) * speedMultiplier;

      ctx.strokeStyle = `rgba(139, 92, 246, ${(0.4 - i * 0.1) * intensity})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 10]);

      ctx.beginPath();
      ctx.arc(centerX, centerY, ringRadius, rotation, rotation + Math.PI * 1.5);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  };

  const drawNeuralConnections = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const nodeCount = 8;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 120;

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2 + time * 0.0005;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      // Draw connection to center with progress-based opacity
      const baseOpacity = 0.3 + Math.sin(time * 0.002 + i) * 0.2;
      const progressOpacity = baseOpacity * Math.max(0.3, progress / 100);
      
      const gradient = ctx.createLinearGradient(centerX, centerY, x, y);
      gradient.addColorStop(0, `rgba(139, 92, 246, ${progressOpacity})`);
      gradient.addColorStop(1, `rgba(59, 130, 246, 0)`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();

      // Draw node
      const nodeGradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
      nodeGradient.addColorStop(0, `rgba(139, 92, 246, ${0.8 * Math.max(0.3, progress / 100)})`);
      nodeGradient.addColorStop(1, `rgba(139, 92, 246, 0)`);

      ctx.fillStyle = nodeGradient;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.setLineDash([]);
  };

  const drawVideoFrames = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const frameCount = 5;
    const frameWidth = 40;
    const frameHeight = 25;
    const startX = width / 2 - (frameCount * frameWidth) / 2;
    const startY = height - 100;

    for (let i = 0; i < frameCount; i++) {
      const x = startX + i * (frameWidth + 10);
      const y = startY + Math.sin(time * 0.003 + i * 0.5) * 5;
      
      // Use actual progress instead of simulated
      const frameProgress = (progress / 100) * frameCount;
      const isActive = i < frameProgress;
      const opacity = isActive ? 0.8 : 0.3;

      // Frame border
      ctx.strokeStyle = `rgba(139, 92, 246, ${opacity})`;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, frameWidth, frameHeight);

      // Frame content (simulated)
      if (isActive) {
        ctx.fillStyle = `rgba(139, 92, 246, ${opacity * 0.3})`;
        ctx.fillRect(x + 2, y + 2, frameWidth - 4, frameHeight - 4);

        // Scanning line effect
        const scanY = y + (time * 0.1) % frameHeight;
        ctx.strokeStyle = `rgba(255, 255, 255, 0.6)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, scanY);
        ctx.lineTo(x + frameWidth, scanY);
        ctx.stroke();
      }
    }
  };

  // Map stage to status indicators
  const getStatusSteps = (currentStage: string) => {
    const steps = [
      { name: 'Analysis', stages: ['starting', 'analysis_complete'] },
      { name: 'Video Generation', stages: ['code_generated'] },
      { name: 'Rendering', stages: ['code_sanitized', 'render_complete'] }
    ];

    return steps.map((step, index) => {
      const isActive = step.stages.includes(currentStage);
      const isCompleted = steps.slice(0, index).some(prevStep => 
        prevStep.stages.some(stageInStep => {
          const stageOrder = ['starting', 'analysis_complete', 'code_generated', 'code_sanitized', 'render_complete'];
          const currentIndex = stageOrder.indexOf(currentStage);
          const stepIndex = stageOrder.indexOf(stageInStep);
          return stepIndex < currentIndex;
        })
      );
      
      return {
        ...step,
        isActive,
        isCompleted
      };
    });
  };

  const statusSteps = getStatusSteps(stage);

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-20">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ filter: 'contrast(1.1) saturate(1.2)' }}
      />
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Main loading interface - Fixed dimensions */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/70 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 w-[420px] h-[480px] mx-4 flex flex-col"
        >
          {/* Header - Fixed height container */}
          <div className="text-center mb-6 h-[100px] flex flex-col justify-center">
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl mb-2"
            >
              {phaseIcon}
            </motion.div>
            <div className="h-[32px] flex items-center justify-center">
              <motion.h3
                key={stage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent text-center leading-tight"
              >
                {displayMessage}
              </motion.h3>
            </div>
          </div>

          {/* Progress bar - Fixed height */}
          <div className="mb-6 h-[60px] flex flex-col justify-between">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>Progress</span>
              <span>{Math.round(Math.max(0, progress))}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full relative"
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(0, progress)}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </motion.div>
            </div>
          </div>

          {/* Status indicators - Fixed height */}
          <div className="space-y-3 h-[120px] flex flex-col justify-between">
            {statusSteps.map((step, index) => (
              <motion.div
                key={step.name}
                className="flex items-center gap-3 h-[32px]"
                initial={{ opacity: 0.5 }}
                animate={{ 
                  opacity: step.isActive || step.isCompleted ? 1 : 0.5,
                  x: step.isActive ? [0, 5, 0] : 0
                }}
                transition={{ 
                  x: { duration: 1, repeat: Infinity },
                  opacity: { duration: 0.3 }
                }}
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  step.isCompleted ? 'bg-green-400' : 
                  step.isActive ? 'bg-purple-400 animate-pulse' : 
                  'bg-gray-600'
                }`} />
                <span className={`text-sm flex-1 ${
                  step.isActive || step.isCompleted ? 'text-white' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  {step.isActive && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full"
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Technical readout - Fixed height */}
          <div className="mt-6 flex-1 flex flex-col">
            <div className="flex-1 p-3 bg-gray-900/50 rounded-lg border border-gray-700 min-h-0">
              <div className="text-xs font-mono text-green-400 space-y-1 h-full flex flex-col justify-center">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-4 flex items-center"
                >
                  &gt; {stage === 'starting' ? 'Initializing systems...' : 
                       stage === 'analysis_complete' ? 'Neural analysis complete...' :
                       stage === 'code_generated' ? 'Code generation successful...' :
                       stage === 'code_sanitized' ? 'Security validation passed...' :
                       'Rendering in progress...'}
                </motion.div>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="h-4 flex items-center"
                >
                  &gt; Progress: {Math.round(Math.max(0, progress))}% complete
                </motion.div>
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="h-4 flex items-center"
                >
                  &gt; {phaseSubtext}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Floating elements */}
        <AnimatePresence>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-400 rounded-full"
              initial={{ 
                x: Math.random() * 400 - 200,
                y: Math.random() * 400 - 200,
                opacity: 0 
              }}
              animate={{ 
                x: Math.random() * 400 - 200,
                y: Math.random() * 400 - 200,
                opacity: [0, 1, 0],
                scale: [1, 2, 1]
              }}
              transition={{ 
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.5
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}