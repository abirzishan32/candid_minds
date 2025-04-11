"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, Loader2, ChevronDown, X, Smile, Image as ImageIcon, Building, Award } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createCareerExperience, InterviewExperience, InterviewSource } from "@/lib/actions/career-experience.action";

type FormValues = {
  companyName: string;
  position: string;
  experience: InterviewExperience;
  source: InterviewSource;
  details: string;
};

// Server action to get the current user
async function fetchCurrentUser() {
  
  const { getCurrentUser } = await import("@/lib/actions/auth.action");
  return getCurrentUser();
}

export default function ClientExperienceForm() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [questionInput, setQuestionInput] = useState('');
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<FormValues>({
    defaultValues: {
      companyName: '',
      position: '',
      experience: 'neutral',
      source: 'Applied online',
      details: '',
    }
  });
  
  useEffect(() => {
    const getUser = async () => {
      try {
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching current user:", error);
      } finally {
        setLoading(false);
      }
    };
    
    getUser();
  }, []);
  
  const addQuestion = () => {
    if (questionInput.trim() === '') return;
    setQuestions([...questions, questionInput.trim()]);
    setQuestionInput('');
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };
  
  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast.error("You must be logged in to submit an experience.");
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await createCareerExperience({
        userId: user.id,
        companyName: data.companyName,
        position: data.position,
        experience: data.experience,
        source: data.source,
        details: data.details,
        questions: questions,
      });

      if (result.success) {
        toast.success("Your experience has been shared!");
        reset();
        setQuestions([]);
        setExpanded(false);
        router.refresh();
      } else {
        toast.error(result.message || "Failed to share your experience.");
      }
    } catch (error) {
      console.error("Error submitting experience:", error);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-6">
        <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="text-center py-6 border border-gray-800 rounded-lg bg-gray-900/50">
        <Briefcase className="h-8 w-8 text-blue-500 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-white mb-2">Share Your Experience</h3>
        <p className="text-gray-400 mb-4 px-4 text-sm">
          Sign in to share your interview experience anonymously
        </p>
        <Link 
          href="/sign-in" 
          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium transition-colors text-sm"
        >
          Sign in
        </Link>
      </div>
    );
  }
  
  // Twitter-like posting experience
  return (
    <div className="rounded-xl overflow-hidden relative">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex space-x-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              A
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Compact View (until expanded) */}
            {!expanded ? (
              <div 
                className="w-full mb-4 cursor-text"
                onClick={() => setExpanded(true)}
              >
                <textarea
                  placeholder="Share your interview experience..."
                  className="w-full bg-transparent border-none focus:outline-none text-white resize-none min-h-[60px] placeholder-gray-500"
                  onClick={() => setExpanded(true)}
                ></textarea>
              </div>
            ) : (
              <>
                {/* Company and Position fields */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <div className="flex-1 min-w-0 flex items-center gap-1 bg-gray-800/50 rounded-full px-3 py-1.5 border border-gray-700">
                    <Building className="h-4 w-4 text-blue-400" />
                    <input
                      {...register("companyName", { required: true })}
                      placeholder="Company name"
                      className="bg-transparent border-none focus:outline-none text-white w-full text-sm"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0 flex items-center gap-1 bg-gray-800/50 rounded-full px-3 py-1.5 border border-gray-700">
                    <Award className="h-4 w-4 text-blue-400" />
                    <input
                      {...register("position", { required: true })}
                      placeholder="Position"
                      className="bg-transparent border-none focus:outline-none text-white w-full text-sm"
                    />
                  </div>
                </div>
                
                {/* Experience Textarea */}
                <div className="w-full mb-4">
                  <textarea
                    {...register("details", { required: true })}
                    placeholder="What was your interview experience like? What questions were asked? Share details to help others..."
                    className="w-full bg-transparent border-none focus:outline-none text-white resize-none min-h-[120px] placeholder-gray-500"
                  ></textarea>
                </div>
                
                {/* Interview Questions */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 min-w-0 flex items-center gap-1 bg-gray-800/50 rounded-full px-3 py-1.5 border border-gray-700">
                      <input
                        value={questionInput}
                        onChange={(e) => setQuestionInput(e.target.value)}
                        placeholder="Add a question you were asked (optional)"
                        className="bg-transparent border-none focus:outline-none text-white w-full text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addQuestion())}
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={addQuestion}
                      className="bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Question Tags */}
                  {questions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {questions.map((q, index) => (
                        <div 
                          key={index}
                          className="bg-gray-800 text-gray-300 text-xs rounded-full px-3 py-1 flex items-center gap-1 border border-gray-700"
                        >
                          <span className="truncate max-w-[150px]">{q}</span>
                          <button
                            type="button"
                            onClick={() => removeQuestion(index)}
                            className="text-gray-500 hover:text-gray-300"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Bottom Form fields */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <select
                    {...register("experience")}
                    className="bg-gray-800/50 border border-gray-700 rounded-full px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-blue-500"
                  >
                    <option value="positive">Positive Experience</option>
                    <option value="neutral">Neutral Experience</option>
                    <option value="negative">Negative Experience</option>
                  </select>
                  
                  <select
                    {...register("source")}
                    className="bg-gray-800/50 border border-gray-700 rounded-full px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-blue-500"
                  >
                    <option value="Applied online">Applied online</option>
                    <option value="Campus Recruiting">Campus Recruiting</option>
                    <option value="Recruiter">Recruiter</option>
                    <option value="Employee Referral">Employee Referral</option>
                    <option value="In Person">In Person</option>
                    <option value="Staffing Agency">Staffing Agency</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </>
            )}
            
            {/* Action Bar */}
            <div className={`flex items-center ${expanded ? 'justify-between' : 'justify-end'}`}>
              {expanded && (
                <div className="flex gap-2 text-blue-400">
                  <button type="button" className="p-2 rounded-full hover:bg-gray-800/50">
                    <ImageIcon className="h-5 w-5" />
                  </button>
                  <button type="button" className="p-2 rounded-full hover:bg-gray-800/50">
                    <Smile className="h-5 w-5" />
                  </button>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                {expanded && (
                  <button
                    type="button"
                    onClick={() => setExpanded(false)}
                    className="px-4 py-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                )}
                
                <button
                  type={expanded ? "submit" : "button"}
                  onClick={expanded ? undefined : () => setExpanded(true)}
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-full hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    expanded ? "Post" : "Share experience"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
} 