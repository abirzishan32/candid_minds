"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { getCurrentUser } from '@/lib/actions/auth.action';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  read: boolean;
  timestamp: string;
}

interface SocketContextType {
  socket: Socket | null;
  notifications: Notification[];
  unreadCount: number;
  connected: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  notifications: [],
  unreadCount: 0,
  connected: false,
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {}
});

export const useSocket = () => useContext(SocketContext);

export const SocketContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connected, setConnected] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Initialize socket connection when the component mounts
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        // Get the current user
        const user = await getCurrentUser();
        if (!user) return;
        
        setUserId(user.id);
        
        // Initialize socket connection
        const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', {
          path: '/api/socket',
          auth: {
            userId: user.id
          }
        });
        
        setSocket(socketInstance);
        
        // Load existing notifications from localStorage
        const storedNotifications = localStorage.getItem(`notifications_${user.id}`);
        if (storedNotifications) {
          setNotifications(JSON.parse(storedNotifications));
        }
      } catch (error) {
        console.error('Failed to initialize socket:', error);
      }
    };
    
    initializeSocket();
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);
  
  // Setup socket event listeners
  useEffect(() => {
    if (!socket) return;
    
    // Connection events
    socket.on('connect', () => {
      setConnected(true);
      console.log('Socket connected');
    });
    
    socket.on('disconnect', () => {
      setConnected(false);
      console.log('Socket disconnected');
    });
    
    // Notification events
    socket.on('notification', (notification: Notification) => {
      console.log('Received notification:', notification);
      setNotifications(prev => {
        const newNotifications = [notification, ...prev];
        // Store in localStorage
        if (userId) {
          localStorage.setItem(`notifications_${userId}`, JSON.stringify(newNotifications));
        }
        return newNotifications;
      });
      
      // Show browser notification if permission is granted
      if (Notification.permission === 'granted') {
        new Notification('Candid Minds', { 
          body: notification.message,
          icon: '/logo.png'
        });
      }
    });
    
    // Specific application status update events
    socket.on('application_status_update', (data: { 
      applicationId: string, 
      status: 'approved' | 'rejected',
      message: string 
    }) => {
      const notificationType = data.status === 'approved' ? 'success' : 'error';
      const newNotification: Notification = {
        id: `app_${data.applicationId}_${Date.now()}`,
        type: notificationType,
        message: data.message,
        read: false,
        timestamp: new Date().toISOString()
      };
      
      setNotifications(prev => {
        const newNotifications = [newNotification, ...prev];
        // Store in localStorage
        if (userId) {
          localStorage.setItem(`notifications_${userId}`, JSON.stringify(newNotifications));
        }
        return newNotifications;
      });
      
      // Show browser notification
      if (Notification.permission === 'granted') {
        new Notification('Application Status Update', { 
          body: data.message,
          icon: '/logo.png'
        });
      }
    });
    
    // Cleanup
    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('notification');
      socket.off('application_status_update');
    };
  }, [socket, userId]);
  
  // Request notification permission
  useEffect(() => {
    if (typeof window !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  
  // Mark single notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      // Update localStorage
      if (userId) {
        localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
      }
      return updated;
    });
  };
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      // Update localStorage
      if (userId) {
        localStorage.setItem(`notifications_${userId}`, JSON.stringify(updated));
      }
      return updated;
    });
  };
  
  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
    // Clear localStorage
    if (userId) {
      localStorage.setItem(`notifications_${userId}`, JSON.stringify([]));
    }
  };
  
  return (
    <SocketContext.Provider value={{
      socket,
      notifications,
      unreadCount,
      connected,
      markAsRead,
      markAllAsRead,
      clearNotifications
    }}>
      {children}
    </SocketContext.Provider>
  );
};