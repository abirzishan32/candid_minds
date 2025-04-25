import { getInterviewById } from "@/lib/actions/general.action";
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

                <p className="bg-black text-primary px-4 py-2 rounded-lg h-fit capitalize border border-gray-800">{interview.type}</p>
            </div>

            <Agent
                userName={user?.name || ''}
                userId={user?.id}
                interviewId={id}
                type="interview"
                questions={interview.questions}
            />
        </>
    )
}
export default Page