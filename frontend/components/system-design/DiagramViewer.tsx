"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Code, Eye, Copy, Check, ZoomIn, ZoomOut, Edit2, Save } from "lucide-react";

// Use the same interface as the page component
interface DiagramData {
  id: string;
  prompt: string;
  plantuml_code: string;
  diagram_url: string;
  explanation: string;
  analysis?: any;
  d3_components?: any;
  timestamp: Date;
}

interface DiagramViewerProps {
  diagram: DiagramData;
  onEdit?: (updatedCode: string) => void;
}

export function DiagramViewer({ diagram, onEdit }: DiagramViewerProps) {
  const [activeTab, setActiveTab] = useState("diagram");
  const [copied, setCopied] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState(diagram.plantuml_code);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(diagram.plantuml_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const handleDownloadImage = () => {
    const link = document.createElement('a');
    link.href = diagram.diagram_url;
    link.download = `system-design-${diagram.id}.png`;
    link.click();
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleSaveEdit = () => {
    if (onEdit && editedCode !== diagram.plantuml_code) {
      onEdit(editedCode);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedCode(diagram.plantuml_code);
    setIsEditing(false);
  };

  // Generate PlantUML image URL from code
  const generateImageUrl = (code: string) => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(code)));
      return `https://www.plantuml.com/plantuml/img/${encoded}`;
    } catch (error) {
      console.error('Failed to encode PlantUML:', error);
      return diagram.diagram_url;
    }
  };

  const currentImageUrl = isEditing ? generateImageUrl(editedCode) : diagram.diagram_url;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-1">
              System Design Diagram
            </h3>
            <p className="text-sm text-gray-400 truncate">
              {diagram.prompt}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              {new Date(diagram.timestamp).toLocaleString()}
            </span>
            {onEdit && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm rounded-md transition-colors ${
                  isEditing 
                    ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                <Edit2 className="w-3 h-3" />
                {isEditing ? 'Cancel Edit' : 'Edit'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-700">
        <div className="flex">
          <button
            onClick={() => setActiveTab("diagram")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "diagram"
                ? "border-blue-400 text-blue-400 bg-blue-950/30"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            <Eye className="w-4 h-4" />
            Diagram
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "code"
                ? "border-blue-400 text-blue-400 bg-blue-950/30"
                : "border-transparent text-gray-400 hover:text-gray-300"
            }`}
          >
            <Code className="w-4 h-4" />
            PlantUML Code
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "diagram" && (
        <div className="relative">
          {/* Controls */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <div className="bg-black/70 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-gray-600 rounded transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4 text-white" />
              </button>
              <span className="text-xs text-white px-2 min-w-[3rem] text-center">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-gray-600 rounded transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4 text-white" />
              </button>
            </div>
            <button
              onClick={handleDownloadImage}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
              title="Download Diagram"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Diagram Display */}
          <div className="p-6 pt-16 bg-gradient-to-br from-gray-900/30 to-gray-800/30 min-h-[400px] flex items-center justify-center overflow-auto">
            {imageLoading && (
              <div className="flex flex-col items-center gap-3 text-gray-400">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Loading diagram...</span>
              </div>
            )}
            
            <AnimatePresence>
              {!imageError && (
                <motion.img
                  key={currentImageUrl} // Force re-render when URL changes
                  src={currentImageUrl}
                  alt="System Design Diagram"
                  className="max-w-full h-auto rounded-lg shadow-2xl bg-white"
                  style={{ 
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: 'center',
                  }}
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageLoading(false);
                    setImageError(true);
                  }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: imageLoading ? 0 : 1, scale: imageLoading ? 0.9 : 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </AnimatePresence>

            {imageError && (
              <motion.div 
                className="text-center text-gray-400 p-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-4xl mb-3">⚠️</div>
                <h4 className="text-lg font-medium mb-2">Failed to load diagram</h4>
                <p className="text-sm">The PlantUML service might be unavailable.</p>
                <p className="text-sm">Please check the code or try again later.</p>
              </motion.div>
            )}
          </div>

          {/* Edit Mode Indicator */}
          {isEditing && (
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-orange-600/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                🔧 Edit Mode - Changes preview in real-time
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "code" && (
        <div className="relative">
          {/* Code Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/30">
            <h4 className="text-sm font-medium text-gray-300">PlantUML Source Code</h4>
            <div className="flex items-center gap-2">
              {isEditing && (
                <>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors"
                  >
                    <Save className="w-3 h-3" />
                    Save Changes
                  </button>
                </>
              )}
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Code
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code Content */}
          <div className="relative">
            {isEditing ? (
              <textarea
                value={editedCode}
                onChange={(e) => setEditedCode(e.target.value)}
                className="w-full h-96 p-4 bg-gray-900/50 text-gray-300 font-mono text-sm resize-none border-none outline-none"
                placeholder="Enter PlantUML code here..."
              />
            ) : (
              <div className="p-4 bg-gray-900/50 max-h-96 overflow-auto">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                  {diagram.plantuml_code}
                </pre>
              </div>
            )}
            
            {/* Line numbers for readonly view */}
            {!isEditing && (
              <div className="absolute left-0 top-0 p-4 text-xs text-gray-500 font-mono select-none pointer-events-none">
                {diagram.plantuml_code.split('\n').map((_, index) => (
                  <div key={index} className="leading-relaxed">
                    {index + 1}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Code Stats */}
          <div className="border-t border-gray-700 px-4 py-2 bg-gray-800/20 text-xs text-gray-500">
            Lines: {(isEditing ? editedCode : diagram.plantuml_code).split('\n').length} | 
            Characters: {(isEditing ? editedCode : diagram.plantuml_code).length}
            {isEditing && editedCode !== diagram.plantuml_code && (
              <span className="text-orange-400 ml-2">• Modified</span>
            )}
          </div>
        </div>
      )}

      {/* Explanation Footer */}
      {diagram.explanation && (
        <div className="border-t border-gray-700 p-4 bg-gray-800/20">
          <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
            📝 Architecture Explanation
          </h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            {diagram.explanation}
          </p>
          
          {/* Additional metadata */}
          {diagram.analysis && (
            <details className="mt-3">
              <summary className="text-xs text-blue-400 cursor-pointer hover:text-blue-300">
                View Technical Analysis
              </summary>
              <div className="mt-2 p-3 bg-gray-900/50 rounded border border-gray-700 text-xs">
                <pre className="text-green-400 whitespace-pre-wrap">
                  {JSON.stringify(diagram.analysis, null, 2)}
                </pre>
              </div>
            </details>
          )}
        </div>
      )}
    </motion.div>
  );
}