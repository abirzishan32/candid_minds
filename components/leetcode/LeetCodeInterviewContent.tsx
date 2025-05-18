'use client';

import { useState } from 'react';
import SimpleLeetCodeVoiceAgent from '@/components/leetcode/LeetCodeVoiceAgent';
import { leetcodeLanguages } from '@/constants/leetcode';

interface ProblemData {
  title: string;
  difficulty: string;
  content: string;
}

interface LeetCodeInterviewContentProps {
  userName: string;
  userId: string;
  problemSlug: string;
  problem: ProblemData;
}

export default function LeetCodeInterviewContent({ 
  userName, 
  userId, 
  problemSlug, 
  problem 
}: LeetCodeInterviewContentProps) {
  const [language, setLanguage] = useState('C++');

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{problem.title}</h1>
        <div className="flex items-center mb-6">
          <span className={`px-2 py-0.5 text-xs rounded-full ${
            problem.difficulty === 'Easy' ? 'bg-green-700 text-green-100' : 
            problem.difficulty === 'Medium' ? 'bg-yellow-700 text-yellow-100' : 
            'bg-red-700 text-red-100'
          }`}>
            {problem.difficulty}
          </span>
          
          <div className="ml-auto">
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm"
            >
              {leetcodeLanguages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="bg-gray-900/70 border border-gray-800 p-4 rounded-lg mb-8">
          <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: problem.content }} />
        </div>
      </div>

      <SimpleLeetCodeVoiceAgent
        userName={userName}
        userId={userId}
        problemSlug={problemSlug}
        problemTitle={problem.title}
        problemDifficulty={problem.difficulty}
        language={language}
      />
    </div>
  );
}