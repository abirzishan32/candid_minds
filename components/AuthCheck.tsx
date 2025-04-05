'use client';

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface AuthCheckProps {
    isAuthenticated: boolean;
    href: string;
    children: React.ReactNode;
    className?: string;
}

const AuthCheck = ({ isAuthenticated, href, children, className = "" }: AuthCheckProps) => {
    const router = useRouter();

    const handleClick = () => {
        if (isAuthenticated) {
            router.push(href);
        } else {
            router.push('/sign-up');
        }
    };

    return (
        <Button onClick={handleClick} className={className}>
            {children}
        </Button>
    );
};

export default AuthCheck;