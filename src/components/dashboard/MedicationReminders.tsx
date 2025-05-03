import React from "react";

interface Reminder {
  name: string;
  time: string;
  enabled: boolean;
  onToggle: () => void;
}

interface MedicationRemindersProps {
  reminders: Reminder[];
}

const MedicationReminders: React.FC<MedicationRemindersProps> = ({ reminders }) => (
  <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4 border border-gray-100">
    <div className="text-lg font-bold text-gray-900 mb-1">Medication Reminders</div>
    {reminders.length === 0 ? (
      <div className="text-gray-400 text-center py-4">No reminders set</div>
    ) : (
      <div className="flex flex-col gap-3">
        {reminders.map((reminder, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <div className="font-semibold text-gray-900 text-base">{reminder.name}</div>
              <div className="text-sm text-gray-500">{reminder.time}</div>
            </div>
            <button
              onClick={reminder.onToggle}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${reminder.enabled ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}
            >
              {reminder.enabled ? "Enabled" : "Disabled"}
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default MedicationReminders; 