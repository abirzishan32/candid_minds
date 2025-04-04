import React from 'react'
import {Button} from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import InterviewCard from "@/components/InterviewCard";
import {getCurrentUser} from "@/lib/actions/auth.action";
import {getInterviewByUserId, getLatestInterviews} from "@/lib/actions/general.action";

const Page = async () => {
    const user = await getCurrentUser()

    const [userInterviews, latestInterviews] = await Promise.all([
        await getInterviewByUserId(user?.id!),
        await getLatestInterviews({userId: user?.id!})
    ])

    const hasPastInterviews = userInterviews?.length > 0
    const hasUpcomingInterviews = latestInterviews?.length > 0

    return (
        <>
            <section className="card-cta rounded-2xl bg-gradient-to-br from-background to-muted/50 p-8 border border-border/50 shadow-lg backdrop-blur-sm">
                <div className="flex flex-col gap-6 max-w-lg">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent animate-pulse">Want to upgrade your skill with our courses and interviews?</h2>
                    <p className="text-lg text-muted-foreground">Enroll in courses you like and take demo interviews and get instant feedbacks!</p>
                    <Button asChild className="btn btn-primary max-sm:w-full group transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1">
                        <Link href="/interview-main" className="flex items-center gap-2">
                            Start an Interview
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </Button>
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

            <section className="flex flex-col gap-6 mt-14">
                <h2 className="text-2xl font-bold flex items-center gap-2 border-b pb-2">
                    <span className="w-2 h-6 bg-primary rounded-full"></span>
                    Your Interviews
                </h2>
                <div className="interviews-section grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hasPastInterviews ? (
                        userInterviews?.map((interview) => (
                            <InterviewCard {...interview} key={interview.id} />
                        ))
                    ) : (
                        <div className="col-span-full p-8 text-center rounded-xl border border-dashed border-muted-foreground/30">
                            <p className="text-muted-foreground">You haven't taken any interviews yet!</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="flex flex-col gap-6 mt-14">
                <h2 className="text-2xl font-bold flex items-center gap-2 border-b pb-2">
                    <span className="w-2 h-6 bg-secondary rounded-full"></span>
                    Take an interview
                </h2>

                <div className="interviews-section grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {hasUpcomingInterviews ? (
                        latestInterviews?.map((interview) => (
                            <InterviewCard {...interview} key={interview.id} />
                        ))
                    ) : (
                        <div className="col-span-full p-8 text-center rounded-xl border border-dashed border-muted-foreground/30">
                            <p className="text-muted-foreground">There are no new interviews available!</p>
                        </div>
                    )}
                </div>
            </section>
        </>
    )
}

export default Page