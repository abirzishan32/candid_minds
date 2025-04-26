import React from 'react';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { getAllUsers } from '@/lib/actions/admin.action';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import UserRoleButton from '@/components/admin/UserRoleButton';
import { Building2, Users, UserCheck, UserPlus, Clock } from 'lucide-react';
import UserDetailClient from './UserDetailClient';

const convertSecondsToDate = (seconds: number | null | undefined) => {
    if (!seconds) return null;
    // Convert seconds to milliseconds for JavaScript Date
    return new Date(seconds * 1000);
};

const formatDate = (seconds: number | null | undefined) => {
    const date = convertSecondsToDate(seconds);
    return date ? date.toLocaleDateString() : 'Unknown';
};

const formatTimeAgo = (seconds: number | null | undefined) => {
    if (!seconds) return 'Never';
    const date = convertSecondsToDate(seconds);
    if (!date) return 'Unknown';
    
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 30) return `${diff} days ago`;
    if (diff < 365) return `${Math.floor(diff / 30)} months ago`;
    return `${Math.floor(diff / 365)} years ago`;
};

const UserManagement = async () => {
    const admin = await getCurrentUser();
    const { users = [] } = await getAllUsers();

    // Calculate total number of users
    const totalUsers = users.length;

    // Calculate user counts by role
    const adminCount = users.filter(user => user.role === 'admin').length;
    const moderatorCount = users.filter(user => user.role === 'interview-moderator').length;
    const regularUserCount = users.filter(user => user.role === 'user').length;

    // Calculate active users (users who were active in the last 30 days)
    const activeUsers = users.filter(user => {
        if (!user.lastActive) return false;
        try {
            // Convert timestamps from seconds to milliseconds
            const activeDate = convertSecondsToDate(user.lastActive);
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            return activeDate ? activeDate > thirtyDaysAgo : false;
        } catch {
            return false;
        }
    }).length;

    // Calculate new users in the last 7 days
    const newUsers = users.filter(user => {
        if (!user.createdAt) return false;
        try {
            const createdDate = convertSecondsToDate(user.createdAt);
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return createdDate ? createdDate > sevenDaysAgo : false;
        } catch {
            return false;
        }
    }).length;

    // Helper function to determine if a user is active (last active within 7 days)
    const isUserActive = (lastActiveSeconds: number | null | undefined) => {
        if (!lastActiveSeconds) return false;
        try {
            const activeDate = convertSecondsToDate(lastActiveSeconds);
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return activeDate ? activeDate > sevenDaysAgo : false;
        } catch {
            return false;
        }
    };

    return (
        <section className="max-w-7xl mx-auto bg-gray-900 p-8 rounded-xl border border-gray-800 shadow-lg">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">User Management</h1>
                    <p className="text-gray-400">Manage user accounts and permissions</p>
                </div>
                <Link href="/admin-dashboard">
                    <Button className="bg-gray-800 hover:bg-gray-700 text-white">
                        Back to Dashboard
                    </Button>
                </Link>
            </div>

            {/* User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                <div className="bg-black bg-opacity-70 p-4 rounded-xl border border-gray-800 shadow-inner">
                    <div className="flex items-center gap-3">
                        <Users className="h-6 w-6 text-primary-100" />
                        <h3 className="text-gray-400 text-sm">Total Users</h3>
                    </div>
                    <p className="text-3xl font-bold text-white mt-2">{totalUsers}</p>
                </div>
                
                
                
                
                <div className="bg-black bg-opacity-70 p-4 rounded-xl border border-gray-800 shadow-inner">
                    <div className="flex items-center gap-3">
                        <svg className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <h3 className="text-gray-400 text-sm">Admins</h3>
                    </div>
                    <p className="text-3xl font-bold text-amber-400 mt-2">{adminCount}</p>
                </div>
                
                <div className="bg-black bg-opacity-70 p-4 rounded-xl border border-gray-800 shadow-inner">
                    <div className="flex items-center gap-3">
                        <Building2 className="h-6 w-6 text-blue-400" />
                        <h3 className="text-gray-400 text-sm">Moderators</h3>
                    </div>
                    <p className="text-3xl font-bold text-blue-400 mt-2">{moderatorCount}</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="search"
                    placeholder="Search users by name or email..."
                    className="pl-10 pr-4 py-2 w-full bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent"
                />
            </div>

            {/* Client Component for handling the user details modal */}
            <UserDetailClient users={users} />

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6 px-4 py-3 bg-black bg-opacity-60 border border-gray-800 rounded-lg">
                <div className="text-sm text-gray-400">
                    Showing <span className="font-medium text-white">1</span> to <span className="font-medium text-white">{Math.min(users.length, 10)}</span> of <span className="font-medium text-white">{totalUsers}</span> users
                </div>
                <div className="flex space-x-2">
                    <Button className="bg-gray-800 hover:bg-gray-700 text-white text-sm">Previous</Button>
                    <Button className="bg-gray-800 hover:bg-gray-700 text-white text-sm">Next</Button>
                </div>
            </div>
        </section>
    );
};

export default UserManagement;