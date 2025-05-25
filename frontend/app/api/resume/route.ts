import { NextRequest } from 'next/server';
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { isAuthenticated } from "@/lib/actions/auth.action";

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const isUserAuth = await isAuthenticated();
    if (!isUserAuth) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const body = await request.json();
    const { content, type, jobTitle, companyName, industry, technologies } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return Response.json(
        { success: false, error: 'Content is required and must be a string' },
        { status: 400 }
      );
    }

    // Generate AI-enhanced content
    const enhancedContent = await enhanceContent(content, type, jobTitle, companyName, industry, technologies);

    return Response.json({
      success: true,
      enhancedContent
    });

  } catch (error) {
    console.error('Error enhancing resume content:', error);
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to enhance content' },
      { status: 500 }
    );
  }
}

async function enhanceContent(
  content: string,
  type: 'job' | 'project' | 'achievement' = 'job',
  jobTitle?: string,
  companyName?: string,
  industry?: string,
  technologies?: string
): Promise<string> {
  try {
    // Extract original technologies or skills from the content
    const originalWords = new Set(content.toLowerCase().split(/[\s.,;:!?()[\]{}'"\/\\<>]+/).filter(word => word));
    
    // Build the prompt based on content type
    let prompt = '';
    
    if (type === 'job') {
      prompt = `
You are an expert ATS optimization specialist. Your task is to enhance the following job description to be more impactful, 
quantifiable, and ATS-friendly. The description is for a ${jobTitle || 'professional'} 
at ${companyName || 'a company'} in the ${industry || 'technology'} industry.

Original description:
"""
${content}
"""

IMPORTANT GUIDELINES:
1. DO NOT add any technologies, tools, frameworks, or skills that are not mentioned in the original text
2. DO NOT invent metrics, percentages, or specific numbers that aren't in the original
3. DO NOT change the fundamental nature of the work described
4. Keep the enhanced version concise (similar length or slightly shorter than the original)
5. Start sentences with strong action verbs
6. Emphasize the skills and technologies that ARE mentioned in the original
7. Use the XYZ formula where appropriate: "Accomplished [X] as measured by [Y], by doing [Z]"

Return only the improved content directly, with no additional commentary, prefixes, or bullet points unless they existed in the original.
`;
    } else if (type === 'project') {
      prompt = `
You are an expert ATS optimization specialist. Your task is to enhance the following project description to be more impactful and ATS-friendly.

Original project description:
"""
${content}
"""

IMPORTANT GUIDELINES:
1. DO NOT add any technologies, tools, frameworks, or skills that are not mentioned in the original text
2. DO NOT invent metrics, impacts, or specific numbers that aren't in the original
3. DO NOT change the fundamental nature of the project described
4. Keep the enhanced version concise (similar length or slightly shorter than the original)
5. Start sentences with strong action verbs
6. Emphasize the technologies that ARE mentioned in the original text
7. Maintain the same voice and style as the original

Return only the improved content directly, with no additional commentary, prefixes, or bullet points unless they existed in the original.
`;
    } else if (type === 'achievement') {
      prompt = `
You are an expert ATS optimization specialist. Your task is to enhance the following professional achievement to be more impactful and ATS-friendly.

Original achievement:
"""
${content}
"""

IMPORTANT GUIDELINES:
1. DO NOT add any technologies, methods, or skills that are not mentioned in the original text
2. DO NOT invent metrics, percentages, or specific numbers that aren't in the original
3. DO NOT change the fundamental achievement described
4. Keep the enhanced version concise (1-2 sentences, similar length or slightly shorter than the original)
5. Start with a strong action verb
6. Emphasize any measurable results that ARE mentioned in the original
7. Maintain the same voice and technical level as the original

Return only the improved content directly, with no additional commentary or prefixes.
`;
    }

    // Generate the enhanced content
    const { text } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt,
      temperature: 0.2, // Lower temperature for more predictable output
      maxTokens: 500,
    });

    // Clean up the response to ensure it doesn't have unexpected markdown or formatting
    const cleanedText = text
      .trim()
      // Remove markdown code blocks if present
      .replace(/^```[\s\S]*?```$/gm, '')
      // Remove quotes if present
      .replace(/^["']|["']$/g, '')
      // Remove any "Enhanced version:" or similar prefixes
      .replace(/^(Enhanced version:|Improved version:|Rewritten:|Here's the enhanced content:|Optimized version:)/i, '')
      // Trim again after replacements
      .trim();

    return cleanedText;
  } catch (error) {
    console.error('Error generating enhanced content:', error);
    throw new Error('Failed to generate enhanced content');
  }
}