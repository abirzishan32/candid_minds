'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { setUserRole } from '@/lib/actions/auth.action';

interface UserRoleButtonProps {
    userId: string;
    currentRole: string;
}

const UserRoleButton = ({ userId, currentRole = 'user' }: UserRoleButtonProps) => {
    const [role, setRole] = useState(currentRole);
    const [isChanging, setIsChanging] = useState(false);

    const handleRoleChange = async (newRole: 'user' | 'admin' | 'interview-moderator') => {
        if (newRole === role) return;
        setIsChanging(true);

        try {
            const result = await setUserRole({ userId, newRole });
            if (result.success) {
                setRole(newRole);
            } else {
                alert('Failed to update role: ' + result.message);
            }
        } catch (error) {
            console.error('Error updating role:', error);
            alert('An error occurred while updating the role');
        } finally {
            setIsChanging(false);
        }
    };

    return (
        <div className="flex items-center space-x-2 flex-wrap">
            <Button
                className={`text-xs py-1 px-2 ${
                    role === 'user'
                        ? 'bg-violet-900/50 text-violet-300 border border-violet-800'
                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}
                onClick={() => handleRoleChange('user')}
                disabled={isChanging || role === 'user'}
            >
                User
            </Button>
            <Button
                className={`text-xs py-1 px-2 ${
                    role === 'admin'
                        ? 'bg-amber-900/50 text-amber-300 border border-amber-800'
                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}
                onClick={() => handleRoleChange('admin')}
                disabled={isChanging || role === 'admin'}
            >
                Admin
            </Button>
            <Button
                className={`text-xs py-1 px-2 ${
                    role === 'interview-moderator'
                        ? 'bg-blue-900/50 text-blue-300 border border-blue-800'
                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}
                onClick={() => handleRoleChange('interview-moderator')}
                disabled={isChanging || role === 'interview-moderator'}
            >
                Moderator
            </Button>
        </div>
    );
};

export default UserRoleButton;