export interface GeneralInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  github?: string;
  summary: string;
}

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  highlights: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  startDate: string;
  endDate?: string;
}

export interface Skill {
  id: string;
  name: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expires?: boolean;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface OtherInfo {
  id: string;
  title: string;
  content: string;
}

export interface ResumeData {
  generalInfo: GeneralInfo;
  workExperiences: WorkExperience[];
  education: Education[];
  projects: Project[];
  skills: Skill[];
  certifications: Certification[];
  otherInfo: OtherInfo[];
  sections: SectionOrder[];
}

export type SectionKey = 'workExperiences' | 'education' | 'projects' | 'skills' | 'certifications' | 'otherInfo';

export interface SectionOrder {
  id: SectionKey;
  title: string;
  enabled: boolean;
}

export interface ResumeTheme {
  fontFamily: string;
  primaryColor: string;
  fontSize: 'small' | 'medium' | 'large';
  spacing: 'compact' | 'standard' | 'spacious';
  layout: 'standard' | 'creative' | 'minimal';
} 