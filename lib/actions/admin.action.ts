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