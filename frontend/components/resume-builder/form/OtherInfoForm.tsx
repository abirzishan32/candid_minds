"use client";

import React, { useState } from "react";
import { useResume } from "@/app/(root)/resume-builder/contexts/ResumeContext";
import { Info, Plus, Trash, ChevronDown, ChevronUp } from "lucide-react";

export default function OtherInfoForm() {
  const { resumeData, updateOtherInfo, addOtherInfo, removeOtherInfo } = useResume();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleChange = (id: string, field: string, value: string) => {
    updateOtherInfo(id, { [field]: value });
  };

  const handleAddOtherInfo = () => {
    addOtherInfo();
    // Expand the newly added section
    if (resumeData.otherInfo.length > 0) {
      const lastId = resumeData.otherInfo[resumeData.otherInfo.length - 1].id;
      setExpandedItems(prev => [...prev, lastId]);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-lg border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Info className="mr-2 text-pink-400" size={24} />
          <h2 className="text-xl font-semibold text-white">Additional Information</h2>
        </div>
        <button
          onClick={handleAddOtherInfo}
          className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-2 rounded-md 
                   flex items-center transition-colors duration-200"
        >
          <Plus size={18} className="mr-1" />
          Add Section
        </button>
      </div>

      <div className="mb-4 text-gray-300">
        <p>Use this section to add any additional information that doesn't fit elsewhere, such as:</p>
        <ul className="list-disc ml-5 mt-1 text-gray-400">
          <li>Languages</li>
          <li>Interests</li>
          <li>Volunteer work</li>
          <li>Publications</li>
          <li>Patents</li>
          <li>Any other relevant information</li>
        </ul>
      </div>

      {resumeData.otherInfo.length === 0 ? (
        <div className="text-center py-6 text-gray-400">
          <p>No additional information added yet. Click the button above to add a new section.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {resumeData.otherInfo.map((info) => (
            <div key={info.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div 
                className="px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-750"
                onClick={() => toggleExpand(info.id)}
              >
                <div className="flex-1">
                  <h3 className="font-medium text-white">
                    {info.title ? info.title : "New Section"}
                  </h3>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOtherInfo(info.id);
                    }}
                    className="text-red-400 hover:text-red-300 mr-3 p-1"
                  >
                    <Trash size={18} />
                  </button>
                  {expandedItems.includes(info.id) ? 
                    <ChevronUp className="text-gray-400" size={20} /> : 
                    <ChevronDown className="text-gray-400" size={20} />}
                </div>
              </div>
              
              {expandedItems.includes(info.id) && (
                <div className="px-4 pb-4 pt-2 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={info.title || ""}
                      onChange={(e) => handleChange(info.id, "title", e.target.value)}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      placeholder="Languages, Interests, etc."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Content
                    </label>
                    <textarea
                      value={info.content || ""}
                      onChange={(e) => handleChange(info.id, "content", e.target.value)}
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 min-h-[100px]"
                      placeholder="Add details about this section here..."
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