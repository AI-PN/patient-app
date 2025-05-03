import React from "react";

interface AppointmentDetailModalProps {
  open: boolean;
  appointment: {
    doctor: string;
    specialty?: string;
    avatarUrl?: string | null;
    date: string;
    time: string;
    location: string;
    department: string;
    status: string;
    notes?: string;
  } | null;
  onClose: () => void;
  onReschedule: () => void;
  onCancel: () => void;
}

const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({ open, appointment, onClose, onReschedule, onCancel }) => {
  if (!open || !appointment) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
        <div className="flex items-center gap-4 mb-4">
          {appointment.avatarUrl ? (
            <img src={appointment.avatarUrl} alt={appointment.doctor} className="w-14 h-14 rounded-full object-cover border" />
          ) : (
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl border">
              {appointment.doctor.charAt(0)}
            </div>
          )}
          <div>
            <div className="font-semibold text-gray-900 text-lg">{appointment.doctor}</div>
            {appointment.specialty && <div className="text-sm text-gray-500">{appointment.specialty}</div>}
          </div>
        </div>
        <div className="mb-2 text-sm text-gray-500">{appointment.department}</div>
        <div className="mb-2 text-base text-gray-900 font-medium">{appointment.date} &bull; {appointment.time}</div>
        <div className="mb-2 text-sm text-gray-500">Location: {appointment.location}</div>
        <div className="mb-2">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${appointment.status === "Upcoming" ? "bg-blue-100 text-blue-700" : appointment.status === "Completed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{appointment.status}</span>
        </div>
        {appointment.notes && <div className="mb-4 text-sm text-gray-700">Notes: {appointment.notes}</div>}
        <div className="flex gap-2 mt-4">
          {appointment.status === "Upcoming" && (
            <button onClick={onReschedule} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-lg text-sm">Reschedule</button>
          )}
          {appointment.status === "Upcoming" && (
            <button onClick={onCancel} className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-4 py-2 rounded-lg text-sm">Cancel</button>
          )}
          <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg text-sm ml-auto">Close</button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal; 