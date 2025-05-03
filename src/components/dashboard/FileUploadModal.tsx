import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { supabase } from '@/utils/supabaseClient';

interface FileUploadModalProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  onUploadSuccess: () => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({ 
  open, 
  onClose, 
  patientId, 
  onUploadSuccess 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('');
  const [doctor, setDoctor] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!reportName) {
      setError('Please enter a report name');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // 1. Upload file to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${patientId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('medical-records')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // 2. Get the URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from('medical-records')
        .getPublicUrl(filePath);

      // 3. Create record in reports table
      const { error: dbError } = await supabase
        .from('reports')
        .insert({
          name: reportName,
          patient_id: patientId,
          file_url: urlData.publicUrl,
          type: reportType,
          date: new Date().toISOString(),
          provider_name: doctor,
          status: 'Normal'
        });

      if (dbError) {
        throw dbError;
      }

      onUploadSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !uploading && onClose()}
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
                Upload Medical Report
              </Dialog.Title>
              <button
                type="button"
                className="rounded-md p-1 text-gray-400 hover:text-gray-500"
                onClick={() => !uploading && onClose()}
                disabled={uploading}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="reportName" className="block text-sm font-medium text-gray-700 mb-1">
                  Report Name *
                </label>
                <input
                  type="text"
                  id="reportName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  required
                  disabled={uploading}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <select
                  id="reportType"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  disabled={uploading}
                >
                  <option value="">Select a type</option>
                  <option value="Blood Test">Blood Test</option>
                  <option value="Imaging">Imaging</option>
                  <option value="Allergy Test">Allergy Test</option>
                  <option value="Vaccination">Vaccination</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor/Provider
                </label>
                <input
                  type="text"
                  id="doctor"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                  disabled={uploading}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                  File *
                </label>
                {file ? (
                  <div className="flex items-center gap-2 p-2 bg-blue-50 rounded border border-blue-100">
                    <DocumentArrowUpIcon className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                  </div>
                ) : (
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-300" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            onChange={handleFileChange}
                            disabled={uploading}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                    </div>
                  </div>
                )}
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
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default FileUploadModal; 