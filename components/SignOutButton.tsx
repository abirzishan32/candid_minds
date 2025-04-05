'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/lib/actions/auth.action';

export default function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut();
      router.refresh(); // Refresh the page to update auth state
      router.push('/interview-home'); // Redirect to home after logout
    } catch (error) {
      console.error('Failed to sign out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className="text-sm text-gray-400 hover:text-primary-100"
    >
      {isLoading ? 'Signing out...' : '(Logout)'}
    </button>
  );
}