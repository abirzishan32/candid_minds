import React, { ReactNode } from 'react'
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/actions/auth.action";
import SignOutButton from '@/components/SignOutButton';

const RootLayout = async ({ children }: { children: ReactNode }) => {
    const user = await getCurrentUser();
    const isUserAuth = !!user;

    return (
        <div className="root-layout">
            <nav className="flex justify-between items-center px-4 py-3">
                <Link href="/interview-home" className="flex items-center gap-2">
                    <Image src="/logo.svg" alt="Candid Minds" width={38} height={32} />
                    <h2 className="text-primary-100"> Candid Minds </h2>
                </Link>

                <div>
                    {isUserAuth ? (
                        <div className="flex items-center gap-2">
                            <span className="text-primary-100">{user?.name}</span>
                            <SignOutButton />
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