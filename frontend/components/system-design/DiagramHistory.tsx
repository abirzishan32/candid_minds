"use client";

import { motion } from "framer-motion";
import { Clock, Trash2 } from "lucide-react";

interface DiagramData {
  id: string;
  prompt: string;
  plantUML: string;
  diagramUrl: string;
  explanation: string;
  timestamp: Date;
}

interface DiagramHistoryProps {
  history: DiagramData[];
  onSelect: (diagram: DiagramData) => void;
  currentDiagramId?: string;
}

export function DiagramHistory({ history, onSelect, currentDiagramId }: DiagramHistoryProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="border-b border-gray-700 p-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-white">Recent Diagrams</h3>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {history.length} diagram{history.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* History List */}
      <div className="max-h-96 overflow-y-auto">
        {history.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-sm">No diagrams yet</p>
            <p className="text-xs">Generate your first system design!</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {history.map((diagram, index) => (
              <motion.button
                key={diagram.id}
                onClick={() => onSelect(diagram)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 hover:bg-gray-700/50 ${
                  diagram.id === currentDiagramId 
                    ? 'bg-blue-600/20 border border-blue-500/50' 
                    : 'hover:bg-gray-800/50'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="space-y-2">
                  {/* Prompt preview */}
                  <p className="text-sm text-white font-medium line-clamp-2">
                    {diagram.prompt}
                  </p>
                  
                  {/* Timestamp */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {formatTime(diagram.timestamp)}
                    </span>
                    {diagram.id === currentDiagramId && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                        Current
                      </span>
                    )}
                  </div>
                  
                  {/* Preview thumbnail placeholder */}
                  <div className="w-full h-16 bg-gray-800/50 rounded border border-gray-600 flex items-center justify-center">
                    <span className="text-xs text-gray-500">Diagram #{index + 1}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Clear History */}
      {history.length > 0 && (
        <div className="border-t border-gray-700 p-3">
          <button
            onClick={() => {/* Add clear history functionality */}}
            className="w-full flex items-center justify-center gap-2 text-xs text-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Clear History
          </button>
        </div>
      )}
    </motion.div>
  );
}