import React from "react";

interface UpcomingAppointmentCardProps {
  doctorName: string;
  dateTime: string;
  department: string;
  location: string;
  status: string;
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
}) => {
  return (
    <section className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 min-h-[120px]">
      <div className="text-sm text-gray-500 font-medium mb-1">Upcoming Appointment</div>
      <div className="font-semibold text-lg text-gray-900 mb-1">{doctorName}</div>
      <div className="text-sm text-gray-700 mb-1">{dateTime}</div>
      <div className="text-sm text-gray-500 mb-1">{department}</div>
      <div className="text-sm text-gray-400 mb-2">{location}</div>
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status] || "bg-gray-100 text-gray-500"}`}>{status}</span>
    </section>
  );
};

export default UpcomingAppointmentCard; 