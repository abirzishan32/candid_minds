import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, Stars, Zap, Award, FileText, Users, Brain, Bot } from 'lucide-react';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { Button } from '@/components/ui/button';

export default async function HomePage() {
  const user = await getCurrentUser();
  const isAuthenticated = !!user;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background grid pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 z-0"></div>
        
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black z-0"></div>
        
        {/* Animated glow effect */}
        <div className="absolute -top-40 -right-40 h-96 w-96 bg-primary-100 opacity-20 blur-[150px] rounded-full z-0"></div>
        <div className="absolute top-1/2 left-1/3 h-80 w-80 bg-blue-700 opacity-20 blur-[150px] rounded-full z-0"></div>
        
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2 space-y-8">
              <div className="inline-block bg-gradient-to-r from-primary-100 to-blue-600 bg-clip-text">
                <p className="uppercase tracking-wider text-transparent font-semibold">Next-level interview preparation</p>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="block">Ace Your Interviews with</span>
                <span className="bg-gradient-to-r from-primary-100 to-blue-600 bg-clip-text text-transparent">
                  AI-Powered Voice Assistant
                </span>
              </h1>
              
              <p className="text-lg text-gray-400 leading-relaxed max-w-lg">
                Prepare for tech interviews with realistic AI-driven mock interviews, personalized feedback, and data-driven skill assessments.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                {isAuthenticated ? (
                  <Link href="/interview-home">
                    <Button size="lg" className="bg-primary-100 hover:bg-primary-200 text-black font-medium px-8 text-base">
                      Start Practicing
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/sign-up">
                    <Button size="lg" className="bg-primary-100 hover:bg-primary-200 text-black font-medium px-8 text-base">
                      Get Started
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}
                
                <Link href="#features">
                  <Button variant="outline" size="lg" className="bg-transparent text-white border-gray-700 hover:bg-gray-900 hover:border-gray-600 px-8 text-base">
                    Explore Features
                  </Button>
                </Link>
              </div>
              
              
            </div>
            
            <div className="lg:w-1/2 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-100/20 to-blue-500/20 blur-2xl rounded-full"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 shadow-2xl rounded-xl overflow-hidden">
                <Image 
                  src="/home-interview.jpg" 
                  alt="AI Interview Simulation" 
                  width={600} 
                  height={400}
                  className="w-full rounded-lg shadow-lg object-cover transition transform hover:scale-105 duration-700"
                />
                
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="py-20 bg-gray-950 relative">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Your Complete Interview Preparation Platform</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Our comprehensive platform offers everything you need to prepare for your next job interview and advance your career
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Bot className="h-8 w-8 text-primary-100" />,
                title: "AI Mock Interviews",
                description: "Practice with our AI interviewer that adapts to your responses and provides realistic interview scenarios across different tech roles."
              },
              {
                icon: <Brain className="h-8 w-8 text-primary-100" />,
                title: "Proctored Skill Assessments",
                description: "Verify your skills with tamper-proof assessments using eye-tracking and anti-cheating technology to ensure integrity."
              },
              {
                icon: <FileText className="h-8 w-8 text-primary-100" />,
                title: "ATS Resume Builder",
                description: "Create modern, ATS-friendly resumes with our AI-powered builder that optimizes your resume for both humans and automated systems."
              },
              {
                icon: <Users className="h-8 w-8 text-primary-100" />,
                title: "Interview Community",
                description: "Connect with professionals who've interviewed at your target companies and learn from thousands of shared interview experiences."
              }
            ].map((feature, index) => (
              <div key={index} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition duration-300 hover:shadow-xl hover:shadow-primary-100/5 group">
                <div className="mb-4 bg-gray-800 rounded-xl h-16 w-16 flex items-center justify-center group-hover:bg-gray-800/80">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Interview Experience Section */}
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary-100/10 blur-[100px] rounded-full"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-100 to-blue-600 rounded-lg blur opacity-30"></div>
                <div className="relative bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                  <Image 
                    src="/ai-interview-demo.jpg" 
                    alt="AI Interview Demo" 
                    width={600} 
                    height={400}
                    className="w-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-primary-100 text-black flex items-center justify-center">
                      <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="inline-block bg-gradient-to-r from-primary-100 to-blue-600 bg-clip-text mb-4">
                <p className="uppercase tracking-wider text-transparent font-semibold">AI-Powered Mock Interviews</p>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Practice Like It's the Real Thing</h2>
              
              <div className="space-y-6">
                {[
                  {
                    icon: <Zap className="h-5 w-5 text-primary-100" />,
                    title: "Dynamic Questioning",
                    description: "Our AI interviewer adapts questions based on your responses, creating a realistic interview flow."
                  },
                  {
                    icon: <Stars className="h-5 w-5 text-primary-100" />,
                    title: "Instant Feedback",
                    description: "Receive detailed feedback on your communication skills, technical knowledge, and problem-solving approach."
                  },
                  {
                    icon: <Award className="h-5 w-5 text-primary-100" />,
                    title: "Performance Analytics",
                    description: "Track your progress over time with comprehensive analytics on your interview performance."
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="mt-1 bg-gray-900 rounded-lg h-10 w-10 flex-shrink-0 flex items-center justify-center border border-gray-800">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <Link href="/interview-main">
                  <Button className="bg-primary-100 hover:bg-primary-200 text-black font-medium">
                    Try Mock Interview
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Skill Assessment Section */}
      <section className="py-20 bg-gray-950 relative">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-gradient-to-r from-primary-100 to-blue-600 bg-clip-text mb-4">
                <p className="uppercase tracking-wider text-transparent font-semibold">Proctored Skill Assessments</p>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Verify Your Skills With Confidence</h2>
              
              <p className="text-gray-400 mb-6">
                Take verified skill assessments with our advanced proctoring system that ensures integrity. Our platform monitors eye movements, prevents tab switching, and provides real-time analysis of your technical abilities.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  "Advanced eye-tracking to verify focus and prevent cheating",
                  "Tab-switching detection to maintain assessment integrity",
                  "Camera access for identity verification and monitoring",
                  "Diverse assessment topics from algorithms to system design",
                  "Industry-standard benchmarking of your skills"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1 text-primary-100">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-300">{item}</p>
                  </div>
                ))}
              </div>
              
              <Link href="/skill-assessment">
                <Button className="bg-primary-100 hover:bg-primary-200 text-black font-medium">
                  Take Verified Assessment
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            
            <div>
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-100 to-blue-600 rounded-lg blur opacity-20"></div>
                <div className="relative bg-gray-900 border border-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Proctored Assessment</h3>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-500">Live Monitoring</span>
                    </div>
                  </div>
                  
                  <div className="border border-gray-800 rounded-lg p-4 mb-6 bg-black/40">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-400 text-sm">Frontend Development</span>
                      <span className="text-sm bg-blue-900/50 text-blue-400 px-2 py-0.5 rounded">In Progress</span>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-white mb-1">Question 17/30</p>
                        <div className="w-full h-1.5 bg-gray-800 rounded-full">
                          <div className="h-1.5 bg-primary-100 rounded-full" style={{width: '56%'}}></div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400 flex items-center gap-2">
                        <svg className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Eye tracking active - Please maintain focus
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Available Assessment Topics</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        "Frontend Development", 
                        "Backend Architecture",
                        "Data Structures", 
                        "System Design",
                        "Cloud Infrastructure", 
                        "Machine Learning"
                      ].map((topic, index) => (
                        <div key={index} className="bg-gray-800/50 border border-gray-800 rounded-lg p-2 text-sm text-gray-300 flex items-center gap-2">
                          <div className="h-2 w-2 bg-primary-100 rounded-full"></div>
                          {topic}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resume Builder Section */}
      <section className="py-20 bg-black relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-blue-600/10 blur-[100px] rounded-full"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-gradient-to-r from-primary-100 to-blue-600 bg-clip-text mb-4">
                <p className="uppercase tracking-wider text-transparent font-semibold">AI-Powered Resume Builder</p>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Create ATS-Optimized Resumes</h2>
              
              <p className="text-gray-400 mb-6">
                Our AI-powered resume builder helps you create modern, ATS-friendly resumes that stand out to both hiring managers and automated screening systems.
              </p>
              
              <div className="space-y-6 mb-8">
                {[
                  {
                    title: "ATS Optimization",
                    description: "Ensure your resume passes through Applicant Tracking Systems with our keyword optimization technology."
                  },
                  {
                    title: "Modern Templates",
                    description: "Choose from dozens of professionally designed templates tailored for different industries and roles."
                  },
                  {
                    title: "Content Suggestions",
                    description: "Get AI-powered suggestions for skills, achievements, and bullet points based on your target role."
                  },
                  {
                    title: "Real-time Feedback",
                    description: "Receive instant feedback on your resume's effectiveness and suggestions for improvement."
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="mt-1 bg-gray-900 rounded-lg h-10 w-10 flex-shrink-0 flex items-center justify-center border border-gray-800">
                      <svg className="h-5 w-5 text-primary-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link href="/resume-builder">
                <Button className="bg-primary-100 hover:bg-primary-200 text-black font-medium">
                  Build Your Resume
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            
            <div>
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-100 to-blue-600 rounded-lg blur opacity-20"></div>
                <div className="relative bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-medium">Resume Builder</h3>
                    <div className="flex gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  <div className="p-6 bg-gray-950">
                    <div className="mb-6">
                      <div className="h-8 w-48 bg-gray-800 rounded mb-4"></div>
                      <div className="h-4 w-full bg-gray-800 rounded mb-2"></div>
                      <div className="h-4 w-5/6 bg-gray-800 rounded"></div>
                    </div>
                    <div className="mb-6">
                      <div className="h-6 w-36 bg-gray-800 rounded mb-3"></div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="h-16 w-full bg-gray-800 rounded"></div>
                        <div className="h-16 w-full bg-gray-800 rounded"></div>
                      </div>
                      <div className="h-4 w-full bg-gray-800 rounded mb-2"></div>
                      <div className="h-4 w-5/6 bg-gray-800 rounded"></div>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="h-6 w-36 bg-gray-800 rounded"></div>
                        <div className="text-xs px-2 py-1 bg-primary-100 text-black rounded">ATS Optimized</div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-gray-800 rounded"></div>
                        <div className="h-4 w-5/6 bg-gray-800 rounded"></div>
                        <div className="h-4 w-full bg-gray-800 rounded"></div>
                      </div>
                    </div>
                    <div className="h-4 w-32 bg-primary-100 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community and Career Section */}
     

      {/* Career Interview Experiences Section */}
      <section className="py-20 bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5 z-0"></div>
        <div className="absolute top-40 left-20 w-72 h-72 bg-blue-600/20 blur-[120px] rounded-full"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-gradient-to-r from-primary-100 to-blue-600 bg-clip-text mb-4">
                <p className="uppercase tracking-wider text-transparent font-semibold">Career Insider</p>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Authentic Interview Experiences</h2>
              
              <p className="text-gray-400 mb-6">
                Access a growing database of real interview experiences shared by professionals across hundreds of companies. Get insider knowledge about interview processes, question patterns, and company cultures.
              </p>
              
              <div className="space-y-6 mb-8">
                {[
                  {
                    title: "Company-Specific Insights",
                    description: "Browse interview experiences from top tech companies like Google, Amazon, Microsoft, and startups."
                  },
                  {
                    title: "Filter by Role and Experience",
                    description: "Find interview reports specific to your target position and seniority level."
                  },
                  {
                    title: "Contribute Your Experience",
                    description: "Share your own interview journey anonymously to help others prepare effectively."
                  },
                  {
                    title: "Trending Companies and Topics",
                    description: "Discover which companies are actively hiring and what skills are in demand."
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="mt-1 bg-gray-900 rounded-lg h-10 w-10 flex-shrink-0 flex items-center justify-center border border-gray-800">
                      <svg className="h-5 w-5 text-primary-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                      <p className="text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Link href="/career">
                <Button className="bg-primary-100 hover:bg-primary-200 text-black font-medium">
                  Explore Interview Experiences
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            
            <div>
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-100 to-blue-600 rounded-lg blur opacity-20"></div>
                <div className="relative bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-white">Recent Experiences</h3>
                    <div className="text-xs px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full">
                      Trending
                    </div>
                  </div>
                  
                  <div className="divide-y divide-gray-800">
                    {[
                      {
                        company: "TechGiant Inc.",
                        position: "Senior Frontend Engineer",
                        experience: "positive",
                        date: "2 weeks ago",
                        questions: ["Explain how React's virtual DOM works", "Design a component to handle infinite scrolling"]
                      },
                      {
                        company: "DataSphere",
                        position: "Machine Learning Engineer",
                        experience: "neutral",
                        date: "3 weeks ago",
                        questions: ["Explain overfitting and how to prevent it", "Design a recommendation system for an e-commerce site"]
                      },
                      {
                        company: "StartupX",
                        position: "Full Stack Developer",
                        experience: "positive",
                        date: "1 month ago",
                        questions: ["How would you optimize database queries?", "Implement authentication in a microservices architecture"]
                      }
                    ].map((item, index) => (
                      <div key={index} className="p-4 hover:bg-gray-800/30 transition-colors">
                        <div className="flex items-start mb-2">
                          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm mr-3">
                            {item.company.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-medium text-white flex items-center">
                              {item.company}
                              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs border ${
                                item.experience === 'positive' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                                item.experience === 'neutral' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                                'bg-red-500/10 border-red-500/20 text-red-500'
                              }`}>
                                {item.experience.charAt(0).toUpperCase() + item.experience.slice(1)}
                              </span>
                            </h4>
                            <p className="text-gray-400 text-xs">{item.position} · {item.date}</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-800/50 p-2 rounded-md border border-gray-800 mb-2">
                          <h5 className="text-xs font-medium text-gray-300 mb-1">Interview Questions:</h5>
                          <ul className="text-gray-400 text-xs space-y-1">
                            {item.questions.map((q, i) => (
                              <li key={i} className="flex gap-1.5">
                                <span className="text-blue-400">Q:</span>
                                <span className="line-clamp-1">{q}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                              12
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                              </svg>
                              5
                            </span>
                          </div>
                          <span className="text-blue-400 hover:underline cursor-pointer">Read more</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 border-t border-gray-800 text-center">
                    <Link 
                      href="/career" 
                      className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                    >
                      View all experiences
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5 z-0"></div>
        <div className="absolute -top-40 -right-40 h-80 w-80 bg-primary-100 opacity-10 blur-[100px] rounded-full z-0"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 bg-blue-700 opacity-10 blur-[100px] rounded-full z-0"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Interview Preparation?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Join thousands of professionals using our AI-powered platform to ace interviews, verify skills, build standout resumes, and connect with industry insiders.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 bg-gray-900/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary-100">5,000+</p>
                <p className="text-xs text-gray-400">Practice Interviews</p>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary-100">10,000+</p>
                <p className="text-xs text-gray-400">Skill Assessments</p>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary-100">3,500+</p>
                <p className="text-xs text-gray-400">Resumes Built</p>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-lg text-center">
                <p className="text-2xl font-bold text-primary-100">95%</p>
                <p className="text-xs text-gray-400">Success Rate</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link href="/interview-home">
                  <Button size="lg" className="bg-primary-100 hover:bg-primary-200 text-black font-medium w-full sm:w-auto">
                    Start Preparing Now
                  </Button>
                </Link>
              ) : (
                <Link href="/sign-up">
                  <Button size="lg" className="bg-primary-100 hover:bg-primary-200 text-black font-medium w-full sm:w-auto">
                    Create Free Account
                  </Button>
                </Link>
              )}
              
              <Link href="#features">
                <Button size="lg" variant="outline" className="border-gray-700 hover:bg-gray-900 hover:border-gray-600 w-full sm:w-auto">
                  Explore All Features
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}