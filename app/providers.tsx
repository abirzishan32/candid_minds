'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import SocketProvider from '@/providers/SocketProvide';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SocketProvider>
        {children}
      </SocketProvider>
    </SessionProvider>
  );
} 