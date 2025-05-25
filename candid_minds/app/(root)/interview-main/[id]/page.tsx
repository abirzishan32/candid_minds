import { getInterviewById, canAccessModeratorInterview, hasUserCompletedInterview } from "@/lib/actions/general.action";
import { redirect } from "next/navigation";
import Image from "next/image";
import DisplayTechIcons from "@/components/DisplayTechIcons";
import Agent from "@/components/Agent";
import { getCurrentUser, isAuthenticated } from "@/lib/actions/auth.action";

const Page = async ({ params }: RouteParams) => {
    // Check authentication first
    const isUserAuth = await isAuthenticated();
    if (!isUserAuth) redirect('/sign-up');

    const { id } = await params;
    const user = await getCurrentUser();
    const interview = await getInterviewById(id);

    if (!interview) redirect('/interview-home');

    // Check if this is a moderator interview and if the user has access
    if (interview.isModeratorInterview) {
        const hasAccess = await canAccessModeratorInterview(id, user?.id!);
        if (!hasAccess) {
            redirect('/interview-home?error=no-access');
        }
    }

    // Check if this is a company interview and if the user has already completed it
    if ((interview.isCompanyInterview || interview.isModeratorInterview) && user?.id) {
        const hasCompleted = await hasUserCompletedInterview(id, user.id);
        if (hasCompleted) {
            redirect(`/interview-main/${id}/feedback?completed=true`);
        }
    }

    return (
        <>
            <div className="flex flex-row gap-4 justify-between mb-6 bg-gradient-to-r from-gray-950 to-black p-4 rounded-xl border border-gray-800 shadow-md">
                <div className="flex flex-row gap-4 items-center max-sm:flex-col">
                    <div className="flex items-center">
                        <div className="w-2 h-16 bg-primary rounded-full mr-3"></div>
                        <h3 className="capitalize text-white text-xl font-bold">{interview.role} Interview</h3>
                    </div>

                    <DisplayTechIcons techStack={interview.techstack} />
                </div>

                <div className="flex flex-col items-end">
                    <p className="bg-black text-primary px-4 py-2 rounded-lg h-fit capitalize border border-gray-800">{interview.type}</p>
                    {interview.isModeratorInterview && interview.company && (
                        <p className="text-sm text-gray-300 mt-2">{interview.company} Interview</p>
                    )}
                </div>
            </div>

            <Agent
                userName={user?.name || ''}
                userId={user?.id}
                interviewId={id}
                type="interview"
                questions={interview.questions}
                saveResult={interview.isCompanyInterview || interview.isModeratorInterview}
            />
        </>
    )
}
export default Page