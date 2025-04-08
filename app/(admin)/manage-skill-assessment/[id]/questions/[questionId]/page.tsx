"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
import { toast } from "sonner";
import { 
  getSkillAssessmentById,
  updateAssessmentQuestion
} from "@/lib/actions/skill-assessment.action";
import { AssessmentQuestion } from "@/lib/actions/skill-assessment.action";
import QuestionForm from "@/components/skill-assessment/QuestionForm";

export default function EditQuestionPage({ 
  params 
}: { 
  params: { 
    id: string;
    questionId: string;
  } 
}) {
  const router = useRouter();
  const [question, setQuestion] = useState<AssessmentQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use React.use() to unwrap params
  const { id, questionId } = React.use(params);

  useEffect(() => {
    fetchQuestion();
  }, [id, questionId]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      console.log(`Fetching assessment with ID: ${id}`);
      const response = await getSkillAssessmentById(id);
      console.log('Assessment response:', response);
      
      if (response && response.success && response.data) {
        const questions = response.data.questions || [];
        const foundQuestion = questions.find(q => q.id === questionId);
        
        if (foundQuestion) {
          setQuestion(foundQuestion);
        } else {
          setError("Question not found");
        }
      } else {
        setError("Failed to load assessment");
      }
    } catch (err) {
      setError("Failed to load question. Please try again later.");
      console.error("Error fetching question:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuestion = async (data: Partial<AssessmentQuestion>) => {
    try {
      const response = await updateAssessmentQuestion(questionId, {
        ...data,
        assessmentId: id
      });
      
      if (response.success) {
        toast.success("Question updated successfully");
        router.push(`/manage-skill-assessment/${id}/questions`);
      } else {
        toast.error(response.message || "Failed to update question");
      }
    } catch (error) {
      toast.error("Failed to update question");
      console.error("Error updating question:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-800 rounded w-1/4"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2"></div>
            <div className="h-96 bg-gray-800 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-red-500 text-center py-8">{error}</div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-red-500 text-center py-8">Question not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.push(`/manage-skill-assessment/${id}/questions`)}
          className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 mb-8"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span>Back to Questions</span>
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Edit Question</h1>
          <p className="text-gray-400">Update the question details below</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-lg p-6"
        >
          <QuestionForm
            assessmentId={id}
            initialData={question}
            onSuccess={() => {
              router.push(`/manage-skill-assessment/${id}/questions`);
            }}
            onSubmit={handleUpdateQuestion}
            mode="edit"
          />
        </motion.div>
      </div>
    </div>
  );
} 