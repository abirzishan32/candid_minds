"use client";

import React, { useState } from "react";
import { useResume } from "@/app/(root)/resume-builder/contexts/ResumeContext";
import { Plus, X, ChevronDown, ChevronUp, Briefcase } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";

export default function WorkExperienceForm() {
  const { resumeData, addWorkExperience, updateWorkExperience, removeWorkExperience } = useResume();
  const { workExperiences } = resumeData;
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleChange = (id: string, field: string, value: string | boolean | string[]) => {
    updateWorkExperience(id, { [field]: value });
  };

  const handleAddHighlight = (id: string) => {
    const experience = workExperiences.find((exp) => exp.id === id);
    if (experience) {
      updateWorkExperience(id, {
        highlights: [...experience.highlights, ""],
      });
    }
  };

  const handleUpdateHighlight = (id: string, index: number, value: string) => {
    const experience = workExperiences.find((exp) => exp.id === id);
    if (experience) {
      const newHighlights = [...experience.highlights];
      newHighlights[index] = value;
      updateWorkExperience(id, { highlights: newHighlights });
    }
  };

  const handleRemoveHighlight = (id: string, index: number) => {
    const experience = workExperiences.find((exp) => exp.id === id);
    if (experience) {
      const newHighlights = [...experience.highlights];
      newHighlights.splice(index, 1);
      updateWorkExperience(id, { highlights: newHighlights });
    }
  };

  return (
    <div className="space-y-5 bg-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Briefcase size={20} className="text-indigo-400 mr-2" />
          <h2 className="text-xl font-bold text-white">Work Experience</h2>
        </div>
        <button
          onClick={addWorkExperience}
          className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          <span>Add</span>
        </button>
      </div>
      
      {workExperiences.length === 0 && (
        <p className="text-gray-400 text-sm italic">
          No work experiences added yet. Click the Add button to add your first work experience.
        </p>
      )}
      
      {workExperiences.map((experience) => (
        <div
          key={experience.id}
          className="border border-gray-700 rounded-lg p-4 bg-gray-800"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleExpand(experience.id)}
                className="text-gray-400 hover:text-gray-300"
              >
                {expandedItems[experience.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              <h3 className="font-medium text-white">
                {experience.title || "New Position"} {experience.company ? `at ${experience.company}` : ""}
              </h3>
            </div>
            <button
              onClick={() => removeWorkExperience(experience.id)}
              className="text-gray-500 hover:text-red-400"
            >
              <X size={20} />
            </button>
          </div>
          
          <div className={expandedItems[experience.id] ? "block" : "hidden"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Job Title</label>
                <input
                  type="text"
                  value={experience.title}
                  onChange={(e) => handleChange(experience.id, "title", e.target.value)}
                  className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500"
                  placeholder="Senior Software Engineer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Company</label>
                <input
                  type="text"
                  value={experience.company}
                  onChange={(e) => handleChange(experience.id, "company", e.target.value)}
                  className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500"
                  placeholder="Acme Inc."
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Location</label>
                <input
                  type="text"
                  value={experience.location}
                  onChange={(e) => handleChange(experience.id, "location", e.target.value)}
                  className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500"
                  placeholder="New York, NY"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Start Date</label>
                <DatePicker
                  date={experience.startDate ? new Date(experience.startDate) : undefined}
                  onDateChange={(date) => handleChange(experience.id, "startDate", format(date, "MMMM yyyy"))}
                  className="w-full"
                  placeholder="Select start date"
                />
              </div>
              
              <div>
                <div className="flex items-center mb-1">
                  <label className="block text-sm font-medium text-gray-300">End Date</label>
                  <div className="ml-4 flex items-center">
                    <input
                      type="checkbox"
                      checked={experience.current}
                      onChange={(e) => handleChange(experience.id, "current", e.target.checked)}
                      className="mr-2 text-indigo-600 bg-gray-800 border-gray-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-300">Current</span>
                  </div>
                </div>
                {experience.current ? (
                  <div className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-gray-400">Present</div>
                ) : (
                  <DatePicker
                    date={experience.endDate ? new Date(experience.endDate) : undefined}
                    onDateChange={(date) => handleChange(experience.id, "endDate", format(date, "MMMM yyyy"))}
                    className="w-full"
                    placeholder="Select end date"
                    disabled={experience.current}
                  />
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-300">Description</label>
              <textarea
                value={experience.description}
                onChange={(e) => handleChange(experience.id, "description", e.target.value)}
                rows={3}
                className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500"
                placeholder="Brief description of your role and responsibilities..."
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-300">Key Achievements</label>
                <button
                  onClick={() => handleAddHighlight(experience.id)}
                  className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1"
                >
                  <Plus size={16} />
                  <span>Add</span>
                </button>
              </div>
              
              {experience.highlights.length === 0 ? (
                <p className="text-gray-500 text-sm italic">
                  No achievements added yet. Click Add to highlight your accomplishments.
                </p>
              ) : (
                <ul className="space-y-2">
                  {experience.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) => handleUpdateHighlight(experience.id, index, e.target.value)}
                        className="flex-1 p-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500"
                        placeholder="Led the development of..."
                      />
                      <button
                        onClick={() => handleRemoveHighlight(experience.id, index)}
                        className="text-gray-500 hover:text-red-400 mt-2"
                      >
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 