import { Suspense } from "react";
import { Building, MessageSquare, TrendingUp, Search, Zap, Shield, Users, Hash } from "lucide-react";
import { getCareerExperiences, CareerExperience } from "@/lib/actions/career-experience.action";
import ExperienceCard from "@/components/career/ExperienceCard";
import ClientExperienceForm from "@/components/career/ClientExperienceForm";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Interview Experiences | Candid Minds",
  description: "Share and read anonymous interview experiences from different IT companies",
};

async function CareerContent() {
  const result = await getCareerExperiences();
  const experiences: CareerExperience[] = result.success && result.data ? result.data : [];
  
  // Get unique company names for filtering
  const companies = [...new Set(experiences.map(exp => exp.companyName))];

  return (
    <>
      {experiences.length === 0 ? (
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 shadow-lg text-center">
          <Building className="h-12 w-12 mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-3">No interview experiences yet</h3>
          <p className="text-gray-400 mb-6">
            Be the first to share your interview experience and help others prepare.
          </p>
        </div>
      ) : (
        <div className="space-y-4">          
          {/* Experience Timeline */}
          {experiences.map((experience) => (
            <ExperienceCard key={experience.id} experience={experience} />
          ))}
        </div>
      )}
    </>
  );
}

// Simplified component for posting a new experience
function PostPrompt() {
  return (
    <Link
      href="#post-form"
      className="flex items-center gap-3 p-4 bg-gray-900 border border-gray-800 rounded-xl mb-4 hover:bg-gray-900/80 transition-colors"
    >
      <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
        A
      </div>
      <div className="flex-1 text-gray-500">Share your interview experience...</div>
      <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-full transition-colors">
        Post
      </button>
    </Link>
  );
}

// Companies & Topics component (similar to Twitter/X trends)
function TrendingCompanies({ companies }: { companies: string[] }) {
  // Take up to 5 companies, or fewer if not enough
  const displayCompanies = companies.slice(0, Math.min(5, companies.length));
  
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-lg font-bold text-white">Trending Companies</h3>
      </div>
      
      <div>
        {displayCompanies.length > 0 ? (
          displayCompanies.map((company, index) => (
            <Link 
              key={company} 
              href={`/career/company/${encodeURIComponent(company)}`}
              className="flex justify-between items-center p-3 hover:bg-gray-800/50 transition-colors border-b border-gray-800/50 last:border-0"
            >
              <div>
                <p className="font-medium text-white">{company}</p>
                <p className="text-xs text-gray-500">{index + 1} Experiences</p>
              </div>
              <Building className="h-5 w-5 text-gray-500" />
            </Link>
          ))
        ) : (
          <div className="p-4 text-gray-500 text-sm">No trending companies yet</div>
        )}
        
        <Link 
          href="#" 
          className="block p-3 text-blue-400 hover:bg-gray-800/50 transition-colors text-sm"
        >
          Show more
        </Link>
      </div>
    </div>
  );
}

function TopicsList() {
  const topics = [
    { name: "Technical Interviews", icon: <Zap className="h-4 w-4" /> },
    { name: "Behavioral Questions", icon: <Users className="h-4 w-4" /> },
    { name: "System Design", icon: <Building className="h-4 w-4" /> },
    { name: "Coding Challenges", icon: <Hash className="h-4 w-4" /> },
    { name: "Security Interviews", icon: <Shield className="h-4 w-4" /> },
  ];
  
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <h3 className="text-lg font-bold text-white">Popular Topics</h3>
      </div>
      
      <div>
        {topics.map((topic) => (
          <Link 
            key={topic.name} 
            href="#"
            className="flex items-center gap-3 p-3 hover:bg-gray-800/50 transition-colors border-b border-gray-800/50 last:border-0"
          >
            <div className="bg-blue-500/10 p-2 rounded-full text-blue-400">
              {topic.icon}
            </div>
            <span className="text-white">{topic.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function CareerPage() {
  return (
    <div className="container mx-auto px-0 sm:px-4 py-0 sm:py-4 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 sm:gap-4">
        {/* Left Sidebar - Desktop Only */}
        <div className="hidden lg:block lg:col-span-3 space-y-3">
          <div className="lg:sticky lg:top-4">
            <div className="p-4 flex flex-col space-y-6">
              
              <Link 
                href="/career" 
                className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-full font-medium text-white"
              >
                <MessageSquare className="h-6 w-6" />
                <span>Interview Experiences</span>
              </Link>
              
              <Link 
                href="#" 
                className="flex items-center gap-3 p-3 hover:bg-gray-800/50 rounded-full text-gray-300 hover:text-white transition-colors"
              >
                <TrendingUp className="h-6 w-6" />
                <span>Trending Companies</span>
              </Link>
              
              <Link 
                href="#" 
                className="flex items-center gap-3 p-3 hover:bg-gray-800/50 rounded-full text-gray-300 hover:text-white transition-colors"
              >
                <Building className="h-6 w-6" />
                <span>Browse Companies</span>
              </Link>
              
              <Link 
                href="#" 
                className="flex items-center gap-3 p-3 hover:bg-gray-800/50 rounded-full text-gray-300 hover:text-white transition-colors"
              >
                <Users className="h-6 w-6" />
                <span>My Experiences</span>
              </Link>
              
              <div className="pt-4">
                <Link
                  href="#post-form"
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-full w-full transition-colors"
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>Share Experience</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Timeline */}
        <div className="col-span-1 lg:col-span-6 border-x border-gray-800 min-h-screen">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-black p-4 border-b border-gray-800 backdrop-blur bg-black/80">
            <h1 className="text-xl font-bold text-white">Interview Experiences</h1>
          </div>
          
          <div className="p-4 border-b border-gray-800 lg:hidden">
            <div className="flex gap-4">
              <Link 
                href="/career" 
                className="flex-1 text-center py-3 border-b-2 border-blue-500 text-white font-medium"
              >
                For you
              </Link>
              <Link 
                href="#" 
                className="flex-1 text-center py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-300"
              >
                Trending
              </Link>
            </div>
          </div>
          
          {/* Post Form - Mobile Only */}
          <div className="p-4 border-b border-gray-800 block lg:hidden">
            <PostPrompt />
          </div>
          
          {/* Post Form */}
          <div id="post-form" className="p-4 border-b border-gray-800 hidden lg:block">
            <ClientExperienceForm />
          </div>
          
          {/* Timeline */}
          <div className="divide-y divide-gray-800/80">
            <Suspense fallback={
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            }>
              <CareerContent />
            </Suspense>
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className="hidden lg:block lg:col-span-3 space-y-4">
          <div className="lg:sticky lg:top-4 space-y-4">
            {/* Search */}
            <div className="bg-gray-900 border border-gray-800 rounded-full px-4 py-2 flex items-center gap-3">
              <Search className="h-5 w-5 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search experiences" 
                className="bg-transparent border-none focus:outline-none text-white w-full"
              />
            </div>
            
            <Suspense fallback={null}>
              <TrendingCompaniesWrapper />
            </Suspense>
            
            <TopicsList />
            
            {/* Why Share Box */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-3">Why Share Anonymously?</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500/10 p-1 rounded-full text-blue-400 mt-0.5">
                    <Shield className="h-3 w-3" />
                  </span>
                  Your identity remains private & secure
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500/10 p-1 rounded-full text-blue-400 mt-0.5">
                    <Users className="h-3 w-3" />
                  </span>
                  Help others prepare for interviews
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500/10 p-1 rounded-full text-blue-400 mt-0.5">
                    <TrendingUp className="h-3 w-3" />
                  </span>
                  Improve transparency in tech hiring
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper to handle async data fetching for trending companies
async function TrendingCompaniesWrapper() {
  const result = await getCareerExperiences();
  const experiences: CareerExperience[] = result.success && result.data ? result.data : [];
  const companies = [...new Set(experiences.map(exp => exp.companyName))];
  
  return <TrendingCompanies companies={companies} />;
}
