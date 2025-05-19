"use client";

import React, { useState } from "react";
import { useResume } from "@/app/(root)/resume-builder/contexts/ResumeContext";
import { Plus, X, ChevronDown, ChevronUp, FolderGit2 } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import AiEnhanceButton from "@/components/resume-builder/ui/AIEnhanceButton";
import { toast } from "sonner";

export default function ProjectsForm() {
  const { resumeData, updateProject, addProject, removeProject } = useResume();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [enhancingField, setEnhancingField] = useState<{ id: string, field: string } | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleChange = (id: string, field: string, value: string) => {
    updateProject(id, { [field]: value });
  };

  const handleAddTechnology = (projectId: string) => {
    const project = resumeData.projects.find(p => p.id === projectId);
    if (project) {
      const technologies = project.technologies || [];
      updateProject(projectId, { technologies: [...technologies, ""] });
    }
  };

  const handleUpdateTechnology = (projectId: string, index: number, value: string) => {
    const project = resumeData.projects.find(p => p.id === projectId);
    if (project && project.technologies) {
      const newTechnologies = [...project.technologies];
      newTechnologies[index] = value;
      updateProject(projectId, { technologies: newTechnologies });
    }
  };

  const handleRemoveTechnology = (projectId: string, index: number) => {
    const project = resumeData.projects.find(p => p.id === projectId);
    if (project && project.technologies) {
      const newTechnologies = [...project.technologies];
      newTechnologies.splice(index, 1);
      updateProject(projectId, { technologies: newTechnologies });
    }
  };

  const enhanceDescription = async (id: string) => {
    const project = resumeData.projects.find((p) => p.id === id);
    if (!project || !project.description) return;

    setEnhancingField({ id, field: 'description' });

    try {
      const response = await fetch('/api/resume/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: project.description,
          type: 'project',
          technologies: project.technologies?.join(', ')
        }),
      });

      const data = await response.json();

      if (data.success) {
        updateProject(id, { description: data.enhancedContent });
        toast.success('Project description enhanced successfully');
      } else {
        toast.error('Failed to enhance description');
      }
    } catch (error) {
      console.error('Error enhancing description:', error);
      toast.error('Failed to enhance description');
    } finally {
      setEnhancingField(null);
    }
  };

  return (
    <div className="space-y-5 bg-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <FolderGit2 size={20} className="text-blue-400 mr-2" />
          <h2 className="text-xl font-bold text-white">Projects</h2>
        </div>

        <button
          onClick={() => addProject()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center transition-colors"
        >
          <Plus size={16} className="mr-1" />
          Add Project
        </button>
      </div>

      {resumeData.projects.map(project => (
        <div key={project.id} className="bg-gray-850 border border-gray-700 rounded-md overflow-hidden">
          <div className="p-4 flex items-center justify-between bg-gray-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleExpand(project.id)}
                className="text-gray-400 hover:text-white"
              >
                {expandedItems.includes(project.id) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              <h3 className="font-medium text-white">
                {project.title || "New Project"}
              </h3>
            </div>
            <button
              onClick={() => removeProject(project.id)}
              className="text-gray-500 hover:text-red-400"
            >
              <X size={20} />
            </button>
          </div>

          {expandedItems.includes(project.id) && (
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Project Name</label>
                <input
                  type="text"
                  value={project.title || ""}
                  onChange={(e) => handleChange(project.id, "name", e.target.value)}
                  className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500"
                  placeholder="e.g. E-commerce Platform"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Project Link</label>
                <input
                  type="text"
                  value={project.link || ""}
                  onChange={(e) => handleChange(project.id, "link", e.target.value)}
                  className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500"
                  placeholder="e.g. https://github.com/username/project"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Start Date</label>
                  <DatePicker
                    date={project.startDate ? new Date(project.startDate) : undefined}
                    onDateChange={(date) => date && handleChange(project.id, "startDate", format(date, 'yyyy-MM-dd'))}
                    format="MMM yyyy"
                    placeholder="Select date"
                    className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">End Date</label>
                  <DatePicker
                    date={project.endDate ? new Date(project.endDate) : undefined}
                    onDateChange={(date) => date && handleChange(project.id, "endDate", format(date, 'yyyy-MM-dd'))}
                    format="MMM yyyy"
                    placeholder="Select date"
                    className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-300">Description</label>
                  <AiEnhanceButton
                    onEnhance={() => enhanceDescription(project.id)}
                    isDisabled={!project.description || project.description.length < 10 || enhancingField !== null}
                  />
                </div>
                <textarea
                  value={project.description || ""}
                  onChange={(e) => handleChange(project.id, "description", e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500"
                  placeholder="Describe your project, its purpose, and your contributions..."
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">Technologies Used</label>
                  <button
                    onClick={() => handleAddTechnology(project.id)}
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                  >
                    <Plus size={16} />
                    <span>Add</span>
                  </button>
                </div>

                {!project.technologies || project.technologies.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">
                    No technologies added yet. Click Add to highlight tech stack used.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, index) => (
                      <div key={index} className="flex items-center bg-gray-800 rounded-full pl-3 pr-1 py-1 border border-gray-700">
                        <input
                          type="text"
                          value={tech}
                          onChange={(e) => handleUpdateTechnology(project.id, index, e.target.value)}
                          className="bg-transparent text-sm text-white border-none focus:ring-0 p-0 w-28"
                          placeholder="Tech name"
                        />
                        <button
                          onClick={() => handleRemoveTechnology(project.id, index)}
                          className="text-gray-500 hover:text-red-400 ml-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}