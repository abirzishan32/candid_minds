"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

const DisqualificationScreen: React.FC = () => {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-900 flex items-center justify-center p-4"
    >
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="bg-red-500/20 rounded-full p-4 mb-4">
            <FaExclamationTriangle className="text-red-500 text-4xl" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">Assessment Terminated</h1>
          <p className="text-gray-400">
            You have been disqualified due to potential academic integrity violations.
          </p>
        </div>

        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium text-white mb-2">Reason for disqualification:</h3>
          <p className="text-gray-300">
            Our proctoring system detected that you were looking away from the screen or your face was not visible 5 times,
            which violates the assessment integrity policy. The system automatically disqualifies candidates when this behavior is detected.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-white mb-2">What happens now?</h3>
          <ul className="space-y-2 text-gray-300">
            <li>Your assessment progress has been invalidated</li>
            <li>You may contact support if you believe this was in error</li>
            <li>You can return to the assessment list to try a different assessment</li>
          </ul>
        </div>

        <button
          onClick={() => router.push('/skill-assessment')}
          className="w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Return to Assessments
        </button>
      </div>
    </motion.div>
  );
};

export default DisqualificationScreen; 