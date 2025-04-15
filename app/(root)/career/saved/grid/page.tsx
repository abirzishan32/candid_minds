import { Suspense } from "react";
import Link from "next/link";
import { Building, MessageSquare, Search, Shield, TrendingUp, Users, Bookmark, ArrowLeft, Grid, List, Hash, Zap, Filter } from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { CareerExperience, getSavedExperiences } from "@/lib/actions/career-experience.action";
import ExperienceCard from "@/components/career/ExperienceCard";

// Async component to fetch and render saved experiences in grid layout
async function SavedGridContent() {
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {savedExperiences.map((experience: CareerExperience) => (
        <div key={experience.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                {experience.companyName?.charAt(0) || "C"}
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-white">{experience.companyName || "Company"}</h3>
                <p className="text-xs text-gray-400">{experience.position || "Role"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
                {experience.experience || "Interview"}
              </div>
            </div>
          </div>
          
          <h4 className="text-white font-medium mb-2 line-clamp-1">{experience.companyName || "Company"}</h4>
          
          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
            {experience.details || "No details available"}
          </p>
          
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-800">
            <div className="flex space-x-4">
              <div className="flex items-center text-gray-400 text-xs">
                <MessageSquare className="h-4 w-4 mr-1" />
                {experience.commentsCount || 0}
              </div>
              <div className="flex items-center text-gray-400 text-xs">
                <TrendingUp className="h-4 w-4 mr-1" />
                {experience.likesCount || 0}
              </div>
            </div>
            <Link href={`/career/${experience.id}`} className="text-blue-400 text-xs hover:underline">
              View details →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SavedGridPage() {
  return (
    <div className="container mx-auto px-0 sm:px-4 py-0 sm:py-4 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 sm:gap-4">
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
        
        {/* Main Content */}
        <div className="col-span-1 lg:col-span-10 border-x border-gray-800 min-h-screen">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-black p-4 border-b border-gray-800 backdrop-blur bg-black/80">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold text-white">Saved Experiences</h1>
              <div className="flex items-center space-x-2">
                <Link href="/career/saved" className="p-2 rounded-md hover:bg-gray-800 transition-colors">
                  <List className="h-5 w-5 text-gray-400" />
                </Link>
                <Link href="/career/saved/grid" className="p-2 rounded-md bg-gray-800">
                  <Grid className="h-5 w-5 text-blue-400" />
                </Link>
              </div>
            </div>
          </div>
          
          {/* Filters */}
          <div className="p-4 border-b border-gray-800 bg-gray-900/30">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-gray-300 bg-gray-800 px-3 py-2 rounded-md">
                <Filter className="h-4 w-4" />
                <span className="text-sm">Filters</span>
              </div>
              
              <select className="bg-gray-800 border-none text-gray-300 px-3 py-2 rounded-md text-sm">
                <option value="">All companies</option>
                <option value="google">Google</option>
                <option value="microsoft">Microsoft</option>
                <option value="amazon">Amazon</option>
              </select>
              
              <select className="bg-gray-800 border-none text-gray-300 px-3 py-2 rounded-md text-sm">
                <option value="">All roles</option>
                <option value="swe">Software Engineer</option>
                <option value="ds">Data Scientist</option>
                <option value="pm">Product Manager</option>
              </select>
              
              <select className="bg-gray-800 border-none text-gray-300 px-3 py-2 rounded-md text-sm">
                <option value="">All types</option>
                <option value="interview">Interview</option>
                <option value="technical">Technical</option>
                <option value="behavioral">Behavioral</option>
              </select>
              
              <div className="flex-1 md:flex-none">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input 
                    type="text" 
                    placeholder="Search saved experiences" 
                    className="bg-gray-800 pl-10 pr-4 py-2 w-full rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Timeline */}
          <div>
            <Suspense fallback={
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            }>
              <SavedGridContent />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
} 