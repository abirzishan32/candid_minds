"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SystemDesignInput } from "@/components/system-design/SystemDesignInput";
import { DiagramViewer } from "@/components/system-design/DiagramViewer";
import { LoadingDiagram } from "@/components/system-design/LoadingDiagram";

interface DiagramData {
  id: string;
  prompt: string;
  plantUML: string;
  diagramUrl: string;
  explanation: string;
  timestamp: Date;
  versions?: any[];
}

export default function SystemDesignPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentDiagram, setCurrentDiagram] = useState<DiagramData | null>(null);
  const [diagramHistory, setDiagramHistory] = useState<DiagramData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateDiagram = async (prompt: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/system-design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate diagram');
      }

      const data = await response.json();
      
      const newDiagram: DiagramData = {
        id: Date.now().toString(),
        prompt,
        plantUML: data.plantUML,
        diagramUrl: data.diagramUrl,
        explanation: data.explanation,
        timestamp: new Date(),
        versions: []
      };

      setCurrentDiagram(newDiagram);
      setDiagramHistory(prev => [newDiagram, ...prev.slice(0, 9)]);
    } catch (error) {
      console.error('Error generating diagram:', error);
      setError('Failed to generate system design diagram. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFromHistory = (diagram: DiagramData) => {
    setCurrentDiagram(diagram);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
            System Design Generator
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Transform your system design ideas into visual diagrams using AI-powered PlantUML generation.
            Switch to interactive mode for advanced editing and version control.
          </p>
        </motion.div>

        {/* Input Section */}
        <div className="mb-8">
          <SystemDesignInput 
            onSubmit={handleGenerateDiagram} 
            isLoading={isLoading} 
          />
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg"
          >
            <p className="text-red-400 text-center">{error}</p>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Diagram Viewer */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <LoadingDiagram />
            ) : currentDiagram ? (
              <DiagramViewer diagram={currentDiagram} />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-96 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">🏗️</div>
                  <h3 className="text-xl text-gray-400 mb-2">No Diagram Yet</h3>
                  <p className="text-gray-500">Enter a system design prompt to get started</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Try: "Design a video streaming platform like YouTube"
                  </p>
                </div>
              </motion.div>
            )}
          </div>

         
        </div>
      </div>
    </div>
  );
}