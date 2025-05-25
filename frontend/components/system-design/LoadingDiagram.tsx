"use client";

import { motion } from "framer-motion";

export function LoadingDiagram() {
  return (
    <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg p-8">
      <div className="flex flex-col items-center justify-center min-h-96">
        {/* Animated diagram placeholder */}
        <motion.div
          className="relative mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {/* Main container */}
          <motion.div
            className="w-48 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30"
            animate={{ 
              boxShadow: [
                "0 0 20px rgba(59, 130, 246, 0.3)",
                "0 0 30px rgba(147, 51, 234, 0.3)",
                "0 0 20px rgba(59, 130, 246, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          
          {/* Connecting lines */}
          <motion.div
            className="absolute -top-4 left-1/2 w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded"
            style={{ transform: "translateX(-50%)" }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          
          <motion.div
            className="absolute -bottom-4 left-1/2 w-16 h-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded"
            style={{ transform: "translateX(-50%)" }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
          
          {/* Side components */}
          <motion.div
            className="absolute -left-8 top-1/2 w-6 h-6 bg-blue-500/40 rounded border border-blue-400/60"
            style={{ transform: "translateY(-50%)" }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          
          <motion.div
            className="absolute -right-8 top-1/2 w-6 h-6 bg-purple-500/40 rounded border border-purple-400/60"
            style={{ transform: "translateY(-50%)" }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
          />
        </motion.div>

        {/* Loading text */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.h3
            className="text-xl font-semibold text-white mb-2"
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Generating System Design
          </motion.h3>
          
          <div className="flex items-center justify-center gap-2 text-gray-400 mb-4">
            <motion.div
              className="w-2 h-2 bg-blue-500 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-2 h-2 bg-purple-500 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-2 h-2 bg-blue-500 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
            />
          </div>

          <div className="space-y-2 text-sm text-gray-500 max-w-md">
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🤖 AI is analyzing your system requirements...
            </motion.p>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
            >
              🏗️ Generating PlantUML architecture diagram...
            </motion.p>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.4 }}
            >
              🎨 Rendering visual components...
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}