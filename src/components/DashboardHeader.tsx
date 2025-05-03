import React from "react";

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
    <header className="w-full bg-white border-b border-gray-200 shadow-sm px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <span className="font-extrabold text-2xl text-blue-700 tracking-tight">MedConnect</span>
        {pageTitle && (
          <span className="font-bold text-xl text-gray-900">{pageTitle}</span>
        )}
      </div>
      <div className="flex items-center gap-4">
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