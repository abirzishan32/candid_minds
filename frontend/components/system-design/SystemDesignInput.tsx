"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";

interface SystemDesignInputProps {
  onSubmit: (prompt: string) => Promise<void>;
  isLoading: boolean;
}

const EXAMPLE_PROMPTS = [
  "Design a video streaming platform like YouTube",
  "Design a social media platform like Twitter",
  "Design a ride-sharing service like Uber",
  "Design a messaging app like WhatsApp",
  "Design an e-commerce platform like Amazon",
  "Design a food delivery system like DoorDash",
];

export function SystemDesignInput({ onSubmit, isLoading }: SystemDesignInputProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim());
    }
  };

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Input Form */}
      <div className="relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 opacity-30 blur rounded-lg"></div>
        <div className="relative bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the system you want to design... (e.g., 'Design a video streaming platform like YouTube')"
                className="w-full h-24 bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {prompt.length}/500
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Sparkles className="w-4 h-4" />
                <span>AI will generate PlantUML diagrams</span>
              </div>
              
              <button
                type="submit"
                disabled={!prompt.trim() || isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Generate Diagram
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Example Prompts */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-300 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          Try These Examples
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {EXAMPLE_PROMPTS.map((example, index) => (
            <motion.button
              key={index}
              onClick={() => handleExampleClick(example)}
              disabled={isLoading}
              className="text-left p-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 hover:border-gray-500 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <p className="text-sm text-gray-300 group-hover:text-white transition-colors">
                {example}
              </p>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}