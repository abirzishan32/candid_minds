"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FaCamera, FaEye, FaTimes, FaCheck, FaWindowMaximize } from 'react-icons/fa';

interface ProctorConsentModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const ProctorConsentModal: React.FC<ProctorConsentModalProps> = ({
  isOpen,
  onAccept,
  onDecline,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-lg p-8 max-w-md w-full"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="bg-blue-500/20 rounded-full p-4">
            <FaCamera className="text-blue-500 text-3xl" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          Anti-Cheating Verification Required
        </h2>

        <p className="text-gray-300 mb-6">
          This assessment requires webcam access to ensure academic integrity. 
          We will use AI to verify you are not looking away from the screen during the assessment.
        </p>

        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium text-white mb-2">How it works:</h3>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start">
              <FaEye className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
              <span>Our system tracks your eye movements to detect if you're looking away from the screen</span>
            </li>
            <li className="flex items-start">
              <FaWindowMaximize className="text-yellow-500 mt-1 mr-2 flex-shrink-0" />
              <span>Switching browser tabs during the assessment will result in immediate disqualification</span>
            </li>
            <li className="flex items-start">
              <FaCheck className="text-green-500 mt-1 mr-2 flex-shrink-0" />
              <span>Your data is processed locally and not stored or shared</span>
            </li>
            <li className="flex items-start">
              <FaTimes className="text-red-500 mt-1 mr-2 flex-shrink-0" />
              <span>Looking away from the screen or not having your face visible for more than 5 seconds will result in immediate disqualification</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={onAccept}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Accept and Enable Camera
          </button>
          <button
            onClick={onDecline}
            className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-2 px-4 rounded transition-colors"
          >
            Decline (Cannot Take Assessment)
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          By accepting, you agree to allow webcam access for the duration of this assessment only.
        </p>
      </motion.div>
    </div>
  );
};

export default ProctorConsentModal; 