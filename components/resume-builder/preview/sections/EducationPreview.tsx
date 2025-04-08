"use client";

import React from "react";
import { useResume } from "@/app/(root)/resume-builder/contexts/ResumeContext";
import { useTheme } from "@/app/(root)/resume-builder/contexts/ThemeContext";
import { GraduationCap } from "lucide-react";

const EducationPreview: React.FC = () => {
  const { resumeData, visibleSections = [] } = useResume();
  const { theme } = useTheme();

  if (!visibleSections?.includes("education") || !resumeData?.education || resumeData.education.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <GraduationCap size={16} className="mr-2 text-gray-700" />
        <h2 className="text-lg font-bold text-gray-800">Education</h2>
      </div>

      <div className="space-y-4">
        {resumeData.education.map((edu) => (
          <div key={edu.id} className="border-l-2 pl-4 py-2" style={{ borderColor: theme.colors?.primary || "#3b82f6" }}>
            <div className="mb-1">
              <h3 className="font-semibold text-gray-800">
                {edu.degree || "Degree"} {edu.field ? `in ${edu.field}` : ""}
              </h3>
              <div className="flex flex-wrap justify-between text-sm">
                <p className="text-gray-700">
                  {edu.institution || "Institution"}
                  {edu.location ? ` • ${edu.location}` : ""}
                </p>
                <div className="text-gray-500">
                  <p>
                    {edu.startDate || "Start Date"} - {edu.endDate || "End Date"}
                  </p>
                  {edu.gpa && <p className="text-right">GPA: {edu.gpa}</p>}
                </div>
              </div>
            </div>

            {edu.description && (
              <p className="text-sm text-gray-600 mt-1">{edu.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EducationPreview; 