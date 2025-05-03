import React from "react";

const DashboardFooter: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-center rounded-b-lg text-sm text-gray-500">
      {/* Placeholder: Add copyright, links, or footer info as per Figma */}
      © {new Date().getFullYear()} Healthcare App. All rights reserved.
    </footer>
  );
};

export default DashboardFooter; 