import React, { useState } from "react";
import { PhoneIcon } from "@heroicons/react/24/outline";
import VoiceChatModal from './VoiceChatModal';

interface PatientNavigatorCardProps {
  navigatorName: string;
  navigatorStatus: string;
  avatarUrl?: string | null;
  onStartChat: () => void;
  patientId: string;
}

const PatientNavigatorCard: React.FC<PatientNavigatorCardProps> = ({
  navigatorName,
  navigatorStatus,
  avatarUrl,
  onStartChat,
  patientId,
}) => {
  const [voiceChatOpen, setVoiceChatOpen] = useState(false);

  return (
    <>
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
        <div className="flex gap-2">
          <button
            onClick={onStartChat}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition"
          >
            Start Chat
          </button>
          <button
            onClick={() => setVoiceChatOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold p-2 rounded-lg flex items-center justify-center transition"
            title="Start voice call"
          >
            <PhoneIcon className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Voice Chat Modal */}
      <VoiceChatModal
        open={voiceChatOpen}
        onClose={() => setVoiceChatOpen(false)}
        patientId={patientId}
        navigatorName={navigatorName}
      />
    </>
  );
};

export default PatientNavigatorCard; 