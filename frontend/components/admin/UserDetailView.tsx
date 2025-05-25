'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { setUserRole } from "@/lib/actions/auth.action";
import { Building2, Mail, Calendar, Clock, User, Shield } from "lucide-react";

interface UserDetailViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'interview-moderator';
    lastActive?: number;
    createdAt?: number;
    company?: string;
    companyWebsite?: string;
    position?: string;
  };
  onClose: () => void;
  isOpen: boolean;
}

const formatDate = (seconds?: number) => {
  if (!seconds) return 'Unknown';
  const date = new Date(seconds * 1000);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

const UserDetailView = ({ user, onClose, isOpen }: UserDetailViewProps) => {
  const [currentRole, setCurrentRole] = useState(user.role);
  const [isChangingRole, setIsChangingRole] = useState(false);

  const handleRoleChange = async (newRole: 'user' | 'admin' | 'interview-moderator') => {
    if (newRole === currentRole) return;
    setIsChangingRole(true);

    try {
      const result = await setUserRole({ userId: user.id, newRole });
      if (result.success) {
        setCurrentRole(newRole);
      } else {
        alert('Failed to update role: ' + result.message);
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('An error occurred while updating the role');
    } finally {
      setIsChangingRole(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] bg-gray-950 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <User className="h-5 w-5" />
            User Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* User profile header */}
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-gray-800 flex items-center justify-center text-2xl font-bold text-white border-2 border-primary-100">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-gray-400">{user.email}</p>
              <div className="mt-1">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  currentRole === 'admin' 
                    ? 'bg-amber-900/50 text-amber-300 border border-amber-800' 
                    : currentRole === 'interview-moderator'
                      ? 'bg-blue-900/50 text-blue-300 border border-blue-800'
                      : 'bg-violet-900/50 text-violet-300 border border-violet-800'
                }`}>
                  {currentRole === 'admin' 
                    ? 'Admin' 
                    : currentRole === 'interview-moderator'
                      ? 'Moderator'
                      : 'User'}
                </span>
              </div>
            </div>
          </div>

          {/* User information */}
          <div className="grid grid-cols-1 gap-4 pt-4 border-t border-gray-800">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-300">Email</h3>
                <p className="text-white">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-300">Account Created</h3>
                <p className="text-white">{formatDate(user.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-300">Last Active</h3>
                <p className="text-white">{user.lastActive ? formatDate(user.lastActive) : 'Never'}</p>
              </div>
            </div>

            {user.company && (
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-gray-300">Company Information</h3>
                  <p className="text-white">{user.company}</p>
                  {user.position && <p className="text-gray-400 text-sm">{user.position}</p>}
                  {user.companyWebsite && (
                    <a 
                      href={user.companyWebsite} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline text-sm flex items-center mt-1 gap-1"
                    >
                      {user.companyWebsite}
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-300">User Permissions</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className={`text-xs py-1 px-3 ${
                      currentRole === 'user'
                        ? 'bg-violet-900/50 text-violet-300 border border-violet-800'
                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}
                    onClick={() => handleRoleChange('user')}
                    disabled={isChangingRole || currentRole === 'user'}
                  >
                    Regular User
                  </Button>
                  <Button
                    size="sm"
                    className={`text-xs py-1 px-3 ${
                      currentRole === 'interview-moderator'
                        ? 'bg-blue-900/50 text-blue-300 border border-blue-800'
                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}
                    onClick={() => handleRoleChange('interview-moderator')}
                    disabled={isChangingRole || currentRole === 'interview-moderator'}
                  >
                    Interview Moderator
                  </Button>
                  <Button
                    size="sm"
                    className={`text-xs py-1 px-3 ${
                      currentRole === 'admin'
                        ? 'bg-amber-900/50 text-amber-300 border border-amber-800'
                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                    }`}
                    onClick={() => handleRoleChange('admin')}
                    disabled={isChangingRole || currentRole === 'admin'}
                  >
                    Admin
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between mt-6 pt-4 border-t border-gray-800">
          <Button 
            variant="destructive"
            size="sm"
          >
            Suspend Account
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailView; 