import React from "react";

interface PharmacyCardProps {
  name: string;
  address: string;
  phone: string;
  onContact: () => void;
}

const PharmacyCard: React.FC<PharmacyCardProps> = ({ name, address, phone, onContact }) => (
  <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-2 border border-gray-100">
    <div className="text-lg font-bold text-gray-900 mb-1">Preferred Pharmacy</div>
    <div className="font-semibold text-gray-800 text-base">{name}</div>
    <div className="text-sm text-gray-500">{address}</div>
    <div className="text-sm text-gray-500 mb-2">{phone}</div>
    <button
      onClick={onContact}
      className="w-fit bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition text-sm mt-2"
    >
      Contact Pharmacy
    </button>
  </div>
);

export default PharmacyCard; 