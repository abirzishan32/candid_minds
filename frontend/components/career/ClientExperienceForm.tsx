"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Briefcase, Loader2, ChevronDown, X, Smile, Image as ImageIcon, Building, Award, UserRoundIcon, Search, HelpCircle, PlusCircle, ThumbsUp, ThumbsDown, Meh, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createCareerExperience, InterviewExperience, InterviewSource } from "@/lib/actions/career-experience.action";
import { motion, AnimatePresence } from "framer-motion";

type FormValues = {
  companyName: string;
  position: string;
  experience: InterviewExperience;
  source: InterviewSource;
  details: string;
};

// List of allowed companies
const ALLOWED_COMPANIES = [
  "6amTech", "6sense Technologies", "a1qa", "All Generation Tech", "Ami Probashi Ltd.", 
  "Anchorblock Technology", "AnnonLab Ltd.", "Apon Bazaar", "Appscode Ltd", "Apsis Solutions Ltd.", 
  "Apurba Technologies Ltd.", "Astha IT", "Augmedix", "Auxinix", "Bangladesh Software Solution - BSS", 
  "BDCOM Online Ltd", "Bdtask Limited", "Beacontech Limited", "Bit Mascot", "Bitmorpher Ltd.", 
  "BJIT Ltd", "bKash Limited", "BRAC IT Services Limited", "Brain Station 23", 
  "British American Tobacco Bangladesh", "Business Novelty Limited", "Cefalo Bangladesh Ltd", 
  "Chaldal Ltd.", "CodeLab FZC LLC", "Codemen Solution Inc", "Creative Business Group Ltd.", 
  "Daraz Bangladesh", "Data Edge Limited", "DevSpike", "Ding", "Divine IT Limited", 
  "DocTime", "Dotlines Technologies Ltd", "Dynamic Solution Innovators Ltd.", "EDOTCO BD", 
  "Enosis Solutions", "ERA Infotech Ltd.", "Esquire Technology Limited", "Exabyting Technologies Ltd", 
  "Fiftytwo Digital Ltd.", "Foodpanda Bangladesh Ltd", "Fountain IT", 
  "Frontier Semiconductor Bangladesh (FSMB)", "Fronture Technologies Limited", "Giga Tech Limited", 
  "Gigalogy", "Green Delta Insurance Company Limited", "HawarIT Limited", "Huawei", 
  "iBOS Limited", "iFarmer Limited", "Indetechs Software Limited", "Infolytx Bangladesh Limited", 
  "Inkam Ltd", "Inventive Apps Ltd.", "IQVIA", "JB Connect Ltd.", "Kaz Software", 
  "Kite Games Studio", "Kona Software Limited", "LEADS Corporation Limited", "Lynkeus AI", 
  "Media365 Limited", "Mediusware Ltd.", "MetLife", "Millennium Information Solution Limited", 
  "Mir Info Systems Ltd.", "Nagad", "Nascenia Limited", "Navana Group", "Neural Semiconductor Limited", 
  "Nexdecade Technology (Pvt.) Ltd.", "OnnoRokom Projukti Limited", "OnnoRokom Software Ltd.", 
  "Optimizely", "Orange Solutions Limited", "Orbitax Bangladesh Limited", "Pathao", 
  "Pioneer Alpha", "Polygon Technology", "Poridhi", "Portonics Limited", "Praava Health", 
  "Pridesys IT Ltd.", "RedDot Digital Limited", "ReliSource", "REVE Systems", "Riseup Labs", 
  "RITE Solutions Ltd.", "Robi Axiata Limited", "RocketPhone", "Rokomari.com", 
  "Samsung R&D Institute Bangladesh", "Sazim Tech Ltd.", "Scube Technologies Limited", 
  "SEBPO", "SELISE Digital Platforms", "Shadhin Lab Technologies", "ShellBeeHaken Ltd.", 
  "Shikho Technologies BD Ltd", "Silicon Orchard Ltd.", "SSL Wireless", "Startise", 
  "Strativ AB Ltd.", "Streams Tech Ltd", "SupreoX Ltd", "TechForing Ltd", "TechnoNext Ltd.", 
  "Techsist Limited", "Tekarsh Bangladesh Limited", "Tero Labs", "Themefic", "Therap (BD) Ltd.", 
  "THT-Space Electrical Company Ltd.", "TigerIT Bangladesh Ltd.", "Tikweb Bangladesh", "Tiller", 
  "TNC GLOBAL LTD", "Truck Lagbe", "Twinbit Limited", "United Group", 
  "upay (UCB Fintech Company Limited)", "Vivasoft Limited", "Voyage AI", "Wafi Solutions", 
  "WellDev Bangladesh Ltd.", "WPPOOL", "Xeon Technology Ltd."
].sort();

// Server action to get the current user
async function fetchCurrentUser() {
  
  const { getCurrentUser } = await import("@/lib/actions/auth.action");
  return getCurrentUser();
}

// Helper component for tooltips
function Tooltip({ children, content }: { children: React.ReactNode, content: string }) {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="relative" onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-30 text-xs text-gray-300"
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ClientExperienceForm() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [questionInput, setQuestionInput] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [filteredCompanies, setFilteredCompanies] = useState<string[]>([]);
  const companyInputRef = useRef<HTMLDivElement>(null);
  const questionInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue, getValues } = useForm<FormValues>({
    defaultValues: {
      companyName: '',
      position: '',
      experience: 'neutral',
      source: 'Applied online',
      details: '',
    }
  });

  // Watch the details field for character counting
  const details = watch("details") || "";
  const detailsLength = details.length;
  const maxDetailsLength = 1000;

  // Handle click outside to close company dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (companyInputRef.current && !companyInputRef.current.contains(event.target as Node)) {
        setShowCompanyDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Filter companies based on search term
  useEffect(() => {
    const filtered = ALLOWED_COMPANIES.filter(company => 
      company.toLowerCase().includes(companySearch.toLowerCase())
    );
    setFilteredCompanies(filtered);
  }, [companySearch]);
  
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
    
    // Add question with animation
    setQuestions([...questions, questionInput.trim()]);
    setQuestionInput('');
    
    // Focus back on the input for quick addition of multiple questions
    setTimeout(() => {
      if (questionInputRef.current) {
        questionInputRef.current.focus();
      }
    }, 100);
    
    // Show a subtle toast for feedback
    if (questions.length === 0) {
      toast.success("First question added! Add more if you remember them.", {
        duration: 2000,
        position: "bottom-center",
      });
    }
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleCompanySelect = (company: string) => {
    setValue("companyName", company);
    setCompanySearch(company);
    setShowCompanyDropdown(false);
  };
  
  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast.error("You must be logged in to submit an experience.");
      return;
    }

    // Validate that the company is in our allowed list
    if (!ALLOWED_COMPANIES.includes(data.companyName)) {
      toast.error("Please select a company from the dropdown list.");
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
        setCompanySearch('');
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
  

  return (
    <div className="rounded-xl overflow-hidden relative">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex space-x-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              <UserRoundIcon className="w-5 h-5" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Compact View (until expanded) */}
            {!expanded ? (
              <motion.div 
                className="w-full mb-4 cursor-text border border-transparent hover:border-gray-700 rounded-xl p-3 transition-colors"
                onClick={() => setExpanded(true)}
                whileHover={{ scale: 1.01 }}
              >
                <textarea
                  placeholder="Share your interview experience... Help others prepare for their interviews!"
                  className="w-full bg-transparent border-none focus:outline-none text-white resize-none min-h-[60px] placeholder-gray-500"
                  onClick={() => setExpanded(true)}
                ></textarea>
              </motion.div>
            ) : (
              <>
                {/* Company and Position fields */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <div 
                    ref={companyInputRef}
                    className="flex-1 min-w-0 relative"
                  >
                    <div 
                      className="flex items-center gap-1 bg-gray-800/50 rounded-full px-3 py-1.5 border border-gray-700 hover:border-blue-500 transition-colors"
                      onClick={() => setShowCompanyDropdown(true)}
                    >
                      <Building className="h-4 w-4 text-blue-400 flex-shrink-0" />
                      <input
                        {...register("companyName", { 
                          required: true,
                          validate: value => ALLOWED_COMPANIES.includes(value) || "Please select a company from the list"
                        })}
                        placeholder="Select company"
                        className="bg-transparent border-none focus:outline-none text-white w-full text-sm"
                        value={companySearch}
                        onChange={(e) => {
                          setCompanySearch(e.target.value);
                          setValue("companyName", e.target.value);
                          setShowCompanyDropdown(true);
                        }}
                        autoComplete="off"
                      />
                      <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    </div>
                    
                    <AnimatePresence>
                      {showCompanyDropdown && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute left-0 right-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-20"
                        >
                          {filteredCompanies.length > 0 ? (
                            filteredCompanies.map(company => (
                              <motion.div 
                                key={company}
                                className="px-3 py-2 hover:bg-gray-700 cursor-pointer text-sm text-white transition-colors"
                                onClick={() => handleCompanySelect(company)}
                                whileHover={{ backgroundColor: 'rgba(75, 85, 99, 0.7)' }}
                              >
                                {company}
                              </motion.div>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-400">
                              No companies match your search
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {errors.companyName && (
                      <div className="text-red-500 text-xs mt-1 ml-2">
                        Please select a company from the list
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0 flex items-center gap-1 bg-gray-800/50 rounded-full px-3 py-1.5 border border-gray-700 hover:border-blue-500 transition-colors">
                    <Award className="h-4 w-4 text-blue-400" />
                    <input
                      {...register("position", { required: true })}
                      placeholder="Position"
                      className="bg-transparent border-none focus:outline-none text-white w-full text-sm"
                    />
                  </div>
                </div>
                
                {/* Experience Textarea */}
                <div className="w-full mb-4 relative">
                  <textarea
                    {...register("details", { required: true, maxLength: maxDetailsLength })}
                    placeholder="Share details to help others prepare for their interviews. Include information about the interview process, stages, and any tips for success."
                    className="w-full bg-transparent border border-gray-700 focus:border-blue-500 rounded-lg p-3 transition-colors text-white resize-none min-h-[120px] placeholder-gray-500"
                    maxLength={maxDetailsLength}
                  ></textarea>
                  
                  <div className="absolute bottom-2 right-3 text-xs text-gray-400">
                    <span className={detailsLength > maxDetailsLength * 0.9 ? "text-amber-400" : ""}>
                      {detailsLength}
                    </span>
                    <span>/</span>
                    <span>{maxDetailsLength}</span>
                  </div>
                </div>
                
                {/* Interview Questions - Enhanced with better UI */}
                <div className="mb-4">
                  <div className="mb-2 flex items-center">
                    <h4 className="text-white text-sm font-medium">Interview Questions</h4>
                    <span className="ml-2 text-xs text-gray-400">({questions.length} added)</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 min-w-0 flex items-center gap-1 bg-gray-800/50 rounded-full px-3 py-1.5 border border-gray-700 hover:border-blue-500 transition-colors">
                      <input
                        ref={questionInputRef}
                        value={questionInput}
                        onChange={(e) => setQuestionInput(e.target.value)}
                        placeholder="Add a specific interview question"
                        className="bg-transparent border-none focus:outline-none text-white w-full text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addQuestion())}
                      />
                    </div>
                    <motion.button 
                      type="button"
                      onClick={addQuestion}
                      className="bg-blue-600 text-white p-1.5 rounded-full hover:bg-blue-700 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={!questionInput.trim()}
                    >
                      <PlusCircle className="h-4 w-4" />
                    </motion.button>
                  </div>
                  
                  {questions.length === 0 && (
                    <p className="text-xs text-gray-400 mb-2">
                      Adding specific questions helps others prepare. Example: "How do you handle conflicts in a team?"
                    </p>
                  )}
                  
                  {/* Question Tags with Animations */}
                  <motion.div className="flex flex-wrap gap-2 mt-2" layout>
                    <AnimatePresence>
                      {questions.map((q, index) => (
                        <motion.div 
                          key={index}
                          className="bg-gray-800 text-gray-300 text-xs rounded-full px-3 py-1.5 flex items-center gap-1 border border-gray-700 hover:border-blue-500 transition-colors"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          whileHover={{ backgroundColor: 'rgba(55, 65, 81, 1)' }}
                        >
                          <span className="truncate max-w-[200px]">{q}</span>
                          <motion.button
                            type="button"
                            onClick={() => removeQuestion(index)}
                            className="text-gray-500 hover:text-red-400"
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <X className="h-3 w-3" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </div>
                
                {/* Bottom Form fields with Tooltips */}
                <div className="flex flex-wrap gap-2 mb-4 items-center">
                  <div className="relative flex items-center">
                    <Tooltip content="Rate your overall feeling about this interview experience. This helps others understand what to expect.">
                      <div className="flex items-center mr-2">
                        <select
                          {...register("experience")}
                          className="bg-gray-800/50 border border-gray-700 rounded-full px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-blue-500 appearance-none pr-8"
                        >
                          <option value="positive">Positive Experience</option>
                          <option value="neutral">Neutral Experience</option>
                          <option value="negative">Negative Experience</option>
                        </select>
                        <div className="absolute right-2 pointer-events-none flex items-center">
                          {watch("experience") === "positive" && <ThumbsUp className="h-4 w-4 text-green-400" />}
                          {watch("experience") === "neutral" && <Meh className="h-4 w-4 text-yellow-400" />}
                          {watch("experience") === "negative" && <ThumbsDown className="h-4 w-4 text-red-400" />}
                        </div>
                      </div>
                      <HelpCircle className="h-4 w-4 text-gray-500" />
                    </Tooltip>
                  </div>
                  
                  <div className="relative flex items-center">
                    <Tooltip content="How you were connected to this interview. This helps candidates understand the typical recruitment channels for this company.">
                      <div className="flex items-center mr-2">
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
                      <HelpCircle className="h-4 w-4 text-gray-500" />
                    </Tooltip>
                  </div>
                </div>
                
                {/* Experience Rating Legend */}
                <div className="mb-4 p-3 bg-gray-800/30 rounded-lg border border-gray-800">
                  <h4 className="text-sm font-medium text-white mb-2">What do the ratings mean?</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4 text-green-400" />
                      <span className="text-xs text-gray-300">Positive: Enjoyable interview, fair questions, good communication</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Meh className="h-4 w-4 text-yellow-400" />
                      <span className="text-xs text-gray-300">Neutral: Average interview, neither good nor bad</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="h-4 w-4 text-red-400" />
                      <span className="text-xs text-gray-300">Negative: Poor experience, difficult process, bad communication</span>
                    </div>
                  </div>
                </div>
                
                {/* Why sharing is important */}
                <div className="mb-4 text-xs text-gray-400 flex items-start gap-2">
                  <ExternalLink className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <p>Sharing your experience helps other candidates prepare better and improves transparency in the hiring process.</p>
                </div>
                
                {/* Footer with Post Button */}
                <div className="flex justify-end pt-3 border-t border-gray-800">
                  <button
                    type="button"
                    onClick={() => {
                      setExpanded(false);
                      reset();
                      setQuestions([]);
                      setCompanySearch('');
                    }}
                    className="mr-2 px-4 py-1.5 text-gray-300 hover:text-white font-medium rounded-full text-sm"
                  >
                    Cancel
                  </button>
                  
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium disabled:opacity-50 disabled:pointer-events-none text-sm flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>Share Experience</>
                    )}
                  </motion.button>
                </div>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
} 