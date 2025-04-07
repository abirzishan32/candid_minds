import React, { ReactNode } from 'react';
import { isAdmin, getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import AdminCheck from '@/components/AdminCheck';

const AdminLayout = async ({ children }: { children: ReactNode }) => {
    const userIsAdmin = await isAdmin();
    const currentUser = await getCurrentUser();

    // If not logged in, redirect to sign in
    if (!currentUser) {
        redirect('/sign-in');
    }

    return (
        <AdminCheck isAdmin={userIsAdmin}>
            <div className="admin-layout">
                {/* Admin sidebar could go here */}
                <div className="admin-content">
                    {children}
                </div>
            </div>
        </AdminCheck>
    );
};

export default AdminLayout;