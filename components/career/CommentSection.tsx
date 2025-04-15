"use client";

import { useState, useEffect } from "react";
import { addComment, getComments, addCommentV2, getCommentsV2 } from "@/lib/actions/career-experience.action";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

// Server action to get the current user
async function fetchCurrentUser() {

  
  const { getCurrentUser } = await import("@/lib/actions/auth.action");
  return getCurrentUser();
}

interface Comment {
  id: string;
  experienceId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

interface CommentSectionProps {
  experienceId: string;
}

export default function CommentSection({ experienceId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const loadUserAndComments = async () => {
      try {
        // Get current user
        const currentUser = await fetchCurrentUser();
        setUser(currentUser);
        
        // Load comments
        const result = await getComments(experienceId);
        if (result.success && result.data) {
          setComments(result.data);
        }
      } catch (error) {
        console.error("Error loading comments:", error);
      } finally {
        setIsLoadingComments(false);
      }
    };
    
    loadUserAndComments();
  }, [experienceId]);
  
  const handleSubmitComment = async () => {
    if (!user) {
      toast.error("Please sign in to comment");
      return;
    }
    
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await addComment({
        experienceId,
        userId: user.id,
        userName: user.name || "Anonymous User",
        content: newComment.trim()
      });
      
      if (result.success && result.data) {
        setComments(prev => [result.data, ...prev]);
        setNewComment("");
        toast.success("Comment added successfully");
      } else {
        toast.error("Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4 text-white">Comments</h3>
      
      {/* Comment form */}
      {user ? (
        <div className="mb-6">
          <Textarea
            placeholder="Share your thoughts or ask a question..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="bg-gray-800 border-gray-700 text-gray-200 min-h-24 resize-none focus:border-blue-500"
          />
          <div className="flex justify-end mt-2">
            <Button 
              onClick={handleSubmitComment} 
              disabled={isSubmitting || !newComment.trim()}
              className="flex items-center space-x-1.5"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>Post Comment</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800/30 rounded-md p-4 mb-6 text-center border border-gray-700">
          <p className="text-gray-400">Please sign in to leave a comment</p>
          <Button 
            variant="outline" 
            className="mt-2 text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
            onClick={() => window.location.href = "/login"}
          >
            Sign In
          </Button>
        </div>
      )}
      
      {/* Comments list */}
      {isLoadingComments ? (
        <div className="flex justify-center my-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center my-8 p-6 bg-gray-800/30 rounded-lg border border-gray-700">
          <p className="text-gray-400">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-800/40 p-4 rounded-md border border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                    {comment.userName.charAt(0)}
                  </div>
                  <div className="ml-2">
                    <p className="font-medium text-white">{comment.userName}</p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(comment.createdAt), "MMM d, yyyy • h:mm a")}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-gray-300 text-sm">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 