import React from "react";
import MedConnectLogo from "./MedConnectLogo";
import Link from "next/link";

interface DashboardHeaderProps {
  pageTitle?: string;
  userName: string;
  userInitials: string;
  avatarUrl?: string | null;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  pageTitle,
  userName,
  userInitials,
  avatarUrl,
}) => {
  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm px-4 md:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
          <MedConnectLogo size={32} className="flex-shrink-0" />
          <span className="font-extrabold text-xl md:text-2xl text-blue-700 tracking-tight">MedConnect</span>
        </Link>
        {pageTitle && (
          <span className="font-bold text-lg md:text-xl text-gray-900 hidden sm:block">{pageTitle}</span>
        )}
      </div>
      <div className="flex items-center gap-3 md:gap-4">
        <span className="text-gray-900 font-medium hidden md:block">{userName}</span>
        {avatarUrl ? (
          <img src={avatarUrl} alt={userInitials} className="w-10 h-10 rounded-full object-cover border" />
        ) : (
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg border">
            {userInitials}
          </div>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader; 