'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import UserRoleButton from '@/components/admin/UserRoleButton';
import UserDetailView from '@/components/admin/UserDetailView';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'interview-moderator';
  lastActive?: number;
  createdAt?: number;
  company?: string;
  companyWebsite?: string;
  position?: string;
}

interface UserDetailClientProps {
  users: User[];
}

const convertSecondsToDate = (seconds: number | null | undefined) => {
  if (!seconds) return null;
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

const UserDetailClient = ({ users }: UserDetailClientProps) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
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
    <>
      {/* Users Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-800 shadow-inner">
        <table className="min-w-full bg-black bg-opacity-60">
          <thead className="bg-gray-800 text-left">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
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
                      <div className={`absolute inset-0 rounded-full ${
                        isUserActive(user.lastActive) 
                          ? 'bg-gradient-to-r from-green-500/30 to-green-400/30 animate-pulse' 
                          : 'bg-gradient-to-r from-primary-100/30 to-primary-200/30'
                      }`}></div>
                      <div className="absolute inset-0.5 rounded-full bg-gray-800 flex items-center justify-center text-xl text-white">
                        {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white">{user.name}</div>
                      <div className="text-xs text-gray-400">
                        {user.id.substring(0, 8)}...
                      </div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-300">{user.email}</div>
                  <div className="text-xs text-gray-500">
                    Joined: {formatDate(user.createdAt)}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <UserRoleButton userId={user.id} currentRole={user.role} />
                </td>
                
                
                
                
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2 justify-end">
                    <Button 
                      className="bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs py-1 px-2"
                      onClick={() => setSelectedUser(user)}
                    >
                      View Details
                    </Button>
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

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetailView
          user={selectedUser}
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </>
  );
};

export default UserDetailClient; 