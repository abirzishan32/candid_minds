"use client";

import React from "react";
import { motion } from "framer-motion";

export function LoadingAnimation() {
  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-20">
      <div className="flex flex-col items-center">
        {/* Neural network animation */}
        <div className="relative w-48 h-48">
          {/* Nodes */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={`node-${i}`}
              className="absolute w-2 h-2 bg-blue-400 rounded-full"
              initial={{ 
                x: Math.random() * 200 - 100, 
                y: Math.random() * 200 - 100,
                opacity: 0.3
              }}
              animate={{ 
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                delay: Math.random()
              }}
            />
          ))}
          
          {/* Center pulsing circle */}
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full"
            style={{ 
              background: "radial-gradient(circle, rgba(79,70,229,0.6) 0%, rgba(79,70,229,0) 70%)" 
            }}
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.7, 0.9, 0.7] 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />
          
          {/* Central glowing orb */}
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            style={{ 
              boxShadow: "0 0 15px 5px rgba(59, 130, 246, 0.5)" 
            }}
          />
        </div>
        
        <div className="mt-8 flex flex-col items-center">
          <motion.h3 
            className="text-blue-400 font-medium text-xl mb-2"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Generating Visualization
          </motion.h3>
          
          <div className="flex space-x-2 mt-2">
            {["●", "●", "●"].map((dot, i) => (
              <motion.span
                key={i}
                className="text-blue-400"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              >
                {dot}
              </motion.span>
            ))}
          </div>
          
          <div className="mt-6 text-sm text-gray-400 max-w-xs text-center">
            <p>Processing your concept and generating a custom visualization. This may take a moment.</p>
          </div>
        </div>
      </div>
    </div>
  );
}