"use server";

import { isAdmin } from "./auth.action";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";

// Define schema for questions generation
const questionsSchema = z.object({
    questions: z.array(z.string()).min(1).max(5)
});

interface GenerateQuestionsParams {
    role: string;
    level: string;
    type: string;
    currentQuestions: string[];
}

export async function generateQuestionsWithAI(params: GenerateQuestionsParams) {
    try {
        // Verify that the user is an admin
        const userIsAdmin = await isAdmin();
        if (!userIsAdmin) {
            return {
                success: false,
                message: "Unauthorized: Only admins can use AI generation",
                questions: []
            };
        }

        const { role, level, type, currentQuestions } = params;

        // If no role provided, return error
        if (!role) {
            return {
                success: false,
                message: "Please provide at least the role to generate relevant questions",
                questions: []
            };
        }

        // Build the prompt for question generation
        let prompt = `Generate 5 professional and specific interview questions for a ${role} position`;

        if (level) {
            prompt += ` at the ${level} level`;
        }

        if (type) {
            prompt += ` for a ${type} interview`;
        }

        // Add guidance for the type of questions
        if (type === "Technical") {
            prompt += "\n\nFocus on technical skills, problem-solving abilities, and domain knowledge questions.";
        } else if (type === "Behavioral") {
            prompt += "\n\nFocus on past experiences, teamwork, conflict resolution, and soft skills.";
        } else if (type === "System Design") {
            prompt += "\n\nFocus on architecture, scalability, and designing complex systems.";
        } else if (type === "Mixed") {
            prompt += "\n\nInclude a mix of technical, behavioral, and problem-solving questions.";
        }

        // Add existing questions to avoid duplicates
        if (currentQuestions.length > 0) {
            prompt += "\n\nAvoid generating questions similar to these existing questions:";
            currentQuestions.forEach((q, i) => {
                if (i < 10) { // Limit to first 10 to avoid token limits
                    prompt += `\n- ${q}`;
                }
            });
        }

        // Use generateObject with Google's Gemini model
        try {
            const { object } = await generateObject({
                model: google("gemini-2.0-flash-001", {
                    structuredOutputs: true,
                }),
                schema: questionsSchema,
                prompt: prompt,
                system: "You are a professional interview question generator. Create high-quality, relevant interview questions based on the role, experience level, and interview type."
            });

            // Return the questions
            return {
                success: true,
                questions: object.questions
            };

        } catch (aiError) {
            console.error("AI generation error:", aiError);
            return {
                success: false,
                message: "Failed to generate questions with AI",
                questions: []
            };
        }

    } catch (error) {
        console.error("Error in generateQuestionsWithAI:", error);
        return {
            success: false,
            message: "An error occurred while generating questions",
            questions: []
        };
    }
}


