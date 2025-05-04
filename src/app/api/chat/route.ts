import { Message } from 'ai';
import { supabase } from '@/utils/supabaseClient';

export const runtime = 'edge';

/**
 * Simple proxy to Ollama API that can be used if direct browser calls to Ollama aren't possible.
 * Currently this is not being used as we're making direct calls to Ollama from the client,
 * but keeping this as a fallback option.
 */
export async function POST(req: Request) {
  console.log("Chat API called - This is now a proxy that forwards requests to Ollama");
  
  try {
    // Extract the request body
    const requestData = await req.json();
    
    // Forward the request to Ollama
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    // If we got a response, stream it back to the client
    if (response.ok) {
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    } else {
      // If there was an error, return it
      const errorText = await response.text();
      console.error('Ollama API error:', errorText);
      return new Response(JSON.stringify({ error: 'Failed to communicate with Ollama service' }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(JSON.stringify({ error: 'An error occurred during chat processing' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 