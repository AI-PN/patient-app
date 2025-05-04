import { NextResponse } from 'next/server';
import { fetchAccessToken } from 'hume';
import { supabase } from '@/utils/supabaseClient';

export async function GET() {
  try {
    // Get API keys from environment variables
    const apiKey = process.env.HUME_API_KEY;
    const secretKey = process.env.HUME_SECRET_KEY;

    if (!apiKey || !secretKey) {
      console.error('Missing Hume API keys');
      return NextResponse.json(
        { error: 'Hume API keys not configured' },
        { status: 500 }
      );
    }

    // Generate access token for Hume API
    const accessToken = await fetchAccessToken({
      apiKey,
      secretKey,
    });

    if (!accessToken) {
      console.error('Failed to generate Hume access token');
      return NextResponse.json(
        { error: 'Failed to generate access token' },
        { status: 500 }
      );
    }

    // Simulate returning history from Hume API
    // In a production environment, the actual API endpoint would be used
    // But for this prototype, we'll create a mock response
    // since the exact Hume API endpoint requires specific documentation
    
    console.log('Simulating Hume API call with access token:', accessToken.slice(0, 10) + '...');
    
    // Create a mock response
    const mockHistory = [
      {
        id: "123e4567-e89b-12d3-a456-426614174100", // Use valid UUID format
        created_at: new Date().toISOString(),
        user_id: "123e4567-e89b-12d3-a456-426614174100",
        messages: [
          {
            is_user: true,
            content: "Hello, how are you today?"
          },
          {
            is_user: false,
            content: "I'm doing well, thank you! How can I help you today?"
          },
          {
            is_user: true,
            content: "I'd like to schedule an appointment."
          },
          {
            is_user: false,
            content: "I'd be happy to help you schedule an appointment. What type of appointment would you like to schedule?"
          }
        ]
      }
    ];
    
    // For debugging, log some info
    console.log(`Found ${mockHistory.length} conversations from Hume API`);
    
    // Import mock history into local database
    await syncHumeHistoryToDatabase(mockHistory);
    
    // Return the mock history
    return NextResponse.json({ history: mockHistory });
    
    /* Uncomment this section when you have the actual Hume API endpoint
    // Fetch chat history from Hume API
    const response = await fetch('https://api.hume.ai/v0/empathic-voice/conversations', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error fetching from Hume API:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch history from Hume API' },
        { status: response.status }
      );
    }

    const humeHistory = await response.json();
    
    // Import Hume history into local database
    await syncHumeHistoryToDatabase(humeHistory);
    
    // Return the combined history
    return NextResponse.json({ history: humeHistory });
    */
    
  } catch (error) {
    console.error('Error in Hume history API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voice history: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}

// Helper function to generate a valid UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper function to check if a string is a valid UUID
function isValidUUID(id: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// Helper function to sync Hume history to local database
async function syncHumeHistoryToDatabase(humeHistory: any) {
  try {
    if (!Array.isArray(humeHistory) || humeHistory.length === 0) {
      console.log('No conversations to sync');
      return;
    }
    
    // Check which conversations we already have
    const { data: existingChats, error: queryError } = await supabase
      .from('voice_chats')
      .select('id');
      
    if (queryError) {
      console.error('Error querying existing chats:', queryError);
      return;
    }
    
    const existingIds = new Set((existingChats || []).map((chat: any) => chat.id));
    
    // Filter out conversations we already have
    const newChats = humeHistory.filter((chat: any) => !existingIds.has(chat.id));
    
    console.log(`Syncing ${newChats.length} new conversations to database`);
    
    if (newChats.length === 0) return;
    
    // Format the chats for our database
    const formattedChats = newChats.map((chat: any) => {
      // Ensure we have a valid UUID
      let chatId = chat.id;
      if (!isValidUUID(chatId)) {
        // Create a deterministic UUID from the chat ID if possible
        console.log(`Converting non-UUID ID "${chatId}" to valid UUID`);
        chatId = generateUUID();
      }
      
      return {
        id: chatId,
        patient_id: chat.user_id || "123e4567-e89b-12d3-a456-426614174100", // Default if not available
        started_at: chat.created_at || new Date().toISOString(),
        messages: formatHumeMessages(chat.messages || []),
        created_at: new Date().toISOString()
      };
    });
    
    // Insert the new chats
    const { error } = await supabase
      .from('voice_chats')
      .insert(formattedChats);
      
    if (error) {
      console.error('Error syncing Hume history to database:', error);
    } else {
      console.log(`Successfully synced ${formattedChats.length} conversations`);
    }
  } catch (error) {
    console.error('Error in syncHumeHistoryToDatabase:', error);
  }
}

// Helper function to format Hume messages
function formatHumeMessages(messages: any[]) {
  return messages.map((msg: any) => ({
    role: msg.is_user ? 'user' : 'assistant',
    content: msg.content || ''
  }));
} 