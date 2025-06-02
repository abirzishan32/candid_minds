import React from 'react'
import VoiceAgent from "@/components/VoiceAgent";
import { getCurrentUser, isAuthenticated } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";

const Page = async () => {
    // Check authentication first
    const isUserAuth = await isAuthenticated();
    if (!isUserAuth) redirect('/sign-up');

    const user = await getCurrentUser();

    return (
        <div className="min-h-screen">
            <VoiceAgent userName={user?.name!} userId={user?.id} type="generate" />
        </div>
    );
};

export default Page;