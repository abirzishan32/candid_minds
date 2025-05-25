"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Graph from 'graphology';
import GraphVisualization from './GraphVisualization';
import GraphControls from './GraphControls';
import Queue from './Queue';
import AlgorithmExplanation from './AlgorithmExplanation';
import { BFSStep } from './types';
import { generateTeachingGraph } from '@/lib/graph-algorithm/graph-generator';
import { generateBFSSteps } from '@/lib/graph-algorithm/bfs';

export default function BFSVisualizer() {
    const [graph, setGraph] = useState<Graph>(() => generateTeachingGraph());
    const [startNode, setStartNode] = useState<string>('A');
    const [steps, setSteps] = useState<BFSStep[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [speed, setSpeed] = useState<number>(1000); // 1x speed (1000ms)
    const [animationTimer, setAnimationTimer] = useState<NodeJS.Timeout | null>(null);

    // Generate BFS steps whenever the graph or start node changes
    useEffect(() => {
        try {
            if (graph && graph.hasNode(startNode)) {
                const bfsSteps = generateBFSSteps(graph, startNode);
                setSteps(bfsSteps);
                setCurrentStepIndex(0);
            }
        } catch (error) {
            console.error("Error generating BFS steps:", error);
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
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Breadth-First Search Visualization</h1>
                    <p className="text-lg text-muted-foreground">
                        Explore how BFS traverses a graph level by level, finding all vertices reachable from the source.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main graph visualization area - takes 2/3 of the space on large screens */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Graph visualization */}
                        <div
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700 relative"
                            style={{ height: "500px", overflow: "hidden" }}
                        >
                            <GraphVisualization
                                graph={graph}
                                currentStep={currentStep}
                                isRunning={isRunning}
                            />
                        </div>

                        {/* Queue visualization */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 border dark:border-gray-700">
                            <h2 className="text-xl font-bold mb-4">Queue</h2>
                            <Queue
                                items={currentStep?.queue || []}
                                currentNode={currentStep?.currentNode || ''}
                            />
                        </div>
                    </div>

                    {/* Right sidebar for controls and explanation - takes 1/3 of the space */}
                    <div className="space-y-6">
                        {/* Controls */}
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

                        {/* Algorithm explanation */}
                        <AlgorithmExplanation currentStep={currentStep} />
                    </div>
                </div>
            </div>
        </div>
    );
}