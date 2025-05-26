"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";

interface SystemDesignInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

export function SystemDesignInput({ onSubmit, isLoading }: SystemDesignInputProps) {
  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [prompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim().length < 5 || isLoading) return;
    
    onSubmit(prompt);
    setPrompt("");
  };

  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Ambient glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-75 blur-lg rounded-lg"></div>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-30 animate-pulse rounded-lg"></div>
      
      <form 
        onSubmit={handleSubmit} 
        className="relative bg-gray-900/80 backdrop-blur-sm rounded-lg border border-gray-800/50 overflow-hidden"
      >
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the system you want to design..."
          className="w-full bg-transparent px-4 py-3 pr-12 outline-none resize-none text-white placeholder:text-gray-400"
          rows={1}
          disabled={isLoading}
        />
        
        <motion.button
          type="submit"
          className="absolute right-2 bottom-2 p-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white disabled:opacity-50"
          disabled={prompt.trim().length < 5 || isLoading}
          whileTap={{ scale: 0.94 }}
          whileHover={{ scale: 1.05 }}
        >
          <Send size={18} />
        </motion.button>
      </form>
    </motion.div>
  );
}