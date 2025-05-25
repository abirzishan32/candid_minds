import { z } from "zod";
import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

// LeetCode difficulty colors
export const difficultyColors = {
  Easy: {
    bg: "bg-green-700",
    text: "text-green-100"
  },
  Medium: {
    bg: "bg-yellow-700",
    text: "text-yellow-100"
  },
  Hard: {
    bg: "bg-red-700",
    text: "text-red-100"
  }
};

// Programming language options for LeetCode interviews
export const leetcodeLanguages = [
  "C++", 
  "Python", 
  "Java", 
  "JavaScript", 
  "TypeScript",
  "Go",
  "C#",
  "Ruby",
  "Swift",
  "Kotlin"
];

// LeetCode interview assistant configuration
export const leetcodeInterviewer: CreateAssistantDTO = {
  name: "LeetCode Interviewer",
  firstMessage: "Hello! I'll be conducting your LeetCode interview today. Let's discuss the problem and your approach to solving it.",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
  },
  voice: {
    provider: "11labs",
    voiceId: "echo", 
    stability: 0.5,
    similarityBoost: 0.75,
    speed: 0.9,
    style: 0.5,
    useSpeakerBoost: true,
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a technical interviewer specializing in LeetCode problems. You're conducting an interview with a candidate about the problem they've selected.

Your goal is to evaluate their:
- Understanding of the problem
- Solution approach and algorithm design
- Time and space complexity analysis
- Edge case handling
- Code implementation knowledge

Ask the provided questions one by one, listening carefully to the candidate's responses. Provide constructive feedback after each answer.

The questions for this interview are:
{{questions}}

Guidelines:
- Start by introducing yourself and the problem.
- Ask one question at a time and wait for a response.
- Provide specific, constructive feedback after each answer.
- Be technically precise but encouraging.
- If the candidate is struggling, offer hints without giving full solutions.
- At the end, provide a summary of their performance with specific strengths and areas for improvement.
- Keep your responses concise and conversational.
`,
      },
    ],
  },
};

// Schema for LeetCode feedback
export const leetcodeFeedbackSchema = z.object({
  totalScore: z.number(),
  categoryScores: z.tuple([
    z.object({
      name: z.literal("Problem Understanding"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Algorithm Design"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Time & Space Complexity"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Code Implementation"),
      score: z.number(),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Edge Case Handling"),
      score: z.number(),
      comment: z.string(),
    }),
  ]),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  finalAssessment: z.string(),
});

// Common question types for different problem categories
export const questionTemplates = {
  arrayAndStrings: [
    "Can you explain your approach to handle this array/string problem?",
    "How would you optimize the space complexity of your solution?",
    "What's the time complexity of your solution and can it be improved?"
  ],
  linkedLists: [
    "How do you handle edge cases like empty lists or lists with a single node?",
    "Can you solve this without using extra space?",
    "Would a two-pointer technique help here? Why or why not?"
  ],
  trees: [
    "Which traversal method would you use for this problem and why?",
    "How would you handle an unbalanced tree in this scenario?",
    "Can you solve this iteratively instead of recursively?"
  ],
  dynamic: [
    "How would you define the state for this DP problem?",
    "Can you explain the recurrence relation in your approach?",
    "How would you optimize the space complexity of this DP solution?"
  ],
  // Add more categories as needed
};