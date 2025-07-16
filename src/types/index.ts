export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  agent?: 'socratic' | 'conversationalist' | 'explainer';
}

export interface TutorState {
  attempt_number: number;
  hint_level: number;
  misconception: string;
}

export interface TutorResponse {
  active_agent: 'socratic' | 'conversationalist' | 'explainer';
  combinedMessage: string;
  next_state: TutorState;
}

export interface ChatSession {
  id: string;
  topic: string;
  messages: Message[];
  state: TutorState;
  createdAt: Date;
  updatedAt: Date;
}

export interface TopicSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}
