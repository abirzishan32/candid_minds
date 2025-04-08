"use client";

import React from "react";
import { useResume } from "@/app/(root)/resume-builder/contexts/ResumeContext";
import { useTheme } from "@/app/(root)/resume-builder/contexts/ThemeContext";
import { Code } from "lucide-react";

const SkillsPreview: React.FC = () => {
  const { resumeData, visibleSections = [] } = useResume();
  const { theme } = useTheme();

  if (!visibleSections?.includes("skills") || !resumeData?.skills || resumeData.skills.length === 0) {
    return null;
  }

  const getSkillLevelStyle = (level: string | undefined) => {
    if (!level) return {};
    
    const baseColor = theme.colors?.primary || "#3b82f6";
    let opacity = 1.0;
    
    switch (level) {
      case "Beginner":
        opacity = 0.4;
        break;
      case "Intermediate":
        opacity = 0.6;
        break;
      case "Advanced":
        opacity = 0.8;
        break;
      case "Expert":
        opacity = 1.0;
        break;
      default:
        opacity = 0.7;
    }
    
    return {
      backgroundColor: baseColor,
      opacity,
    };
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
            {skill.level && (
              <div className="ml-2 w-2 h-2 rounded-full" style={getSkillLevelStyle(skill.level)}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillsPreview; 