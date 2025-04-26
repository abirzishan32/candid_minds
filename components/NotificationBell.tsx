'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useSocket } from '@/context/SocketContext';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useSocket();
  const [isOpen, setIsOpen] = useState(false);

  // Close popover when ESC key is pressed
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  // Handle notification click
  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };
  
  // Format the timestamp to a human-readable format
  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'MMM d, h:mm a');
    } catch (error) {
      return 'Unknown time';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 rounded-full hover:bg-gray-800 transition-colors">
          <Bell className="h-5 w-5 text-gray-300" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-[70vh] overflow-y-auto bg-gray-950 border border-gray-800 p-0">
        <div className="p-3 border-b border-gray-800 flex justify-between items-center bg-gray-900">
          <h3 className="font-medium text-white">Notifications</h3>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-primary-100 hover:text-primary-200 transition-colors"
              >
                Mark all as read
              </button>
            )}
            {notifications.length > 0 && (
              <button 
                onClick={clearNotifications}
                className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
        <div className={cn(
          "py-2",
          notifications.length === 0 && "flex items-center justify-center h-32"
        )}>
          {notifications.length === 0 ? (
            <p className="text-gray-400 text-sm">No notifications</p>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id}
                className={cn(
                  "px-4 py-3 border-b border-gray-800 last:border-b-0 hover:bg-gray-900/50 cursor-pointer transition-colors",
                  !notification.read && "bg-gray-900"
                )}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "h-2 w-2 mt-2 rounded-full flex-shrink-0",
                    notification.type === 'success' && "bg-green-500",
                    notification.type === 'error' && "bg-red-500",
                    notification.type === 'info' && "bg-blue-500"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm",
                      notification.read ? "text-gray-300" : "text-white"
                    )}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimestamp(notification.timestamp)}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 bg-primary-100 rounded-full" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell; 