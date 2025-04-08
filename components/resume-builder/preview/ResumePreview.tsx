"use client";

import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { useResume } from "@/app/(root)/resume-builder/contexts/ResumeContext";
import { useTheme } from "@/app/(root)/resume-builder/contexts/ThemeContext";
import GeneralInfoPreview from "./sections/GeneralInfoPreview";
import WorkExperiencePreview from "./sections/WorkExperiencePreview";
import EducationPreview from "./sections/EducationPreview";
import ProjectsPreview from "./sections/ProjectsPreview";
import SkillsPreview from "./sections/SkillsPreview";
import CertificationsPreview from "./sections/CertificationsPreview";
import { SectionKey } from "@/app/(root)/resume-builder/types";

const ResumePreview: React.FC = () => {
  const { resumeData, visibleSections = [] } = useResume();
  const { theme, getFontSizeClass, getLineHeightClass } = useTheme();
  const resumeRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    documentTitle: `${resumeData?.generalInfo?.fullName || "Resume"}_${new Date().toLocaleDateString()}`,
    onBeforeGetContent: () => {
      return new Promise<void>((resolve) => {
        resolve();
      });
    },
    contentRef: resumeRef,
    removeAfterPrint: true,
  });

  // Apply typography and spacing classes
  const fontSizeClass = getFontSizeClass();
  const lineHeightClass = getLineHeightClass();
  
  // Determine if any sections are visible
  const hasVisibleSections = visibleSections && visibleSections.length > 0;

  // Map section keys to their respective components
  const renderSection = (sectionKey: SectionKey) => {
    switch (sectionKey) {
      case "workExperiences":
        return <WorkExperiencePreview key={sectionKey} />;
      case "education":
        return <EducationPreview key={sectionKey} />;
      case "projects":
        return <ProjectsPreview key={sectionKey} />;
      case "skills":
        return <SkillsPreview key={sectionKey} />;
      case "certifications":
        return <CertificationsPreview key={sectionKey} />;
      default:
        return null;
    }
  };

  // Get sections in the correct order
  const orderedSections = resumeData.sections
    .filter(section => section.enabled)
    .map(section => section.id);

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-900 p-4 flex justify-between items-center">
        <h2 className="text-white font-medium">Preview</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            onClick={handlePrint}
          >
            <Printer size={16} className="mr-2" />
            Print
          </Button>
          <Button 
            size="sm" 
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download size={16} className="mr-2" />
            Export PDF
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto bg-gray-800 p-4">
        <div className="max-w-[850px] mx-auto mb-8 bg-white shadow-2xl rounded-md overflow-hidden">
          <div
            ref={resumeRef}
            className={`bg-white p-8 w-full ${fontSizeClass} ${lineHeightClass}`}
            style={{ color: "#333" }}
          >
            {hasVisibleSections ? (
              <>
                <GeneralInfoPreview />
                
                <div className="space-y-6" style={{ marginTop: `${theme.spacing.sectionGap}px` }}>
                  {orderedSections.map(sectionKey => renderSection(sectionKey))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-gray-500">
                <p>No sections are currently visible.</p>
                <p className="text-sm">Enable sections in the Design tab to display content.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview; 