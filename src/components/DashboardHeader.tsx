import React, { useState, useEffect } from "react";
import MedConnectLogo from "./MedConnectLogo";
import Link from "next/link";
import { BellIcon, UserCircleIcon, CogIcon, ChevronDownIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

interface DashboardHeaderProps {
  pageTitle?: string;
  userName: string;
  userInitials: string;
  avatarUrl?: string | null;
}

interface Notification {
  id: number;
  message: string;
  read: boolean;
  time: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  pageTitle,
  userName,
  userInitials,
  avatarUrl,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Sample notifications - in a real app, these would come from props or a context
  // For now, let's not show any notifications by default unless there's actual data
  const notifications: Notification[] = [];

  // Simulate data loading
  useEffect(() => {
    // This would be replaced with actual data fetching
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Display name handling
  const displayName = userName === "Loading..." ? "Welcome" : userName;
  const displayInitials = userInitials === "U" || userInitials === "L" ? "MC" : userInitials;

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
          <MedConnectLogo size={32} className="flex-shrink-0" />
          <span className="font-extrabold text-xl md:text-2xl text-blue-700 tracking-tight">MedConnect</span>
        </Link>
        {pageTitle && (
          <span className="font-bold text-lg md:text-xl text-gray-900 hidden sm:block ml-6 pl-6 border-l border-gray-200">{pageTitle}</span>
        )}
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        {/* Help Button */}
        <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
          <QuestionMarkCircleIcon className="w-6 h-6" />
        </button>
        
        {/* Notifications */}
        <div className="relative">
          <button 
            className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <BellIcon className="w-6 h-6" />
            {notifications.length > 0 && notifications.some(n => !n.read) && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
            )}
          </button>
          
          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-50">
              <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {notifications.length > 0 && (
                  <button className="text-xs text-blue-600 hover:underline">Mark all as read</button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">No notifications</div>
                ) : (
                  notifications.map(notification => (
                    <div key={notification.id} className={`px-4 py-3 hover:bg-gray-50 border-l-4 ${notification.read ? 'border-transparent' : 'border-blue-500'}`}>
                      <div className="text-sm text-gray-900">{notification.message}</div>
                      <div className="text-xs text-gray-500 mt-1">{notification.time}</div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2 border-t border-gray-100">
                <Link href="/notifications" className="text-sm text-blue-600 hover:underline block text-center">
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* User Menu */}
        <div className="relative ml-2">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="text-gray-900 font-medium hidden md:block">{isLoading ? "Welcome" : displayName}</span>
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={displayInitials} 
                className="w-10 h-10 rounded-full object-cover border shadow-sm" 
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm transition-transform hover:scale-105">
                {displayInitials}
              </div>
            )}
            <ChevronDownIcon className="w-4 h-4 text-gray-500 hidden md:block" />
          </div>
          
          {/* User Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg py-2 border border-gray-200 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="font-semibold text-gray-900">{isLoading ? "Welcome" : displayName}</div>
                <div className="text-sm text-gray-500">Patient</div>
              </div>
              <div>
                <Link href="/profile" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50">
                  <UserCircleIcon className="w-5 h-5 text-gray-500" />
                  <span>My Profile</span>
                </Link>
                <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50">
                  <CogIcon className="w-5 h-5 text-gray-500" />
                  <span>Settings</span>
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
                <Link href="/help" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50">
                  <QuestionMarkCircleIcon className="w-5 h-5 text-gray-500" />
                  <span>Help & Support</span>
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
                <button 
                  className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-gray-50 w-full text-left"
                >
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader; 