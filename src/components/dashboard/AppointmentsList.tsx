import React from "react";

interface AppointmentRowData {
  doctorName: string;
  dateTime: string;
  department: string;
  location: string;
  status: string;
  onView: () => void;
  onCancel: () => void;
}

interface AppointmentsListProps {
  appointments: AppointmentRowData[];
  loading?: boolean;
}

const statusConfig: Record<string, { color: string, bg: string, border: string, icon: string }> = {
  Upcoming: { 
    color: "text-blue-700", 
    bg: "bg-blue-50", 
    border: "border-blue-200",
    icon: "⏰"
  },
  Completed: { 
    color: "text-green-700", 
    bg: "bg-green-50", 
    border: "border-green-200",
    icon: "✓"
  },
  Cancelled: { 
    color: "text-red-700", 
    bg: "bg-red-50", 
    border: "border-red-200",
    icon: "✗" 
  },
};

const AppointmentCard: React.FC<AppointmentRowData> = ({ doctorName, dateTime, department, location, status, onView, onCancel }) => {
  const statusStyle = statusConfig[status] || { 
    color: "text-gray-700", 
    bg: "bg-gray-50", 
    border: "border-gray-200",
    icon: "•"
  };
  
  const dateParts = dateTime.split(',');
  const date = dateParts[0];
  const time = dateParts[1]?.trim() || '';
  
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow transition-shadow border border-gray-100 overflow-hidden">
      <div className="flex flex-col md:flex-row w-full">
        {/* Left colored status indicator */}
        <div className={`md:w-2 w-full h-2 md:h-auto ${statusStyle.bg} ${statusStyle.border}`}></div>
        
        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900">{doctorName}</h3>
              <p className="text-sm text-gray-500 mt-1">{department}</p>
            </div>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.color}`}>
              <span>{statusStyle.icon}</span> {status}
            </span>
          </div>
          
          <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{date}</span>
            </div>
            {time && (
              <div className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{time}</span>
              </div>
            )}
          </div>
          
          <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{location}</span>
          </div>
          
          <div className="mt-4 flex justify-end gap-2">
            <button 
              onClick={onView}
              className="px-3 py-1 bg-white border border-blue-200 text-blue-600 rounded-lg text-xs font-medium hover:bg-blue-50 transition-colors"
            >
              View Details
            </button>
            {status === "Upcoming" && (
              <button 
                onClick={onCancel}
                className="px-3 py-1 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AppointmentsList: React.FC<AppointmentsListProps> = ({ appointments, loading }) => {
  return (
    <div className="bg-transparent">
      {loading ? (
        <div className="text-gray-400 text-center py-8 bg-white rounded-xl shadow-sm border border-gray-100">Loading...</div>
      ) : appointments.length === 0 ? (
        <div className="text-gray-400 text-center py-8 bg-white rounded-xl shadow-sm border border-gray-100">No appointments</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {appointments.map((appt, idx) => (
            <AppointmentCard key={idx} {...appt} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentsList; 