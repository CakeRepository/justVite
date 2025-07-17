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

// Gamification types
export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
  lessons: CourseLesson[];
  requirements: CourseRequirements;
  rewards: CourseRewards;
  created_at: string;
  updated_at: string;
}

export interface CourseLesson {
  id: number;
  title: string;
  description: string;
  questions: string[];
  completed?: boolean;
  score?: number;
}

export interface CourseRequirements {
  min_score: number;
  completion_criteria: string[];
}

export interface CourseRewards {
  xp: number;
  badge: string;
  unlock_courses: string[];
}

export interface UserProgress {
  id: string;
  user_id: string;
  course_id: string;
  current_lesson: number;
  completed_lessons: number[];
  total_score: number;
  completion_percentage: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'mastered';
  started_at: string;
  completed_at?: string;
  last_activity: string;
  streak_days: number;
  best_session_score: number;
  total_time_spent: number;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'score' | 'streak' | 'completion' | 'engagement' | 'mastery';
  criteria: Record<string, any>;
  reward_xp: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  progress: {
    current: number;
    target: number;
  };
  achievement?: Achievement;
}

export interface UserStats {
  user_id: string;
  level: number;
  total_xp: number;
  current_streak: number;
  best_streak: number;
  total_sessions: number;
  total_messages: number;
  average_score: number;
  courses_completed: number;
  achievements_earned: number;
  rank_position: number;
  created_at: string;
  updated_at: string;
}

export interface GameEvent {
  type: 'xp_gained' | 'level_up' | 'achievement_unlocked' | 'course_completed' | 'streak_milestone';
  data: any;
  timestamp: Date;
}

export interface LearningSession {
  id: string;
  course_id: string;
  lesson_id: number;
  user_id: string;
  score: number;
  time_spent: number;
  questions_asked: number;
  hints_used: number;
  completed: boolean;
  created_at: string;
}
