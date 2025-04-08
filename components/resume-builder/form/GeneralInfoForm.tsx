"use client";

import React from "react";
import { useResume } from "@/app/(root)/resume-builder/contexts/ResumeContext";
import { User, Mail, Phone, MapPin, Globe, Linkedin, Github, FileText } from "lucide-react";

export default function GeneralInfoForm() {
  const { resumeData, updateGeneralInfo } = useResume();
  const { generalInfo } = resumeData;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateGeneralInfo({ [name]: value });
  };

  return (
    <div className="space-y-5 bg-gray-900 rounded-lg p-6">
      <div className="flex items-center mb-2">
        <User size={20} className="text-indigo-400 mr-2" />
        <h2 className="text-xl font-bold text-white">Personal Information</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={generalInfo.fullName}
            onChange={handleChange}
            className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500"
            placeholder="John Doe"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-300">Professional Title</label>
          <input
            type="text"
            name="title"
            value={generalInfo.title}
            onChange={handleChange}
            className="w-full p-2 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500"
            placeholder="Software Engineer"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={generalInfo.email}
              onChange={handleChange}
              className="w-full p-2 pl-9 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500"
              placeholder="john.doe@example.com"
            />
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
        </div>
        
        <div className="relative">
          <label className="block text-sm font-medium mb-1 text-gray-300">Phone</label>
          <div className="relative">
            <input
              type="tel"
              name="phone"
              value={generalInfo.phone}
              onChange={handleChange}
              className="w-full p-2 pl-9 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500"
              placeholder="+1 (555) 123-4567"
            />
            <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
        </div>
      </div>
      
      <div className="relative">
        <label className="block text-sm font-medium mb-1 text-gray-300">Location</label>
        <div className="relative">
          <input
            type="text"
            name="location"
            value={generalInfo.location}
            onChange={handleChange}
            className="w-full p-2 pl-9 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500"
            placeholder="New York, NY"
          />
          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium mb-1 text-gray-300">Website (Optional)</label>
          <div className="relative">
            <input
              type="url"
              name="website"
              value={generalInfo.website}
              onChange={handleChange}
              className="w-full p-2 pl-9 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500"
              placeholder="https://johndoe.com"
            />
            <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
        </div>
        
        <div className="relative">
          <label className="block text-sm font-medium mb-1 text-gray-300">LinkedIn (Optional)</label>
          <div className="relative">
            <input
              type="url"
              name="linkedin"
              value={generalInfo.linkedin}
              onChange={handleChange}
              className="w-full p-2 pl-9 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500"
              placeholder="https://linkedin.com/in/johndoe"
            />
            <Linkedin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
        </div>
        
        <div className="relative">
          <label className="block text-sm font-medium mb-1 text-gray-300">GitHub (Optional)</label>
          <div className="relative">
            <input
              type="url"
              name="github"
              value={generalInfo.github}
              onChange={handleChange}
              className="w-full p-2 pl-9 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500"
              placeholder="https://github.com/johndoe"
            />
            <Github size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
        </div>
      </div>
      
      <div className="relative">
        <label className="block text-sm font-medium mb-1 text-gray-300">Professional Summary</label>
        <div className="relative">
          <textarea
            name="summary"
            value={generalInfo.summary}
            onChange={handleChange}
            rows={4}
            className="w-full p-2 pl-9 border border-gray-700 rounded-md bg-gray-800 text-white placeholder-gray-500"
            placeholder="Experienced software engineer with expertise in..."
          />
          <FileText size={16} className="absolute left-3 top-4 text-gray-500" />
        </div>
      </div>
    </div>
  );
} 