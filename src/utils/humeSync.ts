/**
 * Utility functions for syncing Hume voice conversations with our database
 */

/**
 * Fetches voice conversation history from Hume API and syncs it with our database
 * @returns {Promise<boolean>} Success status
 */
export async function syncHumeConversations(): Promise<boolean> {
  try {
    console.log('Starting Hume conversation sync');
    const response = await fetch('/api/hume-history');
    
    if (!response.ok) {
      let errorMessage = 'Failed to sync with Hume';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (parseError) {
        // If JSON parsing fails, try to get the text
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      }
      console.error('Error response from Hume API:', errorMessage);
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('Successfully fetched data from Hume API:', data.history?.length || 0, 'conversations');
    return true;
  } catch (error) {
    console.error('Error syncing with Hume API:', error);
    return false;
  }
}

/**
 * Extracts a conversation ID from Hume message data
 * @param message Hume message object
 * @returns The conversation ID or null if not found
 */
export function extractConversationId(message: any): string | null {
  // Different patterns we might find in Hume data
  if (message.conversationId) {
    return message.conversationId;
  }
  
  if (message.id && typeof message.id === 'string') {
    // Try to extract from ID (format might be like "conv-123|msg-456")
    const idParts = message.id.split('|');
    if (idParts.length > 0 && idParts[0].startsWith('conv-')) {
      return idParts[0].replace('conv-', '');
    }
  }
  
  return null;
}

// Helper function to generate a valid UUID
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper function to check if a string is a valid UUID
export function isValidUUID(id: string) {
  if (!id || typeof id !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// Helper function to convert non-UUID IDs to valid UUIDs
export function ensureValidUUID(id: string | null | undefined): string {
  if (!id) return generateUUID();
  return isValidUUID(id) ? id : generateUUID();
} 