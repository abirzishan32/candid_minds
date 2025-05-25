"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StackProps {
  items: string[];
  currentNode: string;
}

export default function Stack({ items, currentNode }: StackProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 h-full">
      <h2 className="text-lg font-semibold mb-2">Stack</h2>
      
      {items.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 text-sm italic text-center py-2">
          Stack is empty
        </div>
      ) : (
        <div className="flex flex-col-reverse space-y-reverse space-y-1">
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={`${item}-${index}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className={`
                  border px-3 py-2 rounded-md text-sm font-mono flex items-center justify-between
                  ${item === currentNode 
                    ? 'bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900 dark:border-amber-700 dark:text-amber-300' 
                    : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'}
                  ${index === 0 ? 'border-t-2 border-t-amber-500 dark:border-t-amber-500' : ''}
                `}
              >
                <span>{item}</span>
                {index === 0 && (
                  <span className="text-xs bg-amber-200 dark:bg-amber-800 px-1.5 py-0.5 rounded">
                    Top
                  </span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      {/* Visual stack bottom */}
      <div className="border-b-2 border-gray-300 dark:border-gray-600 mt-2 mb-1"></div>
      <div className="text-xs text-center text-gray-400 dark:text-gray-500">Stack Bottom</div>
    </div>
  );
}