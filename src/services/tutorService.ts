import { EDGE_FUNCTION_URL } from '../config/constants';
import { TutorResponse, Message, TutorState } from '../types';

export class TutorService {
  private static instance: TutorService;
  
  static getInstance(): TutorService {
    if (!TutorService.instance) {
      TutorService.instance = new TutorService();
    }
    return TutorService.instance;
  }

  async sendMessage(
    messages: Message[],
    topic: string,
    state: TutorState,
    model: string = 'gpt-4o-mini'
  ): Promise<TutorResponse> {
    try {
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          topic,
          state,
          model
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending message to tutor:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to communicate with the tutor: ${errorMessage}`);
    }
  }
}

export const tutorService = TutorService.getInstance();
