"use client";

import { format } from "date-fns";
import { Building, Calendar, Award, Users, Tag, Briefcase } from "lucide-react";
import { CareerExperience } from "@/lib/actions/career-experience.action";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface ExperienceDetailProps {
  experience: CareerExperience;
}

export default function ExperienceDetail({ experience }: ExperienceDetailProps) {
  const formattedDate = experience.createdAt 
    ? format(new Date(experience.createdAt), "MMMM d, yyyy")
    : "Recent";
  
  const experienceColors = {
    positive: "text-green-500 bg-green-500/10 border-green-500/20",
    neutral: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    negative: "text-red-500 bg-red-500/10 border-red-500/20"
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
      <div className="p-8">
        <div className="mb-8 pb-6 border-b border-gray-800">
          <Link href="/career" className="text-blue-400 hover:text-blue-300 mb-4 inline-flex items-center">
            ← Back to all experiences
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
            <h1 className="text-3xl font-bold text-white">{experience.companyName}</h1>
            
            <div className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium border self-start",
              experienceColors[experience.experience]
            )}>
              {experience.experience.charAt(0).toUpperCase() + experience.experience.slice(1)} Experience
            </div>
          </div>
          
          <div className="flex items-center text-gray-300 mt-2">
            <Award className="h-5 w-5 mr-2" />
            <span className="text-lg">{experience.position}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex flex-col bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <span className="text-gray-400 text-sm mb-1">Interview Source</span>
            <div className="flex items-center text-white">
              <Users className="h-4 w-4 mr-2 text-blue-400" />
              <span>{experience.source}</span>
            </div>
          </div>
          
          <div className="flex flex-col bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <span className="text-gray-400 text-sm mb-1">Posted On</span>
            <div className="flex items-center text-white">
              <Calendar className="h-4 w-4 mr-2 text-blue-400" />
              <span>{formattedDate}</span>
            </div>
          </div>
          
          <div className="flex flex-col bg-gray-800/50 p-4 rounded-lg border border-gray-700">
            <span className="text-gray-400 text-sm mb-1">Company</span>
            <div className="flex items-center text-white">
              <Building className="h-4 w-4 mr-2 text-blue-400" />
              <span>{experience.companyName}</span>
            </div>
          </div>
        </div>
        
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-4">Experience Details</h2>
          <div className="bg-gray-800/30 rounded-lg border border-gray-800 p-6">
            <p className="text-gray-200 leading-relaxed whitespace-pre-line">
              {experience.details}
            </p>
          </div>
        </div>
        
        {experience.questions && experience.questions.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Interview Questions</h2>
            <div className="bg-gray-800/30 rounded-lg border border-gray-800 p-6">
              <ul className="space-y-4">
                {experience.questions.map((question, index) => (
                  <li key={index} className="flex">
                    <div className="mr-3 text-blue-400">
                      <Tag className="h-5 w-5" />
                    </div>
                    <p className="text-gray-200">{question}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        <div className="mt-10 pt-6 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">
            This experience was shared anonymously to help others prepare for their interviews.
          </p>
        </div>
      </div>
    </div>
  );
} 