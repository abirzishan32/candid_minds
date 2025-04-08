"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaQuestion } from "react-icons/fa";
import { toast } from "sonner";
import { 
  getSkillAssessmentById, 
  createAssessmentQuestion,
  updateAssessmentQuestion,
  deleteAssessmentQuestion
} from "@/lib/actions/skill-assessment.action";
import { SkillAssessment, AssessmentQuestion } from "@/lib/actions/skill-assessment.action";
import QuestionForm from "@/components/skill-assessment/QuestionForm";

function getQuestionTypeColor(type: string) {
  switch (type) {
    case 'multiple-choice':
      return 'bg-blue-500/10 text-blue-500';
    case 'coding':
      return 'bg-green-500/10 text-green-500';
    case 'text':
      return 'bg-purple-500/10 text-purple-500';
    case 'true-false':
      return 'bg-yellow-500/10 text-yellow-500';
    default:
      return 'bg-gray-500/10 text-gray-500';
  }
}

export default function AssessmentQuestionsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [assessment, setAssessment] = useState<SkillAssessment | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  // Use React.use() to unwrap params
  const { id } = React.use(params);

  useEffect(() => {
    fetchAssessment();
  }, [id]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      console.log(`Fetching assessment with ID: ${id}`);
      const response = await getSkillAssessmentById(id);
      console.log('Assessment response:', response);
      
      if (response && response.success && response.data) {
        setAssessment(response.data);
        
        // The questions are now directly in the response.data.questions array
        const assessmentQuestions = response.data.questions;
        console.log('Questions from response:', assessmentQuestions);
        
        // Ensure we're dealing with a valid array of questions
        if (Array.isArray(assessmentQuestions) && assessmentQuestions.length > 0) {
          // Validate that each question has the required properties
          const validQuestions = assessmentQuestions.filter(q => 
            q && typeof q === 'object' && 'id' in q && 'question' in q
          );
          
          console.log(`Found ${validQuestions.length} valid questions out of ${assessmentQuestions.length}`);
          
          if (validQuestions.length !== assessmentQuestions.length) {
            console.warn('Some questions were invalid:', 
              assessmentQuestions.filter(q => !validQuestions.includes(q)));
          }
          
          setQuestions(validQuestions);
        } else {
          console.log('No valid questions found in response');
          setQuestions([]);
        }
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

  const handleAddQuestion = async (data: Omit<AssessmentQuestion, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await createAssessmentQuestion({
        ...data,
        assessmentId: id,
        order: questions.length
      });
      
      if (response.success) {
        toast.success("Question added successfully");
        setIsAddingQuestion(false);
        fetchAssessment(); // Refresh the questions list
      } else {
        toast.error(response.message || "Failed to add question");
      }
    } catch (error) {
      toast.error("Failed to add question");
      console.error("Error adding question:", error);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const response = await deleteAssessmentQuestion(questionId, id);
      if (response.success) {
        toast.success("Question deleted successfully");
        fetchAssessment(); // Refresh the questions list
      } else {
        toast.error(response.message || "Failed to delete question");
      }
    } catch (error) {
      toast.error("Failed to delete question");
      console.error("Error deleting question:", error);
    }
  };

  const handleEditQuestion = (question: AssessmentQuestion) => {
    router.push(`/manage-skill-assessment/${id}/questions/${question.id}`);
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
        <button
          onClick={() => router.push(`/manage-skill-assessment/${id}`)}
          className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 mb-8"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span>Back to Assessment</span>
        </button>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {assessment ? `Questions for ${assessment.title}` : 'Assessment Questions'}
            </h1>
            <p className="text-gray-400">
              {assessment ? 
                `Manage the questions for this assessment (${questions.length} ${questions.length === 1 ? 'question' : 'questions'})` : 
                'Loading assessment details...'}
            </p>
          </div>
          <button
            onClick={() => setIsAddingQuestion(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <FaPlus className="w-4 h-4" />
            <span>Add Question</span>
          </button>
        </div>

        {isAddingQuestion ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-6 mb-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Add Question</h2>
              <button
                onClick={() => setIsAddingQuestion(false)}
                className="text-gray-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
            {assessment && (
              <QuestionForm
                assessmentId={id}
                onSuccess={() => {
                  setIsAddingQuestion(false);
                  fetchAssessment();
                }}
              />
            )}
          </motion.div>
        ) : questions.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="mb-4 text-gray-400">
              <FaQuestion className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <h3 className="text-xl font-semibold text-white mb-2">No Questions Yet</h3>
              <p className="max-w-md mx-auto mb-6">
                This assessment doesn't have any questions yet. Add questions to make this assessment available to users.
              </p>
              <button
                onClick={() => setIsAddingQuestion(true)}
                className="px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600"
              >
                Add Your First Question
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-lg p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-gray-400 mr-2">
                        Question {index + 1}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          getQuestionTypeColor(question.type)
                        }`}
                      >
                        {question.type}
                      </span>
                    </div>
                    <p className="text-lg font-medium text-white mb-3">
                      {question.question}
                    </p>
                    
                    {question.type === "multiple-choice" && question.options && (
                      <div className="space-y-2 mt-3">
                        <h4 className="text-sm font-medium text-gray-400">
                          Options:
                        </h4>
                        <ul className="space-y-1 pl-5">
                          {(() => {
                            // Safely extract options as an array
                            let options = [];
                            if (Array.isArray(question.options)) {
                              options = question.options;
                            } else if (typeof question.options === 'object' && question.options !== null) {
                              options = Object.values(question.options);
                            }
                            
                            return options.map((option: any) => {
                              if (!option || !option.id) {
                                console.warn('Invalid option:', option);
                                return null;
                              }
                              
                              return (
                                <li
                                  key={option.id}
                                  className={`text-sm ${
                                    option.isCorrect
                                      ? "text-green-500"
                                      : "text-gray-300"
                                  }`}
                                >
                                  {option.text || '[No text]'}{" "}
                                  {option.isCorrect && (
                                    <span className="text-green-500">✓</span>
                                  )}
                                </li>
                              );
                            });
                          })()}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditQuestion(question)}
                      className="p-2 text-blue-400 hover:text-blue-300"
                    >
                      <FaEdit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="p-2 text-red-400 hover:text-red-300"
                    >
                      <FaTrash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 