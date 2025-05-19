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
import { Palette, Layers, User, Briefcase, GraduationCap, FolderGit2, Code, Award, FileText, PenTool, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ResumeBuilder() {
  const [editorMode, setEditorMode] = useState<"content" | "design">("content");
  const [contentTab, setContentTab] = useState("personal");

  return (
    <ResumeProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white p-4 md:p-6">
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
              <div className="sticky top-4 z-20 bg-gray-900/80 backdrop-blur-sm rounded-lg shadow-lg border border-gray-800 overflow-hidden">
                <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                  <h2 className="text-xl font-semibold flex items-center">
                    <FileText size={20} className={`mr-2 ${editorMode === "content" ? "text-blue-400" : "text-purple-400"}`} />
                    Resume Editor
                  </h2>
                  
                  {/* Subtle indicator for current mode */}
                  <span className={`text-sm font-medium ${editorMode === "content" ? "text-blue-400" : "text-purple-400"}`}>
                    {editorMode === "content" ? "Content Editing" : "Design Customization"}
                  </span>
                </div>

                {/* Main Editor Tabs - Improved Design */}
                <div className="relative">
                  <Tabs 
                    value={editorMode} 
                    onValueChange={(value) => setEditorMode(value as "content" | "design")} 
                    defaultValue="content"
                    className="w-full"
                  >
                    <TabsList className="w-full grid grid-cols-2 bg-gray-800/50 rounded-none h-12 p-1">
                      <TabsTrigger 
                        value="content" 
                        className="rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 h-full flex gap-2 items-center justify-center"
                      >
                        <FileText size={16} />
                        <span>Content</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="design" 
                        className="rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 h-full flex gap-2 items-center justify-center"
                      >
                        <PenTool size={16} />
                        <span>Design</span>
                      </TabsTrigger>
                    </TabsList>

                    {/* Animated highlight indicator */}
                    <div 
                      className={`absolute bottom-0 h-0.5 transform transition-all duration-300 ease-out ${
                        editorMode === "content" 
                          ? "left-[5%] w-[40%] bg-blue-400" 
                          : "left-[55%] w-[40%] bg-purple-400"
                      }`}
                    />

                    {/* Content Tab Panel - with animated transitions */}
                    <AnimatePresence mode="wait">
                      {editorMode === "content" && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <TabsContent value="content" className="m-0 border-t border-gray-800">
                            <Tabs 
                              value={contentTab} 
                              onValueChange={setContentTab} 
                              defaultValue="personal"
                              className="w-full"
                            >
                              {/* Section tabs with subtle hover effects */}
                              <div className="border-b border-gray-800 bg-gray-850 py-1 px-2 overflow-x-auto">
                                <TabsList className="bg-transparent p-1 w-auto flex flex-nowrap justify-start gap-1">
                                  <TabsTrigger 
                                    value="personal" 
                                    className="px-3 py-1.5 rounded-md data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 flex items-center gap-1.5 transition-all"
                                  >
                                    <User size={14} />
                                    <span>Personal</span>
                                  </TabsTrigger>
                                  <TabsTrigger 
                                    value="work" 
                                    className="px-3 py-1.5 rounded-md data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 flex items-center gap-1.5 transition-all"
                                  >
                                    <Briefcase size={14} />
                                    <span>Work</span>
                                  </TabsTrigger>
                                  <TabsTrigger 
                                    value="education" 
                                    className="px-3 py-1.5 rounded-md data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 flex items-center gap-1.5 transition-all"
                                  >
                                    <GraduationCap size={14} />
                                    <span>Education</span>
                                  </TabsTrigger>
                                  <TabsTrigger 
                                    value="projects" 
                                    className="px-3 py-1.5 rounded-md data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 flex items-center gap-1.5 transition-all"
                                  >
                                    <FolderGit2 size={14} />
                                    <span>Projects</span>
                                  </TabsTrigger>
                                  <TabsTrigger 
                                    value="skills" 
                                    className="px-3 py-1.5 rounded-md data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 flex items-center gap-1.5 transition-all"
                                  >
                                    <Code size={14} />
                                    <span>Skills</span>
                                  </TabsTrigger>
                                  <TabsTrigger 
                                    value="certifications" 
                                    className="px-3 py-1.5 rounded-md data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300 flex items-center gap-1.5 transition-all"
                                  >
                                    <Award size={14} />
                                    <span>Certifications</span>
                                  </TabsTrigger>
                                </TabsList>
                              </div>

                              {/* Form content */}
                              <div className="p-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
                                <AnimatePresence mode="wait">
                                  <motion.div
                                    key={contentTab}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.15 }}
                                  >
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
                                  </motion.div>
                                </AnimatePresence>
                              </div>
                            </Tabs>
                          </TabsContent>
                        </motion.div>
                      )}

                      {/* Design Tab Panel */}
                      {editorMode === "design" && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2 }}
                        >
                          <TabsContent value="design" className="m-0 border-t border-gray-800">
                            <div className="p-4 max-h-[calc(100vh-14rem)] overflow-y-auto">
                              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg mb-6">
                                <div className="flex items-center mb-3">
                                  <Palette className="mr-2 text-purple-400" size={20} />
                                  <h3 className="text-lg font-medium text-white">Theme & Styling</h3>
                                </div>
                                <ThemeCustomizer />
                              </div>
                              
                              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                                <div className="flex items-center mb-3">
                                  <Layers className="mr-2 text-amber-400" size={20} />
                                  <h3 className="text-lg font-medium text-white">Section Order & Visibility</h3>
                                </div>
                                <SectionOrderManager />
                              </div>
                            </div>
                          </TabsContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Tabs>
                </div>
              </div>
            </div>

            {/* Right side - Preview */}
            <div className="h-full">
              <div className="sticky top-4 h-[calc(100vh-8rem)] overflow-hidden flex flex-col rounded-lg shadow-xl border border-gray-800 bg-gray-900/80 backdrop-blur-sm">
                <div className="bg-gray-850 p-3 border-b border-gray-800 flex items-center justify-between">
                  <h3 className="font-medium flex items-center">
                    <Eye size={16} className="text-blue-400 mr-2" />
                    Live Preview
                  </h3>
                  <span className="text-xs text-gray-400">Updates in real-time</span>
                </div>
                <div className="flex-1 overflow-auto p-1">
                  <ResumePreview />
                </div>
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