import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { isAuthenticated, getCurrentUser } from '@/lib/actions/auth.action';
import LeetCodeInterviewContent from '@/components/leetcode/LeetCodeInterviewContent';
import { getProblemBySlug } from '@/lib/actions/leetcode.action';
import { Skeleton } from '@/components/ui/skeleton';

export default async function LeetCodeInterviewPage({ params }: { params: { slug: string } }) {
  // Check authentication first
  const isUserAuth = await isAuthenticated();
  if (!isUserAuth) redirect('/sign-up');

  // Get current user using the same pattern as interview-main
  const user = await getCurrentUser();
  
  // Get problem slug
  const { slug } = params;
  const problemSlug = Array.isArray(slug) ? slug[0] : slug;
  
  // Fetch problem details
  const result = await getProblemBySlug(problemSlug);
  
  // If problem doesn't exist, show an error
  if (!result.success) {
    return (
      <div className="container mx-auto py-12">
        <div className="bg-red-900/30 border border-red-700 p-6 rounded-lg text-center max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-white mb-3">Error</h3>
          <p className="text-red-200 mb-4">Could not fetch problem details.</p>
          <button
            onClick={() => window.history.back()}
            className="bg-primary-100 hover:bg-primary-200 text-black px-4 py-2 rounded-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  const problem = {
    title: result.data.title,
    difficulty: result.data.difficulty,
    content: result.data.content
  };

  return (
    <Suspense fallback={
      <div className="container mx-auto py-12">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-3/4 mb-6" />
          <Skeleton className="h-6 w-1/4 mb-12" />
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-10 w-32 mx-auto" />
        </div>
      </div>
    }>
      <LeetCodeInterviewContent 
        userName={user?.name || 'Guest'}
        userId={user?.id || 'guest-user'}
        problemSlug={problemSlug}
        problem={problem}
      />
    </Suspense>
  );
}