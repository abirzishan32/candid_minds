"use client";

import React, { createContext, useContext, useState } from "react";
import { ResumeData, SectionKey, SectionOrder } from "../types";
import { v4 as uuidv4 } from "uuid";

const initialResumeData: ResumeData = {
  generalInfo: {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    summary: "",
  },
  workExperiences: [],
  education: [],
  projects: [],
  skills: [],
  certifications: [],
  otherInfo: [],
  sections: [
    { id: "workExperiences", title: "Work Experience", enabled: true },
    { id: "education", title: "Education", enabled: true },
    { id: "projects", title: "Projects", enabled: true },
    { id: "skills", title: "Skills", enabled: true },
    { id: "certifications", title: "Certifications", enabled: true },
    { id: "otherInfo", title: "Additional Information", enabled: false },
  ],
};

interface ResumeContextType {
  resumeData: ResumeData;
  visibleSections: SectionKey[];
  updateGeneralInfo: (generalInfo: Partial<ResumeData["generalInfo"]>) => void;
  addWorkExperience: () => void;
  updateWorkExperience: (id: string, data: Partial<ResumeData["workExperiences"][0]>) => void;
  removeWorkExperience: (id: string) => void;
  addEducation: () => void;
  updateEducation: (id: string, data: Partial<ResumeData["education"][0]>) => void;
  removeEducation: (id: string) => void;
  addProject: () => void;
  updateProject: (id: string, data: Partial<ResumeData["projects"][0]>) => void;
  removeProject: (id: string) => void;
  addSkill: () => void;
  updateSkill: (id: string, data: Partial<ResumeData["skills"][0]>) => void;
  removeSkill: (id: string) => void;
  addCertification: () => void;
  updateCertification: (id: string, data: Partial<ResumeData["certifications"][0]>) => void;
  removeCertification: (id: string) => void;
  addOtherInfo: () => void;
  updateOtherInfo: (id: string, data: Partial<ResumeData["otherInfo"][0]>) => void;
  removeOtherInfo: (id: string) => void;
  updateSectionOrder: (sections: SectionOrder[]) => void;
  toggleSectionVisibility: (id: SectionKey) => void;
  reorderSkills: (fromIndex: number, toIndex: number) => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);

  const updateGeneralInfo = (generalInfo: Partial<ResumeData["generalInfo"]>) => {
    setResumeData((prev) => ({
      ...prev,
      generalInfo: {
        ...prev.generalInfo,
        ...generalInfo,
      },
    }));
  };

  const addWorkExperience = () => {
    const newItem = {
      id: uuidv4(),
      title: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      highlights: [],
    };
    setResumeData((prev) => ({
      ...prev,
      workExperiences: [...prev.workExperiences, newItem],
    }));
  };

  const updateWorkExperience = (id: string, data: Partial<ResumeData["workExperiences"][0]>) => {
    setResumeData((prev) => ({
      ...prev,
      workExperiences: prev.workExperiences.map((item) =>
        item.id === id ? { ...item, ...data } : item
      ),
    }));
  };

  const removeWorkExperience = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      workExperiences: prev.workExperiences.filter((item) => item.id !== id),
    }));
  };

  const addEducation = () => {
    const newItem = {
      id: uuidv4(),
      institution: "",
      degree: "",
      field: "",
      location: "",
      startDate: "",
      endDate: "",
      gpa: "",
      description: "",
    };
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, newItem],
    }));
  };

  const updateEducation = (id: string, data: Partial<ResumeData["education"][0]>) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((item) =>
        item.id === id ? { ...item, ...data } : item
      ),
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((item) => item.id !== id),
    }));
  };

  const addProject = () => {
    const newItem = {
      id: uuidv4(),
      title: "",
      description: "",
      technologies: [],
      link: "",
      startDate: "",
      endDate: "",
    };
    setResumeData((prev) => ({
      ...prev,
      projects: [...prev.projects, newItem],
    }));
  };

  const updateProject = (id: string, data: Partial<ResumeData["projects"][0]>) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.map((item) =>
        item.id === id ? { ...item, ...data } : item
      ),
    }));
  };

  const removeProject = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((item) => item.id !== id),
    }));
  };

  const addSkill = () => {
    const newItem = {
      id: uuidv4(),
      name: "",
      level: "Intermediate" as const,
    };
    setResumeData((prev) => ({
      ...prev,
      skills: [...prev.skills, newItem],
    }));
  };

  const updateSkill = (id: string, data: Partial<ResumeData["skills"][0]>) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.map((item) =>
        item.id === id ? { ...item, ...data } : item
      ),
    }));
  };

  const removeSkill = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((item) => item.id !== id),
    }));
  };

  const addCertification = () => {
    const newItem = {
      id: uuidv4(),
      name: "",
      issuer: "",
      date: "",
      expires: false,
      expiryDate: "",
      credentialId: "",
      credentialUrl: "",
    };
    setResumeData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, newItem],
    }));
  };

  const updateCertification = (id: string, data: Partial<ResumeData["certifications"][0]>) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((item) =>
        item.id === id ? { ...item, ...data } : item
      ),
    }));
  };

  const removeCertification = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((item) => item.id !== id),
    }));
  };

  const addOtherInfo = () => {
    const newItem = {
      id: uuidv4(),
      title: "",
      content: "",
    };
    setResumeData((prev) => ({
      ...prev,
      otherInfo: [...prev.otherInfo, newItem],
    }));
  };

  const updateOtherInfo = (id: string, data: Partial<ResumeData["otherInfo"][0]>) => {
    setResumeData((prev) => ({
      ...prev,
      otherInfo: prev.otherInfo.map((item) =>
        item.id === id ? { ...item, ...data } : item
      ),
    }));
  };

  const removeOtherInfo = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      otherInfo: prev.otherInfo.filter((item) => item.id !== id),
    }));
  };

  const updateSectionOrder = (sections: SectionOrder[]) => {
    setResumeData((prev) => ({
      ...prev,
      sections,
    }));
  };

  const toggleSectionVisibility = (id: SectionKey) => {
    setResumeData((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === id ? { ...section, enabled: !section.enabled } : section
      ),
    }));
  };

  const getVisibleSections = (): SectionKey[] => {
    return resumeData.sections
      .filter(section => section.enabled)
      .map(section => section.id);
  };

  const reorderSkills = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex < 0 || 
      toIndex < 0 || 
      fromIndex >= resumeData.skills.length || 
      toIndex >= resumeData.skills.length
    ) {
      return; // Invalid indices
    }

    setResumeData((prev) => {
      const newSkills = [...prev.skills];
      const [movedSkill] = newSkills.splice(fromIndex, 1);
      newSkills.splice(toIndex, 0, movedSkill);
      
      return {
        ...prev,
        skills: newSkills,
      };
    });
  };

  const value = {
    resumeData,
    visibleSections: getVisibleSections(),
    updateGeneralInfo,
    addWorkExperience,
    updateWorkExperience,
    removeWorkExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addProject,
    updateProject,
    removeProject,
    addSkill,
    updateSkill,
    removeSkill,
    addCertification,
    updateCertification,
    removeCertification,
    addOtherInfo,
    updateOtherInfo,
    removeOtherInfo,
    updateSectionOrder,
    toggleSectionVisibility,
    reorderSkills,
  };

  return <ResumeContext.Provider value={value}>{children}</ResumeContext.Provider>;
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error("useResume must be used within a ResumeProvider");
  }
  return context;
} 