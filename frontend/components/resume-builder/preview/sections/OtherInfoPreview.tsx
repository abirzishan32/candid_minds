"use client";

import React from "react";
import { useResume } from "@/app/(root)/resume-builder/contexts/ResumeContext";
import { useTheme } from "@/app/(root)/resume-builder/contexts/ThemeContext";
import { Info } from "lucide-react";

export default function OtherInfoPreview() {
  const { resumeData } = useResume();
  const { theme } = useTheme();
  const { otherInfo } = resumeData;

  if (otherInfo.length === 0) return null;

  return (
    <div className="bg-gray-800 p-5 rounded-lg">
      <div className="flex items-center mb-4">
        <Info 
          size={18} 
          className="mr-2"
          style={{ color: theme.primaryColor }} 
        />
        <h2 className="text-lg font-bold text-white">Additional Information</h2>
      </div>

      <div className="space-y-3">
        {otherInfo.map((info) => (
          <div key={info.id} className="border-l-2 pl-4 pb-1" style={{ borderColor: theme.primaryColor }}>
            <h3 className="font-semibold text-white">{info.title || "Section Title"}</h3>
            <p className="text-sm text-gray-300 mt-1">{info.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 