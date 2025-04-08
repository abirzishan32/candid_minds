"use client";

import React from "react";
import { useResume } from "@/app/(root)/resume-builder/contexts/ResumeContext";
import { Code, Plus, Trash, ArrowUp, ArrowDown } from "lucide-react";

export default function SkillsForm() {
  const { resumeData, updateSkill, addSkill, removeSkill } = useResume();

  const handleChange = (id: string, field: string, value: string | number) => {
    updateSkill(id, { [field]: value });
  };

  const handleAddSkill = () => {
    addSkill();
  };

  const moveSkill = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === resumeData.skills.length - 1)
    ) {
      return; // Can't move further
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const skillsArray = [...resumeData.skills];
    
    // Swap the items
    const temp = skillsArray[index];
    skillsArray[index] = skillsArray[newIndex];
    skillsArray[newIndex] = temp;
    
    // Update each skill with its new order property (if needed)
    skillsArray.forEach((skill, idx) => {
      updateSkill(skill.id, { order: idx });
    });
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Code className="mr-2 text-green-400" size={24} />
          <h2 className="text-xl font-semibold text-white">Skills</h2>
        </div>
        <button
          onClick={handleAddSkill}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md 
                   flex items-center transition-colors duration-200"
        >
          <Plus size={18} className="mr-1" />
          Add Skill
        </button>
      </div>

      {resumeData.skills.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No skills added yet. Click the button above to add your skills.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-2 px-3 py-2 text-gray-400 text-sm">
            <div className="col-span-5">Skill</div>
            <div className="col-span-5">Proficiency</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>
          
          {resumeData.skills.map((skill, index) => (
            <div key={skill.id} className="bg-gray-800 rounded-lg border border-gray-700 p-3">
              <div className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <input
                    type="text"
                    value={skill.name || ""}
                    onChange={(e) => handleChange(skill.id, "name", e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Skill name (e.g. JavaScript)"
                  />
                </div>
                <div className="col-span-5">
                  <select
                    value={skill.level || "Intermediate"}
                    onChange={(e) => handleChange(skill.id, "level", e.target.value)}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
                <div className="col-span-2 flex items-center justify-center space-x-1">
                  <button
                    onClick={() => moveSkill(index, 'up')}
                    disabled={index === 0}
                    className={`p-1 rounded hover:bg-gray-700 ${index === 0 ? 'text-gray-600' : 'text-gray-400'}`}
                  >
                    <ArrowUp size={18} />
                  </button>
                  <button
                    onClick={() => moveSkill(index, 'down')}
                    disabled={index === resumeData.skills.length - 1}
                    className={`p-1 rounded hover:bg-gray-700 ${index === resumeData.skills.length - 1 ? 'text-gray-600' : 'text-gray-400'}`}
                  >
                    <ArrowDown size={18} />
                  </button>
                  <button
                    onClick={() => removeSkill(skill.id)}
                    className="p-1 rounded hover:bg-gray-700 text-red-400"
                  >
                    <Trash size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          <div className="mt-4 text-gray-400 text-sm">
            <p>Tip: Use the arrow buttons to reorder your skills. List your most important skills first.</p>
          </div>
        </div>
      )}
    </div>
  );
} 