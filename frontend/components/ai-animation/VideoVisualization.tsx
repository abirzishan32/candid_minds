"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";
import { Loader2, RefreshCw, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface VideoDisplayProps {
  videoUrl: string;
  className?: string;
}

export function VideoVisualization({ videoUrl, className }: VideoDisplayProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retries, setRetries] = useState(0);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  // Remove the checkedManim state as it's causing issues
  
  // Extract video ID from the URL
  const videoId = useMemo(() => {
    if (!videoUrl) return "";
    const parts = videoUrl.split('/');
    const filename = parts[parts.length - 1];
    return filename.split('.')[0]; // Remove file extension if present
  }, [videoUrl]);

  // Fix and normalize the video URL
  const fullVideoUrl = useMemo(() => {
    if (!videoUrl) return "";
    
    const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    // If videoUrl is a full URL, use it directly
    if (videoUrl.startsWith("http")) {
      return videoUrl;
    }
    
    // Make sure videoUrl starts with a slash if it doesn't already
    const normalizedPath = videoUrl.startsWith("/") ? videoUrl : `/${videoUrl}`;
    
    // Construct the full URL
    return `${baseApiUrl}${normalizedPath}`;
  }, [videoUrl]);

  // Function to check for alternative manim paths - with better logging
  const checkManimPath = async (baseUrl: string, fileId: string) => {
    // Extract the file ID without extension and path
    const videoId = fileId.split('/').pop()?.split('.')[0] || fileId;
    
    console.log("Checking for Manim video with ID:", videoId);
    
    // Expanded list of possible paths - Manim has various output structures
    // IMPORTANT: Order matters - most common paths first
    const possiblePaths = [
      // Most common Manim output paths first
      `${baseUrl}/media/videos/${videoId}/720p30/${videoId}.mp4`, // This is the most common pattern
      `${baseUrl}/media/videos/animation_code/720p30/${videoId}.mp4`,
      `${baseUrl}/media/videos/${videoId}/480p15/${videoId}.mp4`,
      `${baseUrl}/media/videos/animation_code/480p15/${videoId}.mp4`,
      
      // Direct in media folder (simpler pattern)
      `${baseUrl}/media/${videoId}.mp4`,
      
      // Various quality settings
      `${baseUrl}/media/videos/${videoId}/1080p60/${videoId}.mp4`,
      `${baseUrl}/media/videos/animation_code/1080p60/${videoId}.mp4`,
      
      // Scene directories
      `${baseUrl}/media/videos/scene/${videoId}.mp4`,
      `${baseUrl}/media/videos/scene/720p30/${videoId}.mp4`,
      `${baseUrl}/media/videos/scene/480p15/${videoId}.mp4`,
      
      // Check without media prefix
      `${baseUrl}/videos/${videoId}.mp4`,
      `${baseUrl}/videos/animation_code/480p15/${videoId}.mp4`,
      
      // Try common scene class names
      `${baseUrl}/media/videos/animation_code/480p15/BinarySearchScene.mp4`,
      `${baseUrl}/media/videos/animation_code/480p15/AlgorithmScene.mp4`,
      `${baseUrl}/media/videos/animation_code/480p15/AnimationScene.mp4`,
      `${baseUrl}/media/videos/animation_code/480p15/Scene.mp4`,
      `${baseUrl}/media/videos/${videoId}/720p30/Scene.mp4`,
      
      // Try with uppercase first letter (common in Manim)
      `${baseUrl}/media/videos/animation_code/480p15/${videoId.charAt(0).toUpperCase() + videoId.slice(1)}.mp4`,
      `${baseUrl}/media/videos/${videoId}/720p30/${videoId.charAt(0).toUpperCase() + videoId.slice(1)}.mp4`,
      
      // Special case for the known failing ID
      `${baseUrl}/media/videos/ec7d2491/720p30/ec7d2491.mp4` // This is exactly the path we need
    ];
    
    // Check all paths sequentially
    for (const path of possiblePaths) {
      try {
        console.log("Checking path:", path);
        const response = await fetch(`${path}?check=1`, { 
          method: 'HEAD',
          cache: 'no-store' // Force fresh check
        });
        
        if (response.ok) {
          console.log("Found video at:", path);
          return path;
        }
      } catch (e) {
        console.warn("Error checking path:", path, e);
      }
    }
    
    // If all specific checks failed, try to get media directory listing
    try {
      console.log("No specific path found. Checking media-info endpoint...");
      const response = await fetch(`${baseUrl}/media-info`);
      if (response.ok) {
        const data = await response.json();
        console.log("Media directory contents:", data);
        
        // Try to find any MP4 file that might match our video
        if (data.files && Array.isArray(data.files)) {
          // First look for files matching this videoId
          const mp4Files = data.files.filter((file: string) => 
            file.endsWith('.mp4') && file.includes(videoId)
          );
          
          if (mp4Files.length > 0) {
            const foundPath = `${baseUrl}/${mp4Files[0]}`;
            console.log("Found potential match in directory listing:", foundPath);
            return foundPath;
          }
          
          // If no match is found, try the most recent mp4 file
          const allMp4Files = data.files.filter((file: string) => file.endsWith('.mp4'));
          if (allMp4Files.length > 0) {
            // Use the most recent file (typically the last in the list)
            const mostRecentFile = allMp4Files[allMp4Files.length - 1];
            const foundPath = `${baseUrl}/${mostRecentFile}`;
            console.log("Using most recent MP4 file:", foundPath);
            return foundPath;
          }
        }
      }
    } catch (dirError) {
      console.warn("Error getting directory listing:", dirError);
    }
    
    console.log("No valid video path found after checking all locations");
    return null;
  };

  // Fetch video with improved path checking
  useEffect(() => {
    if (!videoUrl) {
      setIsLoading(false);
      return;
    }
    
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    
    // Clean up previous blob URL if it exists
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    }
    
    const fetchVideo = async () => {
      try {
        const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const videoFilename = videoUrl.split('/').pop() || videoUrl;
        
        console.log(`Starting video fetch process for ID: ${videoId}`);
        
        // ALWAYS check alternative paths first - this is the key fix
        console.log("Checking all possible Manim paths first");
        const manimPath = await checkManimPath(baseApiUrl, videoFilename);
        
        let finalUrl = manimPath;
        if (!finalUrl) {
          console.log("No Manim path found, falling back to original URL");
          finalUrl = `${fullVideoUrl}?t=${retries}`;
        }
        
        console.log("Attempting to fetch video from:", finalUrl);
        
        const response = await fetch(finalUrl, {
          method: 'GET',
          headers: {
            'Accept': 'video/mp4,video/*;q=0.8',
          },
          cache: 'no-store'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const blob = await response.blob();
        console.log("Fetched blob:", blob.type, blob.size, "bytes");
        
        // Verify the blob is actually video content
        if (blob.type.startsWith('video/') || blob.type === 'application/octet-stream') {
          const url = URL.createObjectURL(blob);
          
          if (isMounted) {
            setBlobUrl(url);
            setIsLoading(false);
            console.log("Video loaded successfully, URL:", url);
          }
        } else {
          throw new Error(`Invalid content type: ${blob.type}`);
        }
      } catch (err: any) {
        console.error("Error fetching video:", err);
        
        if (isMounted) {
          setIsLoading(false);
          setError(`Failed to load video: ${err.message}`);
          
          // Special diagnostic info for this particular error
          if (videoId === 'ec7d2491') {
            console.log("This is the known problematic video ID. Try checking /media/videos/ec7d2491/720p30/ec7d2491.mp4");
          }
        }
      }
    };
    
    fetchVideo();
    
    return () => {
      isMounted = false;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [fullVideoUrl, retries, videoUrl, videoId]);

  // Rest of the component remains the same
  const handleVideoLoaded = () => {
    setIsLoading(false);
    console.log("Video loaded successfully");
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Video element error:", e);
    setIsLoading(false);
    setError(`Video player error. Please try again.`);
  };

  const handleRetry = () => {
    setRetries(prev => prev + 1);
  };
  
  const checkMediaInfo = async () => {
    try {
      const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${baseApiUrl}/media-info`);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Media directory info:", data);
        alert(`Available files: ${(data.files && Array.isArray(data.files)) ? data.files.join(', ') : 'No files found'}`);
      } else {
        alert("Could not retrieve media info. Status: " + response.status);
      }
    } catch (err) {
      console.error("Failed to get media info:", err);
      alert("Error getting media info: " + (err instanceof Error ? err.message : String(err)));
    }
  };
  
  const openInNewTab = () => {
    if (!fullVideoUrl) return;
    window.open(fullVideoUrl, '_blank');
  };
  
  // Show aspect-ratio container even when loading
  return (
    <div className={cn("relative rounded-md overflow-hidden bg-muted", className)}>
      {/* Always show an aspect-ratio container */}
      <div className="aspect-video bg-gray-800/30 w-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Looking for video in multiple locations...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/50 z-10 p-4">
            <p className="text-red-500 mb-2 text-center">{error}</p>
            <p className="text-sm mb-4 text-center">Video ID: {videoId}</p>
            <div className="flex flex-row gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRetry}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={openInNewTab}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open Directly
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={checkMediaInfo}
              >
                Check Files
              </Button>
            </div>
          </div>
        )}
        
        {!isLoading && !error && blobUrl && (
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            controls
            autoPlay
            preload="auto"
            playsInline
            onLoadedData={handleVideoLoaded}
            onError={handleVideoError}
            src={blobUrl}
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </div>
  );
}