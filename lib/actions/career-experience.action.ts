"use server";

import { db } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

export type InterviewExperience = 'positive' | 'neutral' | 'negative';
export type InterviewSource = 'Applied online' | 'Campus Recruiting' | 'Recruiter' | 'Employee Referral' | 'In Person' | 'Staffing Agency' | 'Other';

export interface CareerExperience {
  id: string;
  userId: string;
  companyName: string;
  position: string;
  experience: InterviewExperience;
  source: InterviewSource;
  details: string;
  questions: string[];
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
}

export interface CreateCareerExperienceParams {
  userId: string;
  companyName: string;
  position: string;
  experience: InterviewExperience;
  source: InterviewSource;
  details: string;
  questions: string[];
}

// Helper function to serialize Firestore data (converting Firestore timestamps to ISO strings)
const serializeFirestoreData = (data: any) => {
  if (!data) return null;
  
  const serialized: any = { ...data };
  
  // Convert Firestore Timestamps to ISO strings
  if (data.createdAt && typeof data.createdAt.toDate === 'function') {
    serialized.createdAt = data.createdAt.toDate().toISOString();
  }
  if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
    serialized.updatedAt = data.updatedAt.toDate().toISOString();
  }
  
  return serialized;
};

/**
 * Create a new career experience post
 */
export async function createCareerExperience(params: CreateCareerExperienceParams) {
  try {
    const experienceId = uuidv4();
    const now = FieldValue.serverTimestamp();
    
    const newExperience: CareerExperience = {
      id: experienceId,
      userId: params.userId,
      companyName: params.companyName,
      position: params.position,
      experience: params.experience,
      source: params.source,
      details: params.details,
      questions: params.questions,
      createdAt: now,
      updatedAt: now
    };
    
    await db.collection("careerExperience").doc(experienceId).set(newExperience);
    
    revalidatePath('/career');
    
    return { 
      success: true, 
      data: {
        ...newExperience,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error("Error creating career experience:", error);
    return { success: false, message: "Failed to create career experience" };
  }
}

/**
 * Get all career experiences
 */
export async function getCareerExperiences(limit = 50) {
  try {
    const experiencesSnapshot = await db.collection("careerExperience")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    
    const experiences = experiencesSnapshot.docs.map(doc => {
      const data = doc.data() || {};
      return {
        id: doc.id,
        ...serializeFirestoreData(data)
      };
    }) as CareerExperience[];
    
    return { success: true, data: experiences };
  } catch (error) {
    console.error("Error fetching career experiences:", error);
    return { success: false, message: "Failed to fetch career experiences" };
  }
}

/**
 * Get a career experience by ID
 */
export async function getCareerExperienceById(id: string) {
  try {
    const experienceDoc = await db.collection("careerExperience").doc(id).get();
    
    if (!experienceDoc.exists) {
      return { success: false, message: "Career experience not found" };
    }
    
    const experienceData = experienceDoc.data() || {};
    
    const experience = {
      id: experienceDoc.id,
      ...serializeFirestoreData(experienceData)
    } as CareerExperience;
    
    return { success: true, data: experience };
  } catch (error) {
    console.error("Error fetching career experience:", error);
    return { success: false, message: "Failed to fetch career experience" };
  }
}

/**
 * Get all career experiences for a specific company
 */
export async function getCareerExperiencesByCompany(companyName: string, limit = 50) {
  try {
    const experiencesSnapshot = await db.collection("careerExperience")
      .where("companyName", "==", companyName)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    
    const experiences = experiencesSnapshot.docs.map(doc => {
      const data = doc.data() || {};
      return {
        id: doc.id,
        ...serializeFirestoreData(data)
      };
    }) as CareerExperience[];
    
    return { success: true, data: experiences };
  } catch (error) {
    console.error("Error fetching career experiences for company:", error);
    return { success: false, message: "Failed to fetch career experiences" };
  }
} 