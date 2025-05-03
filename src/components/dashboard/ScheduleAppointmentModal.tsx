import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/utils/supabaseClient';

interface ScheduleAppointmentModalProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  onScheduleSuccess: () => void;
}

const ScheduleAppointmentModal: React.FC<ScheduleAppointmentModalProps> = ({
  open,
  onClose,
  patientId,
  onScheduleSuccess
}) => {
  const [doctor, setDoctor] = useState('');
  const [department, setDepartment] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [doctors, setDoctors] = useState<any[]>([]);
  
  // Fetch available doctors on modal open
  useEffect(() => {
    if (open) {
      fetchDoctors();
    }
  }, [open]);
  
  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('*');
        
      if (error) throw error;
      if (data) setDoctors(data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!doctor || !department || !date || !time || !location) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Format datetime for database
      const scheduledAt = new Date(`${date}T${time}`).toISOString();
      
      // Get care plan ID for this patient
      const { data: carePlans } = await supabase
        .from('care_plans')
        .select('care_plan_id')
        .eq('patient_id', patientId)
        .limit(1);
        
      let carePlanId = null;
      if (carePlans && carePlans.length > 0) {
        carePlanId = carePlans[0].care_plan_id;
      } else {
        // Create a care plan if one doesn't exist
        const { data: newCarePlan, error: carePlanError } = await supabase
          .from('care_plans')
          .insert({
            patient_id: patientId,
            department: department,
            created_at: new Date().toISOString()
          })
          .select();
          
        if (carePlanError) throw carePlanError;
        if (newCarePlan) carePlanId = newCarePlan[0].care_plan_id;
      }
      
      // Create the appointment
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: patientId,
          care_plan_id: carePlanId,
          provider_id: doctor, // Assuming doctor is the provider's ID
          scheduled_at: scheduledAt,
          location: location,
          status: 'Upcoming',
          notes: notes || null
        });
        
      if (appointmentError) throw appointmentError;
      
      onScheduleSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error scheduling appointment');
    } finally {
      setLoading(false);
    }
  };

  // Generate time slots from 8am to 5pm
  const timeSlots = Array.from({ length: 19 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  // Get tomorrow's date as default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/25" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900"
              >
                Schedule New Appointment
              </Dialog.Title>
              <button
                type="button"
                className="rounded-md p-1 text-gray-400 hover:text-gray-500"
                onClick={() => !loading && onClose()}
                disabled={loading}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor *
                </label>
                <select
                  id="doctor"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Select a doctor</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} - {doc.specialty || 'General'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Department *
                </label>
                <select
                  id="department"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  disabled={loading}
                >
                  <option value="">Select a department</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Family Medicine">Family Medicine</option>
                  <option value="Internal Medicine">Internal Medicine</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Obstetrics & Gynecology">Obstetrics & Gynecology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Psychiatry">Psychiatry</option>
                  <option value="Surgery">Surgery</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="mb-4">
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    id="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={defaultDate}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                    Time *
                  </label>
                  <select
                    id="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                    disabled={loading}
                  >
                    <option value="">Select a time</option>
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Medical Center, Room 203"
                  required
                  disabled={loading}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Any additional information"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="mb-4 p-2 text-sm text-red-700 bg-red-100 rounded-md">
                  {error}
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center gap-1"
                  disabled={loading}
                >
                  <CalendarDaysIcon className="h-4 w-4" />
                  {loading ? 'Scheduling...' : 'Schedule Appointment'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default ScheduleAppointmentModal; 