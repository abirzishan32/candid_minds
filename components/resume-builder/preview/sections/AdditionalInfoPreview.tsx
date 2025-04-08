"use client";

import React from "react";
import { useResume } from "@/app/(root)/resume-builder/contexts/ResumeContext";
import { useTheme } from "@/app/(root)/resume-builder/contexts/ThemeContext";
import { FileText } from "lucide-react";

export default function AdditionalInfoPreview() {
  const { resumeData } = useResume();
  const { theme } = useTheme();
  const { additionalInfo } = resumeData;

  if (!additionalInfo || !additionalInfo.content || additionalInfo.content.trim() === "") {
    return null;
  }

  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center mb-4">
        <FileText
          size={18}
          className="mr-2"
          style={{ color: theme.primaryColor }}
        />
        <h2 className="text-lg font-bold text-gray-800">Additional Information</h2>
      </div>

      <div className="border-l-2 pl-4 py-1" style={{ borderColor: theme.primaryColor }}>
        <p className="text-sm text-gray-600 whitespace-pre-line">{additionalInfo.content}</p>
      </div>
    </div>
  );
} 