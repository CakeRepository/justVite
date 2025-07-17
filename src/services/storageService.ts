import { ChatSession, Message } from '../types';
import { supabase } from '../config/supabase';

const STORAGE_KEY = 'socratic_tutor_sessions';

export class StorageService {
  private static instance: StorageService;
  
  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Migration helper: Load sessions from localStorage and save to Supabase
  async migrateSessions(): Promise<void> {
    try {
      const localSessions = this.loadLocalSessions();
      if (localSessions.length > 0) {
        await this.saveSessionsToSupabase(localSessions);
        // Clear localStorage after successful migration
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error migrating sessions:', error);
    }
  }

  // Load sessions from localStorage (for migration)
  private loadLocalSessions(): ChatSession[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      
      const sessions = JSON.parse(saved);
      return sessions.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Error loading local sessions:', error);
      return [];
    }
  }

  // Save sessions to Supabase
  private async saveSessionsToSupabase(sessions: ChatSession[]): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    for (const session of sessions) {
      await supabase.from('chat_sessions').upsert({
        id: session.id,
        user_id: user.id,
        topic: session.topic,
        messages: session.messages,
        state: session.state,
        created_at: session.createdAt.toISOString(),
        updated_at: session.updatedAt.toISOString()
      });
    }
  }

  // Load sessions from Supabase (authenticated users) or localStorage (fallback)
  async loadSessions(): Promise<ChatSession[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Load from Supabase for authenticated users
        const { data, error } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error loading sessions from Supabase:', error);
          return [];
        }

        return data?.map(session => ({
          id: session.id,
          topic: session.topic,
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })),
          state: session.state,
          createdAt: new Date(session.created_at),
          updatedAt: new Date(session.updated_at)
        })) || [];
      } else {
        // Fallback to localStorage for unauthenticated users
        return this.loadLocalSessions();
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      return [];
    }
  }

  // Save sessions to Supabase (authenticated users) or localStorage (fallback)
  async saveSessions(sessions: ChatSession[]): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Save to Supabase for authenticated users
        await this.saveSessionsToSupabase(sessions);
      } else {
        // Fallback to localStorage for unauthenticated users
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
      }
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  }

  // Save a single session
  async saveSession(session: ChatSession): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase.from('chat_sessions').upsert({
          id: session.id,
          user_id: user.id,
          topic: session.topic,
          messages: session.messages,
          state: session.state,
          created_at: session.createdAt.toISOString(),
          updated_at: session.updatedAt.toISOString()
        });
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  // Delete a session from Supabase
  async deleteSessionFromDB(sessionId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('chat_sessions')
          .delete()
          .eq('id', sessionId)
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  }

  createSession(topic: string): ChatSession {
    const now = new Date();
    return {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      topic,
      messages: [],
      state: {
        attempt_number: 0,
        hint_level: 0,
        misconception: "none"
      },
      createdAt: now,
      updatedAt: now
    };
  }

  updateSession(sessions: ChatSession[], sessionId: string, updates: Partial<ChatSession>): ChatSession[] {
    return sessions.map(session => 
      session.id === sessionId 
        ? { ...session, ...updates, updatedAt: new Date() }
        : session
    );
  }

  // Helper method for local array operations
  removeSessionFromArray(sessions: ChatSession[], sessionId: string): ChatSession[] {
    return sessions.filter(session => session.id !== sessionId);
  }

  addMessage(session: ChatSession, message: Omit<Message, 'id' | 'timestamp'>): Message {
    const newMessage: Message = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    session.messages.push(newMessage);
    session.updatedAt = new Date();

    return newMessage;
  }
}

export const storageService = StorageService.getInstance();
