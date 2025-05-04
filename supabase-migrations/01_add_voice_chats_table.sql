-- Add voice chat support
CREATE TABLE IF NOT EXISTS voice_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  messages JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for patient_id
CREATE INDEX IF NOT EXISTS voice_chats_patient_id_idx ON voice_chats(patient_id);

-- Create RLS policies for voice_chats
ALTER TABLE voice_chats ENABLE ROW LEVEL SECURITY;

-- Create policy to allow patients to access only their own voice chat history
CREATE POLICY voice_chats_patient_access ON voice_chats
  FOR ALL
  USING (auth.uid()::text = patient_id::text);

-- Create policy for admin access
CREATE POLICY voice_chats_admin_access ON voice_chats
  FOR ALL
  USING (auth.jwt() ? 'admin_access'); 