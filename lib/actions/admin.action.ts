"use server";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import { isAdmin } from "./auth.action";

interface CreateCustomInterviewParams {
    role: string;
    companyName: string;
    type: string;
    techstack: string[];
    experienceLevel: string;
    questions: string[];
    adminId: string;
    adminName: string;
    isPublic: boolean;
}

export async function createCustomInterview(params: CreateCustomInterviewParams) {
    const {
        role,
        companyName,
        type,
        techstack,
        experienceLevel,
        questions,
        adminId,
        adminName,
        isPublic
    } = params;

    // Verify that the user is an admin
    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
        return {
            success: false,
            message: "Unauthorized: Only admins can create custom interviews"
        };
    }

    try {
        // Create the interview document
        const interview = {
            role,
            companyName,
            type,
            techstack,
            level: experienceLevel,
            questions,
            userId: adminId,
            creatorName: adminName,
            isCompanyInterview: true,
            isPublic,
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection("interviews").add(interview);

        return {
            success: true,
            message: "Interview created successfully",
            interviewId: docRef.id
        };
    } catch (error) {
        console.error("Error creating custom interview:", error);
        return {
            success: false,
            message: "Failed to create interview"
        };
    }
}

export async function getAdminInterviews(adminId: string) {
    try {
        const interviews = await db
            .collection("interviews")
            .where("userId", "==", adminId)
            .where("isCompanyInterview", "==", true)
            .orderBy("createdAt", "desc")
            .get();

        return {
            success: true,
            interviews: interviews.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
        };
    } catch (error) {
        console.error("Error fetching admin interviews:", error);
        return {
            success: false,
            interviews: []
        };
    }
}

export async function getAllUsers() {
    try {
        // Verify that the user is an admin
        const userIsAdmin = await isAdmin();
        if (!userIsAdmin) {
            return {
                success: false,
                message: "Unauthorized: Only admins can view all users",
                users: []
            };
        }

        // Fetch all users from the database
        const usersSnapshot = await db
            .collection("users")
            .orderBy("name", "asc")
            .get();

        // Map the user documents to the expected format
        // Add defaults for missing fields to prevent errors
        const users = usersSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name || 'Unknown',
                email: data.email || 'No email',
                role: data.role || 'user',
                // Provide default values for optional properties
                lastActive: data.lastActive?.toDate?.()?.toISOString() || null,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || null
            };
        });

        return {
            success: true,
            users
        };
    } catch (error) {
        console.error("Error fetching users:", error);
        return {
            success: false,
            message: "Failed to fetch users",
            users: []
        };
    }
}