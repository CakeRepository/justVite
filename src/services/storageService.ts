import { ChatSession, Message } from '../types';

const STORAGE_KEY = 'socratic_tutor_sessions';

export class StorageService {
  private static instance: StorageService;
  
  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  saveSessions(sessions: ChatSession[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error saving sessions:', error);
    }
  }

  loadSessions(): ChatSession[] {
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
      console.error('Error loading sessions:', error);
      return [];
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

  deleteSession(sessions: ChatSession[], sessionId: string): ChatSession[] {
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
