import { Message, TutorState } from '../types';

export const validateMessage = (message: Partial<Message>): message is Message => {
  return (
    typeof message.id === 'string' &&
    typeof message.content === 'string' &&
    ['user', 'assistant', 'system'].includes(message.role as string) &&
    message.timestamp instanceof Date
  );
};

export const validateTutorState = (state: any): state is TutorState => {
  return (
    typeof state === 'object' &&
    typeof state.attempt_number === 'number' &&
    typeof state.hint_level === 'number' &&
    typeof state.misconception === 'string'
  );
};

export const sanitizeInput = (input: string): string => {
  // Basic HTML sanitization
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const validateEnvironment = (): boolean => {
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];
  
  return requiredEnvVars.every(varName => {
    const value = import.meta.env[varName];
    if (!value) {
      console.error(`Missing required environment variable: ${varName}`);
      return false;
    }
    return true;
  });
};
