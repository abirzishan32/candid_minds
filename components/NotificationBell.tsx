'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';

const NotificationBell = () => {
  const [hasNotifications, setHasNotifications] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (hasNotifications) {
      setHasNotifications(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={toggleNotifications}
        className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gray-800/50 hover:bg-gray-800 transition-colors duration-300 focus:outline-none group"
      >
        <Bell className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
        
        {hasNotifications && (
          <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-blue-500 animate-pulse">
            <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping"></span>
          </span>
        )}
        
        <div className="absolute inset-0 rounded-full border border-transparent group-hover:border-primary-100/30 duration-300 transform scale-75 group-hover:scale-100 opacity-0 group-hover:opacity-100"></div>
      </button>
      
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900/95 backdrop-blur-md border border-gray-800 rounded-xl shadow-lg shadow-black/30 z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-medium text-sm">Notifications</h3>
            <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-800 rounded-full">
              {hasNotifications ? "New" : "All read"}
            </span>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {/* Sample notifications */}
            {[
              {
                title: "Assessment Completed",
                message: "Your Frontend Developer skill assessment has been processed.",
                time: "10 minutes ago",
                isNew: true
              },
              {
                title: "Interview Feedback",
                message: "You received feedback on your recent JavaScript interview.",
                time: "2 hours ago",
                isNew: false
              },
              {
                title: "Weekly Challenge",
                message: "New system design challenge is available for practice.",
                time: "Yesterday",
                isNew: false
              }
            ].map((notification, index) => (
              <div 
                key={index} 
                className={`p-3 hover:bg-gray-800/50 border-b border-gray-800/50 transition-colors ${notification.isNew ? 'bg-blue-900/10' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${notification.isNew ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
                  <div>
                    <p className="text-white text-sm font-medium">{notification.title}</p>
                    <p className="text-gray-400 text-xs mt-1">{notification.message}</p>
                    <p className="text-gray-500 text-xs mt-2">{notification.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-2 border-t border-gray-800">
            <button className="w-full text-center py-2 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 