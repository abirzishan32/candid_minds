'use client';

import ProblemSelector from '@/components/leetcode/ProblemSelector';

export default function LeetCodeQnAPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">LeetCode Interview Practice</h1>
      <p className="text-center mb-8 max-w-2xl mx-auto">
        Select a LeetCode problem to practice with our AI interviewer. The AI will ask you questions about your approach, time complexity, space complexity, and more.
      </p>
      
      <ProblemSelector />
    </div>
  );
}