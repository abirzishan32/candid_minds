"use client";

import React from "react";
import { useResume } from "@/app/(root)/resume-builder/contexts/ResumeContext";
import { useTheme } from "@/app/(root)/resume-builder/contexts/ThemeContext";
import { Briefcase } from "lucide-react";

const WorkExperiencePreview: React.FC = () => {
  const { resumeData, visibleSections = [] } = useResume();
  const { theme } = useTheme();

  if (!visibleSections?.includes("workExperiences") || !resumeData?.workExperiences || resumeData.workExperiences.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <Briefcase size={16} className="mr-2 text-gray-700" />
        <h2 className="text-lg font-bold text-gray-800">Work Experience</h2>
      </div>

      <div className="space-y-4">
        {resumeData.workExperiences.map((experience) => (
          <div key={experience.id} className="border-l-2 pl-4 py-2" style={{ borderColor: theme.colors?.primary || "#3b82f6" }}>
            <div className="mb-1">
              <h3 className="font-semibold text-gray-800">
                {experience.title || "Position"}
              </h3>
              <div className="flex flex-wrap justify-between text-sm">
                <p className="text-gray-700">
                  {experience.company || "Company"}
                  {experience.location ? ` • ${experience.location}` : ""}
                </p>
                <p className="text-gray-500">
                  {experience.startDate || "Start Date"} - {experience.current ? "Present" : experience.endDate || "End Date"}
                </p>
              </div>
            </div>

            {experience.description && (
              <p className="text-sm text-gray-600 mt-1">{experience.description}</p>
            )}

            {experience.highlights && experience.highlights.length > 0 && (
              <ul className="list-disc list-inside text-sm mt-2 space-y-1 text-gray-700">
                {experience.highlights.map((highlight, index) => (
                  <li key={index} className="ml-1">{highlight}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkExperiencePreview; 