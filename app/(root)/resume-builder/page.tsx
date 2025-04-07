"use client";

import React, { useState } from "react";
import { ResumeProvider } from "./contexts/ResumeContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import GeneralInfoForm from "@/components/resume-builder/form/GeneralInfoForm";
import WorkExperienceForm from "@/components/resume-builder/form/WorkExperienceForm";
import ThemeCustomizer from "@/components/resume-builder/form/ThemeCustomizer";
import SectionOrderManager from "@/components/resume-builder/form/SectionOrderManager";
import ResumePreview from "@/components/resume-builder/preview/ResumePreview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, Wand2 } from "lucide-react";

export default function ResumeBuilderPage() {
  const [activeTab, setActiveTab] = useState("content");

  return (
    <ResumeProvider>
      <ThemeProvider>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-screen">
          <div className="overflow-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Resume Editor</h2>
                <AiAssistantButton />
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="design">Design</TabsTrigger>
                  <TabsTrigger value="sections">Sections</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-8">
                  <GeneralInfoForm />
                  <WorkExperienceForm />
                  {/* Add other content form components here */}
                </TabsContent>

                <TabsContent value="design">
                  <ThemeCustomizer />
                </TabsContent>

                <TabsContent value="sections">
                  <SectionOrderManager />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="h-full overflow-hidden">
            <ResumePreview />
          </div>
        </div>
      </ThemeProvider>
    </ResumeProvider>
  );
}

function AiAssistantButton() {
  const [showAiTips, setShowAiTips] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowAiTips(!showAiTips)}
        className="flex items-center gap-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-800/30"
      >
        <Wand2 size={16} />
        <span>AI Assistant</span>
      </button>

      {showAiTips && (
        <div className="absolute right-0 mt-2 w-72 p-4 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
          <div className="flex items-start gap-2 mb-2">
            <Lightbulb size={20} className="text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium">AI Suggestions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click any suggestion to apply it to your resume.
              </p>
            </div>
          </div>

          <div className="space-y-2 mt-3">
            <button className="w-full text-left p-2 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md">
              Improve your summary with more specific achievements
            </button>
            <button className="w-full text-left p-2 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md">
              Add quantifiable metrics to your work experiences
            </button>
            <button className="w-full text-left p-2 text-sm bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md">
              Use active voice and power verbs in descriptions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
