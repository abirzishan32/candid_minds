"use server";

import { isAdmin } from "./auth.action";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { AssessmentOption, DifficultyLevel, QuestionType, SkillCategory } from "./skill-assessment.action";

// Define schema for multiple-choice question generation
const multipleChoiceQuestionSchema = z.object({
  questions: z.array(z.object({
    question: z.string(),
    options: z.array(z.object({
      text: z.string(),
      isCorrect: z.boolean()
    })).min(2).max(5)
  })).min(1).max(20)
});

// Define parameters for question generation
export interface GenerateAssessmentQuestionsParams {
  category: SkillCategory;
  difficulty: DifficultyLevel;
  count: number;
  questionType: QuestionType;
  title?: string;
  description?: string;
  currentQuestions?: string[];
}

/**
 * Generate assessment questions using AI
 */
export async function generateAssessmentQuestionsWithAI(params: GenerateAssessmentQuestionsParams) {
  try {
    // Verify that the user is an admin
    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
      return {
        success: false,
        message: "Unauthorized: Only admins can use AI generation",
        data: []
      };
    }

    const { 
      category, 
      difficulty, 
      count, 
      questionType, 
      title, 
      description, 
      currentQuestions = [] 
    } = params;

    // Validate parameters
    if (!category || !difficulty) {
      return {
        success: false,
        message: "Category and difficulty level are required",
        data: []
      };
    }

    if (count <= 0 || count > 20) {
      return {
        success: false,
        message: "Number of questions must be between 1 and 20",
        data: []
      };
    }

    // Build the prompt for question generation
    let prompt = `Generate ${count} high-quality ${difficulty} level assessment questions about ${category}`;
    
    if (title) {
      prompt += ` for an assessment titled "${title}"`;
    }
    
    if (description) {
      prompt += `\n\nAssessment description: ${description}`;
    }

    // Add specifics based on question type
    if (questionType === "multiple-choice") {
      prompt += `\n\nEach question should have 4 options, with exactly one correct answer. 
      The correct answer should be challenging to identify without proper knowledge.
      The incorrect options should be plausible and related to the topic.`;
    } else if (questionType === "coding") {
      prompt += `\n\nEach question should involve coding challenges related to ${category}.
      Include clear instructions and expected outcomes.`;
    } else if (questionType === "text") {
      prompt += `\n\nEach question should require a short text answer.
      Focus on questions that test understanding and application rather than memorization.`;
    } else if (questionType === "true-false") {
      prompt += `\n\nEach question should be a statement that is either true or false.
      Make the statements nuanced and challenging, requiring proper understanding of the subject.`;
    }

    // Add guidance based on difficulty
    if (difficulty === "beginner") {
      prompt += "\n\nFocus on fundamental concepts and basic knowledge.";
    } else if (difficulty === "intermediate") {
      prompt += "\n\nFocus on applying concepts in straightforward scenarios.";
    } else if (difficulty === "advanced") {
      prompt += "\n\nFocus on complex applications and deeper understanding.";
    } else if (difficulty === "expert") {
      prompt += "\n\nFocus on edge cases, uncommon scenarios, and specialized knowledge.";
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

    // Use generateObject with Google's Gemini model for structured output
    try {
      // For multiple-choice questions, use the schema to get structured data
      if (questionType === "multiple-choice") {
        const { object } = await generateObject({
          model: google("gemini-2.0-flash-001", {
            structuredOutputs: true,
          }),
          schema: multipleChoiceQuestionSchema,
          prompt: prompt,
          system: "You are a professional assessment question creator. Create high-quality, challenging, and relevant assessment questions with clear options."
        });

        return {
          success: true,
          data: object.questions
        };
      } 
      // For other question types (to be implemented)
      else {
        return {
          success: false,
          message: "Only multiple-choice questions are currently supported",
          data: []
        };
      }
    } catch (aiError) {
      console.error("AI generation error:", aiError);
      return {
        success: false,
        message: "Failed to generate questions with AI",
        data: []
      };
    }
  } catch (error) {
    console.error("Error in generateAssessmentQuestionsWithAI:", error);
    return {
      success: false,
      message: "An error occurred while generating questions",
      data: []
    };
  }
} 