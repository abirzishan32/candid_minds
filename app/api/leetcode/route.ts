import { NextRequest } from 'next/server';
import { getProblems, searchProblems } from '@/lib/actions/leetcode.action';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '30', 10);
    const skip = parseInt(searchParams.get('skip') || '0', 10);
    const query = searchParams.get('query');
    
    // Handle different actions
    switch (action) {
      case 'get-all':
        // Fetch all problems with pagination
        const problemsResult = await getProblems(limit, skip);
        
        if (problemsResult.success) {
          return Response.json({ 
            success: true, 
            data: problemsResult.data,
            total: 2000 // Fixed: Use a constant value instead of the undefined problemsResult
          });
        } else {
          return Response.json({ 
            success: false, 
            error: problemsResult.error || 'Failed to fetch problems' 
          }, { status: 500 });
        }
        
      case 'search':
        // Search problems by query
        if (!query) {
          return Response.json({ 
            success: false, 
            error: 'Search query is required' 
          }, { status: 400 });
        }
        
        const searchResult = await searchProblems(query, limit, skip);
        
        if (searchResult.success) {
          return Response.json({ 
            success: true, 
            data: searchResult.data,
            total: searchResult.data.length || 0 // Fixed: Use the actual data length
          });
        } else {
          return Response.json({ 
            success: false, 
            error: searchResult.error || 'Failed to search problems' 
          }, { status: 500 });
        }
        
      default:
        return Response.json({ 
          success: false, 
          error: 'Invalid action. Use "get-all" or "search"' 
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Error in LeetCode API route:', error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}