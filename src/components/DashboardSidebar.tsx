import React, { useState } from "react";
import Link from "next/link";
import { HomeIcon, ChatBubbleLeftRightIcon, DocumentTextIcon, ClipboardDocumentListIcon, CalendarDaysIcon, UserCircleIcon, PhoneIcon } from "@heroicons/react/24/outline";
import VoiceChatModal from "./dashboard/VoiceChatModal";

const navItems = [
  { label: "Dashboard", icon: HomeIcon, href: "/" },
  { label: "Chat History", icon: ChatBubbleLeftRightIcon, href: "/chat-history" },
  { label: "Voice History", icon: PhoneIcon, href: "/voice-history" },
  { label: "Medical Reports", icon: DocumentTextIcon, href: "/medical-records" },
  { label: "Prescriptions", icon: ClipboardDocumentListIcon, href: "/prescriptions" },
  { label: "Appointments", icon: CalendarDaysIcon, href: "/appointments" },
  { label: "My Profile", icon: UserCircleIcon, href: "/profile" },
];

interface DashboardSidebarProps {
  activeItem?: string;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ElementType;
  href: string;
  active: boolean;
}> = ({ label, icon: Icon, href, active }) => (
  <li>
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2 my-1 rounded-xl cursor-pointer transition-colors text-base font-medium
        ${active ? "bg-blue-100 text-blue-700 font-bold" : "bg-transparent text-gray-600 hover:bg-blue-50"}`}
    >
      <Icon className={`w-5 h-5 ${active ? "text-blue-600" : "text-gray-400"}`} />
      <span>{label}</span>
    </Link>
  </li>
);

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ activeItem = "Dashboard" }) => {
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);
  
  const startNewChat = () => {
    window.location.href = "/chat-history?new=true&navigator=Dr.%20Sarah%20Johnson";
  };

  return (
    <>
      <nav className="bg-[#F7FBFF] rounded-2xl min-h-full w-64 flex-col justify-between py-10 px-6 gap-4 shadow-md hidden lg:flex">
        <div>
          <ul className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavItem key={item.label} label={item.label} icon={item.icon} href={item.href} active={item.label === activeItem} />
            ))}
          </ul>
        </div>
        {/* Patient Navigator Card */}
        <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center gap-2 mt-8">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg border">SJ</div>
          <div className="font-semibold text-gray-900 text-base">Dr. Sarah Johnson</div>
          <div className="text-xs text-green-600 font-medium mb-2">Available now</div>
          <div className="flex gap-2 w-full">
            <button 
              onClick={startNewChat}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-2 rounded-lg transition text-sm">
              Start Chat
            </button>
            <button 
              onClick={() => setVoiceChatOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold p-2 rounded-lg transition text-sm"
              title="Start voice call"
            >
              <PhoneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Voice Chat Modal */}
      <VoiceChatModal
        open={voiceChatOpen}
        onClose={() => setVoiceChatOpen(false)}
        patientId="123e4567-e89b-12d3-a456-426614174100" // Default patient ID - should come from props
        navigatorName="Dr. Sarah Johnson"
      />
    </>
  );
};

export default DashboardSidebar; 