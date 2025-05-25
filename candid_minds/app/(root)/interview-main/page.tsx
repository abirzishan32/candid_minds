import React from 'react'
import Agent from "@/components/Agent";
import { getCurrentUser, isAuthenticated } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";

const Page = async () => {
    // Check authentication first
    const isUserAuth = await isAuthenticated();
    if (!isUserAuth) redirect('/sign-up');

    const user = await getCurrentUser();

    return (
        <>
            <h3>Interview Generation</h3>

            <Agent userName={user?.name!} userId={user?.id} type="generate" />
        </>
    )
}
export default Page