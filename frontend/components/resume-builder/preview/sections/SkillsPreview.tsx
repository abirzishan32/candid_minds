"use client";

import React from "react";
import { useResume } from "@/app/(root)/resume-builder/contexts/ResumeContext";
import { useTheme } from "@/app/(root)/resume-builder/contexts/ThemeContext";
import { Code, Star } from "lucide-react";

const SkillsPreview: React.FC = () => {
  const { resumeData, visibleSections = [] } = useResume();
  const { theme } = useTheme();

  if (!visibleSections?.includes("skills") || !resumeData?.skills || resumeData.skills.length === 0) {
    return null;
  }

  const renderStars = (level: string | undefined) => {
    if (!level) return null;
    
    const primaryColor = theme.colors?.primary || "#3b82f6";
    let starCount = 3; // Default
    
    switch (level) {
      case "Beginner":
        starCount = 1;
        break;
      case "Intermediate":
        starCount = 2;
        break;
      case "Advanced":
        starCount = 3;
        break;
      case "Expert":
        starCount = 4;
        break;
    }
    
    return (
      <div className="flex ml-2">
        {Array(4).fill(0).map((_, i) => (
          <Star 
            key={i} 
            size={12} 
            className={i < starCount ? "fill-current" : "text-gray-300"} 
            style={{ color: i < starCount ? primaryColor : "#e5e7eb" }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <Code size={16} className="mr-2 text-gray-700" />
        <h2 className="text-lg font-bold text-gray-800">Skills</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {resumeData.skills.map((skill) => (
          <div
            key={skill.id}
            className="px-3 py-1.5 rounded-md text-gray-700 text-sm border border-gray-200 flex items-center"
            style={{ backgroundColor: 'rgba(245, 245, 245, 0.7)' }}
          >
            <span>{skill.name}</span>
            {renderStars(skill.level)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsPreview; 