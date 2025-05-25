"use client";

import React from "react";
import { useResume } from "@/app/(root)/resume-builder/contexts/ResumeContext";
import { useTheme } from "@/app/(root)/resume-builder/contexts/ThemeContext";
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";

export default function GeneralInfoPreview() {
  const { resumeData } = useResume();
  const { theme } = useTheme();
  const { generalInfo } = resumeData;

  return (
    <div className="relative pb-6 mb-6 border-b border-gray-300">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{ color: theme.primaryColor }}>
            {generalInfo.fullName || "Your Name"}
          </h1>
          <p className="text-xl text-gray-600 mt-1">{generalInfo.title || "Professional Title"}</p>
        </div>

        <div className="flex flex-wrap gap-4 mt-3 md:mt-0">
          {generalInfo.email && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <Mail size={16} className="text-gray-500" />
              <span>{generalInfo.email}</span>
            </div>
          )}
          {generalInfo.phone && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <Phone size={16} className="text-gray-500" />
              <span>{generalInfo.phone}</span>
            </div>
          )}
          {generalInfo.location && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <MapPin size={16} className="text-gray-500" />
              <span>{generalInfo.location}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        {generalInfo.website && (
          <div className="flex items-center gap-1.5 text-gray-600">
            <Globe size={16} style={{ color: theme.primaryColor }} />
            <span>{generalInfo.website}</span>
          </div>
        )}
        {generalInfo.linkedin && (
          <div className="flex items-center gap-1.5 text-gray-600">
            <Linkedin size={16} style={{ color: theme.primaryColor }} />
            <span>{generalInfo.linkedin}</span>
          </div>
        )}
        {generalInfo.github && (
          <div className="flex items-center gap-1.5 text-gray-600">
            <Github size={16} style={{ color: theme.primaryColor }} />
            <span>{generalInfo.github}</span>
          </div>
        )}
      </div>

      {generalInfo.summary && (
        <p className="text-gray-700">{generalInfo.summary}</p>
      )}
    </div>
  );
} 