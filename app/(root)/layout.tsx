import React, { ReactNode } from 'react'
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/actions/auth.action";
import SignOutButton from '@/components/SignOutButton';
import NotificationBell from '@/components/NotificationBell';

const RootLayout = async ({ children }: { children: ReactNode }) => {
    const user = await getCurrentUser();
    const isUserAuth = !!user;
    const isModerator = user?.role === 'MODERATOR';

    return (
        <div className="root-layout">
            <nav className="flex justify-between items-center px-4 py-3">
                <div className="flex items-center gap-4">
                    <Link href="/interview-home" className="flex items-center gap-2">
                        <Image src="/logo.svg" alt="Candid Minds" width={38} height={32} />
                        <h2 className="text-primary-100"> Candid Minds </h2>
                    </Link>
                    
                    {/* Main Navigation Links */}
                    <div className="hidden md:flex items-center gap-4 text-sm">
                        <Link href="/interview-home" className="text-gray-300 hover:text-primary-100 transition">
                            Interviews
                        </Link>
                        <Link href="/skill-assessment" className="text-gray-300 hover:text-primary-100 transition">
                            Skills Assessment
                        </Link>
                        <Link href="/resume-checker" className="text-gray-300 hover:text-primary-100 transition">
                            Resume Checker
                        </Link>
                        <Link href="/job-market" className="text-gray-300 hover:text-primary-100 transition">
                            Job Market Insights
                        </Link>
                        {isModerator && (
                            <Link href="/moderator-dashboard" className="text-gray-300 hover:text-primary-100 transition">
                                Moderator Dashboard
                            </Link>
                        )}
                    </div>
                </div>

                <div>
                    {isUserAuth ? (
                        <div className="flex items-center gap-4">
                            {/* Notification Bell */}
                            <NotificationBell />
                            
                            <div className="flex items-center gap-2">
                                <span className="text-primary-100">{user?.name}</span>
                                <SignOutButton />
                            </div>
                        </div>
                    ) : (
                        <Link href="/sign-in" className="text-primary-100 hover:text-primary-200">
                            Login
                        </Link>
                    )}
                </div>
            </nav>

            {children}
        </div>
    )
}

export default RootLayout