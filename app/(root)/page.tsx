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
                  AI-Powered Coaching
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
              
              <div className="flex items-center gap-4 pt-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-xs font-medium">
                      {i}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-400">Join thousands of professionals advancing their careers</p>
              </div>
            </div>
            
            <div className="lg:w-1/2 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-100/20 to-blue-500/20 blur-2xl rounded-full"></div>
              <div className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 shadow-2xl rounded-xl overflow-hidden">
                <Image 
                  src="/hero-interview.png" 
                  alt="AI Interview Simulation" 
                  width={600} 
                  height={400}
                  className="w-full rounded-lg shadow-lg object-cover transition transform hover:scale-105 duration-700"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-sm font-medium">Live Interview Session</p>
                  </div>
                </div>
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
                    src="/ai-interview-demo.png" 
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
      <section className="py-20 bg-black relative">
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-600/10 blur-[100px] rounded-full"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-primary-100 to-blue-600 bg-clip-text mb-4">
              <p className="uppercase tracking-wider text-transparent font-semibold">Interview Community</p>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Learn From Real Interview Experiences</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Access a growing database of interview experiences shared by professionals at top companies. Get insider insights, company-specific questions, and detailed feedback from past candidates.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                company: "TechGiant Inc.",
                role: "Senior Backend Engineer",
                author: "Alex Chen",
                content: "The interview process consisted of 5 rounds including system design and coding challenges. Focus areas were distributed systems and database optimization.",
                difficulty: "Hard",
                rating: 4,
                date: "2 weeks ago"
              },
              {
                company: "Innovate AI",
                role: "ML Engineer",
                author: "Sarah Johnson",
                content: "Had to solve a machine learning problem during the technical interview. They were particularly interested in feature engineering approaches and model evaluation.",
                difficulty: "Medium",
                rating: 5,
                date: "1 month ago"
              },
              {
                company: "CloudScale",
                role: "DevOps Engineer",
                author: "Miguel Rodriguez",
                content: "The interview focused heavily on Kubernetes, CI/CD pipelines, and infrastructure as code. Practical experience with AWS was essential.",
                difficulty: "Medium-Hard",
                rating: 3,
                date: "3 weeks ago"
              }
            ].map((experience, index) => (
              <div key={index} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition duration-300">
                <div className="border-b border-gray-800 px-6 py-4 flex justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{experience.company}</h3>
                    <p className="text-primary-100">{experience.role}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg 
                          key={i} 
                          className={`h-4 w-4 ${i < experience.rating ? 'text-yellow-500' : 'text-gray-600'}`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 mt-1">Difficulty: {experience.difficulty}</span>
                  </div>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-300 mb-4">"{experience.content}"</p>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">— {experience.author}</span>
                    <span className="text-gray-500">{experience.date}</span>
                  </div>
                </div>
                
                <div className="px-6 py-3 bg-gray-950 border-t border-gray-800 flex justify-between items-center">
                  <span className="text-xs text-gray-400">12 helpful questions</span>
                  <button className="text-xs text-primary-100 hover:text-primary-200">See details</button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-10">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 text-center">
                <h3 className="text-2xl font-bold text-white mb-1">500+</h3>
                <p className="text-gray-400 text-sm">Companies</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 text-center">
                <h3 className="text-2xl font-bold text-white mb-1">2,400+</h3>
                <p className="text-gray-400 text-sm">Interview Experiences</p>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 text-center">
                <h3 className="text-2xl font-bold text-white mb-1">15,000+</h3>
                <p className="text-gray-400 text-sm">Interview Questions</p>
              </div>
            </div>
            
            <Link href="/community">
              <Button className="bg-transparent hover:bg-gray-900 border border-gray-700 text-white">
                Join the Community
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
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