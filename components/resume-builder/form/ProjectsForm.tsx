"use client";

import React, { useState } from "react";
import { useResume } from "@/app/(root)/resume-builder/contexts/ResumeContext";
import { FolderGit2, Plus, Trash, ChevronDown, ChevronUp, Link, Calendar } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";

export default function ProjectsForm() {
  const { resumeData, updateProject, addProject, removeProject } = useResume();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleChange = (id: string, field: string, value: string) => {
    updateProject(id, { [field]: value });
  };

  const handleAddHighlight = (projectId: string) => {
    const project = resumeData.projects.find(p => p.id === projectId);
    if (project) {
      const highlights = project.highlights || [];
      updateProject(projectId, { highlights: [...highlights, ""] });
    }
  };

  const handleUpdateHighlight = (projectId: string, index: number, value: string) => {
    const project = resumeData.projects.find(p => p.id === projectId);
    if (project && project.highlights) {
      const updatedHighlights = [...project.highlights];
      updatedHighlights[index] = value;
      updateProject(projectId, { highlights: updatedHighlights });
    }
  };

  const handleRemoveHighlight = (projectId: string, index: number) => {
    const project = resumeData.projects.find(p => p.id === projectId);
    if (project && project.highlights) {
      const updatedHighlights = project.highlights.filter((_, i) => i !== index);
      updateProject(projectId, { highlights: updatedHighlights });
    }
  };

  const handleAddProject = () => {
    addProject();
    // Expand the newly added project
    if (resumeData.projects.length > 0) {
      const lastId = resumeData.projects[resumeData.projects.length - 1].id;
      setExpandedItems(prev => [...prev, lastId]);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FolderGit2 className="mr-2 text-amber-400" size={24} />
          <h2 className="text-xl font-semibold text-white">Projects</h2>
        </div>
        <button
          onClick={handleAddProject}
          className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded-md 
                   flex items-center transition-colors duration-200"
        >
          <Plus size={18} className="mr-1" />
          Add Project
        </button>
      </div>

      {resumeData.projects.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No projects added yet. Click the button above to add your projects.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {resumeData.projects.map((project) => (
            <div key={project.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div 
                className="px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-750"
                onClick={() => toggleExpand(project.id)}
              >
                <div className="flex-1">
                  <h3 className="font-medium text-white">
                    {project.name ? project.name : "New Project"}
                  </h3>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeProject(project.id);
                    }}
                    className="text-red-400 hover:text-red-300 mr-3 p-1"
                  >
                    <Trash size={18} />
                  </button>
                  {expandedItems.includes(project.id) ? 
                    <ChevronUp className="text-gray-400" size={20} /> : 
                    <ChevronDown className="text-gray-400" size={20} />}
                </div>
              </div>
              
              {expandedItems.includes(project.id) && (
                <div className="px-4 pb-4 pt-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={project.name || ""}
                      onChange={(e) => handleChange(project.id, "name", e.target.value)}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="E-commerce Platform"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Project URL
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <Link size={16} className="text-gray-400" />
                        </span>
                        <input
                          type="text"
                          value={project.url || ""}
                          onChange={(e) => handleChange(project.id, "url", e.target.value)}
                          className="w-full bg-gray-700 text-white border border-gray-600 rounded-md pl-10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          placeholder="https://github.com/username/project"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Start Date
                        </label>
                        <DatePicker
                          date={project.startDate ? new Date(project.startDate) : undefined}
                          onDateChange={(date) => handleChange(project.id, "startDate", format(date, "MMMM yyyy"))}
                          className="w-full"
                          placeholder="Select start date"
                        />
                      </div>
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          End Date
                        </label>
                        <DatePicker
                          date={project.endDate ? new Date(project.endDate) : undefined}
                          onDateChange={(date) => handleChange(project.id, "endDate", format(date, "MMMM yyyy"))}
                          className="w-full"
                          placeholder="Select end date or leave empty"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={project.description || ""}
                      onChange={(e) => handleChange(project.id, "description", e.target.value)}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[80px]"
                      placeholder="Brief overview of the project and your role"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Key Highlights
                      </label>
                      <button
                        onClick={() => handleAddHighlight(project.id)}
                        className="text-amber-400 hover:text-amber-300 text-sm flex items-center"
                      >
                        <Plus size={16} className="mr-1" />
                        Add Highlight
                      </button>
                    </div>
                    
                    {!project.highlights || project.highlights.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">
                        Add bullet points highlighting your contributions and achievements
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {project.highlights.map((highlight, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={highlight}
                                onChange={(e) => handleUpdateHighlight(project.id, index, e.target.value)}
                                className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                placeholder="Implemented feature X resulting in Y improvement"
                              />
                            </div>
                            <button
                              onClick={() => handleRemoveHighlight(project.id, index)}
                              className="text-red-400 hover:text-red-300 mt-2"
                            >
                              <Trash size={16} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 