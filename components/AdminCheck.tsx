'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from './ui/button';

interface AdminCheckProps {
    isAdmin: boolean;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

const AdminCheck = ({ isAdmin, children, fallback }: AdminCheckProps) => {
    const router = useRouter();

    useEffect(() => {
        if (!isAdmin) {
            router.push('/interview-home');
        }
    }, [isAdmin, router]);

    if (!isAdmin) {
        return fallback || (
            <div className="flex flex-col items-center justify-center p-10 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
                <p className="text-gray-400 mb-6">You don't have permission to access this page.</p>
                <Button className="bg-primary-100 hover:bg-primary-200 text-black">
                    <Link href="/interview-home">Back to Home</Link>
                </Button>
            </div>
        );
    }

    return <>{children}</>;
};

export default AdminCheck;