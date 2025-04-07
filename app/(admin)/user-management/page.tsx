import React from 'react';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { getAllUsers } from '@/lib/actions/admin.action';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import UserRoleButton from '@/components/admin/UserRoleButton';

const convertSecondsToDate = (seconds: number | null | undefined) => {
    if (!seconds) return null;
    // Convert seconds to milliseconds for JavaScript Date
    return new Date(seconds * 1000);
};

const formatDate = (seconds: number | null | undefined) => {
    const date = convertSecondsToDate(seconds);
    return date ? date.toLocaleDateString() : 'Unknown';
};


const UserManagement = async () => {
    const admin = await getCurrentUser();
    const { users = [] } = await getAllUsers();

    // Calculate total number of users
    const totalUsers = users.length;

    // Calculate total number of active users
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-black bg-opacity-70 p-4 rounded-xl border border-gray-800 shadow-inner">
                    <h3 className="text-gray-400 text-sm mb-1">Total Users</h3>
                    <p className="text-3xl font-bold text-white">{totalUsers}</p>
                </div>
                <div className="bg-black bg-opacity-70 p-4 rounded-xl border border-gray-800 shadow-inner">
                    <h3 className="text-gray-400 text-sm mb-1">Active Users (30d)</h3>
                    <p className="text-3xl font-bold text-primary-100">{activeUsers}</p>
                </div>
                <div className="bg-black bg-opacity-70 p-4 rounded-xl border border-gray-800 shadow-inner">
                    <h3 className="text-gray-400 text-sm mb-1">New Users (7d)</h3>
                    <p className="text-3xl font-bold text-green-400">{newUsers}</p>
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

            {/* Users Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-800 shadow-inner">
                <table className="min-w-full bg-black bg-opacity-60">
                    <thead className="bg-gray-800 text-left">
                    <tr>
                        <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">User ID</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-900 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 relative">
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-100/30 to-primary-200/30 animate-pulse"></div>
                                        <div className="absolute inset-0.5 rounded-full bg-gray-800 flex items-center justify-center text-xl text-white">
                                            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-white">{user.name}</div>

                                    </div>
                                </div>

                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-400">{user.id.substring(0, 8)}...</div>
                            </td>

                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-300">{user.email}</div>
                            </td>





                            <td className="px-6 py-4 whitespace-nowrap">
                                <UserRoleButton userId={user.id} currentRole={user.role} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex space-x-2 justify-end">

                                    <Button className="bg-red-900/50 hover:bg-red-900 text-red-300 text-xs py-1 px-2 border border-red-800">
                                        Suspend
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6 px-4 py-3 bg-black bg-opacity-60 border border-gray-800 rounded-lg">
                <div className="text-sm text-gray-400">
                    Showing <span className="font-medium text-white">1</span> to <span className="font-medium text-white">10</span> of <span className="font-medium text-white">{totalUsers}</span> users
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