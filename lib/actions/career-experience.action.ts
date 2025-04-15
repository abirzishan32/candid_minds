"use server";

import { db } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, arrayUnion, arrayRemove, query, where, addDoc, serverTimestamp, orderBy, deleteDoc, increment } from "firebase/firestore";

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
  likesCount?: number;
  commentsCount?: number;
}

export interface Comment {
  id: string;
  experienceId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: any; // Firestore timestamp
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

export interface CreateCommentParams {
  experienceId: string;
  userId: string;
  userName: string;
  content: string;
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
      updatedAt: now,
      likesCount: 0,
      commentsCount: 0
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

/**
 * Like or unlike a career experience post
 */
export async function toggleLike(experienceId: string, userId: string) {
  try {
    // Check if the user has already liked this post
    const likeRef = db.collection("careerExperienceLikes").doc(`${experienceId}_${userId}`);
    const likeDoc = await likeRef.get();
    
    const experienceRef = db.collection("careerExperience").doc(experienceId);
    const experienceDoc = await experienceRef.get();
    
    if (!experienceDoc.exists) {
      return { success: false, message: "Career experience not found" };
    }
    
    if (likeDoc.exists) {
      // User already liked this post, so unlike it
      await likeRef.delete();
      
      // Decrement the likes count on the experience
      await experienceRef.update({
        likesCount: FieldValue.increment(-1)
      });
      
      revalidatePath(`/career`);
      revalidatePath(`/career/${experienceId}`);
      
      return { success: true, action: 'unliked' };
    } else {
      // User hasn't liked this post yet, so like it
      await likeRef.set({
        experienceId,
        userId,
        createdAt: FieldValue.serverTimestamp()
      });
      
      // Increment the likes count on the experience
      await experienceRef.update({
        likesCount: FieldValue.increment(1)
      });
      
      revalidatePath(`/career`);
      revalidatePath(`/career/${experienceId}`);
      
      return { success: true, action: 'liked' };
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return { success: false, message: "Failed to toggle like" };
  }
}

/**
 * Check if a user has liked a specific post
 */
export async function hasUserLiked(experienceId: string, userId: string) {
  try {
    const likeRef = db.collection("careerExperienceLikes").doc(`${experienceId}_${userId}`);
    const likeDoc = await likeRef.get();
    
    return { success: true, hasLiked: likeDoc.exists };
  } catch (error) {
    console.error("Error checking if user liked post:", error);
    return { success: false, message: "Failed to check like status", hasLiked: false };
  }
}

/**
 * Add a comment to a career experience post
 */
export async function addComment(params: CreateCommentParams) {
  try {
    const commentId = uuidv4();
    const now = FieldValue.serverTimestamp();
    
    const newComment = {
      id: commentId,
      experienceId: params.experienceId,
      userId: params.userId,
      userName: params.userName,
      content: params.content,
      createdAt: now
    };
    
    await db.collection("careerExperienceComments").doc(commentId).set(newComment);
    
    // Increment the comments count on the experience
    await db.collection("careerExperience").doc(params.experienceId).update({
      commentsCount: FieldValue.increment(1)
    });
    
    revalidatePath(`/career`);
    revalidatePath(`/career/${params.experienceId}`);
    
    return { 
      success: true, 
      data: {
        ...newComment,
        createdAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error("Error adding comment:", error);
    return { success: false, message: "Failed to add comment" };
  }
}

/**
 * Get comments for a specific career experience post
 */
export async function getComments(experienceId: string) {
  try {
    const commentsSnapshot = await db.collection("careerExperienceComments")
      .where("experienceId", "==", experienceId)
      .orderBy("createdAt", "desc")
      .get();
    
    const comments = commentsSnapshot.docs.map(doc => {
      const data = doc.data() || {};
      return {
        id: doc.id,
        ...serializeFirestoreData(data)
      };
    }) as Comment[];
    
    return { success: true, data: comments };
  } catch (error) {
    console.error("Error fetching comments:", error);
    return { success: false, message: "Failed to fetch comments" };
  }
}

/**
 * Save or unsave a career experience post for a user
 */
export async function toggleSavePost(experienceId: string, userId: string) {
  try {
    // Check if the user has already saved this post
    const saveRef = db.collection("careerExperienceSaves").doc(`${userId}_${experienceId}`);
    const saveDoc = await saveRef.get();
    
    if (saveDoc.exists) {
      // User already saved this post, so unsave it
      await saveRef.delete();
      
      revalidatePath(`/career`);
      revalidatePath(`/career/${experienceId}`);
      revalidatePath(`/career/saved`);
      
      return { success: true, action: 'unsaved' };
    } else {
      // User hasn't saved this post yet, so save it
      await saveRef.set({
        experienceId,
        userId,
        createdAt: FieldValue.serverTimestamp()
      });
      
      revalidatePath(`/career`);
      revalidatePath(`/career/${experienceId}`);
      revalidatePath(`/career/saved`);
      
      return { success: true, action: 'saved' };
    }
  } catch (error) {
    console.error("Error toggling save post:", error);
    return { success: false, message: "Failed to toggle save post" };
  }
}

/**
 * Check if a user has saved a specific post
 */
export async function hasUserSaved(experienceId: string, userId: string) {
  try {
    const saveRef = db.collection("careerExperienceSaves").doc(`${userId}_${experienceId}`);
    const saveDoc = await saveRef.get();
    
    return { success: true, hasSaved: saveDoc.exists };
  } catch (error) {
    console.error("Error checking if user saved post:", error);
    return { success: false, message: "Failed to check save status", hasSaved: false };
  }
}

/**
 * Get all saved career experiences for a user
 */
export async function getSavedExperiences(userId: string) {
  try {
    if (!userId) return { success: true, data: [] };
    
    const savesQuery = query(
      collection(db, "careerExperienceSaves"),
      where("userId", "==", userId)
    );
    
    const savesSnapshot = await getDocs(savesQuery);
    const savedIds = savesSnapshot.docs.map(doc => doc.data().experienceId);
    
    // Get the actual experience data for all saved IDs
    const experiences = [];
    
    for (const id of savedIds) {
      const experienceRef = doc(db, "careerExperience", id);
      const experienceSnap = await getDoc(experienceRef);
      
      if (experienceSnap.exists()) {
        experiences.push({
          id: experienceSnap.id,
          ...experienceSnap.data()
        });
      }
    }
    
    return { success: true, data: experiences };
  } catch (error) {
    console.error("Error getting saved experiences:", error);
    return { success: false, data: [] };
  }
}

// Function to toggle a like for a post
export async function toggleLikeV2({ experienceId, userId }: { experienceId: string, userId: string }) {
  try {
    // Get the experience document
    const experienceRef = doc(db, "careerExperience", experienceId);
    const experienceSnap = await getDoc(experienceRef);
    
    if (!experienceSnap.exists()) {
      return { success: false, message: "Experience not found" };
    }
    
    // Check if the user has already liked this post
    const likeRef = doc(db, "careerExperienceLikes", `${experienceId}_${userId}`);
    const likeSnap = await getDoc(likeRef);
    
    if (likeSnap.exists()) {
      // User already liked it, so remove the like
      await deleteDoc(likeRef);
      await updateDoc(experienceRef, {
        likesCount: increment(-1)
      });
      return { success: true, liked: false };
    } else {
      // User hasn't liked it yet, so add a like
      await setDoc(likeRef, {
        userId,
        experienceId,
        createdAt: FieldValue.serverTimestamp()
      });
      await updateDoc(experienceRef, {
        likesCount: increment(1)
      });
      return { success: true, liked: true };
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return { success: false, message: "Failed to toggle like" };
  }
}

// Function to check if a user has liked a post
export async function hasUserLikedV2({ experienceId, userId }: { experienceId: string, userId: string }) {
  try {
    if (!userId) return { success: true, liked: false };
    
    const likeRef = doc(db, "careerExperienceLikes", `${experienceId}_${userId}`);
    const likeSnap = await getDoc(likeRef);
    
    return { success: true, liked: likeSnap.exists() };
  } catch (error) {
    console.error("Error checking if user liked:", error);
    return { success: false, liked: false };
  }
}

// Function to toggle save/bookmark for a post
export async function toggleSavePostV2({ experienceId, userId }: { experienceId: string, userId: string }) {
  try {
    // Get the user's saved posts document
    const saveRef = doc(db, "careerExperienceSaves", `${userId}_${experienceId}`);
    const saveSnap = await getDoc(saveRef);
    
    if (saveSnap.exists()) {
      // User already saved it, so remove the save
      await deleteDoc(saveRef);
      return { success: true, saved: false };
    } else {
      // User hasn't saved it yet, so add a save
      await setDoc(saveRef, {
        userId,
        experienceId,
        createdAt: FieldValue.serverTimestamp()
      });
      return { success: true, saved: true };
    }
  } catch (error) {
    console.error("Error toggling save:", error);
    return { success: false, message: "Failed to toggle save" };
  }
}

// Function to check if a user has saved a post
export async function hasUserSavedV2({ experienceId, userId }: { experienceId: string, userId: string }) {
  try {
    if (!userId) return { success: true, saved: false };
    
    const saveRef = doc(db, "careerExperienceSaves", `${userId}_${experienceId}`);
    const saveSnap = await getDoc(saveRef);
    
    return { success: true, saved: saveSnap.exists() };
  } catch (error) {
    console.error("Error checking if user saved:", error);
    return { success: false, saved: false };
  }
}

// Function to add a comment to a post
export async function addCommentV2({ 
  experienceId, 
  userId, 
  userName, 
  content 
}: { 
  experienceId: string, 
  userId: string, 
  userName: string, 
  content: string 
}) {
  try {
    const commentsRef = collection(db, "careerExperienceComments");
    
    const newComment = {
      experienceId,
      userId,
      userName,
      content,
      createdAt: FieldValue.serverTimestamp()
    };
    
    const docRef = await addDoc(commentsRef, newComment);
    
    // Update the comment count on the experience
    const experienceRef = doc(db, "careerExperience", experienceId);
    await updateDoc(experienceRef, {
      commentsCount: FieldValue.increment(1)
    });
    
    return { 
      success: true, 
      data: { 
        id: docRef.id, 
        ...newComment, 
        createdAt: new Date().toISOString() 
      } 
    };
  } catch (error) {
    console.error("Error adding comment:", error);
    return { success: false, message: "Failed to add comment" };
  }
}

// Function to get all comments for a post
export async function getCommentsV2(experienceId: string) {
  try {
    const commentsQuery = query(
      collection(db, "careerExperienceComments"),
      where("experienceId", "==", experienceId),
      orderBy("createdAt", "desc")
    );
    
    const commentsSnapshot = await getDocs(commentsQuery);
    const comments = commentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
    }));
    
    return { success: true, data: comments };
  } catch (error) {
    console.error("Error getting comments:", error);
    return { success: false, data: [] };
  }
} 