"use client";

import React, { useState } from "react";
import { useResume } from "@/app/(root)/resume-builder/contexts/ResumeContext";
import { Plus, X, ChevronDown, ChevronUp, Briefcase } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import AiEnhanceButton from "@/components/resume-builder/ui/AIEnhanceButton";
import { toast } from "sonner";

export default function WorkExperienceForm() {
  const { resumeData, addWorkExperience, updateWorkExperience, removeWorkExperience } = useResume();
  const { workExperiences } = resumeData;
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [enhancingField, setEnhancingField] = useState<{ id: string, field: string } | null>(null);

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

  const enhanceDescription = async (id: string) => {
    const experience = workExperiences.find((exp) => exp.id === id);
    if (!experience || !experience.description) return;

    setEnhancingField({ id, field: 'description' });

    try {
      const response = await fetch('/api/resume/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: experience.description,
          type: 'job',
          jobTitle: experience.title,
          companyName: experience.company,
          industry: '',
        }),
      });

      const data = await response.json();

      if (data.success) {
        updateWorkExperience(id, { description: data.enhancedContent });
        toast.success('Description enhanced successfully');
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

  const enhanceHighlight = async (id: string, index: number) => {
    const experience = workExperiences.find((exp) => exp.id === id);
    if (!experience || !experience.highlights[index]) return;

    setEnhancingField({ id, field: `highlight-${index}` });

    try {
      const response = await fetch('/api/resume/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: experience.highlights[index],
          type: 'achievement',
          jobTitle: experience.title,
          companyName: experience.company,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newHighlights = [...experience.highlights];
        newHighlights[index] = data.enhancedContent;
        updateWorkExperience(id, { highlights: newHighlights });
        toast.success('Achievement enhanced successfully');
      } else {
        toast.error('Failed to enhance achievement');
      }
    } catch (error) {
      console.error('Error enhancing highlight:', error);
      toast.error('Failed to enhance achievement');
    } finally {
      setEnhancingField(null);
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
          onClick={() => addWorkExperience()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm flex items-center transition-colors"
        >
          <Plus size={16} className="mr-1" />
          Add Position
        </button>
      </div>

      {workExperiences.map((experience) => (
        <div key={experience.id} className="bg-gray-850 border border-gray-700 rounded-md overflow-hidden">
          <div className="p-4 flex items-center justify-between bg-gray-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleExpand(experience.id)}
                className="text-gray-400 hover:text-white"
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Job Title</label>
                <input
                  type="text"
                  value={experience.title}
                  onChange={(e) => handleChange(experience.id, "title", e.target.value)}
                  className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500"
                  placeholder="e.g. Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Company</label>
                <input
                  type="text"
                  value={experience.company}
                  onChange={(e) => handleChange(experience.id, "company", e.target.value)}
                  className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500"
                  placeholder="e.g. Tech Company Inc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Location</label>
                <input
                  type="text"
                  value={experience.location}
                  onChange={(e) => handleChange(experience.id, "location", e.target.value)}
                  className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500"
                  placeholder="e.g. New York, NY (Remote)"
                />
              </div>

              <div className="grid grid-cols-5 gap-2">
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1 text-gray-300">Start Date</label>
                  <DatePicker
                    date={experience.startDate ? new Date(experience.startDate) : undefined}
                    onDateChange={(date) => date && handleChange(experience.id, "startDate", format(date, 'yyyy-MM-dd'))}
                    format="MMM yyyy"
                    placeholder="Select date"
                    className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500"
                  />
                </div>

                <div className="col-span-3">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 mt-6">
                      <input
                        type="checkbox"
                        id={`current-job-${experience.id}`}
                        checked={experience.current || false}
                        onChange={(e) => handleChange(experience.id, "current", e.target.checked)}
                        className="rounded bg-gray-800 border-gray-700 text-indigo-600"
                      />
                      <label htmlFor={`current-job-${experience.id}`} className="text-sm text-gray-300">
                        Current Position
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {!experience.current && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">End Date</label>
                  <DatePicker
                    date={experience.endDate ? new Date(experience.endDate) : undefined}
                    onDateChange={(date) => date && handleChange(experience.id, "endDate", format(date, 'yyyy-MM-dd'))}
                    format="MMM yyyy"
                    placeholder="Select date"
                    className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500"
                  />
                </div>
              )}
            </div>

            <div className="p-4">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-300">Description</label>
                  <AiEnhanceButton
                    onEnhance={() => enhanceDescription(experience.id)}
                    isDisabled={!experience.description || experience.description.length < 10 || enhancingField !== null}
                  />
                </div>
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
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={highlight}
                            onChange={(e) => handleUpdateHighlight(experience.id, index, e.target.value)}
                            className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500"
                            placeholder="Led the development of..."
                          />
                          <div className="absolute right-2 top-2">
                            <AiEnhanceButton
                              onEnhance={() => enhanceHighlight(experience.id, index)}
                              isDisabled={!highlight || highlight.length < 5 || enhancingField !== null}
                            />
                          </div>
                        </div>
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
        </div>
      ))}
    </div>
  );
}