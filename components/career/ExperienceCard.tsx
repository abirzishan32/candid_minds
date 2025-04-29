"use client";

import { format } from "date-fns";
import Link from "next/link";
import { Building, CalendarDays, Award, Users, MessageSquare, Share2, ThumbsUp, MoreHorizontal } from "lucide-react";
import { CareerExperience, hasUserLikedV2, toggleLikeV2 } from "@/lib/actions/career-experience.action";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Server action to get the current user
async function fetchCurrentUser() {
  const { getCurrentUser } = await import("@/lib/actions/auth.action");
  return getCurrentUser();
}

interface ExperienceCardProps {
  experience: CareerExperience;
}

export default function ExperienceCard({ experience }: ExperienceCardProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [likeCount, setLikeCount] = useState(experience.likesCount || 0);
  
  // Limit details to 1500 characters
  const limitedDetails = experience.details?.length > 1500 
    ? experience.details.substring(0, 1500) + "..." 
    : experience.details;
  
  const formattedDate = experience.createdAt 
    ? format(new Date(experience.createdAt), "MMM d, yyyy")
    : "Recent";
  
  const experienceColors = {
    positive: "text-green-500",
    neutral: "text-yellow-500",
    negative: "text-red-500"
  };

  const badgeColors = {
    positive: "bg-green-500/10 border-green-500/20",
    neutral: "bg-yellow-500/10 border-yellow-500/20",
    negative: "bg-red-500/10 border-red-500/20"
  };
  
  useEffect(() => {
    const loadUserAndInteractions = async () => {
      try {
        // Get current user
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          // Check if the user has liked this post
          const likeResult = await hasUserLikedV2({ 
            experienceId: experience.id, 
            userId: currentUser.id 
          });
          if (likeResult.success) {
            setLiked(likeResult.liked);
          }
        }
      } catch (error) {
        console.error("Error loading user interactions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserAndInteractions();
  }, [experience.id]);
  
  const handleToggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering card click
    
    if (!user) {
      toast.error("Please sign in to like this post");
      return;
    }
    
    try {
      // Optimistic UI update
      setLiked(!liked);
      setLikeCount(prevCount => liked ? prevCount - 1 : prevCount + 1);
      
      // Call the server action to toggle like
      const result = await toggleLikeV2({ 
        experienceId: experience.id, 
        userId: user.id 
      });
      
      if (!result.success) {
        // Revert optimistic update if the server action failed
        setLiked(liked);
        setLikeCount(likeCount);
        toast.error("Failed to update like status");
      }
    } catch (error) {
      // Revert optimistic update on error
      setLiked(liked);
      setLikeCount(likeCount);
      console.error("Error toggling like:", error);
      toast.error("An error occurred");
    }
  };
  
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden transition-all duration-200 hover:bg-gray-900/80">
      <div className="p-4">
        {/* Header with Avatar and Company Info */}
        <div className="flex items-start space-x-3 mb-3">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
            {experience.companyName.charAt(0)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center">
                  {experience.companyName}
                  <span className={cn(
                    "inline-block ml-2 px-2 py-0.5 rounded-full text-xs border text-white",
                    badgeColors[experience.experience]
                  )}>
                    {experience.experience.charAt(0).toUpperCase() + experience.experience.slice(1)}
                  </span>
                </h3>
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  {experience.position} · <span className="text-gray-500">{formattedDate}</span>
                </p>
              </div>
              
              <button 
                className="text-gray-500 hover:text-gray-300"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Interview Source */}
        <div className="flex items-center text-gray-400 text-xs mb-3">
          <Users className="h-3 w-3 mr-1 text-gray-500" />
          <span>Via: {experience.source}</span>
        </div>
        
        {/* Content - Full Post Content limited to 1500 chars */}
        <div className="mb-4">
          <p className="text-gray-300 text-sm whitespace-pre-line">{limitedDetails}</p>
          
          {experience.details?.length > 1500 && (
            <Link 
              href={`/career/${experience.id}`}
              className="text-blue-400 hover:text-blue-300 text-xs font-medium mt-2 inline-block"
            >
              See full post
            </Link>
          )}
        </div>
        
        {/* Questions */}
        {experience.questions && experience.questions.length > 0 && (
          <div className="mb-4 mt-3 bg-gray-800/50 p-3 rounded-md border border-gray-800">
            <h4 className="text-xs font-semibold text-gray-300 mb-1">Interview Questions:</h4>
            <ul className="text-gray-400 text-xs space-y-1.5">
              {experience.questions.map((question, index) => (
                <li key={index} className="flex gap-1.5">
                  <span className="text-blue-400">Q:</span>
                  <span>{question}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Action Bar */}
        <div className="flex justify-between items-center pt-3 mt-2 border-t border-gray-800 text-gray-500">
          <button 
            className="flex items-center gap-1.5 hover:text-blue-400 transition-colors"
            onClick={handleToggleLike}
            disabled={isLoading}
          >
            <ThumbsUp className={cn("h-4 w-4", liked && "text-blue-400 fill-blue-400")} />
            <span className={cn("text-xs", liked && "text-blue-400")}>{likeCount}</span>
          </button>
          
          <Link 
            href={`/career/${experience.id}`}
            className="flex items-center gap-1.5 hover:text-blue-400 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs">{experience.commentsCount ? experience.commentsCount : "Comment"}</span>
          </Link>
          
          <button 
            className="flex items-center gap-1.5 hover:text-blue-400 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            <span className="text-xs">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
} 