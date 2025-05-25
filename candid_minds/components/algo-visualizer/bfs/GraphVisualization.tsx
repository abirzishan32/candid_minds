"use client";

import { useEffect, useRef } from 'react';
import { BFSStep, GraphData } from './types';
import Sigma from 'sigma';
import Graph from 'graphology';

interface GraphVisualizationProps {
  graph: Graph;
  currentStep: BFSStep | null;
  isRunning: boolean;
}

export default function GraphVisualization({
  graph,
  currentStep,
  isRunning
}: GraphVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const graphRef = useRef<Graph | null>(null);
  
  // Initialize and clean up Sigma
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clone the graph to avoid modifying the original
    graphRef.current = graph.copy();

    // Create Sigma instance
    sigmaRef.current = new Sigma(graphRef.current, containerRef.current, {
      renderEdgeLabels: true,
      allowInvalidContainer: true
    });
    
    // Clean up
    return () => {
      if (sigmaRef.current) {
        sigmaRef.current.kill();
        sigmaRef.current = null;
      }
    };
  }, [graph]);
  
  // Update the graph based on current step
  useEffect(() => {
    if (!graphRef.current || !sigmaRef.current || !currentStep) return;
    
    // Reset all nodes and edges to default state
    graphRef.current.forEachNode((node, attributes) => {
      graphRef.current?.setNodeAttribute(node, "color", "#6366F1");
    });
    
    graphRef.current.forEachEdge((edge, attributes, source, target) => {
      graphRef.current?.setEdgeAttribute(edge, "color", "#CBD5E1");
    });
    
    // Highlight current node
    if (currentStep.currentNode) {
      graphRef.current.setNodeAttribute(currentStep.currentNode, "color", "#EF4444"); // Current node (red)
      graphRef.current.setNodeAttribute(currentStep.currentNode, "size", 15); // Make current node larger
    }
    
    // Highlight visited nodes
    currentStep.visited.forEach(nodeId => {
      if (nodeId !== currentStep.currentNode) {
        graphRef.current?.setNodeAttribute(nodeId, "color", "#10B981"); // Visited nodes (green)
      }
    });
    
    // Highlight queue nodes
    currentStep.queue.forEach(nodeId => {
      if (!currentStep.visited.includes(nodeId)) {
        graphRef.current?.setNodeAttribute(nodeId, "color", "#F59E0B"); // Queued nodes (yellow)
      }
    });
    
    // Highlight processing edge
    if (currentStep.processingEdge) {
      const { source, target } = currentStep.processingEdge;
      
      // Find the edge between the nodes (could be in either direction)
      try {
        const edgeId = graphRef.current.edge(source, target);
        graphRef.current.setEdgeAttribute(edgeId, "color", "#3B82F6"); // Processing edge (blue)
        graphRef.current.setEdgeAttribute(edgeId, "size", 3); // Make it thicker
      } catch (e) {
        // Edge might not exist
      }
    }
    
    // Refresh the renderer
    sigmaRef.current.refresh();
    
  }, [currentStep]);
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Graph Visualization</h2>
        
        {/* Move the status text to the right side of the header */}
        <div className="text-xs">
          {currentStep && (
            <>
              {currentStep.state === 'initial' && "Starting BFS traversal..."}
              {currentStep.state === 'visiting' && `Visiting node ${currentStep.currentNode}`}
              {currentStep.state === 'processing-neighbors' && 
                (currentStep.processingEdge 
                  ? `Adding node ${currentStep.processingEdge.target} to queue` 
                  : `Processing neighbors of node ${currentStep.currentNode}`)
              }
              {currentStep.state === 'complete' && "BFS traversal complete!"}
            </>
          )}
        </div>
      </div>
      
      {/* Color legend, now in a horizontal single row */}
      <div className="mb-2">
        <div className="flex flex-wrap gap-3 justify-start">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#6366F1] mr-1 rounded-full"></div>
            <span className="text-xs">Unvisited</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#EF4444] mr-1 rounded-full"></div>
            <span className="text-xs">Current</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#10B981] mr-1 rounded-full"></div>
            <span className="text-xs">Visited</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#F59E0B] mr-1 rounded-full"></div>
            <span className="text-xs">In Queue</span>
          </div>
        </div>
      </div>
      
      {/* Graph container - reduced height */}
      <div 
        ref={containerRef} 
        className="w-full h-[400px] border border-gray-200 dark:border-gray-700 rounded-lg"
      />
    </div>
  );
}