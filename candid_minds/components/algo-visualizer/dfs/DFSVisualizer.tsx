"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Graph from 'graphology';
import GraphVisualization from './GraphVisualization';
import GraphControls from './GraphControls';
import Stack from './Stack';
import AlgorithmExplanation from './AlgorithmExplanation';
import { DFSStep } from './types';
import { generateTeachingGraph, generateRandomGraph } from '@/lib/graph-algorithm/graph-generator';
import { generateDFSSteps } from '@/lib/graph-algorithm/dfs';

export default function DFSVisualizer() {
  const [graph, setGraph] = useState<Graph>(() => generateTeachingGraph());
  const [startNode, setStartNode] = useState<string>('A');
  const [steps, setSteps] = useState<DFSStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1000); // 1x speed (1000ms)
  const [animationTimer, setAnimationTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Generate DFS steps whenever the graph or start node changes
  useEffect(() => {
    try {
      if (graph && graph.hasNode(startNode)) {
        const dfsSteps = generateDFSSteps(graph, startNode);
        setSteps(dfsSteps);
        setCurrentStepIndex(0);
      }
    } catch (error) {
      console.error("Error generating DFS steps:", error);
    }
  }, [graph, startNode]);
  
  // Clean up animation timer when component unmounts
  useEffect(() => {
    return () => {
      if (animationTimer) {
        clearTimeout(animationTimer);
      }
    };
  }, [animationTimer]);
  
  const handleStart = useCallback(() => {
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
    }
    
    setIsRunning(true);
    
    const runStep = () => {
      setCurrentStepIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        
        if (nextIndex >= steps.length - 1) {
          setIsRunning(false);
          return steps.length - 1;
        }
        
        const timer = setTimeout(runStep, speed);
        setAnimationTimer(timer);
        
        return nextIndex;
      });
    };
    
    runStep();
  }, [currentStepIndex, steps, speed]);
  
  const handlePause = useCallback(() => {
    if (animationTimer) {
      clearTimeout(animationTimer);
      setAnimationTimer(null);
    }
    setIsRunning(false);
  }, [animationTimer]);
  
  const handleReset = useCallback(() => {
    if (animationTimer) {
      clearTimeout(animationTimer);
      setAnimationTimer(null);
    }
    setIsRunning(false);
    setCurrentStepIndex(0);
  }, [animationTimer]);
  
  const handleStepForward = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prevIndex => prevIndex + 1);
    }
  }, [currentStepIndex, steps]);
  
  const handleStepBackward = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prevIndex => prevIndex - 1);
    }
  }, [currentStepIndex]);
  
  const currentStep = steps[currentStepIndex] || null;
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Depth-First Search Visualization</h1>
          <p className="text-muted-foreground">
            Explore how DFS traverses a graph by going as deep as possible along each path before backtracking.
          </p>
        </div>
        
        {/* Improved layout with fixed heights and better spacing */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main visualization area */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Graph visualization with fixed height */}
            <div 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700"
              style={{ height: "500px", position: "relative", overflow: "hidden" }}
            >
              <GraphVisualization 
                graph={graph} 
                currentStep={currentStep} 
                isRunning={isRunning} 
              />
            </div>
            
            {/* Stack visualization with controlled height */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border dark:border-gray-700">
              <Stack
                items={currentStep?.stack || []}
                currentNode={currentStep?.currentNode || ''}
              />
            </div>
          </div>
          
          {/* Right sidebar for controls and explanation */}
          <div className="flex flex-col gap-5">
            {/* Controls panel */}
            <GraphControls
              graph={graph}
              onGraphChange={setGraph}
              onStartNodeChange={setStartNode}
              onStart={handleStart}
              onPause={handlePause}
              onReset={handleReset}
              onStepForward={handleStepForward}
              onStepBackward={handleStepBackward}
              onSpeedChange={setSpeed}
              selectedStartNode={startNode}
              isRunning={isRunning}
              currentStepIndex={currentStepIndex}
              totalSteps={steps.length}
              speed={speed}
            />
            
            {/* Algorithm explanation with controlled height */}
            <div className="flex-grow overflow-auto">
              <AlgorithmExplanation currentStep={currentStep} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}