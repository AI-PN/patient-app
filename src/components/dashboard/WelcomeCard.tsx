import React from "react";

interface WelcomeCardProps {
  userName: string;
  lastUpdated: string;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ userName, lastUpdated }) => {
  return (
    <section className="bg-white rounded-lg shadow p-6 flex flex-col gap-2 min-h-[120px]">
      <h2 className="text-xl font-semibold text-gray-900 mb-1">Hello, {userName}</h2>
      <div className="text-sm text-gray-500">Last updated: {lastUpdated}</div>
    </section>
  );
};

export default WelcomeCard; 