import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";

import { cn, getRandomInterviewCover } from "@/lib/utils";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

const InterviewCard = async ({id, userId, role, type, techstack, createdAt, companyName, isCompanyInterview, level}: InterviewCardProps) => {
    const feedback = null as Feedback | null

    const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

    const badgeColor =
        {
            Behavioral: "bg-gray-800 text-emerald-400 border border-emerald-900",
            Mixed: "bg-gray-800 text-violet-400 border border-violet-900",
            Technical: "bg-gray-800 text-blue-400 border border-blue-900",
        }[normalizedType] || "bg-gray-800 text-violet-400 border border-violet-900";

    const formattedDate = dayjs(
        feedback?.createdAt || createdAt || Date.now()
    ).format("MMM D, YYYY");

    return (
        <div className="border border-gray-700 rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 to-black shadow-lg hover:shadow-xl hover:shadow-primary-900/10 transition-all duration-300 w-[360px] max-sm:w-full min-h-96">
            <div className="p-5 relative">
                <div>
                    {/* Type Badge */}
                    <div
                        className={cn(
                            "absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg shadow-md",
                            badgeColor
                        )}
                    >
                        <p className="font-medium text-sm tracking-wide">{normalizedType}</p>
                    </div>

                    {/* Cover Image */}
                    <div className="flex items-center justify-center mb-4">
                        <Image
                            src={getRandomInterviewCover()}
                            alt="cover-image"
                            width={90}
                            height={90}
                            className="rounded-full object-fit size-[90px] border-2 border-gray-700 shadow-lg shadow-primary-900/20"
                        />
                    </div>

                    {/* Interview Role */}
                    <h3 className="mt-5 capitalize text-white text-xl font-bold tracking-tight">{role} Interview</h3>

                    {/* Company Name - Only show for company interviews */}
                    {isCompanyInterview && companyName && (
                        <div className="mt-1 flex items-center">
                        <span className="text-primary-100 font-medium text-sm">
                          {companyName} • {level || 'Any Level'}
                        </span>
                        </div>
                    )}

                    {/* Date & Score */}
                    <div className="flex flex-row gap-5 mt-3 text-gray-300">
                        <div className="flex flex-row gap-2 items-center">
                            <Image
                                src="/calendar.svg"
                                width={22}
                                height={22}
                                alt="calendar"
                                className="opacity-80"
                            />
                            <p>{formattedDate}</p>
                        </div>

                        <div className="flex flex-row gap-2 items-center">
                            <Image src="/star.svg" width={22} height={22} alt="star" className="opacity-80" />
                            <p className="text-primary-100">{feedback?.totalScore || "---"}/100</p>
                        </div>
                    </div>

                    {/* Feedback or Placeholder Text */}
                    <p className="line-clamp-2 mt-5 text-gray-400">
                        {feedback?.finalAssessment ||
                            (isCompanyInterview
                                ? `Practice interview for ${companyName}. Take it now to improve your chances!`
                                : "You haven't taken this interview yet. Take it now to improve your skills.")}
                    </p>
                </div>

                <div className="flex flex-row justify-between mt-5 pt-4 border-t border-gray-800">
                    <DisplayTechIcons techStack={techstack} />

                    <Button className="bg-primary-100 text-black hover:bg-primary-200 font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-primary-900/20">
                        <Link
                            href={
                                feedback
                                    ? `/interview-main/${id}/feedback`
                                    : `interview-main/${id}`
                            }
                        >
                            {feedback ? "Check Feedback" : "View Interview"}
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default InterviewCard;