import React, { ReactNode } from 'react'
import { isAuthenticated } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";

const AuthLayout = async ({ children }: { children: ReactNode }) => {
    const isUserAuth = await isAuthenticated();
    if (isUserAuth) redirect('/interview-home')

    return (
        <div className="auth-layout">{children}</div>
    )
}

export default AuthLayout