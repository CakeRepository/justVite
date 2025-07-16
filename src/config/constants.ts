export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
export const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/multiagent-chat`;

export const DEFAULT_TUTOR_STATE = {
  attempt_number: 0,
  hint_level: 0,
  misconception: "none"
};

export const AGENT_COLORS = {
  socratic: 'text-blue-600',
  conversationalist: 'text-green-600',
  explainer: 'text-purple-600'
};

export const AGENT_ICONS = {
  socratic: '🤔',
  conversationalist: '😊',
  explainer: '💡'
};

export const TOPIC_SUGGESTIONS = [
  {
    id: '1',
    title: 'Photosynthesis',
    description: 'How plants convert sunlight into energy',
    category: 'Biology',
    difficulty: 'beginner' as const
  },
  {
    id: '2',
    title: 'Quadratic Equations',
    description: 'Solving ax² + bx + c = 0',
    category: 'Mathematics',
    difficulty: 'intermediate' as const
  },
  {
    id: '3',
    title: 'World War II Causes',
    description: 'Complex factors leading to global conflict',
    category: 'History',
    difficulty: 'advanced' as const
  },
  {
    id: '4',
    title: 'JavaScript Closures',
    description: 'Understanding scope and lexical environment',
    category: 'Programming',
    difficulty: 'intermediate' as const
  },
  {
    id: '5',
    title: 'Climate Change',
    description: 'Scientific evidence and environmental impact',
    category: 'Science',
    difficulty: 'intermediate' as const
  },
  {
    id: '6',
    title: 'Shakespearean Sonnets',
    description: 'Structure and themes in English poetry',
    category: 'Literature',
    difficulty: 'advanced' as const
  }
];
