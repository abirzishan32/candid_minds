import { Suspense } from "react";
import Link from "next/link";
import { Building, MessageSquare, Search, Shield, TrendingUp, Users, Bookmark, ArrowLeft, Hash, Zap, List, Grid } from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { CareerExperience, getSavedExperiences } from "@/lib/actions/career-experience.action";
import ExperienceCard from "@/components/career/ExperienceCard";

// TopicsList component
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

// Async component to fetch and render saved experiences
async function SavedContent() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-center">
          <Bookmark className="mx-auto h-16 w-16 text-gray-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Sign in to view saved posts</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            You need to be signed in to save and view your bookmarked posts.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }
  
  console.log("Current user ID:", currentUser.id);
  const result = await getSavedExperiences(currentUser.id);
  console.log("getSavedExperiences result:", result);
  const savedExperiences = (result.success && result.data ? result.data : []) as CareerExperience[];
  console.log("Saved experiences count:", savedExperiences.length);
  
  if (savedExperiences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-center">
          <Bookmark className="mx-auto h-16 w-16 text-gray-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No saved posts yet</h2>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            When you save posts, they'll appear here for you to access later.
          </p>
          <Link
            href="/career"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Explore experiences
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {savedExperiences.map((experience: CareerExperience) => (
        <ExperienceCard key={experience.id} experience={experience} />
      ))}
    </div>
  );
}

export default function SavedExperiencesPage() {
  return (
    <div className="container mx-auto px-0 sm:px-4 py-0 sm:py-4 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-14 gap-0 sm:gap-4">
        {/* Left Sidebar - Desktop Only */}
        <div className="hidden lg:block lg:col-span-2 space-y-2">
          <div className="lg:sticky lg:top-4 lg:pl-0">
            <div className="p-2 flex flex-col space-y-3">
              <Link 
                href="/career" 
                className="flex items-center gap-2 p-2 hover:bg-gray-800/50 rounded-full text-gray-300 hover:text-white transition-colors"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="text-sm truncate">Experiences</span>
              </Link>
              
              <Link 
                href="/career/saved" 
                className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-full font-medium text-white"
              >
                <Bookmark className="h-5 w-5" />
                <span className="text-sm truncate">Saved</span>
              </Link>
              
              <Link 
                href="#" 
                className="flex items-center gap-2 p-2 hover:bg-gray-800/50 rounded-full text-gray-300 hover:text-white transition-colors"
              >
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm truncate">Trending</span>
              </Link>
              
              <Link 
                href="#" 
                className="flex items-center gap-2 p-2 hover:bg-gray-800/50 rounded-full text-gray-300 hover:text-white transition-colors"
              >
                <Building className="h-5 w-5" />
                <span className="text-sm truncate">Companies</span>
              </Link>
              
              <Link 
                href="#" 
                className="flex items-center gap-2 p-2 hover:bg-gray-800/50 rounded-full text-gray-300 hover:text-white transition-colors"
              >
                <Users className="h-5 w-5" />
                <span className="text-sm truncate">My Posts</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Main Timeline */}
        <div className="col-span-1 lg:col-span-8 border-x border-gray-800 min-h-screen">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-black p-4 border-b border-gray-800 backdrop-blur bg-black/80">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-white">Saved Experiences</h1>
              <div className="flex items-center space-x-2">
                <Link href="/career/saved" className="p-2 rounded-md bg-gray-800">
                  <List className="h-5 w-5 text-blue-400" />
                </Link>
                <Link href="/career/saved/grid" className="p-2 rounded-md hover:bg-gray-800 transition-colors">
                  <Grid className="h-5 w-5 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <div className="p-4 border-b border-gray-800 lg:hidden">
            <div className="flex gap-4">
              <Link 
                href="/career" 
                className="flex-1 text-center py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-300"
              >
                For you
              </Link>
              <Link 
                href="/career/saved" 
                className="flex-1 text-center py-3 border-b-2 border-blue-500 text-white font-medium"
              >
                Saved
              </Link>
            </div>
          </div>
          
          {/* Timeline */}
          <div className="divide-y divide-gray-800/80">
            <Suspense fallback={
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            }>
              <SavedContent />
            </Suspense>
          </div>
        </div>
        
        {/* Right Sidebar */}
        <div className="hidden lg:block lg:col-span-4 space-y-4">
          <div className="lg:sticky lg:top-4 space-y-4">
            {/* Search */}
            <div className="bg-gray-900 border border-gray-800 rounded-full px-4 py-2 flex items-center gap-3">
              <Search className="h-5 w-5 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search saved experiences" 
                className="bg-transparent border-none focus:outline-none text-white w-full"
              />
            </div>
            
            <TopicsList />
            
            {/* Tips Box */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-3">Tips</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500/10 p-1 rounded-full text-blue-400 mt-0.5">
                    <Bookmark className="h-3 w-3" />
                  </span>
                  Save posts to study interview questions later
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500/10 p-1 rounded-full text-blue-400 mt-0.5">
                    <Shield className="h-3 w-3" />
                  </span>
                  Your saved posts are private to you
                </li>
                <li className="flex items-start gap-2">
                  <span className="bg-blue-500/10 p-1 rounded-full text-blue-400 mt-0.5">
                    <TrendingUp className="h-3 w-3" />
                  </span>
                  Organize your job search by saving relevant experiences
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 