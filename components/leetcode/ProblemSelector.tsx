'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Problem {
  id: string;
  title: string;
  difficulty: string;
  slug: string;
  titleSlug?: string;
  tags: string[];
  topicTags?: Array<{ name: string; slug: string }>;
}

export default function ProblemSelector() {
  const [searchQuery, setSearchQuery] = useState('');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // Start with page 1
  const [totalProblems, setTotalProblems] = useState(0);
  const pageSize = 30; // Number of problems per page
  const router = useRouter();

  // Calculate total pages
  const totalPages = Math.ceil(totalProblems / pageSize) || 1;

  // Search for problems when query changes
  useEffect(() => {
    const searchProblems = async () => {
      if (!searchQuery || searchQuery.length < 2) {
        // Clear results if search query is too short
        if (searchQuery.length > 0) {
          setProblems([]);
        }
        return;
      }
      
      setLoading(true);
      setCurrentPage(1); // Reset to first page when searching
      
      try {
        const response = await fetch(`/api/leetcode?action=search&query=${encodeURIComponent(searchQuery)}&limit=${pageSize}`);
        const data = await response.json();
        console.log("Search response:", data);
        
        if (data.success) {
          // Transform the data to match our Problem interface
          const formattedProblems = formatProblems(data.data);
          setProblems(formattedProblems);
          
          // For search, we don't have exact total count, but we can estimate
          const estimatedTotal = formattedProblems.length < pageSize 
            ? formattedProblems.length 
            : formattedProblems.length * 2; // Just an estimate
            
          setTotalProblems(estimatedTotal);
        } else {
          console.error('Error searching problems:', data.error);
          setProblems([]);
          setTotalProblems(0);
        }
      } catch (error) {
        console.error('Error searching problems:', error);
        setProblems([]);
        setTotalProblems(0);
      } finally {
        setLoading(false);
      }
    };
    
    const debounce = setTimeout(() => {
      searchProblems();
    }, 500);
    
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Load problems when page changes
  useEffect(() => {
    const loadProblems = async () => {
      if (searchQuery.length >= 2) {
        // If search is active, handle pagination through search
        handleSearchPagination();
        return;
      }
      
      setLoading(true);
      try {
        const skip = (currentPage - 1) * pageSize;
        const response = await fetch(`/api/leetcode?action=get-all&limit=${pageSize}&skip=${skip}`);
        const data = await response.json();
        
        if (data.success) {
          const formattedProblems = formatProblems(data.data);
          setProblems(formattedProblems);
          
          // For initial load, set a reasonable total problems count
          if (currentPage === 1) {
            setTotalProblems(2000); // LeetCode has ~2000+ problems
          }
        } else {
          console.error('Error loading problems:', data.error);
          setProblems([]);
        }
      } catch (error) {
        console.error('Error loading problems:', error);
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadProblems();
  }, [currentPage]);
  
  // Handle pagination for search results
  const handleSearchPagination = async () => {
    if (!searchQuery || searchQuery.length < 2) return;
    
    setLoading(true);
    try {
      const skip = (currentPage - 1) * pageSize;
      const response = await fetch(`/api/leetcode?action=search&query=${encodeURIComponent(searchQuery)}&limit=${pageSize}&skip=${skip}`);
      const data = await response.json();
      
      if (data.success) {
        const formattedProblems = formatProblems(data.data);
        setProblems(formattedProblems);
      } else {
        console.error('Error searching problems:', data.error);
        setProblems([]);
      }
    } catch (error) {
      console.error('Error searching problems:', error);
      setProblems([]);
    } finally {
      setLoading(false);
    }
  };

  // Format problems from LeetCode API to match our interface
  const formatProblems = (data: any): Problem[] => {
    // Check if data is an array
    if (!data || !Array.isArray(data)) {
      console.error('Expected array of problems but got:', data);
      return [];
    }
    
    return data.map((problem: any) => {
      // Format the problem to match our interface
      return {
        id: problem.id || problem.questionId || String(problem.frontendQuestionId) || '',
        title: problem.title || problem.questionTitle || '',
        difficulty: problem.difficulty || '',
        slug: problem.titleSlug || problem.slug || '',
        tags: problem.topicTags 
          ? problem.topicTags.map((tag: any) => tag.name || tag) 
          : (problem.tags || [])
      };
    });
  };

  // Start interview with selected problem
  const startInterview = (slug: string) => {
    router.push(`/leetcode-qna/interview/${slug}`);
  };

  // Get badge color based on difficulty
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Generate an array of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 7; // Adjust as needed
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      if (currentPage > 4) {
        pageNumbers.push('...');
      }
      
      // Calculate range of pages to show around current page
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (currentPage < totalPages - 3) {
        pageNumbers.push('...');
      }
      
      // Always include last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search problems by name or keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md"
        />
      </div>

      {problems.length > 0 && (
        <div className="mb-4 text-sm text-gray-500">
          Showing {problems.length} problems (Page {currentPage} of {totalPages})
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-2">Loading problems...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.isArray(problems) && problems.map((problem) => (
              <Card key={problem.id || problem.slug} className="h-full flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{problem.title}</CardTitle>
                    <Badge className={getDifficultyColor(problem.difficulty)}>
                      {problem.difficulty}
                    </Badge>
                  </div>
                  <CardDescription>
                    {Array.isArray(problem.tags) && problem.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="mr-1 mb-1">
                        {tag}
                      </Badge>
                    ))}
                    {Array.isArray(problem.tags) && problem.tags.length > 3 && (
                      <Badge variant="outline">+{problem.tags.length - 3} more</Badge>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto">
                  <Button onClick={() => startInterview(problem.slug || problem.titleSlug || '')}>
                    Start Interview
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {!loading && problems.length === 0 && searchQuery.length >= 2 && (
            <div className="text-center mt-8 py-8">
              <p>No problems found. Try a different search term.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {getPageNumbers().map((page, index) => (
                  <div key={index}>
                    {page === '...' ? (
                      <span className="px-3 py-2">...</span>
                    ) : (
                      <Button
                        variant={currentPage === page ? 'default' : 'outline'}
                        onClick={() => typeof page === 'number' && setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    )}
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}