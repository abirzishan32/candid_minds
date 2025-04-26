'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getInterviewById, getModeratorFeedbacks } from '@/lib/actions/general.action';
import Link from 'next/link';

interface InterviewResultsPageProps {
  params: {
    id: string;
  };
}

const InterviewResultsPage = ({ params }: InterviewResultsPageProps) => {
  const router = useRouter();
  const [interview, setInterview] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getInterviewById(params.id);
        
        if (!data || !data.isModeratorInterview) {
          router.push('/moderator-dashboard');
          return;
        }
        
        setInterview(data);
        
        // Fetch all feedbacks related to this interview
        const allFeedbacks = await getModeratorFeedbacks(data.moderatorId || '');
        setFeedbacks(allFeedbacks.filter(f => f.interviewId === params.id));
      } catch (error) {
        console.error('Error fetching interview data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [params.id, router]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/moderator-dashboard" className="text-primary-100 hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-white">Interview Results</h1>
      </div>
      
      <div className="bg-gray-950 border border-gray-800 rounded-xl p-8 shadow-lg mb-8">
        <div className="flex flex-wrap justify-between items-start gap-6 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-white">{interview.role} Interview</h2>
            <p className="text-gray-400 mt-1">
              {interview.type} • {interview.level}
            </p>
          </div>
          
          <div className="bg-black px-4 py-2 rounded-lg">
            <p className="text-sm text-gray-400">Total Participants</p>
            <p className="text-2xl font-semibold text-primary-100">{feedbacks.length}</p>
          </div>
        </div>
        
        {/* Average Scores Section */}
        {feedbacks.length > 0 ? (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Average Scores</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-gray-900 p-4 rounded-lg">
                  <p className="text-gray-400 text-sm">Overall</p>
                  <p className="text-xl font-bold text-white">
                    {Math.round(feedbacks.reduce((sum, f) => sum + f.totalScore, 0) / feedbacks.length)}/100
                  </p>
                </div>
                
                {/* Calculate average for each category */}
                {feedbacks[0]?.categoryScores?.map((category: any) => {
                  const categoryName = category.name;
                  const avgScore = Math.round(
                    feedbacks.reduce((sum, f) => {
                      const categoryScore = f.categoryScores.find((c: any) => c.name === categoryName);
                      return sum + (categoryScore?.score || 0);
                    }, 0) / feedbacks.length
                  );
                  
                  return (
                    <div key={categoryName} className="bg-gray-900 p-4 rounded-lg">
                      <p className="text-gray-400 text-sm">{categoryName}</p>
                      <p className="text-xl font-bold text-white">{avgScore}/100</p>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-4">Participant Results</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">User Email</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Score</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {feedbacks.map((feedback) => (
                    <tr key={feedback.id} className="hover:bg-gray-900">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {feedback.userEmail || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full ${
                          feedback.totalScore >= 80 ? 'bg-green-900/50 text-green-300' :
                          feedback.totalScore >= 60 ? 'bg-yellow-900/50 text-yellow-300' :
                          'bg-red-900/50 text-red-300'
                        }`}>
                          {feedback.totalScore}/100
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300 max-w-[300px] truncate">
                        {feedback.finalAssessment}
                      </td>
                      
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="bg-gray-900 p-8 rounded-lg text-center">
            <p className="text-gray-400">
              No one has completed this interview yet.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Results will appear here when candidates complete the interview.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewResultsPage; 