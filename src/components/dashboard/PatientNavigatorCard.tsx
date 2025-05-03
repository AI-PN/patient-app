import React from "react";

interface PatientNavigatorCardProps {
  navigatorName: string;
  navigatorStatus: string;
  avatarUrl?: string | null;
  onStartChat: () => void;
}

const PatientNavigatorCard: React.FC<PatientNavigatorCardProps> = ({
  navigatorName,
  navigatorStatus,
  avatarUrl,
  onStartChat,
}) => {
  return (
    <section className="bg-white rounded-lg shadow p-6 flex flex-col gap-4 min-h-[120px]">
      <div className="flex items-center gap-4">
        {avatarUrl ? (
          <img src={avatarUrl} alt={navigatorName} className="w-12 h-12 rounded-full object-cover border" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg border">
            {navigatorName.charAt(0)}
          </div>
        )}
        <div>
          <div className="font-semibold text-gray-900 text-lg">{navigatorName}</div>
          <div className="text-sm text-green-600 font-medium">{navigatorStatus}</div>
        </div>
      </div>
      <button
        onClick={onStartChat}
        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition"
      >
        Start Chat
        {/* Icon placeholder */}
        <span className="w-4 h-4 bg-white/20 rounded-full" />
      </button>
    </section>
  );
};

export default PatientNavigatorCard; 