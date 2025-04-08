"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResumeProvider } from "./contexts/ResumeContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import GeneralInfoForm from "@/components/resume-builder/form/GeneralInfoForm";
import WorkExperienceForm from "@/components/resume-builder/form/WorkExperienceForm";
import EducationForm from "@/components/resume-builder/form/EducationForm";
import ProjectsForm from "@/components/resume-builder/form/ProjectsForm";
import SkillsForm from "@/components/resume-builder/form/SkillsForm";
import CertificationsForm from "@/components/resume-builder/form/CertificationsForm";
import ResumePreview from "@/components/resume-builder/preview/ResumePreview";
import ThemeCustomizer from "@/components/resume-builder/form/ThemeCustomizer";
import SectionOrderManager from "@/components/resume-builder/form/SectionOrderManager";
import { Palette, Layers, User, Briefcase, GraduationCap, FolderGit2, Code, Award } from "lucide-react";

export default function ResumeBuilder() {
  const [editorMode, setEditorMode] = useState<"content" | "design">("content");
  const [contentTab, setContentTab] = useState("personal");

  return (
    <ResumeProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-gray-950 text-white p-4 md:p-6">
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-600 text-transparent bg-clip-text">
              AI-Powered Resume Builder
            </h1>
            <p className="text-center text-gray-400 mt-2 max-w-2xl mx-auto">
              Create a professional resume in minutes. Our AI-powered builder helps you craft the perfect resume 
              with customizable templates and expert suggestions.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
            {/* Left side - Editor */}
            <div className="h-full">
              <div className="sticky top-4 z-20 bg-gray-900 rounded-lg shadow-lg border border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-800">
                  <h2 className="text-xl font-semibold">Resume Editor</h2>
                </div>

                {/* Main Editor Tabs */}
                <Tabs value={editorMode} onValueChange={(value) => setEditorMode(value as "content" | "design")} className="w-full">
                  <TabsList className="w-full grid grid-cols-2 rounded-none">
                    <TabsTrigger value="content" className="rounded-none data-[state=active]:bg-blue-600">
                      Content
                    </TabsTrigger>
                    <TabsTrigger value="design" className="rounded-none data-[state=active]:bg-purple-600">
                      Design
                    </TabsTrigger>
                  </TabsList>

                  {/* Content Tab Panel */}
                  <TabsContent value="content" className="m-0 border-t border-gray-800">
                    <Tabs value={contentTab} onValueChange={setContentTab} className="w-full">
                      <TabsList className="p-1 m-2 w-auto overflow-x-auto flex flex-nowrap justify-start">
                        <TabsTrigger value="personal" className="flex items-center gap-1">
                          <User size={14} />
                          <span>Personal</span>
                        </TabsTrigger>
                        <TabsTrigger value="work" className="flex items-center gap-1">
                          <Briefcase size={14} />
                          <span>Work</span>
                        </TabsTrigger>
                        <TabsTrigger value="education" className="flex items-center gap-1">
                          <GraduationCap size={14} />
                          <span>Education</span>
                        </TabsTrigger>
                        <TabsTrigger value="projects" className="flex items-center gap-1">
                          <FolderGit2 size={14} />
                          <span>Projects</span>
                        </TabsTrigger>
                        <TabsTrigger value="skills" className="flex items-center gap-1">
                          <Code size={14} />
                          <span>Skills</span>
                        </TabsTrigger>
                        <TabsTrigger value="certifications" className="flex items-center gap-1">
                          <Award size={14} />
                          <span>Certifications</span>
                        </TabsTrigger>
                      </TabsList>

                      <div className="p-4 max-h-[calc(100vh-14rem)] overflow-y-auto">
                        <TabsContent value="personal" className="m-0 mt-2">
                          <GeneralInfoForm />
                        </TabsContent>
                        
                        <TabsContent value="work" className="m-0 mt-2">
                          <WorkExperienceForm />
                        </TabsContent>
                        
                        <TabsContent value="education" className="m-0 mt-2">
                          <EducationForm />
                        </TabsContent>
                        
                        <TabsContent value="projects" className="m-0 mt-2">
                          <ProjectsForm />
                        </TabsContent>
                        
                        <TabsContent value="skills" className="m-0 mt-2">
                          <SkillsForm />
                        </TabsContent>
                        
                        <TabsContent value="certifications" className="m-0 mt-2">
                          <CertificationsForm />
                        </TabsContent>
                      </div>
                    </Tabs>
                  </TabsContent>

                  {/* Design Tab Panel */}
                  <TabsContent value="design" className="m-0 border-t border-gray-800">
                    <div className="p-4 max-h-[calc(100vh-14rem)] overflow-y-auto">
                      <div className="flex items-center mb-4">
                        <Palette className="mr-2 text-purple-400" size={20} />
                        <h3 className="text-lg font-medium text-white">Theme & Styling</h3>
                      </div>
                      <ThemeCustomizer />
                      
                      <div className="mt-8">
                        <div className="flex items-center mb-4">
                          <Layers className="mr-2 text-amber-400" size={20} />
                          <h3 className="text-lg font-medium text-white">Section Order & Visibility</h3>
                        </div>
                        <SectionOrderManager />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Right side - Preview */}
            <div className="h-full">
              <div className="sticky top-4 h-[calc(100vh-8rem)] overflow-hidden flex flex-col rounded-lg shadow-xl border border-gray-800">
                <ResumePreview />
              </div>
            </div>
          </div>

          <footer className="mt-16 text-center text-gray-500 text-sm pb-4">
            <p>© {new Date().getFullYear()} AI Resume Builder. All rights reserved.</p>
          </footer>
        </div>
      </ThemeProvider>
    </ResumeProvider>
  );
}
