"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSkillAssessments, deleteSkillAssessment } from "@/lib/actions/skill-assessment.action";
import { SkillAssessment } from "@/lib/actions/skill-assessment.action";
import { motion } from "framer-motion";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast } from "sonner";

export default function ManageSkillAssessmentPage() {
  const router = useRouter();
  const [assessments, setAssessments] = useState<SkillAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      // Show all assessments for admin users, including unpublished
      const response = await getSkillAssessments({ isAdmin: true });
      if (response.success && response.data) {
        setAssessments(response.data);
      } else {
        setError(response.message || "Failed to load assessments");
      }
    } catch (err) {
      setError("Failed to load assessments. Please try again later.");
      console.error("Error fetching assessments:", err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAssessments();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this assessment?")) return;

    try {
      await deleteSkillAssessment(id);
      toast.success("Assessment deleted successfully");
      fetchAssessments();
    } catch (error) {
      toast.error("Failed to delete assessment");
      console.error("Error deleting assessment:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-800 rounded w-1/4"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
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

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Manage Skill Assessments
            </h1>
            <p className="text-gray-400">
              Create, edit, and manage skill assessments
            </p>
          </div>
          <button
            onClick={() => router.push("/manage-skill-assessment/create")}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <FaPlus className="w-4 h-4" />
            <span>Create Assessment</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-800 text-left">
                <th className="py-3 px-4 text-gray-300 font-semibold">Name</th>
                <th className="py-3 px-4 text-gray-300 font-semibold">Difficulty</th>
                <th className="py-3 px-4 text-gray-300 font-semibold">Questions</th>
                <th className="py-3 px-4 text-gray-300 font-semibold">Duration</th>
                <th className="py-3 px-4 text-gray-300 font-semibold">Status</th>
                <th className="py-3 px-4 text-gray-300 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((assessment) => (
                <tr key={assessment.id} className="border-t border-gray-700">
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-white">{assessment.title}</span>
                      <span className="text-sm text-gray-400">{assessment.category}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="capitalize">{assessment.difficulty}</span>
                  </td>
                  <td className="py-4 px-4">{assessment.questionsCount || 0}</td>
                  <td className="py-4 px-4">{assessment.duration} min</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      assessment.isPublished 
                        ? "bg-green-500/10 text-green-500" 
                        : "bg-yellow-500/10 text-yellow-500"
                    }`}>
                      {assessment.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => router.push(`/manage-skill-assessment/${assessment.id}`)}
                        className="p-2 text-blue-400 hover:text-blue-300"
                      >
                        <FaEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(assessment.id)}
                        className="p-2 text-red-400 hover:text-red-300"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {assessments.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No assessments found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
