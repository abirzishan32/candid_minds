"use server";
import { Leetcode } from '@codingsnack/leetcode-api';
import { getCurrentUser } from "./auth.action";
import { db } from "@/firebase/admin";
// Initialize LeetCode client
const leetcode = new Leetcode({ csrfToken: '', session: '' });

// Get all problems with pagination
export async function getProblems(limit = 100, skip = 0) {
  try {
    const problems = await leetcode.getProblems({
      limit,
      skip,
      categorySlug: "", // Required by ISortAndFilterParams
      filters: {}, // Required by ISortAndFilterParams
    });

    const problemsArray = Array.isArray(problems.questions) 
      ? problems.questions 
      : (problems.questions ? [problems.questions] : []);


    return { success: true, data: problemsArray };
  } catch (error) {
    console.error("Error fetching LeetCode problems:", error);
    return { success: false, error: "Failed to fetch LeetCode problems" };
  }
}

// Get problem by slug
export async function getProblemBySlug(slug: string) {
  try {
    console.log(`Fetching LeetCode problem with slug: ${slug}`);
    const problem = await leetcode.getProblem(slug);
    
    if (!problem) {
      console.error(`No problem returned for slug: ${slug}`);
      return { success: false, error: `No problem found with slug: ${slug}` };
    }
    
    console.log(`Successfully fetched problem: ${problem.title}`);
    return { success: true, data: problem };
  } catch (error) {
    console.error(`Error fetching LeetCode problem ${slug}:`, error);
    return { 
      success: false, 
      error: `Failed to fetch problem: ${slug}`,
      details: error instanceof Error ? error.message : String(error)
    };
  }
}

// Search problems

export async function searchProblems(query: string, limit = 30, skip = 0) {
  try {
    const problems = await leetcode.getProblems({
      limit,
      skip,
      categorySlug: "", // Required by ISortAndFilterParams
      filters: {}, // Required by ISortAndFilterParams
      searchKeyWords: query,
    } as any); // Use type assertion to bypass TypeScript check

    const problemsArray = Array.isArray(problems.questions) 
      ? problems.questions 
      : (problems.questions ? [problems.questions] : []);

    return { success: true, data: problemsArray };
  } catch (error) {
    console.error(`Error searching LeetCode problems with query "${query}":`, error);
    return { success: false, error: "Failed to search LeetCode problems" };
  }
}

// Get problem categories/tags
export async function getProblemTags() {
  try {
    // Since there's no direct method to get tags, we can get all problems and extract unique tags
    const problems = await leetcode.getProblems({
      limit: 50,
      skip: 0,
      categorySlug: "", // Required by ISortAndFilterParams
      filters: {}, // Required by ISortAndFilterParams
    });

    
     const problemsArray = Array.isArray(problems.questions) 
      ? problems.questions 
      : (problems.questions ? [problems.questions] : []);
    
    // Extract tags using reduce instead of flatMap
    const allTags = [];
    problemsArray.forEach(problem => {
      if (problem.topicTags && Array.isArray(problem.topicTags)) {
        problem.topicTags.forEach(tag => {
          if (tag.name) allTags.push(tag.name);
        });
      }
    });
    
    // Create a unique set of tags
    const tags = [...new Set(allTags)];
    
    return { success: true, data: tags };
  } catch (error) {
    console.error("Error fetching LeetCode tags:", error);
    return { success: false, error: "Failed to fetch LeetCode tags" };
  }
}


export async function getProblemSolution(slug: string) {
  try {
    console.log(`Generating solution approach for problem with slug: ${slug}`);
    
    // First get the problem details
    const problemResult = await getProblemBySlug(slug);
    
    if (!problemResult.success) {
      return { success: false, error: `Failed to fetch problem: ${slug}` };
    }
    
    const problem = problemResult.data;
    
    // Try to get similar problems to infer solution patterns
    let similarProblems = [];
    try {
      // This method is marked as beta in the documentation
      const similarResult = await leetcode.getSimilarProblems(slug);
      
      if (similarResult && similarResult.similarProblems) {
        similarProblems = similarResult.similarProblems;
        console.log(`Found ${similarProblems.length} similar problems to ${slug}`);
      }
    } catch (error) {
      console.log(`Could not fetch similar problems for ${slug}`);
      // Proceed without similar problems
    }
    
    // Extract approaches based on problem content and difficulty
    const approachKeywords = extractApproachKeywords(problem.content, problem.difficulty);
    
    // Get a more detailed solution approach based on problem characteristics
    const solutionContent = generateSolutionApproach(
      problem.title, 
      problem.content, 
      problem.difficulty, 
      approachKeywords,
      similarProblems
    );
    
    return { 
      success: true, 
      data: {
        title: `Optimal Approach for ${problem.title}`,
        content: solutionContent,
        approachKeywords: approachKeywords,
        problemTitle: problem.title,
        problemDifficulty: problem.difficulty,
        similarProblems: similarProblems.map((p: any) => p.title) // Include names of similar problems
      }
    };
  } catch (error) {
    console.error(`Error generating solution for problem ${slug}:`, error);
    return { success: false, error: `Failed to generate solution: ${slug}` };
  }
}

// Helper function to extract approach keywords from problem content
function extractApproachKeywords(content: string, difficulty: string) {
  // Create a map of common keywords to look for in problem descriptions
  const keywordMappings = {
    // Data structures
    array: ['array', 'nums', 'elements', 'list'],
    string: ['string', 'substring', 'character'],
    linkedlist: ['linked list', 'node', 'next pointer'],
    tree: ['tree', 'node', 'binary tree', 'root'],
    graph: ['graph', 'edge', 'vertex', 'nodes', 'connected'],
    stack: ['stack', 'last-in-first-out', 'parentheses', 'brackets'],
    queue: ['queue', 'first-in-first-out'],
    heap: ['heap', 'priority queue', 'kth smallest', 'kth largest'],
    hashmap: ['hash', 'map', 'dictionary', 'count', 'frequency'],
    set: ['set', 'unique elements', 'duplicate'],
    
    // Algorithms
    'dynamic programming': ['dynamic programming', 'optimal', 'subproblem', 'maximum', 'minimum'],
    'two pointers': ['two pointers', 'left and right', 'start and end'],
    'binary search': ['binary search', 'sorted array', 'log(n)'],
    'depth-first search': ['depth-first', 'dfs', 'recursion', 'backtracking'],
    'breadth-first search': ['breadth-first', 'bfs', 'level order'],
    'sliding window': ['sliding window', 'substring', 'subarray', 'consecutive'],
    greedy: ['greedy', 'optimal choice', 'locally optimal'],
    'divide and conquer': ['divide', 'conquer', 'merge', 'partition']
  };
  
  // Check for keyword presence in content
  const detectedApproaches = [];
  
  for (const [approach, keywords] of Object.entries(keywordMappings)) {
    const contentLower = content.toLowerCase();
    if (keywords.some(keyword => contentLower.includes(keyword.toLowerCase()))) {
      detectedApproaches.push(approach);
    }
  }
  
  // Add difficulty-specific approaches if none detected
  if (detectedApproaches.length === 0) {
    const difficultyApproaches = {
      'Easy': ['brute force', 'iteration', 'hashmap', 'two pointers', 'greedy'],
      'Medium': ['dynamic programming', 'binary search', 'depth-first search', 'breadth-first search', 'sliding window'],
      'Hard': ['advanced data structures', 'graph algorithms', 'complex dynamic programming', 'mathematical insights']
    };
    
    return difficultyApproaches[difficulty as keyof typeof difficultyApproaches] || difficultyApproaches['Medium'];
  }
  
  return detectedApproaches;
}

// Generate a detailed solution approach based on problem attributes
function generateSolutionApproach(
  title: string, 
  content: string, 
  difficulty: string, 
  approachKeywords: string[],
  similarProblems: any[] = []
) {
  // Extract problem type from content and approaches
  let problemType = determineBasicProblemType(content, approachKeywords);
  
  // Base structure for the solution approach
  let approach = `For the "${title}" problem, which is rated as ${difficulty} difficulty, I recommend the following approach:\n\n`;
  
  // Add specific strategy based on detected keywords
  if (approachKeywords.includes('dynamic programming')) {
    approach += `**Dynamic Programming Approach:**\n`;
    approach += `1. Define the state: Determine what each cell in your DP table represents.\n`;
    approach += `2. Establish the base cases.\n`;
    approach += `3. Write the state transition function that relates the current state to previous states.\n`;
    approach += `4. Implement the solution using either top-down (memoization) or bottom-up (tabulation) method.\n`;
    approach += `5. Extract the final answer from the completed DP table.\n\n`;
    approach += `Time complexity is typically O(n²) or O(n*m) depending on the dimensions of your DP table, where n and m are the input sizes.\n`;
    
    if (difficulty === 'Hard') {
      approach += `For this hard problem, you may need to optimize your state representation or transitions carefully.\n`;
    }
  } else if (approachKeywords.includes('two pointers')) {
    approach += `**Two Pointers Approach:**\n`;
    approach += `1. Initialize two pointers (typically at the beginning, or at both ends of the array/string).\n`;
    approach += `2. Move the pointers based on specific conditions related to the problem.\n`;
    approach += `3. Process elements or compute results while moving the pointers.\n\n`;
    approach += `This technique typically provides O(n) time complexity with O(1) extra space.\n`;
  } else if (approachKeywords.includes('binary search')) {
    approach += `**Binary Search Approach:**\n`;
    approach += `1. Identify the search space and what you're looking for.\n`;
    approach += `2. Implement the binary search algorithm to efficiently find the target.\n`;
    approach += `3. Carefully handle edge cases like empty inputs or when the target doesn't exist.\n\n`;
    approach += `Binary search provides O(log n) time complexity.\n`;
  } else if (approachKeywords.includes('hashmap') || approachKeywords.includes('set')) {
    approach += `**Hash Map/Set Approach:**\n`;
    approach += `1. Use a hash map to store key information (often frequencies, indices, or values) as you process the input.\n`;
    approach += `2. Leverage the O(1) lookup time to efficiently solve the problem.\n`;
    approach += `3. Consider edge cases like empty inputs or collisions if relevant.\n\n`;
    approach += `This approach typically provides O(n) time complexity with O(n) space complexity.\n`;
  } else if (approachKeywords.includes('depth-first search') || approachKeywords.includes('breadth-first search')) {
    let searchType = approachKeywords.includes('depth-first search') ? 'Depth-First Search' : 'Breadth-First Search';
    approach += `**${searchType} Approach:**\n`;
    approach += `1. Model the problem as a graph or tree traversal.\n`;
    approach += `2. Implement ${searchType === 'Depth-First Search' ? 'DFS using recursion or a stack' : 'BFS using a queue'}.\n`;
    approach += `3. Track visited nodes to avoid cycles if necessary.\n`;
    approach += `4. Process nodes as you traverse to build the solution.\n\n`;
    approach += `Time and space complexity are typically O(V + E) where V is the number of vertices and E is the number of edges.\n`;
  } else if (approachKeywords.includes('sliding window')) {
    approach += `**Sliding Window Approach:**\n`;
    approach += `1. Define your window with start and end pointers.\n`;
    approach += `2. Expand or contract the window based on certain conditions.\n`;
    approach += `3. Track the optimal result as you slide the window.\n\n`;
    approach += `This technique typically provides O(n) time complexity.\n`;
  } else if (approachKeywords.includes('greedy')) {
    approach += `**Greedy Approach:**\n`;
    approach += `1. At each step, select the locally optimal choice.\n`;
    approach += `2. Prove (intuitively) why making the locally optimal choice leads to a globally optimal solution.\n`;
    approach += `3. Implement the algorithm that makes these greedy decisions.\n\n`;
    approach += `Time complexity varies by implementation, but is often O(n) or O(n log n) if sorting is involved.\n`;
  } else {
    // General approach for other problem types
    approach += `**General Approach:**\n`;
    approach += `1. Analyze the problem constraints carefully.\n`;
    approach += `2. Consider brute force solutions first to understand the problem better.\n`;
    approach += `3. Look for patterns or optimizations that can improve the time/space complexity.\n`;
    approach += `4. Test your solution with various examples, including edge cases.\n\n`;
    approach += `For ${difficulty} level problems, aim for a solution with appropriate time and space complexity.\n`;
  }
  
  // Add tips from similar problems if available
  if (similarProblems.length > 0) {
    approach += `\n**Similar Problem Insights:**\n`;
    approach += `This problem shares patterns with: ${similarProblems.slice(0, 3).map((p: any) => p.title).join(', ')}. `;
    approach += `You might apply similar techniques used in those problems.\n`;
  }
  
  // Add difficulty-specific advice
  if (difficulty === 'Easy') {
    approach += `\nAs this is an Easy problem, focus on clarity and correctness rather than extreme optimizations. `;
    approach += `A straightforward approach using ${approachKeywords.slice(0, 2).join(' or ')} should be sufficient.\n`;
  } else if (difficulty === 'Medium') {
    approach += `\nFor this Medium difficulty problem, balance between an efficient algorithm and code readability. `;
    approach += `Consider edge cases carefully, as they're often what distinguish between accepted and failed submissions.\n`;
  } else if (difficulty === 'Hard') {
    approach += `\nAs a Hard problem, you'll likely need to combine multiple techniques or use advanced algorithms. `;
    approach += `Consider all edge cases thoroughly, and optimize your solution for both time and space complexity.\n`;
  }
  
  return approach;
}

// Helper function to determine basic problem type
function determineBasicProblemType(content: string, approachKeywords: string[]) {
  // This function could be expanded to be more sophisticated
  const contentLower = content.toLowerCase();
  
  if (contentLower.includes("array") || contentLower.includes("list") || contentLower.includes("nums")) {
    return "Array";
  } else if (contentLower.includes("string") || contentLower.includes("character")) {
    return "String";
  } else if (contentLower.includes("tree") || contentLower.includes("node")) {
    return "Tree";
  } else if (contentLower.includes("graph") || contentLower.includes("vertex") || contentLower.includes("edge")) {
    return "Graph";
  } else if (contentLower.includes("linked list")) {
    return "Linked List";
  } else {
    // Default or based on approach keywords
    if (approachKeywords.includes("dynamic programming")) return "Dynamic Programming";
    if (approachKeywords.includes("greedy")) return "Greedy";
    if (approachKeywords.includes("binary search")) return "Binary Search";
    
    return "General";
  }
}