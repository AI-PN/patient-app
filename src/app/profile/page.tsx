"use client";

import React, { useState, useEffect } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardFooter from "@/components/DashboardFooter";
import { Switch } from "@headlessui/react";
import { CheckCircleIcon, ExclamationCircleIcon, PencilSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";
import MobileBottomNav from "@/components/MobileBottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/utils/supabaseClient";

// Demo data for sections that would typically come from API
const demoMedicalData = {
  bloodType: "O+",
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
  insurance: {
    provider: "Blue Cross Blue Shield",
    plan: "PPO",
    memberId: "XYZ123456789",
    group: "G9876543",
    policyHolder: "John Doe",
    relationship: "Self",
  },
};

// Profile section card component
const ProfileSectionCard: React.FC<{ 
  title: string; 
  onEdit?: () => void; 
  children: React.ReactNode;
  isEditable?: boolean;
}> = ({ title, onEdit, children, isEditable = true }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 relative border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {isEditable && onEdit && (
        <button 
          onClick={onEdit}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors text-sm font-semibold bg-blue-50 px-3 py-1.5 rounded-lg"
        >
          <PencilSquareIcon className="w-4 h-4" /> Edit
        </button>
      )}
    </div>
    {children}
  </div>
);

// Toggle component
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

// Modal component for editing
const EditModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// Form input component
const FormInput: React.FC<{
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = ({ label, type = "text", value, onChange, placeholder }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
);

// Form select component
const FormSelect: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}> = ({ label, value, onChange, options }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const ProfilePage: React.FC = () => {
  const { profile } = useAuth();
  
  // User editable profile state
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    phone: "(555) 123-4567",
    address: "123 Main Street, Apt 4B",
    city: "New York",
    state: "NY",
    zip: "10001",
    gender: "Male",
    dob: "1980-01-15",
    maritalStatus: "Married",
    language: "English",
    emergencyContactName: "Jane Doe",
    emergencyContactRelationship: "Spouse",
    emergencyContactPhone: "(555) 987-6543",
    emergencyContactEmail: "jane.doe@example.com",
  });

  // Modal states
  const [personalInfoModalOpen, setPersonalInfoModalOpen] = useState(false);
  const [contactInfoModalOpen, setContactInfoModalOpen] = useState(false);
  const [emergencyContactModalOpen, setEmergencyContactModalOpen] = useState(false);
  
  // Form states
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Notification toggles
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);

  // Load user data
  useEffect(() => {
    if (profile) {
      setUserProfile(prev => ({
        ...prev,
        name: profile.name || prev.name,
        email: profile.email || prev.email,
      }));
    }
  }, [profile]);

  // Get user initials for avatar
  const getInitials = () => {
    if (!userProfile.name) return "U";
    return userProfile.name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase();
  };

  // Save personal info
  const savePersonalInfo = async () => {
    setIsUpdating(true);
    try {
      // Here you would make an API call to update user data
      // For demo purposes, we'll just simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Close modal and show success message
      setPersonalInfoModalOpen(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Save contact info
  const saveContactInfo = async () => {
    setIsUpdating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setContactInfoModalOpen(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating contact info:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Save emergency contact
  const saveEmergencyContact = async () => {
    setIsUpdating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEmergencyContactModalOpen(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating emergency contact:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <DashboardHeader 
        userName={userProfile.name || "User"} 
        userInitials={getInitials()} 
        avatarUrl={null} 
      />
      <div className="flex-1 flex w-full">
        <DashboardSidebar activeItem="My Profile" patientName={userProfile.name} patientEmail={userProfile.email} />
        <main className="flex-1 bg-gray-50 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto lg:pb-8 pb-20">
          {updateSuccess && (
            <div className="fixed top-20 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50">
              Profile updated successfully!
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <ProfileSectionCard title="Personal Information" onEdit={() => setPersonalInfoModalOpen(true)}>
              <div className="flex flex-col sm:flex-row gap-6 items-center mb-4">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-3xl border-2 border-white shadow-md mb-2">
                    {getInitials()}
                  </div>
                  <span className="text-xs text-gray-400 cursor-pointer">Click to update photo</span>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-3">
                  <div>
                    <div className="text-xs text-gray-500">Full Name</div>
                    <div className="font-semibold text-gray-900">{userProfile.name || "Not provided"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Date of Birth</div>
                    <div className="font-semibold text-gray-900">{formatDate(userProfile.dob)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Gender</div>
                    <div className="font-semibold text-gray-900">{userProfile.gender}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Blood Type</div>
                    <div className="font-semibold text-gray-900">{demoMedicalData.bloodType}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Marital Status</div>
                    <div className="font-semibold text-gray-900">{userProfile.maritalStatus}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Language Preference</div>
                    <div className="font-semibold text-gray-900">{userProfile.language}</div>
                  </div>
                </div>
              </div>
            </ProfileSectionCard>

            {/* Contact Information */}
            <ProfileSectionCard title="Contact Information" onEdit={() => setContactInfoModalOpen(true)}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <div className="text-xs text-gray-500">Email Address</div>
                  <div className="font-semibold text-gray-900">{userProfile.email || "Not provided"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Phone Number</div>
                  <div className="font-semibold text-gray-900">{userProfile.phone}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-gray-500">Address</div>
                  <div className="font-semibold text-gray-900">{userProfile.address}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-gray-500">City, State, ZIP</div>
                  <div className="font-semibold text-gray-900">{`${userProfile.city}, ${userProfile.state} ${userProfile.zip}`}</div>
                </div>
              </div>
            </ProfileSectionCard>
          </div>

          {/* Medical Information */}
          <ProfileSectionCard title="Medical Information" isEditable={false}>
            <div className="mb-6">
              <div className="text-xs text-gray-500 mb-1">Allergies</div>
              <div className="flex gap-2 flex-wrap mb-4">
                {demoMedicalData.allergies.map((a) => (
                  <span key={a} className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">{a}</span>
                ))}
              </div>
              <div className="text-xs text-gray-500 mb-1">Current Medications</div>
              <ul className="list-disc ml-6 text-sm text-gray-900 mb-4">
                {demoMedicalData.medications.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
              <div className="text-xs text-gray-500 mb-1">Medical Conditions</div>
              <ul className="ml-0 text-sm text-gray-900 mb-4">
                {demoMedicalData.conditions.map((c, i) => (
                  <li key={i} className="flex items-center gap-1 mb-0.5">{c.icon}{c.label}</li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 p-4 bg-gray-50 rounded-lg">
              <div className="col-span-2 mb-2">
                <div className="font-medium text-sm text-gray-700">Emergency Contact</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Name</div>
                <div className="font-semibold text-gray-900">{userProfile.emergencyContactName}</div>
                <div className="text-xs text-gray-500 mt-2">Relationship</div>
                <div className="font-semibold text-gray-900">{userProfile.emergencyContactRelationship}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Phone Number</div>
                <div className="font-semibold text-gray-900">{userProfile.emergencyContactPhone}</div>
                <div className="text-xs text-gray-500 mt-2">Email</div>
                <div className="font-semibold text-gray-900">{userProfile.emergencyContactEmail}</div>
              </div>
              <div className="col-span-2 mt-2 flex justify-end">
                <button 
                  onClick={() => setEmergencyContactModalOpen(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1"
                >
                  <PencilSquareIcon className="w-4 h-4" /> Edit Emergency Contact
                </button>
              </div>
            </div>
          </ProfileSectionCard>

          {/* Insurance Information */}
          <ProfileSectionCard title="Insurance Information" isEditable={false}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <div className="text-xs text-gray-500">Insurance Provider</div>
                <div className="font-semibold text-gray-900">{demoMedicalData.insurance.provider}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Plan Type</div>
                <div className="font-semibold text-gray-900">{demoMedicalData.insurance.plan}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Member ID</div>
                <div className="font-semibold text-gray-900">{demoMedicalData.insurance.memberId}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Group Number</div>
                <div className="font-semibold text-gray-900">{demoMedicalData.insurance.group}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Policy Holder</div>
                <div className="font-semibold text-gray-900">{demoMedicalData.insurance.policyHolder}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Relationship to Policy Holder</div>
                <div className="font-semibold text-gray-900">{demoMedicalData.insurance.relationship}</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <p>To update insurance information, please contact your patient navigator.</p>
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
              <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-colors">
                Change Password
              </button>
            </div>
            <div className="mb-6">
              <div className="text-sm font-semibold text-gray-900 mb-2">Notification Preferences</div>
              <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-800">Email Notifications</span>
                    <p className="text-xs text-gray-500">Receive updates via email</p>
                  </div>
                  <Toggle enabled={emailNotif} onChange={setEmailNotif} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-800">SMS Notifications</span>
                    <p className="text-xs text-gray-500">Receive updates via text message</p>
                  </div>
                  <Toggle enabled={smsNotif} onChange={setSmsNotif} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-gray-800">Push Notifications</span>
                    <p className="text-xs text-gray-500">Receive updates on your device</p>
                  </div>
                  <Toggle enabled={pushNotif} onChange={setPushNotif} />
                </div>
              </div>
            </div>
            <div className="mb-2">
              <div className="text-sm font-semibold text-gray-900 mb-2">Data & Privacy</div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
                  Download My Medical Records
                </button>
                <button className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                  Delete My Account
                </button>
              </div>
            </div>
          </ProfileSectionCard>
        </main>
      </div>
      <DashboardFooter />
      <MobileBottomNav />

      {/* Edit Personal Information Modal */}
      <EditModal
        isOpen={personalInfoModalOpen}
        onClose={() => setPersonalInfoModalOpen(false)}
        title="Edit Personal Information"
      >
        <div className="space-y-4">
          <FormInput
            label="Full Name"
            value={userProfile.name}
            onChange={(value) => setUserProfile({ ...userProfile, name: value })}
            placeholder="Enter your full name"
          />
          <FormInput
            label="Date of Birth"
            type="date"
            value={userProfile.dob}
            onChange={(value) => setUserProfile({ ...userProfile, dob: value })}
          />
          <FormSelect
            label="Gender"
            value={userProfile.gender}
            onChange={(value) => setUserProfile({ ...userProfile, gender: value })}
            options={[
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
              { value: "Non-binary", label: "Non-binary" },
              { value: "Prefer not to say", label: "Prefer not to say" },
            ]}
          />
          <FormSelect
            label="Marital Status"
            value={userProfile.maritalStatus}
            onChange={(value) => setUserProfile({ ...userProfile, maritalStatus: value })}
            options={[
              { value: "Single", label: "Single" },
              { value: "Married", label: "Married" },
              { value: "Divorced", label: "Divorced" },
              { value: "Widowed", label: "Widowed" },
              { value: "Separated", label: "Separated" },
            ]}
          />
          <FormSelect
            label="Language Preference"
            value={userProfile.language}
            onChange={(value) => setUserProfile({ ...userProfile, language: value })}
            options={[
              { value: "English", label: "English" },
              { value: "Spanish", label: "Spanish" },
              { value: "French", label: "French" },
              { value: "Mandarin", label: "Mandarin" },
              { value: "Arabic", label: "Arabic" },
            ]}
          />
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setPersonalInfoModalOpen(false)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={savePersonalInfo}
              disabled={isUpdating}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </EditModal>

      {/* Edit Contact Information Modal */}
      <EditModal
        isOpen={contactInfoModalOpen}
        onClose={() => setContactInfoModalOpen(false)}
        title="Edit Contact Information"
      >
        <div className="space-y-4">
          <FormInput
            label="Email Address"
            type="email"
            value={userProfile.email}
            onChange={(value) => setUserProfile({ ...userProfile, email: value })}
            placeholder="Enter your email address"
          />
          <FormInput
            label="Phone Number"
            value={userProfile.phone}
            onChange={(value) => setUserProfile({ ...userProfile, phone: value })}
            placeholder="Enter your phone number"
          />
          <FormInput
            label="Address"
            value={userProfile.address}
            onChange={(value) => setUserProfile({ ...userProfile, address: value })}
            placeholder="Enter your street address"
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="City"
              value={userProfile.city}
              onChange={(value) => setUserProfile({ ...userProfile, city: value })}
              placeholder="City"
            />
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                label="State"
                value={userProfile.state}
                onChange={(value) => setUserProfile({ ...userProfile, state: value })}
                placeholder="State"
              />
              <FormInput
                label="ZIP Code"
                value={userProfile.zip}
                onChange={(value) => setUserProfile({ ...userProfile, zip: value })}
                placeholder="ZIP"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setContactInfoModalOpen(false)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveContactInfo}
              disabled={isUpdating}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </EditModal>

      {/* Edit Emergency Contact Modal */}
      <EditModal
        isOpen={emergencyContactModalOpen}
        onClose={() => setEmergencyContactModalOpen(false)}
        title="Edit Emergency Contact"
      >
        <div className="space-y-4">
          <FormInput
            label="Emergency Contact Name"
            value={userProfile.emergencyContactName}
            onChange={(value) => setUserProfile({ ...userProfile, emergencyContactName: value })}
            placeholder="Enter contact name"
          />
          <FormSelect
            label="Relationship"
            value={userProfile.emergencyContactRelationship}
            onChange={(value) => setUserProfile({ ...userProfile, emergencyContactRelationship: value })}
            options={[
              { value: "Spouse", label: "Spouse" },
              { value: "Parent", label: "Parent" },
              { value: "Child", label: "Child" },
              { value: "Sibling", label: "Sibling" },
              { value: "Friend", label: "Friend" },
              { value: "Other", label: "Other" },
            ]}
          />
          <FormInput
            label="Phone Number"
            value={userProfile.emergencyContactPhone}
            onChange={(value) => setUserProfile({ ...userProfile, emergencyContactPhone: value })}
            placeholder="Enter contact phone number"
          />
          <FormInput
            label="Email Address"
            type="email"
            value={userProfile.emergencyContactEmail}
            onChange={(value) => setUserProfile({ ...userProfile, emergencyContactEmail: value })}
            placeholder="Enter contact email address"
          />
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setEmergencyContactModalOpen(false)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveEmergencyContact}
              disabled={isUpdating}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70"
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </EditModal>
    </div>
  );
};

export default ProfilePage; 