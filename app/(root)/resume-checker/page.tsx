import { getCurrentUser } from '@/lib/actions/auth.action';
import { redirect } from 'next/navigation';
import ResumeAnalyzer from '@/components/resume-checker/ResumeAnalyzer';
import Image from 'next/image';

export default async function ResumeCheckerPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/sign-in');
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-12">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        Resume Checker & <span className="text-primary-100">Optimizer</span>
                    </h1>
                    <p className="text-gray-300 text-lg max-w-2xl">
                        Upload your resume for instant AI analysis. Get personalized feedback,
                        objective scoring, and specific recommendations to make your resume stand out.
                    </p>
                </div>
                <div className="flex-shrink-0 relative w-64 h-64">
                    <Image
                        src="/assets/images/resume-ai.webp"
                        alt="AI Resume Analysis"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
            </div>

            <ResumeAnalyzer userId={user.id} />
        </div>
    );
}