"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingDiagramProps {
  progress?: number;
  stage?: string;
  stageDescription?: string;
}

export function LoadingDiagram({ 
  progress = 0, 
  stage = "starting", 
  stageDescription = "Initializing..." 
}: LoadingDiagramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(null);
  const [animationTime, setAnimationTime] = useState(0);

  // Map stages to phase indices and get appropriate messages
  const getPhaseFromStage = (stage: string): number => {
    switch (stage) {
      case "starting":
      case "requirements_analyzed":
        return 0;
      case "plantuml_generated":
        return 1;
      case "explanation_generated":
        return 2;
      case "diagram_complete":
      default:
        return 3;
    }
  };

  const getPhaseMessages = (stage: string): string[] => {
    switch (stage) {
      case "starting":
        return ["Initializing system design...", "🚀", "Starting analysis..."];
      case "requirements_analyzed":
        return ["Analyzing requirements...", "🧠", "Understanding architecture needs..."];
      case "plantuml_generated":
        return ["Generating PlantUML diagram...", "📊", "Creating visual representation..."];
      case "explanation_generated":
        return ["Creating documentation...", "📝", "Writing technical explanation..."];
      case "diagram_complete":
        return ["Finalizing design...", "✅", "System design complete!"];
      default:
        return ["Processing...", "⚙️", "Working on your design..."];
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

    // Animation loop
    const animate = (time: number) => {
      setAnimationTime(time);
      
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // Draw animated architecture components
      drawArchitectureAnimation(ctx, width, height, time);

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

  const drawArchitectureAnimation = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Draw animated grid
    drawAnimatedGrid(ctx, width, height, time);
    
    // Draw system components
    drawSystemComponents(ctx, centerX, centerY, time);
    
    // Draw data flow animations
    drawDataFlowAnimation(ctx, width, height, time);
  };

  const drawAnimatedGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const gridSize = 40;
    const opacity = 0.1 + Math.sin(time * 0.001) * 0.05;
    
    ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 6]);

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

  const drawSystemComponents = (ctx: CanvasRenderingContext2D, centerX: number, centerY: number, time: number) => {
    const components = [
      { x: centerX - 120, y: centerY - 80, size: 60, type: 'frontend' },
      { x: centerX, y: centerY, size: 80, type: 'api' },
      { x: centerX + 120, y: centerY - 80, size: 60, type: 'service' },
      { x: centerX - 80, y: centerY + 100, size: 50, type: 'database' },
      { x: centerX + 80, y: centerY + 100, size: 50, type: 'cache' },
    ];

    components.forEach((comp, index) => {
      const pulse = 1 + Math.sin(time * 0.003 + index * 0.5) * 0.1;
      const size = comp.size * pulse;
      
      // Component glow based on progress
      const intensity = Math.max(0.3, (progress / 100) * (index + 1) / components.length);
      
      const gradient = ctx.createRadialGradient(
        comp.x, comp.y, 0,
        comp.x, comp.y, size
      );
      
      switch (comp.type) {
        case 'frontend':
          gradient.addColorStop(0, `rgba(59, 130, 246, ${intensity})`);
          gradient.addColorStop(1, `rgba(59, 130, 246, 0)`);
          break;
        case 'api':
          gradient.addColorStop(0, `rgba(139, 92, 246, ${intensity})`);
          gradient.addColorStop(1, `rgba(139, 92, 246, 0)`);
          break;
        case 'service':
          gradient.addColorStop(0, `rgba(34, 197, 94, ${intensity})`);
          gradient.addColorStop(1, `rgba(34, 197, 94, 0)`);
          break;
        case 'database':
          gradient.addColorStop(0, `rgba(245, 158, 11, ${intensity})`);
          gradient.addColorStop(1, `rgba(245, 158, 11, 0)`);
          break;
        case 'cache':
          gradient.addColorStop(0, `rgba(239, 68, 68, ${intensity})`);
          gradient.addColorStop(1, `rgba(239, 68, 68, 0)`);
          break;
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(comp.x, comp.y, size / 2, 0, Math.PI * 2);
      ctx.fill();

      // Component border
      ctx.strokeStyle = `rgba(255, 255, 255, ${intensity * 0.8})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(comp.x, comp.y, size / 3, 0, Math.PI * 2);
      ctx.stroke();
    });
  };

  const drawDataFlowAnimation = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const flowProgress = (time * 0.002) % 1;
    const opacity = Math.max(0.3, progress / 100);
    
    // Draw animated data flow paths
    const paths = [
      { start: { x: width / 2 - 120, y: height / 2 - 80 }, end: { x: width / 2, y: height / 2 } },
      { start: { x: width / 2, y: height / 2 }, end: { x: width / 2 + 120, y: height / 2 - 80 } },
      { start: { x: width / 2, y: height / 2 }, end: { x: width / 2 - 80, y: height / 2 + 100 } },
      { start: { x: width / 2, y: height / 2 }, end: { x: width / 2 + 80, y: height / 2 + 100 } },
    ];

    paths.forEach((path, index) => {
      const pathProgress = (flowProgress + index * 0.25) % 1;
      const x = path.start.x + (path.end.x - path.start.x) * pathProgress;
      const y = path.start.y + (path.end.y - path.start.y) * pathProgress;

      // Draw flowing data packets
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
      gradient.addColorStop(0, `rgba(59, 130, 246, ${opacity})`);
      gradient.addColorStop(1, `rgba(59, 130, 246, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  // Map stage to status indicators
  const getStatusSteps = (currentStage: string) => {
    const steps = [
      { name: 'Requirements Analysis', stages: ['starting', 'requirements_analyzed'] },
      { name: 'PlantUML Generation', stages: ['plantuml_generated'] },
      { name: 'Documentation', stages: ['explanation_generated'] },
      { name: 'Finalization', stages: ['diagram_complete'] }
    ];

    return steps.map((step, index) => {
      const isActive = step.stages.includes(currentStage);
      const isCompleted = steps.slice(0, index).some(prevStep => 
        prevStep.stages.some(stageInStep => {
          const stageOrder = ['starting', 'requirements_analyzed', 'plantuml_generated', 'explanation_generated', 'diagram_complete'];
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
          className="bg-black/70 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-8 w-[420px] h-[480px] mx-4 flex flex-col"
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
                className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-center leading-tight"
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
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full relative"
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
                className="flex items-center gap-3 h-[24px]"
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
                  step.isActive ? 'bg-blue-400 animate-pulse' : 
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
                      className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"
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
                  &gt; {stage === 'starting' ? 'Initializing architecture engine...' : 
                       stage === 'requirements_analyzed' ? 'Requirements analysis complete...' :
                       stage === 'plantuml_generated' ? 'PlantUML diagram generated...' :
                       stage === 'explanation_generated' ? 'Documentation created...' :
                       'System design finalized...'}
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
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
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