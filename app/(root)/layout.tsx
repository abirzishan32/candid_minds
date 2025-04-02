import React, { ReactNode } from 'react'
import Link from "next/link";
import Image from "next/image";
import {isAuthenticated} from "@/lib/actions/auth.action";
import {redirect} from "next/navigation";


const RootLayout = async ( {children} : {children: ReactNode} ) => {

    const isUserAuth = await isAuthenticated();
    if(!isUserAuth) redirect('/sign-in')

    return (
        <div className="root-layout">
            <nav>
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.svg" alt="Candid Minds" width={38} height={32} />
                    <h2 className="text-primary-100 "> Candid Minds </h2>
                </Link>
            </nav>

            {children}
        </div>
    )
}


export default RootLayout