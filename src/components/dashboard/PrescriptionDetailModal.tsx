import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/utils/supabaseClient';

interface PrescriptionDetailModalProps {
  open: boolean;
  onClose: () => void;
  prescription: any;
  onRefill: (id: string) => void;
  onDownload: (id: string) => void;
}

const PrescriptionDetailModal: React.FC<PrescriptionDetailModalProps> = ({
  open,
  onClose,
  prescription,
  onRefill,
  onDownload
}) => {
  const [refilling, setRefilling] = useState(false);
  
  const handleRefill = async () => {
    if (!prescription?.id) return;
    
    setRefilling(true);
    try {
      await onRefill(prescription.id);
    } finally {
      setRefilling(false);
    }
  };
  
  if (!prescription) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/25" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title
                as="h3"
                className="text-xl font-semibold leading-6 text-gray-900"
              >
                Prescription Details
              </Dialog.Title>
              <button
                type="button"
                className="rounded-md p-1 text-gray-400 hover:text-gray-500"
                onClick={onClose}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{prescription.name}</h4>
                  <p className="text-sm text-gray-500">{prescription.prescribedBy || 'Unknown doctor'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h5 className="text-xs text-gray-500 uppercase mb-1">Dosage</h5>
                  <p className="text-gray-700">{prescription.dosage}</p>
                </div>
                <div>
                  <h5 className="text-xs text-gray-500 uppercase mb-1">Frequency</h5>
                  <p className="text-gray-700">{prescription.frequency}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h5 className="text-xs text-gray-500 uppercase mb-1">Date Prescribed</h5>
                  <p className="text-gray-700">{prescription.prescribedOn}</p>
                </div>
                <div>
                  <h5 className="text-xs text-gray-500 uppercase mb-1">Status</h5>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    prescription.status === 'Active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {prescription.status}
                  </span>
                </div>
              </div>
              
              {prescription.instructions && (
                <div className="mb-4">
                  <h5 className="text-xs text-gray-500 uppercase mb-1">Instructions</h5>
                  <p className="text-gray-700 text-sm">{prescription.instructions}</p>
                </div>
              )}
              
              <div className="mb-4">
                <h5 className="text-xs text-gray-500 uppercase mb-1">Pharmacy</h5>
                <p className="text-gray-700 text-sm">{prescription.pharmacy || 'City Health Pharmacy'}</p>
              </div>
              
              {prescription.notes && (
                <div className="mb-4">
                  <h5 className="text-xs text-gray-500 uppercase mb-1">Notes</h5>
                  <p className="text-gray-700 text-sm">{prescription.notes}</p>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => onDownload(prescription.id)}
              >
                Download
              </button>
              
              {prescription.status === 'Active' && (
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                  onClick={handleRefill}
                  disabled={refilling}
                >
                  {refilling ? 'Processing...' : 'Request Refill'}
                </button>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default PrescriptionDetailModal; 