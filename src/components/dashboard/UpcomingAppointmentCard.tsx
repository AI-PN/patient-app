import React from "react";
import Link from "next/link";

interface UpcomingAppointmentCardProps {
  doctorName: string;
  dateTime: string;
  department: string;
  location: string;
  status: string;
  appointmentId?: string;
}

const statusColors: Record<string, string> = {
  Upcoming: "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const UpcomingAppointmentCard: React.FC<UpcomingAppointmentCardProps> = ({
  doctorName,
  dateTime,
  department,
  location,
  status,
  appointmentId
}) => {
  const statusColorClass = 
    status === "Scheduled" || status === "Upcoming" 
      ? "bg-blue-100 text-blue-700" 
      : status === "Completed" 
        ? "bg-green-100 text-green-700" 
        : "bg-red-100 text-red-700";
        
  const linkHref = appointmentId 
    ? `/appointments?view=${appointmentId}` 
    : "/appointments";

  return (
    <Link href={linkHref} className="block">
      <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="mb-2 flex justify-between items-start">
          <div className="font-semibold text-gray-900 text-base mb-1">{doctorName}</div>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColorClass}`}>
            {status}
          </span>
        </div>
        <div className="text-sm text-gray-500 mb-1">{department}</div>
        <div className="text-xs text-gray-400 mb-1">{dateTime}</div>
        <div className="text-xs text-gray-400">{location}</div>
      </div>
    </Link>
  );
};

export default UpcomingAppointmentCard; 