import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon, 
  DocumentTextIcon, 
  ClipboardDocumentListIcon, 
  CalendarDaysIcon, 
  UserCircleIcon, 
  PhoneIcon,
  HeartIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import { 
  HomeIcon as HomeIconSolid, 
  ChatBubbleLeftRightIcon as ChatIconSolid,
  DocumentTextIcon as DocumentIconSolid, 
  ClipboardDocumentListIcon as ClipboardIconSolid,
  CalendarDaysIcon as CalendarIconSolid,
  UserCircleIcon as UserIconSolid,
  PhoneIcon as PhoneIconSolid
} from "@heroicons/react/24/solid";
import VoiceChatModal from "./dashboard/VoiceChatModal";
import { usePathname } from "next/navigation";

interface NavItemType {
  label: string;
  icon: React.ElementType;
  activeIcon: React.ElementType;
  href: string;
  notification?: number;
}

const navItems: NavItemType[] = [
  { label: "Dashboard", icon: HomeIcon, activeIcon: HomeIconSolid, href: "/" },
  { label: "Chat History", icon: ChatBubbleLeftRightIcon, activeIcon: ChatIconSolid, href: "/chat-history" },
  { label: "Voice History", icon: PhoneIcon, activeIcon: PhoneIconSolid, href: "/voice-history" },
  { label: "Medical Reports", icon: DocumentTextIcon, activeIcon: DocumentIconSolid, href: "/medical-records", notification: 2 },
  { label: "Prescriptions", icon: ClipboardDocumentListIcon, activeIcon: ClipboardIconSolid, href: "/prescriptions" },
  { label: "Appointments", icon: CalendarDaysIcon, activeIcon: CalendarIconSolid, href: "/appointments", notification: 1 },
  { label: "My Profile", icon: UserCircleIcon, activeIcon: UserIconSolid, href: "/profile" },
];

interface DashboardSidebarProps {
  activeItem?: string;
  patientName?: string;
  patientPhoto?: string;
  patientEmail?: string;
  nextAppointment?: string;
  healthStatus?: string;
}

const NavItem: React.FC<{
  item: NavItemType;
  active: boolean;
}> = ({ item, active }) => {
  const Icon = active ? item.activeIcon : item.icon;
  
  return (
    <li>
      <Link
        href={item.href}
        className={`flex items-center gap-3 px-4 py-3 my-1 rounded-xl cursor-pointer transition-all duration-200 text-base font-medium group relative
          ${active 
            ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 font-semibold shadow-sm" 
            : "bg-transparent text-gray-600 hover:bg-blue-50"}`}
      >
        <Icon className={`w-5 h-5 transition-colors ${active ? "text-blue-600" : "text-gray-400 group-hover:text-blue-600"}`} />
        <span className="transition-colors group-hover:text-blue-700">{item.label}</span>
        
        {/* Notification indicator */}
        {item.notification && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {item.notification}
          </span>
        )}
        
        {/* Active indicator line */}
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
        )}
      </Link>
    </li>
  );
};

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ 
  activeItem = "Dashboard",
  patientName = "John Smith",
  patientPhoto,
  patientEmail = "patient@example.com",
  nextAppointment = "May 12",
  healthStatus = "Healthy"
}) => {
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname() || '';
  
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle patient name and email display
  const displayName = patientName === "Loading..." ? "John Smith" : patientName;
  const displayEmail = patientEmail === "patient@example.com" ? "patient@medconnect.com" : patientEmail;
  
  // Get patient initials for avatar
  const initials = displayName
    .split(' ')
    .map(name => name[0])
    .join('');
  
  const startNewChat = () => {
    window.location.href = "/chat-history?new=true&navigator=Dr.%20Sarah%20Johnson";
  };

  // Check if the path matches the item's href
  const isActive = (href: string): boolean => {
    if (href === "/") {
      return pathname === "/";
    }
    return href !== "/" && pathname.startsWith(href);
  };

  return (
    <>
      <nav className="bg-white border-r border-gray-100 rounded-r-2xl min-h-full w-72 flex-col justify-between py-6 gap-4 shadow-sm hidden lg:flex">
        {/* Patient info section */}
        <div className="px-6 pb-6 mb-2 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            {patientPhoto ? (
              <img src={patientPhoto} alt={displayName} className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-200" />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-sm">
                {isLoading ? "MC" : initials}
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <div className="font-semibold text-gray-900 text-base truncate">{isLoading ? "Welcome" : displayName}</div>
              <div className="text-xs text-gray-500 truncate">{isLoading ? "Loading..." : displayEmail}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-1">
            <div className="bg-blue-50 rounded-lg p-2 flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">Next Appt.</span>
              <span className="text-sm font-semibold text-blue-700">{nextAppointment}</span>
            </div>
            <div className="bg-green-50 rounded-lg p-2 flex flex-col items-center">
              <span className="text-xs text-gray-500 mb-1">Status</span>
              <span className={`text-sm font-semibold ${healthStatus === "Healthy" ? "text-green-700" : "text-amber-600"}`}>
                {healthStatus}
              </span>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="px-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 py-2">
          <div className="text-xs uppercase font-semibold text-gray-400 mb-2 ml-2">Main Menu</div>
          <ul className="flex flex-col gap-0.5">
            {navItems.map((item) => (
              <NavItem 
                key={item.label} 
                item={item} 
                active={isActive(item.href)} 
              />
            ))}
          </ul>
          
          {/* Health Section */}
          <div className="text-xs uppercase font-semibold text-gray-400 mt-6 mb-2 ml-2">Health</div>
          <ul className="flex flex-col gap-0.5">
            <li>
              <Link href="/vitals" className="flex items-center gap-3 px-4 py-3 my-1 rounded-xl cursor-pointer transition-all duration-200 text-base font-medium bg-transparent text-gray-600 hover:bg-blue-50 group">
                <ChartBarIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                <span className="transition-colors group-hover:text-blue-700">Vitals & Metrics</span>
              </Link>
            </li>
            <li>
              <Link href="/wellness" className="flex items-center gap-3 px-4 py-3 my-1 rounded-xl cursor-pointer transition-all duration-200 text-base font-medium bg-transparent text-gray-600 hover:bg-blue-50 group">
                <HeartIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                <span className="transition-colors group-hover:text-blue-700">Wellness</span>
              </Link>
            </li>
          </ul>
        </div>
        
        {/* Patient Navigator Card */}
        <div className="mx-6 mt-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-sm p-4 flex flex-col items-center gap-2">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-blue-700 font-bold text-lg border border-blue-200 shadow-sm">SJ</div>
          <div className="font-semibold text-gray-900 text-base">Dr. Sarah Johnson</div>
          <div className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium">Available now</div>
          <div className="flex gap-2 w-full mt-2">
            <button 
              onClick={startNewChat}
              className="flex-1 bg-white border border-blue-200 hover:bg-blue-50 text-blue-700 font-semibold px-3 py-2 rounded-lg transition text-sm shadow-sm"
            >
              Start Chat
            </button>
            <button 
              onClick={() => setVoiceChatOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold p-2 rounded-lg transition text-sm shadow-sm"
              title="Start voice call"
            >
              <PhoneIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Settings and Logout */}
        <div className="mt-6 px-6 pt-4 border-t border-gray-100">
          <ul className="flex flex-col gap-1">
            <li>
              <Link href="/settings" className="flex items-center gap-3 px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                <Cog6ToothIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm">Settings</span>
              </Link>
            </li>
            <li>
              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                <ArrowLeftOnRectangleIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm">Sign Out</span>
              </button>
            </li>
          </ul>
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