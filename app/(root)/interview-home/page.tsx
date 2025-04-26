import React from 'react'
import Link from "next/link";
import Image from "next/image";
import InterviewCard from "@/components/InterviewCard";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewByUserId, getLatestInterviews, getCompanyInterviews } from "@/lib/actions/general.action";
import AuthCheck from "@/components/AuthCheck";
import ModeratorApplicationButton from "@/components/ModeratorApplicationButton";
import { notFound } from 'next/navigation';

interface PageProps {
    searchParams: {
        mock?: string;
        error?: string;
    };
}

const Page = async ({ searchParams }: PageProps) => {
    const user = await getCurrentUser();
    const isAuthenticated = !!user;

    // Get query parameters - use proper TypeScript access
    const mockCompleted = searchParams?.mock === 'completed';
    const accessError = searchParams?.error === 'no-access';

    // Only fetch interviews if user is authenticated
    const [userInterviews, latestInterviews, companyInterviews] = isAuthenticated
        ? await Promise.all([
            getInterviewByUserId(user?.id!),
            getLatestInterviews({userId: user?.id!}),
            getCompanyInterviews()
        ])
        : [[], [], []];

    const hasPastInterviews = userInterviews?.length! > 0;
    const hasUpcomingInterviews = latestInterviews?.length! > 0;
    const hasCompanyInterviews = companyInterviews?.length! > 0;

    // Check if user is already a moderator
    const isModerator = user?.role === "interview-moderator";

    return (
        <>
            {mockCompleted && (
                <div className="mb-6 bg-green-900/30 border border-green-800 text-green-300 p-4 rounded-lg">
                    <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Mock interview completed successfully! The results were not saved as this was a practice session.
                    </p>
                </div>
            )}

            {accessError && (
                <div className="mb-6 bg-red-900/30 border border-red-800 text-red-300 p-4 rounded-lg">
                    <p className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        You don't have access to this interview. Please contact the moderator for access.
                    </p>
                </div>
            )}
            
            <section className="card-cta rounded-2xl bg-gradient-to-br from-gray-950 to-black p-8 border border-gray-800 shadow-lg backdrop-blur-sm">
                <div className="flex flex-col gap-6 max-w-lg">
                    <h2 className="text-3xl font-bold text-white">
                        Get <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Interview-Ready</span> with AI-Powered Practice
                    </h2>

                    <p className="text-lg text-gray-400">
                        Practice real interview questions & get instant feedback!
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <AuthCheck
                            isAuthenticated={isAuthenticated}
                            href="/interview-main"
                            className="btn btn-primary group transition-all duration-300 hover:shadow-lg
                                        hover:shadow-primary/20 hover:-translate-y-1">
                            <div className="flex items-center gap-2">
                                Create an Interview
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                        </AuthCheck>

                        {isAuthenticated && !isModerator && (
                            <ModeratorApplicationButton userId={user.id} />
                        )}

                        {isAuthenticated && isModerator && (
                            <Link href="/moderator-dashboard" className="bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-2">
                                <span>Moderator Dashboard</span>
                                <span>→</span>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="relative">
                    <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
                    <Image
                        src="/robot.png"
                        alt="robot"
                        width={400}
                        height={400}
                        className="max-sm:hidden drop-shadow-xl hover:scale-105 transition-transform duration-500"
                    />
                </div>
            </section>

            {/* Company Interviews Section */}
            {hasCompanyInterviews && (
                <section className="flex flex-col gap-6 mt-14">
                    <h2 className="text-2xl font-bold flex items-center gap-2 border-b border-gray-800 pb-2">
                        <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
                        Company Interviews
                    </h2>
                    <div className="interviews-section grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {companyInterviews?.map((interview) => (
                            <InterviewCard {...interview} key={interview.id} isAuthenticated={isAuthenticated} />
                        ))}
                    </div>
                </section>
            )}

            <section className="flex flex-col gap-6 mt-14">
                <h2 className="text-2xl font-bold flex items-center gap-2 border-b border-gray-800 pb-2">
                    <span className="w-2 h-6 bg-primary rounded-full"></span>
                    Your Interviews
                </h2>
                <div className="interviews-section grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isAuthenticated ? (
                        hasPastInterviews ? (
                            userInterviews?.map((interview) => (
                                <InterviewCard {...interview} key={interview.id} isAuthenticated={isAuthenticated} />
                            ))
                        ) : (
                            <div className="col-span-full p-8 text-center rounded-xl border border-dashed border-gray-700 bg-black/50">
                                <p className="text-gray-400">You haven't taken any interviews yet!</p>
                            </div>
                        )
                    ) : (
                        <div className="col-span-full p-8 text-center rounded-xl border border-dashed border-gray-700 bg-black/50">
                            <p className="text-gray-400">
                                <Link href="/sign-in" className="text-primary-100 hover:underline">Log in</Link> or
                                <Link href="/sign-up" className="text-primary-100 hover:underline ml-1">sign up</Link> to see your interviews
                            </p>
                        </div>
                    )}
                </div>
            </section>

            <section className="flex flex-col gap-6 mt-14">
                <h2 className="text-2xl font-bold flex items-center gap-2 border-b border-gray-800 pb-2">
                    <span className="w-2 h-6 bg-secondary rounded-full"></span>
                    Practice Interviews
                </h2>

                <div className="interviews-section grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hasUpcomingInterviews ? (
                        latestInterviews?.map((interview) => (
                            <InterviewCard {...interview} key={interview.id} isAuthenticated={isAuthenticated} />
                        ))
                    ) : (
                        <div className="col-span-full p-8 text-center rounded-xl border border-dashed border-gray-700 bg-black/50">
                            <p className="text-gray-400">
                                {isAuthenticated
                                    ? "There are no new interviews available!"
                                    : "Sign up to access practice interviews"}
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}

export default Page