"use client";

import React from "react";
import { useResume } from "@/app/(root)/resume-builder/contexts/ResumeContext";
import { useTheme } from "@/app/(root)/resume-builder/contexts/ThemeContext";
import { FolderGit2, Calendar, Link as LinkIcon } from "lucide-react";

const ProjectsPreview: React.FC = () => {
  const { resumeData, visibleSections = [] } = useResume();
  const { theme } = useTheme();

  if (!visibleSections?.includes("projects") || !resumeData?.projects || resumeData.projects.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <FolderGit2 size={16} className="mr-2 text-gray-700" />
        <h2 className="text-lg font-bold text-gray-800">Projects</h2>
      </div>

      <div className="space-y-4">
        {resumeData.projects.map((project) => (
          <div key={project.id} className="border-l-2 pl-4 py-2" style={{ borderColor: theme.colors?.primary || "#3b82f6" }}>
            <div className="flex flex-wrap justify-between items-start">
              <h3 className="font-semibold text-gray-800">{project.title || "Project Title"}</h3>
              
              <div className="text-sm text-gray-500 flex items-center">
                {project.startDate && (
                  <span className="flex items-center">
                    <Calendar size={12} className="mr-1" />
                    {project.startDate}
                  </span>
                )}
                {project.startDate && project.endDate && <span className="mx-1">-</span>}
                {project.endDate && <span>{project.endDate}</span>}
              </div>
            </div>
            
            {project.link && (
              <div className="flex items-center mt-1 text-sm">
                <LinkIcon size={12} className="mr-1 text-gray-500" />
                <a 
                  href={project.link}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {project.link}
                </a>
              </div>
            )}
            
            {project.description && (
              <p className="text-sm text-gray-600 mt-2">{project.description}</p>
            )}
            
            {project.technologies && project.technologies.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.map((tech, index) => (
                    <span 
                      key={index}
                      className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsPreview; 