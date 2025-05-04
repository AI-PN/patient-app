-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  chat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR NOT NULL,
  navigator_id VARCHAR NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES chats(chat_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender VARCHAR NOT NULL CHECK (sender IN ('patient', 'navigator')),
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chats_patient_id ON chats(patient_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at); 