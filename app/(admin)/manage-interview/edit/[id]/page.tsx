import React from 'react';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { getInterviewById } from '@/lib/actions/admin.action';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import EditInterviewForm from '@/components/admin/EditInterviewForm';
import { ChevronLeft } from 'lucide-react';

const EditInterviewPage = async ({ params }: { params: { id: string } }) => {
    const user = await getCurrentUser();

    // Redirect if not authenticated
    if (!user) {
        redirect('/sign-in');
    }

    // Fetch interview data
    const { interview, success } = await getInterviewById(params.id);

    // Redirect if interview not found or error
    if (!success || !interview) {
        redirect('/manage-interview?error=interview-not-found');
    }

    // Ensure interview is treated as Interview type
    const interviewData = interview as Interview;

    return (
        <section className="max-w-7xl mx-auto pb-20">
            {/* Breadcrumb Navigation */}
            <div className="mb-6 flex items-center text-sm text-gray-400">
                <Link href="/admin-dashboard" className="hover:text-primary-100">Dashboard</Link>
                <span className="mx-2">•</span>
                <Link href="/manage-interview" className="hover:text-primary-100">Manage Interviews</Link>
                <span className="mx-2">•</span>
                <span className="text-white">Edit Interview</span>
            </div>

            {/* Header Section - Fixed by using optional chaining */}
            <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-lg mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Edit Interview</h1>
                        <p className="text-gray-400">
                            {interviewData.role ?? "Role"}
                            {interviewData.type ? ` • ${interviewData.type}` : ""}
                            {interviewData.level ? ` • ${interviewData.level}` : ""}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/manage-interview">
                            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                                <ChevronLeft className="h-4 w-4 mr-1" /> Back
                            </Button>
                        </Link>
                        <Link href={`/interview-main/${interviewData.id}`} target="_blank">
                            <Button className="bg-gray-800 hover:bg-gray-700 text-white">
                                Preview
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Edit Form */}
            <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-lg overflow-hidden">
                <EditInterviewForm interview={interviewData} />
            </div>
        </section>
    );
};

export default EditInterviewPage;