"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { VideoVisualization } from "@/components/ai-animation/VideoVisualization";
import { PromptInput } from "@/components/ai-animation/PromptInput";
import { LoadingAnimation } from "@/components/ai-animation/LoadingAnimation";

export default function AIAnimationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Array<{
    type: "prompt" | "response";
    content: string;
    timestamp: Date;
    videoUrl?: string | null;
  }>>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations]);

  const generateAnimation = async (prompt: string) => {
    setIsLoading(true);
    
    setConversations(prev => [
      ...prev, 
      { 
        type: "prompt", 
        content: prompt, 
        timestamp: new Date() 
      }
    ]);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      // Try new endpoint first, fallback to legacy
      let endpoint = `${apiUrl}/ai-animation/generate`;
      let response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      // If new endpoint fails, try legacy endpoint
      if (!response.ok && response.status === 404) {
        console.log("New endpoint not found, trying legacy endpoint...");
        endpoint = `${apiUrl}/generate-animation`;
        response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
        throw new Error(errorData.detail || "Failed to generate animation");
      }

      const data = await response.json();
      console.log("API response:", data);
      
      setConversations(prev => [
        ...prev, 
        { 
          type: "response", 
          content: data.explanation, 
          videoUrl: data.video_url,
          timestamp: new Date() 
        }
      ]);
      
      if (!data.video_url) {
        toast.warning("I couldn't visualize this concept. Let's try something different.");
      } else {
        toast.success("Visualization complete!");
      }
    } catch (error) {
      console.error("Error generating animation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate animation");
      
      setConversations(prev => [
        ...prev, 
        { 
          type: "response", 
          content: "I'm having trouble creating this visualization. Could you try another prompt?", 
          timestamp: new Date() 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-gradient-to-b from-gray-900 to-black">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px] pointer-events-none" />
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black/40 [mask-image:radial-gradient(ellipse_at_center,transparent_50%,black)]"></div>
      
      {/* Glowing orbs effect */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-15 animate-pulse" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl opacity-15 animate-pulse" />

      {/* Content area */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 drop-shadow-sm">
            Visualize <span className="text-white/90">with AI</span>
          </h1>
          
          {isLoading && (
            <div className="flex items-center text-blue-400 text-sm font-medium">
              <span className="animate-pulse mr-2">●</span>
              Processing
            </div>
          )}
        </div>
        
        {/* Conversation Area */}
        <div className="flex-1 overflow-y-auto pr-4 space-y-6 pb-4 custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-800/50"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-2xl">✨</span>
                </div>
                <h2 className="text-xl font-medium mb-3 text-white">Welcome to AI Visualization</h2>
                <p className="text-gray-300 mb-6">
                  Describe any concept, algorithm, or idea you want to visualize,
                  and I'll create an animated visualization for you.
                </p>
                <div className="flex flex-col gap-3">
                  {["Show me how quicksort works", "Visualize solar system planets", "Create a sine wave animation"].map(suggestion => (
                    <button 
                      key={suggestion}
                      onClick={() => generateAnimation(suggestion)}
                      className="bg-gray-800/80 hover:bg-gray-700/80 px-4 py-2 rounded-full text-sm font-medium transition-all border border-gray-700/70"
                    >
                      "{suggestion}"
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <AnimatePresence>
              {conversations.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`${item.type === "prompt" ? "flex justify-end" : "flex justify-start"}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-2xl p-4 shadow-lg ${
                      item.type === "prompt" 
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium" 
                        : "bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 text-gray-100"
                    }`}
                  >
                    <p className={`${item.type === "prompt" ? "text-white" : "text-gray-100"} text-sm mb-4`}>
                      {item.content}
                    </p>
                    
                    {item.type === "response" && item.videoUrl && (
                      <div className="mt-4">
                        <VideoVisualization videoUrl={item.videoUrl || ""} />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && <LoadingAnimation />}
      
      {/* Prompt input */}
      <div className="w-full p-4 relative z-10 bg-gradient-to-t from-gray-900 to-transparent pt-8">
        <PromptInput onSubmit={generateAnimation} isLoading={isLoading} />
      </div>
    </div>
  );
}