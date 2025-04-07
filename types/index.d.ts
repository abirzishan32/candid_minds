interface Feedback {
    id: string;
    interviewId: string;
    totalScore: number;
    categoryScores: Array<{
      name: string;
      score: number;
      comment: string;
    }>;
    strengths: string[];
    areasForImprovement: string[];
    finalAssessment: string;
    createdAt: string;
  }
  
  interface Interview {
    id: string;
    role: string;
    level: string;
    questions: string[];
    techstack: string[];
    createdAt: string;
    userId: string;
    type: string;
    finalized: boolean;
  }
  
  interface CreateFeedbackParams {
    interviewId: string;
    userId: string;
    transcript: { role: string; content: string }[];
    feedbackId?: string;
  }
  
  interface User {
    name: string;
    email: string;
    id: string;
    role: 'admin' | 'user';
    lastActive?: string;
    createdAt?: string;
  }

  interface SetUserRoleParams {
    userId: string;
    newRole: 'admin' | 'user';
  }
  
  interface InterviewCardProps {
    id?: string;
    userId?: string;
    role: string;
    type: string;
    techstack: string[];
    createdAt?: string;
    isAuthenticated?: boolean;
  }
  
  interface AgentProps {
    userName: string;
    userId?: string;
    interviewId?: string;
    feedbackId?: string;
    type: "generate" | "interview";
    questions?: string[];
  }
  
  interface RouteParams {
    params: Promise<Record<string, string>>;
    searchParams: Promise<Record<string, string>>;
  }
  
  interface GetFeedbackByInterviewIdParams {
    interviewId: string;
    userId: string;
  }
  
  interface GetLatestInterviewsParams {
    userId: string;
    limit?: number;
  }
  
  interface SignInParams {
    email: string;
    idToken: string;
  }
  
  interface SignUpParams {
    uid: string;
    name: string;
    email: string;
    password: string;
  }
  
  type FormType = "sign-in" | "sign-up";
  
  interface InterviewFormProps {
    interviewId: string;
    role: string;
    level: string;
    type: string;
    techstack: string[];
    amount: number;
  }
  
  interface TechIconProps {
    techStack: string[];
  }


interface InterviewCardProps {
  id: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt?: string;
  userId: string;
  isCompanyInterview?: boolean;
  companyName?: string;
  level?: string;
  isAuthenticated?: boolean;
}


interface ResumeAnalysisResult {
  overallScore: number;
  sectionScores: Record<string, number>;
  sectionFeedback: Record<string, string>;
  strengths: string[];
  improvements: {
    title: string;
    description: string;
  }[];
  keywords: string[];
  missedKeywords?: string[];
  suggestions: {
    title: string;
    description: string;
    before?: string;
    after?: string;
    priority?: 'high' | 'medium' | 'low';
  }[];
  timestamp: string;
}

interface ResumeAnalysisRecord {
  id: string;
  userId: string;
  fileName: string;
  analysis: ResumeAnalysisResult;
  createdAt: string;
}