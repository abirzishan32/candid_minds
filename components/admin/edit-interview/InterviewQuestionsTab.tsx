"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, ChevronUp, ChevronDown, Save, X, Sparkles, Loader2, Check } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { generateQuestionsWithAI } from '@/lib/actions/ai.action';
import { Badge } from '@/components/ui/badge';

interface InterviewQuestionsTabProps {
    questions: string[];
    onChange: (questions: string[]) => void;
    role?: string;
    level?: string;
    type?: string;
}

const InterviewQuestionsTab = ({
                                   questions,
                                   onChange,
                                   role = '',
                                   level = '',
                                   type = ''
                               }: InterviewQuestionsTabProps) => {
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editingText, setEditingText] = useState<string>('');
    const [newQuestion, setNewQuestion] = useState<string>('');

    // AI question generation states
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiQuestions, setAiQuestions] = useState<string[]>([]);
    const [appliedQuestions, setAppliedQuestions] = useState<Record<number, boolean>>({});
    const [error, setError] = useState<string | null>(null);

    const addQuestion = () => {
        if (newQuestion.trim() !== '') {
            onChange([...questions, newQuestion.trim()]);
            setNewQuestion('');
        }
    };

    const editQuestion = (index: number) => {
        setEditingIndex(index);
        setEditingText(questions[index]);
    };

    const saveEditedQuestion = () => {
        if (editingIndex !== null && editingText.trim() !== '') {
            const updatedQuestions = [...questions];
            updatedQuestions[editingIndex] = editingText.trim();
            onChange(updatedQuestions);
            setEditingIndex(null);
            setEditingText('');
        }
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setEditingText('');
    };

    const deleteQuestion = (index: number) => {
        const updatedQuestions = [...questions];
        updatedQuestions.splice(index, 1);
        onChange(updatedQuestions);
    };

    const moveQuestion = (index: number, direction: 'up' | 'down') => {
        if (
            (direction === 'up' && index === 0) ||
            (direction === 'down' && index === questions.length - 1)
        ) {
            return;
        }

        const updatedQuestions = [...questions];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap questions
        [updatedQuestions[index], updatedQuestions[targetIndex]] =
            [updatedQuestions[targetIndex], updatedQuestions[index]];

        onChange(updatedQuestions);
    };

    // AI question generation function
    const handleGenerateQuestions = async () => {
        setIsGenerating(true);
        setError(null);
        try {
            const response = await generateQuestionsWithAI({
                role,
                level,
                type,
                currentQuestions: questions
            });

            if (response.success) {
                setAiQuestions(response.questions);
                setAppliedQuestions({});
            } else {
                setError(response.message || "Failed to generate questions");
            }
        } catch (err) {
            console.error("Error generating questions:", err);
            setError("An unexpected error occurred");
        } finally {
            setIsGenerating(false);
        }
    };

    // Apply an AI-generated question
    const applyQuestion = (index: number) => {
        const questionToApply = aiQuestions[index];
        onChange([...questions, questionToApply]);

        // Mark as applied
        setAppliedQuestions(prev => ({
            ...prev,
            [index]: true
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-medium text-white">Interview Questions</h3>
                    <p className="text-gray-400 text-sm">Edit, reorder, or add new questions for this interview.</p>
                </div>
                <Button
                    onClick={handleGenerateQuestions}
                    disabled={isGenerating}
                    className="bg-indigo-900/40 hover:bg-indigo-800/60 text-indigo-300 border border-indigo-800/50"
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating...
                        </>
                    ) : (
                        <>
                            <Sparkles className="h-4 w-4 mr-2" /> Generate with AI
                        </>
                    )}
                </Button>
            </div>

            {/* AI-Generated Questions Section */}
            {aiQuestions.length > 0 && (
                <div className="bg-indigo-950/30 border border-indigo-800/30 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                        <Sparkles className="h-4 w-4 text-indigo-400 mr-2" />
                        <h4 className="text-white text-sm font-medium">AI-Generated Questions</h4>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                        {aiQuestions.map((question, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-start bg-black/40 border border-indigo-800/20 rounded-lg p-3"
                            >
                                <p className="text-gray-300 text-sm flex-grow mr-3">{question}</p>
                                <Button
                                    size="sm"
                                    onClick={() => applyQuestion(index)}
                                    disabled={appliedQuestions[index]}
                                    className={appliedQuestions[index]
                                        ? "bg-green-900/30 text-green-300 border border-green-800/30 cursor-default"
                                        : "bg-indigo-900/30 hover:bg-indigo-800/50 text-indigo-300 border border-indigo-800/30"
                                    }
                                >
                                    {appliedQuestions[index]
                                        ? <><Check className="h-3 w-3 mr-1" /> Applied</>
                                        : "Apply"}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-900/30 border border-red-800/30 text-red-300 p-4 rounded-lg">
                    {error}
                </div>
            )}

            {questions.length === 0 && (
                <div className="bg-gray-800 border border-gray-700 border-dashed rounded-lg p-8 text-center">
                    <p className="text-gray-400">No questions added yet. Add your first question below.</p>
                </div>
            )}

            {/* Question List */}
            <div className="space-y-4">
                {questions.map((question, index) => (
                    <div
                        key={index}
                        className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                    >
                        {editingIndex === index ? (
                            <div className="space-y-3">
                                <Textarea
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                    className="bg-black border-gray-700 text-white min-h-[100px]"
                                />
                                <div className="flex justify-end space-x-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-gray-700 text-gray-300 hover:bg-gray-900"
                                        onClick={cancelEdit}
                                    >
                                        <X className="h-4 w-4 mr-1" /> Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="bg-primary-100 hover:bg-primary-200 text-black"
                                        onClick={saveEditedQuestion}
                                    >
                                        <Save className="h-4 w-4 mr-1" /> Save
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start justify-between gap-4">
                                <p className="text-gray-300 text-sm flex-grow">{question}</p>
                                <div className="flex items-center space-x-1 flex-shrink-0">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="p-1 hover:bg-gray-700 text-gray-400"
                                        onClick={() => moveQuestion(index, 'up')}
                                        disabled={index === 0}
                                    >
                                        <ChevronUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="p-1 hover:bg-gray-700 text-gray-400"
                                        onClick={() => moveQuestion(index, 'down')}
                                        disabled={index === questions.length - 1}
                                    >
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="p-1 hover:bg-gray-700 text-blue-400"
                                        onClick={() => editQuestion(index)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="p-1 hover:bg-gray-700 text-red-400"
                                        onClick={() => deleteQuestion(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add New Question */}
            <div className="bg-black/30 border border-gray-800 rounded-lg p-4">
                <h4 className="text-white text-sm font-medium mb-2">Add New Question</h4>
                <Textarea
                    placeholder="Type a new interview question here..."
                    className="bg-gray-800 border-gray-700 text-white mb-3"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                />
                <div className="flex justify-end">
                    <Button
                        className="bg-green-900/30 hover:bg-green-800/50 text-green-300 border border-green-800/30"
                        onClick={addQuestion}
                        disabled={!newQuestion.trim()}
                    >
                        <Plus className="h-4 w-4 mr-1" /> Add Question
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default InterviewQuestionsTab;