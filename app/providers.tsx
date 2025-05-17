'use client';

import React from 'react';
import SocketProvider from '@/providers/SocketProvide';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SocketProvider>
      {children}
    </SocketProvider>
  );
} 