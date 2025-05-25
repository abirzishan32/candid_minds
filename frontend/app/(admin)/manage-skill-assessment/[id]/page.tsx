"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaEdit, FaTrash, FaQuestionCircle, FaPlus } from "react-icons/fa";
import { toast } from "sonner";
import { getSkillAssessmentById, updateSkillAssessment } from "@/lib/actions/skill-assessment.action";
import { SkillAssessment } from "@/lib/actions/skill-assessment.action";
import AssessmentForm from "@/components/skill-assessment/AssessmentForm";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AssessmentPage({ params }: PageProps) {
  const router = useRouter();
  const [assessment, setAssessment] = useState<SkillAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { id } = React.use(params) as { id: string };

  useEffect(() => {
    fetchAssessment();
  }, [id]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      const response = await getSkillAssessmentById(id);
      
      if (response && response.success && 'data' in response) {
        const assessmentData: SkillAssessment = {
          ...response.data,
          questions: response.data.questions?.map(q => q.id) || []
        };
        setAssessment(assessmentData);
      } else {
        setError("Failed to load assessment");
      }
    } catch (err) {
      setError("Failed to load assessment. Please try again later.");
      console.error("Error fetching assessment:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAssessment = async (data: Partial<SkillAssessment>) => {
    try {
      const response = await updateSkillAssessment(id, data);
      if (response.success) {
        toast.success("Assessment updated successfully");
        setIsEditing(false);
        fetchAssessment();
      } else {
        toast.error(response.message || "Failed to update assessment");
      }
    } catch (error) {
      toast.error("Failed to update assessment");
      console.error("Error updating assessment:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-800 rounded w-1/4"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2"></div>
            <div className="h-64 bg-gray-800 rounded-lg"></div>
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

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-red-500 text-center py-8">Assessment not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {assessment.title}
            </h1>
            <p className="text-gray-400 mb-4">{assessment.description}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span className="capitalize">{assessment.category}</span>
              <span>•</span>
              <span className="capitalize">{assessment.difficulty}</span>
              <span>•</span>
              <span>{assessment.duration} minutes</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={async () => {
                try {
                  if (!assessment.isPublished && (assessment.questionsCount === 0 || !assessment.questions || assessment.questions.length === 0)) {
                    toast.error("Cannot publish an assessment without questions. Please add at least one question first.");
                    return;
                  }
                  
                  const response = await updateSkillAssessment(id, {
                    isPublished: !assessment.isPublished
                  });
                  if (response.success) {
                    toast.success(assessment.isPublished ? 
                      "Assessment unpublished" : 
                      "Assessment published");
                    fetchAssessment();
                  } else {
                    toast.error("Failed to update publication status");
                  }
                } catch (error) {
                  toast.error("Failed to update publication status");
                  console.error("Error updating publication status:", error);
                }
              }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md ${
                assessment.isPublished 
                  ? "bg-gray-700 text-white hover:bg-gray-600" 
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              <span>{assessment.isPublished ? "Unpublish" : "Publish"}</span>
            </button>
            <button
              onClick={() => router.push(`/manage-skill-assessment/${id}/questions`)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <FaQuestionCircle className="w-4 h-4" />
              <span>Manage Questions</span>
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
            >
              <FaEdit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          </div>
        </div>

        {(assessment.questionsCount === 0 || !assessment.questions || assessment.questions.length === 0) && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6 text-yellow-500">
            <h3 className="text-lg font-medium mb-2">This assessment has no questions</h3>
            <p className="mb-3">
              An assessment without questions cannot be published or taken by users. 
              Please add at least one question to make this assessment available.
            </p>
            <button
              onClick={() => router.push(`/manage-skill-assessment/${id}/questions`)}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
            >
              <FaPlus className="w-4 h-4" />
              <span>Add Questions</span>
            </button>
          </div>
        )}

        {isEditing ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Assessment</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
            <AssessmentForm
              assessment={assessment}
              onSuccess={() => handleUpdateAssessment(assessment)}
            />
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Details</h3>
              <div className="space-y-4">
                {assessment.longDescription && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      Long Description
                    </h4>
                    <p className="text-white">{assessment.longDescription}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">
                    Pass Percentage
                  </h4>
                  <p className="text-white">{assessment.passPercentage}%</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">
                    Status
                  </h4>
                  <p className="text-white capitalize">
                    {assessment.isPublished ? "Published" : "Draft"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Statistics</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">
                    Total Completions
                  </h4>
                  <p className="text-white">{assessment.completions}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">
                    Average Score
                  </h4>
                  <p className="text-white">{assessment.averageScore}%</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">
                    Popularity
                  </h4>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < assessment.popularity
                            ? "text-yellow-400"
                            : "text-gray-600"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 