"use client";

import React, { useState } from "react";
import { AnimationForm } from "@/components/ai-animation/AnimationForm";
import { CodeDisplay } from "@/components/ai-animation/CodeDisplay";
import { toast } from "sonner";

export default function AIAnimationPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    code: string;
    explanation: string;
    videoUrl: string | null;
  } | null>(null);

  const generateAnimation = async (prompt: string) => {
    setIsLoading(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(`${apiUrl}/generate-animation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to generate animation");
      }

      const data = await response.json();
      
      setResult({
        code: data.code,
        explanation: data.explanation,
        videoUrl: data.video_url,
      });
      
      if (!data.video_url) {
        toast.warning("Generated code but couldn't render animation. See explanation for details.");
      } else {
        toast.success("Animation generated successfully!");
      }
    } catch (error) {
      console.error("Error generating animation:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate animation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">
        AI Animation Generator
      </h1>
      
      <AnimationForm onSubmit={generateAnimation} isLoading={isLoading} />
      
      {result && (
        <CodeDisplay
          code={result.code}
          explanation={result.explanation}
          videoUrl={result.videoUrl}
        />
      )}
    </div>
  );
}