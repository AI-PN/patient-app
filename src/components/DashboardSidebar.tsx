import React from "react";
import { HomeIcon, ChatBubbleLeftRightIcon, DocumentTextIcon, ClipboardDocumentListIcon, CalendarDaysIcon, UserCircleIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";

const navItems = [
  { label: "Dashboard", icon: HomeIcon },
  { label: "Chat History", icon: ChatBubbleLeftRightIcon },
  { label: "Medical Reports", icon: DocumentTextIcon },
  { label: "Prescriptions", icon: ClipboardDocumentListIcon },
  { label: "Appointments", icon: CalendarDaysIcon },
  { label: "My Profile", icon: UserCircleIcon },
  { label: "Settings", icon: Cog6ToothIcon },
];

interface DashboardSidebarProps {
  activeItem?: string;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ElementType;
  active: boolean;
}> = ({ label, icon: Icon, active }) => (
  <li
    className={`flex items-center gap-3 px-4 py-2 my-1 rounded-xl cursor-pointer transition-colors text-base font-medium
      ${active ? "bg-blue-100 text-blue-700 font-bold" : "bg-transparent text-gray-600 hover:bg-blue-50"}`}
  >
    <Icon className={`w-5 h-5 ${active ? "text-blue-600" : "text-gray-400"}`} />
    <span>{label}</span>
  </li>
);

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ activeItem = "Dashboard" }) => {
  return (
    <nav className="bg-[#F7FBFF] rounded-2xl min-h-full w-64 flex flex-col justify-between py-10 px-6 gap-4 shadow-md">
      <div>
        <ul className="flex flex-col gap-2">
          {navItems.map((item) => (
            <NavItem key={item.label} label={item.label} icon={item.icon} active={item.label === activeItem} />
          ))}
        </ul>
      </div>
      {/* Patient Navigator Card */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center gap-2 mt-8">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg border">SJ</div>
        <div className="font-semibold text-gray-900 text-base">Dr. Sarah Johnson</div>
        <div className="text-xs text-green-600 font-medium mb-2">Available now</div>
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition text-sm">Start Chat</button>
      </div>
    </nav>
  );
};

export default DashboardSidebar; 