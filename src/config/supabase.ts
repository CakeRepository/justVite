import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './constants';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database types (you can generate these with Supabase CLI)
export interface Database {
  public: {
    Tables: {
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          topic: string;
          messages: any[];
          state: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          topic: string;
          messages?: any[];
          state?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          topic?: string;
          messages?: any[];
          state?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: string;
          difficulty: string;
          topics: any[];
          lessons: any[];
          requirements: any;
          rewards: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          category: string;
          difficulty: string;
          topics?: any[];
          lessons?: any[];
          requirements?: any;
          rewards?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          category?: string;
          difficulty?: string;
          topics?: any[];
          lessons?: any[];
          requirements?: any;
          rewards?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_progress: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          current_lesson: number;
          completed_lessons: number[];
          total_score: number;
          completion_percentage: number;
          status: string;
          started_at: string;
          completed_at: string | null;
          last_activity: string;
          streak_days: number;
          best_session_score: number;
          total_time_spent: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          current_lesson?: number;
          completed_lessons?: number[];
          total_score?: number;
          completion_percentage?: number;
          status?: string;
          started_at?: string;
          completed_at?: string | null;
          last_activity?: string;
          streak_days?: number;
          best_session_score?: number;
          total_time_spent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_id?: string;
          current_lesson?: number;
          completed_lessons?: number[];
          total_score?: number;
          completion_percentage?: number;
          status?: string;
          started_at?: string;
          completed_at?: string | null;
          last_activity?: string;
          streak_days?: number;
          best_session_score?: number;
          total_time_spent?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          type: string;
          criteria: any;
          reward_xp: number;
          rarity: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          icon: string;
          type: string;
          criteria: any;
          reward_xp?: number;
          rarity?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          icon?: string;
          type?: string;
          criteria?: any;
          reward_xp?: number;
          rarity?: string;
          created_at?: string;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          earned_at: string;
          progress: any;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          earned_at?: string;
          progress?: any;
        };
        Update: {
          id?: string;
          user_id?: string;
          achievement_id?: string;
          earned_at?: string;
          progress?: any;
        };
      };
      user_stats: {
        Row: {
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
        };
        Insert: {
          user_id: string;
          level?: number;
          total_xp?: number;
          current_streak?: number;
          best_streak?: number;
          total_sessions?: number;
          total_messages?: number;
          average_score?: number;
          courses_completed?: number;
          achievements_earned?: number;
          rank_position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          level?: number;
          total_xp?: number;
          current_streak?: number;
          best_streak?: number;
          total_sessions?: number;
          total_messages?: number;
          average_score?: number;
          courses_completed?: number;
          achievements_earned?: number;
          rank_position?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
