"use client";

import React from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardFooter from "@/components/DashboardFooter";
import { Switch } from "@headlessui/react";
import { CheckCircleIcon, ExclamationCircleIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import MobileBottomNav from "@/components/MobileBottomNav";

const demoProfile = {
  name: "John Doe",
  initials: "JD",
  gender: "Male",
  dob: "January 15, 1980",
  bloodType: "O+",
  maritalStatus: "Married",
  language: "English",
  email: "john.doe@example.com",
  phone: "(555) 123-4567",
  address: "123 Main Street, Apt 4B",
  city: "New York, NY 10001",
  allergies: ["Penicillin", "Peanuts", "Shellfish"],
  medications: [
    "Lisinopril 10mg (1 tablet daily)",
    "Atorvastatin 20mg (1 tablet daily)",
    "Amoxicillin 500mg (3 times daily for 7 days)",
  ],
  conditions: [
    { label: "Hypertension (diagnosed 2020)", icon: <ExclamationCircleIcon className="w-4 h-4 text-red-500 inline mr-1" /> },
    { label: "Mild Asthma (since childhood)", icon: <CheckCircleIcon className="w-4 h-4 text-purple-500 inline mr-1" /> },
  ],
  emergencyContact: {
    name: "Jane Doe",
    relationship: "Spouse",
    phone: "(555) 987-6543",
    email: "jane.doe@example.com",
  },
  insurance: {
    provider: "Blue Cross Blue Shield",
    plan: "PPO",
    memberId: "XYZ123456789",
    group: "G9876543",
    policyHolder: "John Doe",
    relationship: "Self",
  },
};

const ProfileSectionCard: React.FC<{ title: string; onEdit?: () => void; children: React.ReactNode }>
  = ({ title, onEdit, children }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 relative">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {onEdit && (
        <button className="flex items-center gap-1 text-blue-600 hover:underline text-sm font-semibold">
          <PencilSquareIcon className="w-4 h-4" /> Edit
        </button>
      )}
    </div>
    {children}
  </div>
);

const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) => (
  <Switch
    checked={enabled}
    onChange={onChange}
    className={`${enabled ? "bg-blue-600" : "bg-gray-200"} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
  >
    <span
      className={`${enabled ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
    />
  </Switch>
);

const ProfilePage: React.FC = () => {
  // Notification toggles (demo state)
  const [emailNotif, setEmailNotif] = React.useState(true);
  const [smsNotif, setSmsNotif] = React.useState(true);
  const [pushNotif, setPushNotif] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7FBFF]">
      <DashboardHeader userName={demoProfile.name} userInitials={demoProfile.initials} avatarUrl={null} />
      <div className="flex-1 flex w-full">
        <DashboardSidebar activeItem="My Profile" />
        <main className="flex-1 bg-[#F7FBFF] p-6 md:p-8 flex flex-col gap-6 overflow-y-auto lg:pb-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* My Profile Card */}
            <ProfileSectionCard title="My Profile" onEdit={() => {}}>
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-3xl border mb-2 shadow">
                    {demoProfile.initials}
                  </div>
                  <span className="text-xs text-gray-400 cursor-pointer">Click to update photo</span>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-2">
                  <div>
                    <div className="text-xs text-gray-500">Full Name</div>
                    <div className="font-semibold text-gray-900">{demoProfile.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Date of Birth</div>
                    <div className="font-semibold text-gray-900">{demoProfile.dob}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Gender</div>
                    <div className="font-semibold text-gray-900">{demoProfile.gender}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Blood Type</div>
                    <div className="font-semibold text-gray-900">{demoProfile.bloodType}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Marital Status</div>
                    <div className="font-semibold text-gray-900">{demoProfile.maritalStatus}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Language Preference</div>
                    <div className="font-semibold text-gray-900">{demoProfile.language}</div>
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-400 text-right mt-2">Last updated: May 3, 2025</div>
            </ProfileSectionCard>

            {/* Contact Information */}
            <ProfileSectionCard title="Contact Information" onEdit={() => {}}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <div className="text-xs text-gray-500">Email Address</div>
                  <div className="font-semibold text-gray-900">{demoProfile.email}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Phone Number</div>
                  <div className="font-semibold text-gray-900">{demoProfile.phone}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-gray-500">Address</div>
                  <div className="font-semibold text-gray-900">{demoProfile.address}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-gray-500">City, State, ZIP</div>
                  <div className="font-semibold text-gray-900">{demoProfile.city}</div>
                </div>
              </div>
            </ProfileSectionCard>
          </div>

          {/* Medical Information */}
          <ProfileSectionCard title="Medical Information" onEdit={() => {}}>
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-1">Allergies</div>
              <div className="flex gap-2 flex-wrap mb-2">
                {demoProfile.allergies.map((a) => (
                  <span key={a} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">{a}</span>
                ))}
              </div>
              <div className="text-xs text-gray-500 mb-1">Current Medications</div>
              <ul className="list-disc ml-6 text-sm text-gray-900 mb-2">
                {demoProfile.medications.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
              <div className="text-xs text-gray-500 mb-1">Medical Conditions</div>
              <ul className="ml-0 text-sm text-gray-900 mb-2">
                {demoProfile.conditions.map((c, i) => (
                  <li key={i} className="flex items-center gap-1">{c.icon}{c.label}</li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              <div>
                <div className="text-xs text-gray-500">Emergency Contact</div>
                <div className="font-semibold text-gray-900">{demoProfile.emergencyContact.name}</div>
                <div className="text-xs text-gray-500">Relationship</div>
                <div className="font-semibold text-gray-900">{demoProfile.emergencyContact.relationship}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Phone Number</div>
                <div className="font-semibold text-gray-900">{demoProfile.emergencyContact.phone}</div>
                <div className="text-xs text-gray-500">Email</div>
                <div className="font-semibold text-gray-900">{demoProfile.emergencyContact.email}</div>
              </div>
            </div>
          </ProfileSectionCard>

          {/* Insurance Information */}
          <ProfileSectionCard title="Insurance Information" onEdit={() => {}}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <div className="text-xs text-gray-500">Insurance Provider</div>
                <div className="font-semibold text-gray-900">{demoProfile.insurance.provider}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Plan Type</div>
                <div className="font-semibold text-gray-900">{demoProfile.insurance.plan}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Member ID</div>
                <div className="font-semibold text-gray-900">{demoProfile.insurance.memberId}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Group Number</div>
                <div className="font-semibold text-gray-900">{demoProfile.insurance.group}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Policy Holder</div>
                <div className="font-semibold text-gray-900">{demoProfile.insurance.policyHolder}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Relationship to Policy Holder</div>
                <div className="font-semibold text-gray-900">{demoProfile.insurance.relationship}</div>
              </div>
            </div>
          </ProfileSectionCard>

          {/* Account Settings */}
          <ProfileSectionCard title="Account Settings">
            <div className="mb-6">
              <div className="text-sm font-semibold text-gray-900 mb-2">Change Password</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input 
                  type="password" 
                  placeholder="Current Password" 
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-base w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700" 
                />
                <input 
                  type="password" 
                  placeholder="New Password" 
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-base w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700" 
                />
                <input 
                  type="password" 
                  placeholder="Confirm New Password" 
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-base w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700" 
                />
              </div>
              <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg text-base">Change Password</button>
            </div>
            <div className="mb-6">
              <div className="text-sm font-semibold text-gray-900 mb-2">Notification Preferences</div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span>Email Notifications</span>
                  <Toggle enabled={emailNotif} onChange={setEmailNotif} />
                </div>
                <div className="flex items-center justify-between">
                  <span>SMS Notifications</span>
                  <Toggle enabled={smsNotif} onChange={setSmsNotif} />
                </div>
                <div className="flex items-center justify-between">
                  <span>Push Notifications</span>
                  <Toggle enabled={pushNotif} onChange={setPushNotif} />
                </div>
              </div>
            </div>
            <div className="mb-2">
              <div className="text-sm font-semibold text-gray-900 mb-2">Data & Privacy</div>
              <a href="#" className="text-blue-600 hover:underline text-sm font-semibold">Download My Medical Records</a>
              <br />
              <a href="#" className="text-red-600 hover:underline text-sm font-semibold">Delete My Account</a>
            </div>
          </ProfileSectionCard>
        </main>
      </div>
      <DashboardFooter />
      <MobileBottomNav />
    </div>
  );
};

export default ProfilePage; 