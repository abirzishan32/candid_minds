"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QueueProps {
  items: string[];
  currentNode: string;
}

export default function Queue({ items, currentNode }: QueueProps) {
  return (
    <div className="space-y-4">
      {items.length === 0 ? (
        <div className="h-16 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">Queue is empty</p>
        </div>
      ) : (
        <div className="relative">
          {/* Queue heading indicators */}
          <div className="flex justify-between mb-2">
            <div className="text-sm font-medium px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-md">
              Front
            </div>
            <div className="text-sm font-medium px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-md">
              Back
            </div>
          </div>
          
          {/* Queue items */}
          <div className="flex items-center">
            <div className="flex-grow flex overflow-x-auto pb-2">
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={`${item}-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className={`
                      flex-shrink-0 min-w-[70px] border-2 mx-1 first:ml-0 last:mr-0
                      py-3 px-4 rounded-lg text-center font-mono text-lg
                      ${item === currentNode 
                        ? 'bg-indigo-100 border-indigo-500 text-indigo-800 dark:bg-indigo-900 dark:border-indigo-600 dark:text-indigo-200 shadow-md' 
                        : 'bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600'}
                    `}
                  >
                    {item}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Queue lines visualization */}
          <div className="flex mt-1">
            <div className="h-0.5 bg-gray-300 dark:bg-gray-600 flex-grow relative">
              {items.map((_, index) => (
                <div 
                  key={index}
                  className="absolute top-0 h-1.5 w-0.5 bg-gray-300 dark:bg-gray-600"
                  style={{ left: `${(index / (items.length-1)) * 100}%` }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}