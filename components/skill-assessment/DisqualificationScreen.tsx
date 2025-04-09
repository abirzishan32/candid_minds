"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaTimes, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';

const DisqualificationScreen: React.FC<{ assessmentId?: string }> = ({ assessmentId }) => {
  const router = useRouter();
  const [disqualificationReason, setDisqualificationReason] = useState<string>("Academic integrity violation");

  useEffect(() => {
    // Get the reason for disqualification from localStorage if available
    if (assessmentId) {
      const storedReason = localStorage.getItem(`assessment_disqualification_reason_${assessmentId}`);
      if (storedReason) {
        setDisqualificationReason(storedReason);
      }
    } else {
      // Try to get the reason from any assessmentId
      const keys = Object.keys(localStorage);
      const reasonKey = keys.find(key => key.startsWith('assessment_disqualification_reason_'));
      if (reasonKey) {
        const storedReason = localStorage.getItem(reasonKey);
        if (storedReason) {
          setDisqualificationReason(storedReason);
        }
      }
    }
  }, [assessmentId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-lg p-8"
    >
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center justify-center w-16 h-16 bg-red-500 rounded-full">
          <FaExclamationTriangle className="w-8 h-8 text-white" />
        </div>
      </div>
      
      <h1 className="text-3xl font-bold text-white text-center mb-6">Assessment Disqualified</h1>
      
      <div className="bg-gray-700 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-white mb-2">Reason for disqualification:</h3>
        <p className="text-gray-300">
          {disqualificationReason === "Tab switching detected" ? (
            "You switched to another browser tab during the assessment. Tab switching is not allowed during assessments as it violates the integrity policy."
          ) : disqualificationReason.includes("Looking away") || disqualificationReason.includes("Face not detected") ? (
            "Our proctoring system detected that you were looking away from the screen or your face was not visible for more than 5 seconds, which violates the assessment integrity policy."
          ) : (
            "Our proctoring system detected a potential violation of the assessment integrity policy. This could include looking away from the screen, having your face not visible, or using external resources."
          )}
        </p>
      </div>
      
      <div className="bg-gray-700 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-white mb-2">Policy Information:</h3>
        <p className="text-gray-300">
          To ensure fairness and academic integrity, assessments require continuous proctoring. 
          This includes monitoring for:
        </p>
        <ul className="list-disc pl-5 mt-2 text-gray-300 space-y-1">
          <li>Tab switching (instant disqualification)</li>
          <li>Looking away from the screen for extended periods</li>
          <li>Face not being visible to the webcam</li>
          <li>Having other people present in the webcam view</li>
          <li>Using external resources or devices</li>
        </ul>
      </div>
      
      <button
        onClick={() => router.push('/skill-assessment')}
        className="w-full flex items-center justify-center py-3 px-4 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition-colors"
      >
        <FaArrowLeft className="w-4 h-4 mr-2" />
        <span>Return to Assessments</span>
      </button>
    </motion.div>
  );
};

export default DisqualificationScreen; 