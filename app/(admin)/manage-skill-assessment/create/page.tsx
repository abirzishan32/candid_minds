"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { createSkillAssessment } from "@/lib/actions/skill-assessment.action";
import { SkillAssessment } from "@/lib/actions/skill-assessment.action";
import AssessmentForm from "@/components/skill-assessment/AssessmentForm";

export default function CreateAssessmentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccess = () => {
    router.push("/manage-skill-assessment");
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">Create New Assessment</h1>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white"
            >
              Cancel
            </button>
          </div>

          <AssessmentForm
            onSuccess={handleSuccess}
          />
        </motion.div>
      </div>
    </div>
  );
} 