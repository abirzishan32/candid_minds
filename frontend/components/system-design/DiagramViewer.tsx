"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Code, Eye, Copy, Check, ZoomIn, ZoomOut } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DiagramData {
  id: string;
  prompt: string;
  plantUML: string;
  diagramUrl: string;
  explanation: string;
  timestamp: Date;
}

interface DiagramViewerProps {
  diagram: DiagramData;
}

export function DiagramViewer({ diagram }: DiagramViewerProps) {
  const [activeTab, setActiveTab] = useState("diagram");
  const [copied, setCopied] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [zoom, setZoom] = useState(100);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(diagram.plantUML);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const handleDownloadImage = () => {
    const link = document.createElement('a');
    link.href = diagram.diagramUrl;
    link.download = `system-design-${diagram.id}.png`;
    link.click();
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden"
    >
      {/* Header */}
      <div className="border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              System Design Diagram
            </h3>
            <p className="text-sm text-gray-400 truncate max-w-md">
              {diagram.prompt}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {diagram.timestamp.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-gray-700">
          <TabsList className="bg-transparent w-full justify-start rounded-none h-12 p-0">
            <TabsTrigger 
              value="diagram" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-blue-400"
            >
              <Eye className="w-4 h-4 mr-2" />
              Diagram
            </TabsTrigger>
            <TabsTrigger 
              value="code" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-blue-400"
            >
              <Code className="w-4 h-4 mr-2" />
              PlantUML Code
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="diagram" className="p-0 m-0">
          <div className="relative">
            {/* Diagram Controls */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2">
                <button
                  onClick={handleZoomOut}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4 text-white" />
                </button>
                <span className="text-xs text-white px-2">{zoom}%</span>
                <button
                  onClick={handleZoomIn}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
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

            {/* Diagram Image */}
            <div className="p-6 bg-white/5 min-h-96 flex items-center justify-center overflow-auto">
              {imageLoading && (
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  Loading diagram...
                </div>
              )}
              
              <AnimatePresence>
                {!imageError && (
                  <motion.img
                    src={diagram.diagramUrl}
                    alt="System Design Diagram"
                    className="max-w-full h-auto rounded-lg shadow-lg"
                    style={{ 
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: 'center',
                    }}
                    onLoad={() => setImageLoading(false)}
                    onError={() => {
                      setImageLoading(false);
                      setImageError(true);
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: imageLoading ? 0 : 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </AnimatePresence>

              {imageError && (
                <div className="text-center text-gray-400">
                  <div className="text-4xl mb-2">⚠️</div>
                  <p>Failed to load diagram</p>
                  <p className="text-sm">Please try regenerating</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="code" className="p-0 m-0">
          <div className="relative">
            {/* Code Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50">
              <h4 className="text-sm font-medium text-gray-300">PlantUML Code</h4>
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

            {/* Code Content */}
            <div className="p-4 bg-gray-900/50 max-h-96 overflow-auto">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                {diagram.plantUML}
              </pre>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Explanation */}
      {diagram.explanation && (
        <div className="border-t border-gray-700 p-4 bg-gray-800/30">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Explanation</h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            {diagram.explanation}
          </p>
        </div>
      )}
    </motion.div>
  );
}