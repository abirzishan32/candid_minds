"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaQuestion, FaGripVertical, FaRobot, FaCog, FaCheckSquare, FaRegSquare, FaTrashAlt } from "react-icons/fa";
import { toast } from "sonner";
import { 
  getSkillAssessmentById, 
  createAssessmentQuestion,
  updateAssessmentQuestion,
  deleteAssessmentQuestion,
  updateSkillAssessment,
  AssessmentOption, 
  AssessmentQuestion, 
  SkillAssessment,
  QuestionType
} from "@/lib/actions/skill-assessment.action";
import { generateAssessmentQuestionsWithAI } from "@/lib/actions/assessment-ai.action";
import QuestionForm from "@/components/skill-assessment/QuestionForm";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { any } from "zod";
import { CheckSquare, X, Trash2 } from "lucide-react";

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

interface SortableQuestionItemProps {
  question: AssessmentQuestion;
  index: number;
  onEdit: (question: AssessmentQuestion) => void;
  onDelete: (questionId: string) => void;
  isSelected: boolean;
  onSelect: (questionId: string, selected: boolean) => void;
  isDragging: boolean;
}

function SortableQuestionItem({ 
  question, 
  index, 
  onEdit, 
  onDelete, 
  isSelected, 
  onSelect,
  isDragging
}: SortableQuestionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: dndIsDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease',
    opacity: dndIsDragging ? 0.5 : 1,
    zIndex: dndIsDragging ? 999 : 1,
  };

  // Handle checkbox click
  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent other handlers from triggering
    onSelect(question.id, !isSelected);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
      }}
      className={`bg-gray-800 rounded-lg p-6 ${
        dndIsDragging ? 'border-2 border-blue-500 ring-2 ring-blue-500/20' : ''
      } ${isSelected ? 'border-2 border-purple-500' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-4">
          <div className="flex items-center mb-2">
            {/* Add checkbox for selection */}
            <div 
              onClick={handleSelectClick}
              className="mr-3 cursor-pointer text-gray-400 hover:text-purple-400 transition-colors"
            >
              {isSelected ? (
                <FaCheckSquare className="w-5 h-5 text-purple-500" />
              ) : (
                <FaRegSquare className="w-5 h-5" />
              )}
            </div>
            <div 
              {...attributes} 
              {...listeners} 
              className="mr-3 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-300 transition-colors"
            >
              <motion.div
                animate={{ 
                  y: dndIsDragging ? [0, -2, 0] : 0,
                  transition: dndIsDragging ? { repeat: Infinity, duration: 1 } : {}
                }}
              >
                <FaGripVertical className="w-5 h-5" />
              </motion.div>
            </div>
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
                  let options: AssessmentOption[] = [];
                  if (Array.isArray(question.options)) {
                    options = question.options;
                  } else if (typeof question.options === 'object' && question.options !== null) {
                    options = Object.values(question.options);
                  }
                  
                  return options.map((option) => {
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
            onClick={() => onEdit(question)}
            className="p-2 text-blue-400 hover:text-blue-300"
          >
            <FaEdit className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(question.id)}
            className="p-2 text-red-400 hover:text-red-300"
          >
            <FaTrash className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Add a new interface that extends SkillAssessment to properly type the response
interface SkillAssessmentWithQuestions extends Omit<SkillAssessment, 'questions'> {
  questions: AssessmentQuestion[];
}

export default function AssessmentQuestionsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [assessment, setAssessment] = useState<SkillAssessment | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<AssessmentQuestion | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<AssessmentQuestion | null>(null);
  
  // AI Generation states
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGenerationCount, setAiGenerationCount] = useState(5);
  const [selectedQuestionType, setSelectedQuestionType] = useState<QuestionType>("multiple-choice");
  const [aiGenerationLoading, setAiGenerationLoading] = useState(false);

  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Multiple selection states
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Add new state for generated questions in preview mode
  const [previewQuestions, setPreviewQuestions] = useState<any[]>([]);
  const [selectedPreviewQuestions, setSelectedPreviewQuestions] = useState<Set<number>>(new Set());
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // For drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchAssessment();
  }, [params.id]);

  const fetchAssessment = async () => {
    try {
      setLoading(true);
      console.log(`Fetching assessment with ID: ${params.id}`);
      const response = await getSkillAssessmentById(params.id);
      console.log('Assessment response:', response);
      
      if (response && response.success && 'data' in response) {
        // First treat the data as the special type that includes AssessmentQuestion[]
        const assessmentWithQuestions = response.data as unknown as SkillAssessmentWithQuestions;
        
        // Then extract just the question objects for our questions state
        const assessmentQuestions = assessmentWithQuestions.questions || [];
        console.log('Questions from response:', assessmentQuestions);
        
        // For the assessment state, convert back to regular SkillAssessment format with string[] questions
        setAssessment({
          ...assessmentWithQuestions,
          questions: assessmentQuestions.map(q => q.id)
        });
        
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
        assessmentId: params.id,
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
    // Instead of using confirm(), set the state to show our custom modal
    setQuestionToDelete(questionId);
    setShowDeleteModal(true);
  };

  // Add a new function to handle the actual deletion after confirmation
  const confirmDeleteQuestion = async () => {
    if (!questionToDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await deleteAssessmentQuestion(questionToDelete, params.id);
      
      if (response.success) {
        toast.success("Question deleted successfully");
        fetchAssessment(); // Refresh the questions list
      } else {
        toast.error(response.message || "Failed to delete question");
      }
    } catch (error) {
      toast.error("Failed to delete question");
      console.error("Error deleting question:", error);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setQuestionToDelete(null);
    }
  };

  // Add a function to cancel deletion
  const cancelDeleteQuestion = () => {
    setShowDeleteModal(false);
    setQuestionToDelete(null);
  };

  const handleEditQuestion = (question: AssessmentQuestion) => {
    router.push(`/manage-skill-assessment/${params.id}/questions/${question.id}`);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    const question = questions.find(q => q.id === active.id);
    if (question) {
      setActiveQuestion(question);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
      
      try {
        setIsSavingOrder(true);
        
        // Update each question's order based on its new position
        const updatedQuestions = questions.map((question, index) => ({
          ...question,
          order: index
        }));
        
        // Create an array of promises for updating each question
        const updatePromises = updatedQuestions.map(question => 
          updateAssessmentQuestion(question.id, { order: question.order })
        );
        
        // Update the questions array in the assessment
        await updateSkillAssessment(params.id, {
          questions: updatedQuestions.map(q => q.id)
        });
        
        // Execute all promises in parallel
        await Promise.all(updatePromises);
        
        toast.success("Question order updated");
      } catch (error) {
        console.error("Error updating question order:", error);
        toast.error("Failed to update question order");
      } finally {
        setIsSavingOrder(false);
      }
    }

    setActiveId(null);
    setActiveQuestion(null);
  };

  // Handle AI question generation
  const handleGenerateAIQuestions = async () => {
    if (!assessment) return;
    
    try {
      setAiGenerationLoading(true);
      
      // Extract assessment information for the AI
      const { title, description, category, difficulty } = assessment;
      
      // Get current questions text to avoid duplicates
      const currentQuestions = questions.map(q => q.question);
      
      // Call the AI generation function
      const response = await generateAssessmentQuestionsWithAI({
        category,
        difficulty,
        count: aiGenerationCount,
        questionType: selectedQuestionType,
        title,
        description,
        currentQuestions
      });
      
      if (response.success && response.data) {
        // Instead of directly adding to database, show in preview mode
        setPreviewQuestions(response.data);
        setIsPreviewMode(true);
        setIsGeneratingAI(false);
        
        // Select all questions by default
        const allIndices = new Set(response.data.map((_, idx) => idx));
        setSelectedPreviewQuestions(allIndices);
        
        toast.success(`${response.data.length} questions generated. Please review and select which to add.`);
      } else {
        toast.error(response.message || "Failed to generate questions");
      }
    } catch (error) {
      console.error("Error generating AI questions:", error);
      toast.error("Failed to generate questions with AI");
    } finally {
      setAiGenerationLoading(false);
    }
  };

  // New function to add selected questions
  const handleAddSelectedQuestions = async () => {
    if (previewQuestions.length === 0 || selectedPreviewQuestions.size === 0) {
      toast.error("No questions selected");
      return;
    }
    
    try {
      // Show loading state
      toast.loading("Adding selected questions...");
      
      // Create each selected question in the database
      const selectedQuestionsList = Array.from(selectedPreviewQuestions).map(idx => previewQuestions[idx]);
      
      const createPromises = selectedQuestionsList.map((q, idx) => {
        // First determine if we need options based on the question type
        let questionOptions;
        if (selectedQuestionType === "multiple-choice" && q.options) {
          questionOptions = q.options.map((opt: any, optIdx: number) => ({
            id: `${Date.now()}-${idx}-${optIdx}`,
            text: opt.text,
            isCorrect: opt.isCorrect
          }));
        }
        
        return createAssessmentQuestion({
          question: q.question,
          type: selectedQuestionType,
          options: questionOptions,
          assessmentId: params.id,
          points: 1, // Default points
          order: questions.length + idx
        });
      });
      
      await Promise.all(createPromises);
      
      toast.dismiss();
      toast.success(`Successfully added ${selectedQuestionsList.length} questions`);
      setIsPreviewMode(false);
      setPreviewQuestions([]);
      setSelectedPreviewQuestions(new Set());
      fetchAssessment(); // Refresh the questions list
    } catch (error) {
      console.error("Error adding selected questions:", error);
      toast.dismiss();
      toast.error("Failed to add questions");
    }
  };

  // Toggle selection of a preview question
  const togglePreviewQuestionSelection = (index: number) => {
    setSelectedPreviewQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Select all preview questions
  const selectAllPreviewQuestions = () => {
    if (selectedPreviewQuestions.size === previewQuestions.length) {
      setSelectedPreviewQuestions(new Set());
    } else {
      setSelectedPreviewQuestions(new Set(previewQuestions.map((_, idx) => idx)));
    }
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };
  
  const selectAllQuestions = () => {
    if (selectedQuestions.size === questions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(questions.map(q => q.id)));
    }
  };
  
  const clearSelection = () => {
    setSelectedQuestions(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.size === 0) return;
    
    try {
      setIsBulkDeleting(true);
      const questionIds = Array.from(selectedQuestions);
      
      for (const id of questionIds) {
        await deleteAssessmentQuestion(id, params.id);
      }
      
      toast.success(`${questionIds.length} questions deleted successfully`);
      setSelectedQuestions(new Set());
      setShowBulkDeleteModal(false);
      router.refresh();
    } catch (error) {
      console.error("Error deleting questions:", error);
      toast.error("Failed to delete questions");
    } finally {
      setIsBulkDeleting(false);
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
          onClick={() => router.push(`/manage-skill-assessment/${params.id}`)}
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
            {questions.length > 1 && (
              <p className="text-blue-400 mt-1">
                <span className="flex items-center">
                  <FaGripVertical className="mr-1" /> Drag questions to reorder them
                </span>
              </p>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsGeneratingAI(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              <FaRobot className="w-4 h-4" />
              <span>Generate with AI</span>
            </button>
            <button
              onClick={() => setIsAddingQuestion(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <FaPlus className="w-4 h-4" />
              <span>Add Question</span>
            </button>
          </div>
        </div>

        {/* Preview Mode for AI Generated Questions */}
        {isPreviewMode && previewQuestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gray-800 rounded-lg p-6 mb-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Review Generated Questions</h2>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setIsPreviewMode(false);
                      setPreviewQuestions([]);
                      setSelectedPreviewQuestions(new Set());
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-300 mb-4">
                  Select the questions you want to add to the assessment. {selectedPreviewQuestions.size} of {previewQuestions.length} questions selected.
                </p>
                
                {/* Bulk selection controls */}
                <div className="flex items-center mb-4 space-x-4">
                  <button 
                    onClick={selectAllPreviewQuestions}
                    className="flex items-center text-gray-300 hover:text-white"
                  >
                    <CheckSquare className="w-4 h-4 mr-1" />
                    {selectedPreviewQuestions.size === previewQuestions.length ? "Deselect All" : "Select All"}
                  </button>
                  
                  <button
                    onClick={handleAddSelectedQuestions}
                    disabled={selectedPreviewQuestions.size === 0}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaPlus className="w-4 h-4 mr-2" />
                    Add {selectedPreviewQuestions.size} Selected {selectedPreviewQuestions.size === 1 ? "Question" : "Questions"}
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {previewQuestions.map((q, index) => (
                  <div 
                    key={index} 
                    className={`bg-gray-700 rounded-lg p-5 border-2 ${
                      selectedPreviewQuestions.has(index) ? 'border-purple-500' : 'border-gray-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center mb-2">
                          {/* Checkbox for selection */}
                          <div 
                            onClick={() => togglePreviewQuestionSelection(index)}
                            className="mr-3 cursor-pointer text-gray-400 hover:text-purple-400 transition-colors"
                          >
                            {selectedPreviewQuestions.has(index) ? (
                              <FaCheckSquare className="w-5 h-5 text-purple-500" />
                            ) : (
                              <FaRegSquare className="w-5 h-5" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-400 mr-2">
                            Question {index + 1}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ${
                              getQuestionTypeColor(selectedQuestionType)
                            }`}
                          >
                            {selectedQuestionType}
                          </span>
                        </div>
                        <p className="text-lg font-medium text-white mb-3">
                          {q.question}
                        </p>
                        
                        {selectedQuestionType === "multiple-choice" && q.options && (
                          <div className="space-y-2 mt-3">
                            <h4 className="text-sm font-medium text-gray-400">
                              Options:
                            </h4>
                            <ul className="space-y-1 pl-5">
                              {q.options.map((option: any, optionIndex: number) => (
                                <li
                                  key={optionIndex}
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
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div>
                        <button
                          onClick={() => togglePreviewQuestionSelection(index)}
                          className={`p-2 ${
                            selectedPreviewQuestions.has(index) 
                              ? 'text-purple-400 hover:text-purple-300' 
                              : 'text-gray-400 hover:text-gray-300'
                          }`}
                        >
                          {selectedPreviewQuestions.has(index) ? (
                            <FaCheckSquare className="w-5 h-5" />
                          ) : (
                            <FaRegSquare className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleAddSelectedQuestions}
                  disabled={selectedPreviewQuestions.size === 0}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaPlus className="w-4 h-4 mr-2" />
                  Add {selectedPreviewQuestions.size} Selected {selectedPreviewQuestions.size === 1 ? "Question" : "Questions"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bulk Actions Bar - Only show when questions are selected */}
        {selectedQuestions.size > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 border border-gray-700 rounded-md p-3 mb-4 flex items-center justify-between"
          >
            <div className="flex items-center text-white">
              <button 
                onClick={selectAllQuestions}
                className="flex items-center mr-5 text-gray-300 hover:text-white"
              >
                <CheckSquare className="w-4 h-4 mr-1" />
                Select All
              </button>
              {selectedQuestions.size > 0 && (
                <>
                  <button 
                    onClick={clearSelection}
                    className="flex items-center mr-5 text-gray-300 hover:text-white"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </button>
                  <button 
                    onClick={() => setShowBulkDeleteModal(true)}
                    className="flex items-center text-red-500 hover:text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete Selected ({selectedQuestions.size})
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* AI Generation Modal */}
        {isGeneratingAI && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-lg p-6 mb-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Generate Questions with AI</h2>
              <button
                onClick={() => setIsGeneratingAI(false)}
                className="text-gray-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  value={aiGenerationCount}
                  onChange={(e) => setAiGenerationCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                  min="1"
                  max="20"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Generate between 1 and 20 questions at once
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Question Type
                </label>
                <select
                  value={selectedQuestionType}
                  onChange={(e) => setSelectedQuestionType(e.target.value as QuestionType)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  {/* Other question types currently unsupported by AI, will be greyed out */}
                  <option value="text" disabled>Text (Coming Soon)</option>
                  <option value="coding" disabled>Coding (Coming Soon)</option>
                  <option value="true-false" disabled>True/False (Coming Soon)</option>
                </select>
                <p className="mt-1 text-xs text-gray-400">
                  Currently, only multiple-choice questions are supported for AI generation
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Assessment Details
                </label>
                <div className="bg-gray-700 border border-gray-600 rounded-md p-3 text-sm text-gray-300">
                  <div className="flex items-center mb-1">
                    <span className="font-semibold w-24">Category:</span>
                    <span className="capitalize">{assessment?.category}</span>
                  </div>
                  <div className="flex items-center mb-1">
                    <span className="font-semibold w-24">Difficulty:</span>
                    <span className="capitalize">{assessment?.difficulty}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold w-24">Title:</span>
                    <span className="truncate">{assessment?.title}</span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  AI will generate questions based on these assessment details
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleGenerateAIQuestions}
                  disabled={aiGenerationLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  {aiGenerationLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <FaRobot className="w-4 h-4" />
                      <span>Generate Questions</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}

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
                assessmentId={params.id}
                onSubmit={async (data) => {
                  // Cast the Partial<AssessmentQuestion> to the required Omit type
                  // This is safe because QuestionForm ensures all required fields are present
                  await handleAddQuestion(data as Omit<AssessmentQuestion, 'id' | 'createdAt' | 'updatedAt'>);
                }}
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
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setIsGeneratingAI(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700"
                >
                  <FaRobot className="w-4 h-4 mr-2" />
                  Generate with AI
                </button>
                <button
                  onClick={() => setIsAddingQuestion(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600"
                >
                  <FaPlus className="w-4 h-4 mr-2" />
                  Add Manually
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {isSavingOrder && (
              <div className="mb-4 p-2 bg-blue-500/10 text-blue-500 rounded-md text-center">
                Saving question order...
              </div>
            )}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={questions.map(q => q.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <SortableQuestionItem
                      key={question.id}
                      question={question}
                      index={index}
                      onEdit={handleEditQuestion}
                      onDelete={handleDeleteQuestion}
                      isSelected={selectedQuestions.has(question.id)}
                      onSelect={toggleQuestionSelection}
                      isDragging={false}
                    />
                  ))}
                </div>
              </SortableContext>
              
              <DragOverlay>
                {activeId && activeQuestion ? (
                  <SortableQuestionItem
                    question={activeQuestion}
                    index={questions.findIndex(q => q.id === activeId)}
                    onEdit={handleEditQuestion}
                    onDelete={handleDeleteQuestion}
                    isSelected={selectedQuestions.has(activeId)}
                    onSelect={toggleQuestionSelection}
                    isDragging={true}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4">Delete Question</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this question? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDeleteQuestion}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteQuestion}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    "Delete Question"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Bulk Delete Confirmation Modal */}
        {showBulkDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl border border-gray-700"
            >
              <h3 className="text-xl font-bold text-white mb-4">Delete Multiple Questions</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete {selectedQuestions.size} {selectedQuestions.size === 1 ? 'question' : 'questions'}? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowBulkDeleteModal(false)}
                  disabled={isBulkDeleting}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={isBulkDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                >
                  {isBulkDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    "Delete Questions"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
} 