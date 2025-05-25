"use client";

import React, { useState } from "react";
import { useResume } from "@/app/(root)/resume-builder/contexts/ResumeContext";
import { GraduationCap, Plus, Trash, ChevronDown, ChevronUp } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";

export default function EducationForm() {
  const { resumeData, updateEducation, addEducation, removeEducation } = useResume();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleChange = (id: string, field: string, value: string) => {
    updateEducation(id, { [field]: value });
  };

  const handleAddEducation = () => {
    addEducation();
    // Expand the newly added education entry
    if (resumeData.education.length > 0) {
      const lastId = resumeData.education[resumeData.education.length - 1].id;
      setExpandedItems(prev => [...prev, lastId]);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <GraduationCap className="mr-2 text-blue-400" size={24} />
          <h2 className="text-xl font-semibold text-white">Education</h2>
        </div>
        <button
          onClick={handleAddEducation}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md 
                   flex items-center transition-colors duration-200"
        >
          <Plus size={18} className="mr-1" />
          Add Education
        </button>
      </div>

      {resumeData.education.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No education added yet. Click the button above to add your educational background.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {resumeData.education.map((edu) => (
            <div key={edu.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div 
                className="px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-750"
                onClick={() => toggleExpand(edu.id)}
              >
                <div className="flex-1">
                  <h3 className="font-medium text-white">
                    {edu.degree || edu.institution ? 
                      `${edu.degree || "Degree"} - ${edu.institution || "Institution"}` : 
                      "New Education Entry"}
                  </h3>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeEducation(edu.id);
                    }}
                    className="text-red-400 hover:text-red-300 mr-3 p-1"
                  >
                    <Trash size={18} />
                  </button>
                  {expandedItems.includes(edu.id) ? 
                    <ChevronUp className="text-gray-400" size={20} /> : 
                    <ChevronDown className="text-gray-400" size={20} />}
                </div>
              </div>
              
              {expandedItems.includes(edu.id) && (
                <div className="px-4 pb-4 pt-2 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Degree / Certificate
                      </label>
                      <input
                        type="text"
                        value={edu.degree || ""}
                        onChange={(e) => handleChange(edu.id, "degree", e.target.value)}
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Bachelor of Science"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Institution
                      </label>
                      <input
                        type="text"
                        value={edu.institution || ""}
                        onChange={(e) => handleChange(edu.id, "institution", e.target.value)}
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="University Name"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={edu.location || ""}
                        onChange={(e) => handleChange(edu.id, "location", e.target.value)}
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="City, Country"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Start Date
                        </label>
                        <DatePicker
                          date={edu.startDate ? new Date(edu.startDate) : undefined}
                          onDateChange={(date) => handleChange(edu.id, "startDate", format(date, "MMMM yyyy"))}
                          className="w-full"
                          placeholder="Select start date"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          End Date
                        </label>
                        <DatePicker
                          date={edu.endDate ? new Date(edu.endDate) : undefined}
                          onDateChange={(date) => handleChange(edu.id, "endDate", format(date, "MMMM yyyy"))}
                          className="w-full"
                          placeholder="Select end date"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={edu.description || ""}
                      onChange={(e) => handleChange(edu.id, "description", e.target.value)}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                      placeholder="Describe your achievements, GPA, relevant coursework, etc."
                    />
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