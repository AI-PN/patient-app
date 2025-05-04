import React from 'react';
import Link from 'next/link';
import { HomeIcon, CalendarDaysIcon, ClipboardDocumentListIcon, UserCircleIcon, DocumentTextIcon } from '@heroicons/react/24/solid'; // Use solid icons for active state feel
import { usePathname } from 'next/navigation'; // Use next/navigation for App Router

const navItems = [
  { label: 'Dashboard', href: '/', icon: HomeIcon },
  { label: 'Appointments', href: '/appointments', icon: CalendarDaysIcon },
  { label: 'Reports', href: '/medical-records', icon: DocumentTextIcon },
  { label: 'Prescriptions', href: '/prescriptions', icon: ClipboardDocumentListIcon },
  { label: 'Profile', href: '/profile', icon: UserCircleIcon },
];

const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 block border-t border-gray-200 bg-white shadow-lg lg:hidden">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 pt-1 text-center text-xs font-medium transition-colors ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}
              `}
            >
              <item.icon className={`h-6 w-6 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav; 