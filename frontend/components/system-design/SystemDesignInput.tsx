"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";

interface SystemDesignInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export function SystemDesignInput({ onSubmit, isLoading }: SystemDesignInputProps) {
  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim());
      setPrompt("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 200; // Maximum height in pixels
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

 

  return (
    <div className="w-full max-w-4xl mx-auto">


      {/* Main Input Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="relative"
      >
        <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl">
          {/* Input Area */}
          <div className="flex items-end gap-4 p-4">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={handleKeyDown}
                placeholder="Describe the system you want to design... (e.g., 'Design a scalable social media platform with real-time messaging')"
                disabled={isLoading}
                className="w-full bg-transparent text-white placeholder-gray-400 border-none outline-none resize-none min-h-[50px] max-h-[200px] text-base leading-relaxed disabled:opacity-50"
                style={{ height: "50px" }}
              />
              
              {/* Character count */}
              <div className="absolute bottom-1 right-2 text-xs text-gray-500">
                {prompt.length}/2000
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </motion.button>
          </div>

          {/* Features Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-gray-700/50 bg-gray-800/30">
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>AI-Powered Analysis</span>
              </div>
              <span>•</span>
              <span>PlantUML Generation</span>
              <span>•</span>
              <span>Interactive Diagrams</span>
            </div>
            
            <div className="text-xs text-gray-500">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      </motion.form>


      
       
      </div>

  );
}