"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useResume } from "@/app/(root)/resume-builder/contexts/ResumeContext";
import { ChevronDown, ChevronUp, Plus, Trash, Award } from "lucide-react";
import { Certification } from "@/app/(root)/resume-builder/types";

const CertificationsForm = () => {
  const { resumeData, addCertification, updateCertification, removeCertification } = useResume();
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const handleChange = (id: string, field: keyof Certification, value: string) => {
    updateCertification(id, {
      [field]: value
    });
  };

  const handleToggleExpand = (index: number) => {
    if (expandedItems.includes(index)) {
      setExpandedItems(expandedItems.filter((item) => item !== index));
    } else {
      setExpandedItems([...expandedItems, index]);
    }
  };

  const handleAddCertification = () => {
    addCertification();
    const newIndex = resumeData.certifications.length;
    setExpandedItems([...expandedItems, newIndex]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Award className="mr-2 text-blue-400" size={20} />
          <h2 className="text-xl font-semibold text-white">Certifications</h2>
        </div>
        <Button 
          onClick={handleAddCertification}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus size={16} className="mr-2" />
          Add Certification
        </Button>
      </div>

      {resumeData.certifications.length === 0 ? (
        <div className="text-center p-6 border border-gray-800 rounded-lg bg-gray-900/50">
          <Award className="mx-auto mb-3 text-gray-600" size={30} />
          <p className="text-gray-400 mb-3">No certifications added yet</p>
          <Button 
            onClick={handleAddCertification}
            variant="outline" 
            className="border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700"
          >
            <Plus size={16} className="mr-2" />
            Add Your First Certification
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {resumeData.certifications.map((certification, index) => (
            <div key={certification.id} className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/50"
                onClick={() => handleToggleExpand(index)}
              >
                <div className="flex items-center">
                  <Award size={16} className="mr-2 text-blue-400" />
                  <span className="font-medium text-white">
                    {certification.name || "New Certification"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCertification(certification.id);
                    }}
                  >
                    <Trash size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleExpand(index);
                    }}
                  >
                    {expandedItems.includes(index) ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </Button>
                </div>
              </div>

              {expandedItems.includes(index) && (
                <div className="p-4 border-t border-gray-800 space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm text-gray-400">Certification Name</label>
                    <Input
                      value={certification.name || ""}
                      onChange={(e) => handleChange(certification.id, "name", e.target.value)}
                      placeholder="e.g. AWS Certified Solutions Architect"
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm text-gray-400">Issuing Organization</label>
                      <Input
                        value={certification.issuer || ""}
                        onChange={(e) => handleChange(certification.id, "issuer", e.target.value)}
                        placeholder="e.g. Amazon Web Services"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm text-gray-400">Date</label>
                      <Input
                        value={certification.date || ""}
                        onChange={(e) => handleChange(certification.id, "date", e.target.value)}
                        placeholder="e.g. May 2023"
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm text-gray-400">URL (Optional)</label>
                    <Input
                      value={certification.url || ""}
                      onChange={(e) => handleChange(certification.id, "url", e.target.value)}
                      placeholder="https://www.credential.net/..."
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm text-gray-400">Description (Optional)</label>
                    <Textarea
                      value={certification.description || ""}
                      onChange={(e) => handleChange(certification.id, "description", e.target.value)}
                      placeholder="Brief description of the certification and skills covered..."
                      className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
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
};

export default CertificationsForm; 