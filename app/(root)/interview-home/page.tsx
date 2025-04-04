import React from 'react'
import {Button} from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {dummyInterviews} from "@/constants";
import InterviewCard from "@/components/InterviewCard";
import {getCurrentUser, getInterviewByUserId} from "@/lib/actions/auth.action";

const Page = async () => {

    const user = await getCurrentUser()
    const userInterviews = await getInterviewByUserId(user?.id!)


    const hasPastInterview = userInterviews?.length > 0


    return (
        <>
            <section className="card-cta">
                <div className="flex flex-col gap-6 max-w-lg">
                    <h2>Want to upgrade your skill with our courses and interviews?</h2>
                    <p>Enroll in courses you like and take demo interviews and get instant feedbacks!</p>
                    <Button asChild className="btn btn-primary max-sm:w-full">
                        <Link href="/interview"> Start an Interview </Link>
                    </Button>
                </div>

                <Image src="/robot.png" alt="robot" width={400} height={400} className="max-sm:hidden"/>
            </section>

            <section className="flex flex-col gap-6 mt-8">
                <h2> Your Interviews</h2>
                <div className="interviews-section">
                    {
                        hasPastInterview ? (
                            userInterviews?.map((interview) => (
                                <InterviewCard {...interview} key={interview.id} />
                            ))) :
                            (
                                <p>You haven't taken any interviews yet!</p>
                            )
                    }
                </div>

            </section>

            <section className="flex flex-col gap-6 mt-8">
                <h2> Take an interview</h2>

                <div className="interviews-section">
                    {dummyInterviews.map((interview) => (
                        <InterviewCard {...interview} />
                    ))}
                    {/*<p> There are no interviews available here</p>*/}
                </div>
            </section>

        </>

    )
}
export default Page