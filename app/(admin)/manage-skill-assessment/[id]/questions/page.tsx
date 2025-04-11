"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaArrowLeft, FaQuestion, FaGripVertical } from "react-icons/fa";
import { toast } from "sonner";
import { 
  getSkillAssessmentById, 
  createAssessmentQuestion,
  updateAssessmentQuestion,
  deleteAssessmentQuestion,
  updateSkillAssessment
} from "@/lib/actions/skill-assessment.action";
import { SkillAssessment, AssessmentQuestion, AssessmentOption } from "@/lib/actions/skill-assessment.action";
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
}

function SortableQuestionItem({ question, index, onEdit, onDelete }: SortableQuestionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease',
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 1,
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
        isDragging ? 'border-2 border-blue-500 ring-2 ring-blue-500/20' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 pr-4">
          <div className="flex items-center mb-2">
            <div 
              {...attributes} 
              {...listeners} 
              className="mr-3 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-300 transition-colors"
            >
              <motion.div
                animate={{ 
                  y: isDragging ? [0, -2, 0] : 0,
                  transition: isDragging ? { repeat: Infinity, duration: 1 } : {}
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
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const response = await deleteAssessmentQuestion(questionId, params.id);
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
              <button
                onClick={() => setIsAddingQuestion(true)}
                className="px-6 py-3 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600"
              >
                Add Your First Question
              </button>
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
                    />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>
                {activeId ? (
                  <motion.div
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 1.05, opacity: 1 }}
                    className="bg-gray-800 rounded-lg p-6 border-2 border-blue-500 ring-2 ring-blue-500/20 shadow-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center mb-2">
                          <div className="mr-3 text-gray-400">
                            <FaGripVertical className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-medium text-gray-400 mr-2">
                            Question {questions.findIndex(q => q.id === activeId) + 1}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ${
                              getQuestionTypeColor(activeQuestion?.type || '')
                            }`}
                          >
                            {activeQuestion?.type}
                          </span>
                        </div>
                        <p className="text-lg font-medium text-white mb-3">
                          {activeQuestion?.question}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </>
        )}
      </div>
    </div>
  );
} 