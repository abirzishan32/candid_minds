"use client";

import React from 'react';
import { DFSStep } from './types';
import { AlertTriangle, CheckCircle, Activity, ArrowDownSquare, ArrowUpSquare } from 'lucide-react';

interface AlgorithmExplanationProps {
  currentStep: DFSStep | null;
}

export default function AlgorithmExplanation({
  currentStep
}: AlgorithmExplanationProps) {
  const renderExplanation = () => {
    if (!currentStep) {
      return (
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800">
          <p className="text-gray-600 dark:text-gray-400">
            Click "Start" to begin the visualization or use the step controls.
          </p>
        </div>
      );
    }

    switch (currentStep.state) {
      case 'initial':
        return (
          <div className="p-4 border border-blue-100 dark:border-blue-900 rounded-md bg-blue-50 dark:bg-blue-900/30">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center">
              <Activity size={18} className="mr-2" />
              Initializing DFS
            </h3>
            <p className="mb-2 text-blue-700 dark:text-blue-300">
              Starting DFS traversal from node <span className="font-mono bg-blue-100 dark:bg-blue-800 px-1 rounded">{currentStep.currentNode}</span>
            </p>
            <ul className="list-disc pl-5 text-sm space-y-1 text-blue-600 dark:text-blue-400">
              <li>Mark the starting node as visited</li>
              <li>Push the starting node onto our stack</li>
            </ul>
          </div>
        );
      
      case 'visiting':
        return (
          <div className="p-4 border border-amber-100 dark:border-amber-900 rounded-md bg-amber-50 dark:bg-amber-900/30">
            <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center">
              <ArrowDownSquare size={18} className="mr-2" />
              Processing Node
            </h3>
            <p className="mb-2 text-amber-700 dark:text-amber-300">
              Popped node <span className="font-mono bg-amber-100 dark:bg-amber-800 px-1 rounded">{currentStep.currentNode}</span> from the top of the stack.
            </p>
            <p className="text-sm text-amber-600 dark:text-amber-400">
              We'll explore this node's unvisited neighbors in depth before backtracking.
            </p>
          </div>
        );
      
      case 'processing-neighbors':
        const { source, target } = currentStep.processingEdge || { source: '', target: '' };
        const isAlreadyVisited = currentStep.visited.includes(target);
        
        return (
          <div className={`p-4 border rounded-md ${
            isAlreadyVisited 
              ? "border-purple-100 dark:border-purple-900 bg-purple-50 dark:bg-purple-900/30" 
              : "border-green-100 dark:border-green-900 bg-green-50 dark:bg-green-900/30"
          }`}>
            <h3 className={`font-semibold mb-2 flex items-center ${
              isAlreadyVisited 
                ? "text-purple-800 dark:text-purple-300" 
                : "text-green-800 dark:text-green-300"
            }`}>
              {isAlreadyVisited ? (
                <AlertTriangle size={18} className="mr-2" />
              ) : (
                <ArrowUpSquare size={18} className="mr-2" />
              )}
              Exploring Neighbor
            </h3>
            
            <p className={`mb-2 ${
              isAlreadyVisited 
                ? "text-purple-700 dark:text-purple-300" 
                : "text-green-700 dark:text-green-300"
            }`}>
              Found neighbor <span className="font-mono px-1 rounded bg-opacity-50"
                style={{
                  backgroundColor: isAlreadyVisited 
                    ? "rgba(147, 51, 234, 0.2)" 
                    : "rgba(34, 197, 94, 0.2)"
                }}
              >{target}</span> of current node <span className="font-mono px-1 rounded bg-opacity-50"
                style={{
                  backgroundColor: isAlreadyVisited 
                    ? "rgba(147, 51, 234, 0.2)" 
                    : "rgba(34, 197, 94, 0.2)"
                }}
              >{source}</span>
            </p>
            
            {isAlreadyVisited ? (
              <p className="text-sm text-purple-600 dark:text-purple-400">
                Node <span className="font-mono">{target}</span> has already been visited, so we skip it and continue exploring other neighbors.
              </p>
            ) : (
              <p className="text-sm text-green-600 dark:text-green-400">
                Node <span className="font-mono">{target}</span> hasn't been visited yet. Marking it as visited, pushing it to the stack, and immediately exploring it.
              </p>
            )}
          </div>
        );
      
      case 'backtracking':
        return (
          <div className="p-4 border border-orange-100 dark:border-orange-900 rounded-md bg-orange-50 dark:bg-orange-900/30">
            <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              Backtracking
            </h3>
            <p className="mb-2 text-orange-700 dark:text-orange-300">
              All neighbors of node <span className="font-mono bg-orange-100 dark:bg-orange-800 px-1 rounded">{currentStep.currentNode}</span> have been visited.
            </p>
            <p className="text-sm text-orange-600 dark:text-orange-400">
              We're backtracking to the previous node in our traversal path to explore any remaining unvisited neighbors there.
            </p>
          </div>
        );
      
      case 'complete':
        return (
          <div className="p-4 border border-green-100 dark:border-green-900 rounded-md bg-green-50 dark:bg-green-900/30">
            <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center">
              <CheckCircle size={18} className="mr-2" />
              DFS Complete
            </h3>
            <p className="mb-2 text-green-700 dark:text-green-300">
              DFS traversal is complete! We have visited all nodes reachable from the starting node.
            </p>
            <div className="text-sm text-green-600 dark:text-green-400">
              <p className="font-medium mb-1">Final visited order:</p>
              <div className="flex flex-wrap gap-1">
                {currentStep.visited.map((node, index) => (
                  <span key={node} className="px-2 py-0.5 bg-green-100 dark:bg-green-800 rounded-full font-mono text-xs">
                    {index+1}. {node}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      
      default:
        return <p>Processing algorithm...</p>;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3">
      <h2 className="text-lg font-semibold mb-2">Depth-First Search (DFS)</h2>
      
      {/* Current state explanation - Made more compact */}
      {currentStep && (
        <div className="mb-3">
          {renderExplanation()}
        </div>
      )}
      
      {/* Current state panel - Compact layout with flexible height */}
      <div className="mb-3">
        <h3 className="text-sm font-semibold mb-1">Current State</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <div className="font-medium">Current Node</div>
            <div>{currentStep?.currentNode || 'None'}</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <div className="font-medium">Stack</div>
            <div className="truncate">
              {currentStep?.stack?.length > 0 ? currentStep.stack.join(', ') : 'Empty'}
            </div>
          </div>
          <div className="col-span-2 bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <div className="font-medium">Visited</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {currentStep?.visited?.map(node => (
                <span key={node} className="inline-block px-1.5 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded">
                  {node}
                </span>
              ))}
              {(!currentStep?.visited || currentStep.visited.length === 0) && "None"}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabbed content to save space */}
      <div className="border-t dark:border-gray-700 pt-2">
        <details className="group">
          <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold">
            <span>Algorithm Overview</span>
            <svg className="w-5 h-5 transition-transform group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </summary>
          
          <div className="pt-2 text-xs">
            <pre className="bg-gray-100 dark:bg-gray-900 p-2 rounded-md font-mono overflow-x-auto text-xs">
{`function DFS(graph, start):
  stack = [start]
  visited = {start}
  
  while stack not empty:
    current = stack.pop()
    // Process current node
    
    for neighbor of graph[current]:
      if neighbor not in visited:
        visited.add(neighbor)
        stack.push(neighbor)
        // Immediately explore this path`}
            </pre>
          </div>
        </details>
        
        <details className="group mt-2">
          <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold">
            <span>DFS Properties</span>
            <svg className="w-5 h-5 transition-transform group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </summary>
          
          <div className="pt-2">
            <ul className="list-disc pl-4 space-y-0.5 text-xs">
              <li><strong>Time:</strong> O(V + E)</li>
              <li><strong>Space:</strong> O(V)</li>
              <li><strong>Complete:</strong> Yes (finds all reachable vertices)</li>
              <li><strong>Path:</strong> Not guaranteed to find shortest path</li>
              <li><strong>Applications:</strong> Topological sorting, cycle detection, pathfinding in mazes</li>
            </ul>
          </div>
        </details>

        <details className="group mt-2">
          <summary className="flex items-center justify-between cursor-pointer text-sm font-semibold">
            <span>BFS vs DFS</span>
            <svg className="w-5 h-5 transition-transform group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </summary>
          
          <div className="pt-2">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  <th className="p-1 border dark:border-gray-600 text-left">Feature</th>
                  <th className="p-1 border dark:border-gray-600 text-left">BFS</th>
                  <th className="p-1 border dark:border-gray-600 text-left">DFS</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-1 border dark:border-gray-600">Data Structure</td>
                  <td className="p-1 border dark:border-gray-600">Queue</td>
                  <td className="p-1 border dark:border-gray-600">Stack</td>
                </tr>
                <tr>
                  <td className="p-1 border dark:border-gray-600">Traversal</td>
                  <td className="p-1 border dark:border-gray-600">Level by level</td>
                  <td className="p-1 border dark:border-gray-600">Path by path</td>
                </tr>
                <tr>
                  <td className="p-1 border dark:border-gray-600">Shortest Path</td>
                  <td className="p-1 border dark:border-gray-600">Guaranteed</td>
                  <td className="p-1 border dark:border-gray-600">Not guaranteed</td>
                </tr>
                <tr>
                  <td className="p-1 border dark:border-gray-600">Memory</td>
                  <td className="p-1 border dark:border-gray-600">More (all neighbors)</td>
                  <td className="p-1 border dark:border-gray-600">Less (one path)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </div>
  );
}