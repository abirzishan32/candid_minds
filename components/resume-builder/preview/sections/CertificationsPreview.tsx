"use client";

import React from "react";
import { useResume } from "@/app/(root)/resume-builder/contexts/ResumeContext";
import { useTheme } from "@/app/(root)/resume-builder/contexts/ThemeContext";
import { Award, Calendar, Building, Link as LinkIcon } from "lucide-react";

const CertificationsPreview: React.FC = () => {
  const { resumeData, visibleSections = [] } = useResume();
  const { theme } = useTheme();

  if (!visibleSections?.includes("certifications") || !resumeData?.certifications || resumeData.certifications.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <Award size={16} className="mr-2 text-gray-700" />
        <h2 className="text-lg font-bold text-gray-800">Certifications</h2>
      </div>

      <div className="space-y-4">
        {resumeData.certifications.map((cert, index) => (
          <div 
            key={index} 
            className={`pb-3 ${index < resumeData.certifications.length - 1 ? "border-b border-gray-300" : ""}`}
          >
            <h3 className="font-semibold text-gray-800">{cert.name || "Certification Title"}</h3>
            
            <div className="flex flex-wrap gap-x-4 text-gray-600 text-sm mt-1">
              {cert.date && (
                <div className="flex items-center">
                  <Calendar size={14} className="mr-1 text-gray-500" />
                  <span>{cert.date}</span>
                </div>
              )}
              
              {cert.issuer && (
                <div className="flex items-center">
                  <Building size={14} className="mr-1 text-gray-500" />
                  <span>{cert.issuer}</span>
                </div>
              )}
            </div>
            
            {cert.url && (
              <div className="flex items-center mt-1 text-sm">
                <LinkIcon size={14} className="mr-1 text-gray-500" />
                <a 
                  href={cert.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline"
                >
                  View Certificate
                </a>
              </div>
            )}
            
            {cert.description && (
              <p className="text-gray-600 mt-2 text-sm">{cert.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CertificationsPreview; 