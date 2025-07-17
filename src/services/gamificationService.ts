import { supabase } from '../config/supabase';
import { 
  Course, 
  UserProgress, 
  Achievement, 
  UserAchievement, 
  UserStats, 
  GameEvent, 
  LearningSession 
} from '../types';

export class GamificationService {
  private static instance: GamificationService;

  static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }

  // Course management
  async getCourses(): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('difficulty', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async getCourse(id: string): Promise<Course | null> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async getCoursesByCategory(category: string): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('category', category)
      .order('difficulty', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  // User progress management
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .order('last_activity', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getCourseProgress(userId: string, courseId: string): Promise<UserProgress | null> {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async startCourse(userId: string, courseId: string): Promise<UserProgress> {
    const { data, error } = await supabase
      .from('user_progress')
      .insert({
        user_id: userId,
        course_id: courseId,
        status: 'in_progress',
        current_lesson: 0,
        completed_lessons: [],
        total_score: 0,
        completion_percentage: 0,
        streak_days: 0,
        best_session_score: 0,
        total_time_spent: 0
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateProgress(userId: string, courseId: string, updates: Partial<UserProgress>): Promise<UserProgress> {
    const { data, error } = await supabase
      .from('user_progress')
      .update({
        ...updates,
        last_activity: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async completeLesson(
    userId: string, 
    courseId: string, 
    lessonId: number, 
    score: number, 
    timeSpent: number
  ): Promise<{ progress: UserProgress; events: GameEvent[] }> {
    const events: GameEvent[] = [];
    
    // Get current progress
    const currentProgress = await this.getCourseProgress(userId, courseId);
    if (!currentProgress) {
      throw new Error('Course not started');
    }

    // Update completed lessons
    const completedLessons = [...currentProgress.completed_lessons];
    if (!completedLessons.includes(lessonId)) {
      completedLessons.push(lessonId);
    }

    // Get course to calculate completion percentage
    const course = await this.getCourse(courseId);
    if (!course) throw new Error('Course not found');

    const completionPercentage = Math.round((completedLessons.length / course.lessons.length) * 100);
    const totalScore = currentProgress.total_score + score;
    const bestSessionScore = Math.max(currentProgress.best_session_score, score);
    const totalTimeSpent = currentProgress.total_time_spent + timeSpent;

    // Update progress
    const updatedProgress = await this.updateProgress(userId, courseId, {
      completed_lessons: completedLessons,
      current_lesson: Math.max(currentProgress.current_lesson, lessonId + 1),
      total_score: totalScore,
      completion_percentage: completionPercentage,
      best_session_score: bestSessionScore,
      total_time_spent: totalTimeSpent,
      status: completionPercentage === 100 ? 'completed' : 'in_progress'
    });

    // Award XP and check for achievements
    const xpGained = this.calculateXP(score, lessonId, course.difficulty);
    await this.awardXP(userId, xpGained);
    
    events.push({
      type: 'xp_gained',
      data: { amount: xpGained, reason: 'lesson_completion' },
      timestamp: new Date()
    });

    // Check for course completion
    if (completionPercentage === 100) {
      await this.awardXP(userId, course.rewards.xp);
      events.push({
        type: 'course_completed',
        data: { courseId, courseName: course.title, bonus_xp: course.rewards.xp },
        timestamp: new Date()
      });
    }

    // Check for achievements
    const newAchievements = await this.checkAchievements(userId, {
      score,
      lessonCompleted: true,
      courseCompleted: completionPercentage === 100,
      timeSpent
    });

    newAchievements.forEach(achievement => {
      events.push({
        type: 'achievement_unlocked',
        data: achievement,
        timestamp: new Date()
      });
    });

    return { progress: updatedProgress, events };
  }

  // Achievement system
  async getAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .order('rarity', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('user_id', userId)
      .order('earned_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async checkAchievements(userId: string, context: any): Promise<Achievement[]> {
    const achievements = await this.getAchievements();
    const userAchievements = await this.getUserAchievements(userId);
    const earnedAchievementIds = userAchievements.map(ua => ua.achievement_id);
    
    const newAchievements: Achievement[] = [];
    
    for (const achievement of achievements) {
      if (earnedAchievementIds.includes(achievement.id)) continue;
      
      const isEarned = await this.evaluateAchievement(userId, achievement, context);
      if (isEarned) {
        await this.awardAchievement(userId, achievement.id);
        newAchievements.push(achievement);
      }
    }
    
    return newAchievements;
  }

  private async evaluateAchievement(userId: string, achievement: Achievement, context: any): Promise<boolean> {
    const stats = await this.getUserStats(userId);
    
    switch (achievement.type) {
      case 'score':
        return context.score >= achievement.criteria.min_score;
      
      case 'completion':
        if (achievement.criteria.courses_completed) {
          return stats.courses_completed >= achievement.criteria.courses_completed;
        }
        return context.courseCompleted;
      
      case 'engagement':
        if (achievement.criteria.sessions_completed) {
          return stats.total_sessions >= achievement.criteria.sessions_completed;
        }
        if (achievement.criteria.messages_in_session) {
          return context.messagesInSession >= achievement.criteria.messages_in_session;
        }
        return false;
      
      case 'streak':
        return stats.current_streak >= achievement.criteria.streak_days;
      
      case 'mastery':
        if (achievement.criteria.socratic_interactions) {
          return context.socraticInteractions >= achievement.criteria.socratic_interactions;
        }
        return false;
      
      default:
        return false;
    }
  }

  private async awardAchievement(userId: string, achievementId: string): Promise<void> {
    const { error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
        earned_at: new Date().toISOString(),
        progress: { current: 1, target: 1 }
      });
    
    if (error) throw error;
    
    // Award XP for achievement
    const achievement = await supabase
      .from('achievements')
      .select('reward_xp')
      .eq('id', achievementId)
      .single();
    
    if (achievement.data) {
      await this.awardXP(userId, achievement.data.reward_xp);
    }
  }

  // User stats and XP system
  async getUserStats(userId: string): Promise<UserStats> {
    let { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // Create initial stats if they don't exist
      const { data: newStats, error: insertError } = await supabase
        .from('user_stats')
        .insert({
          user_id: userId,
          level: 1,
          total_xp: 0,
          current_streak: 0,
          best_streak: 0,
          total_sessions: 0,
          total_messages: 0,
          average_score: 0,
          courses_completed: 0,
          achievements_earned: 0,
          rank_position: 0
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      return newStats;
    }
    
    if (error) throw error;
    return data;
  }

  async awardXP(userId: string, amount: number): Promise<{ levelUp: boolean; newLevel?: number }> {
    const stats = await this.getUserStats(userId);
    const newTotalXP = stats.total_xp + amount;
    const newLevel = this.calculateLevel(newTotalXP);
    const levelUp = newLevel > stats.level;
    
    await supabase
      .from('user_stats')
      .update({
        total_xp: newTotalXP,
        level: newLevel
      })
      .eq('user_id', userId);
    
    return { levelUp, newLevel: levelUp ? newLevel : undefined };
  }

  private calculateLevel(totalXP: number): number {
    // Level formula: Level = floor(sqrt(totalXP / 100)) + 1
    return Math.floor(Math.sqrt(totalXP / 100)) + 1;
  }

  private calculateXP(score: number, _lessonId: number, difficulty: string): number {
    const baseXP = 50;
    const scoreMultiplier = score / 100;
    const difficultyMultiplier = difficulty === 'beginner' ? 1 : difficulty === 'intermediate' ? 1.5 : 2;
    
    return Math.round(baseXP * scoreMultiplier * difficultyMultiplier);
  }

  // Learning session tracking
  async createLearningSession(
    userId: string, 
    courseId: string, 
    lessonId: number
  ): Promise<LearningSession> {
    const session: LearningSession = {
      id: `session_${Date.now()}`,
      course_id: courseId,
      lesson_id: lessonId,
      user_id: userId,
      score: 0,
      time_spent: 0,
      questions_asked: 0,
      hints_used: 0,
      completed: false,
      created_at: new Date().toISOString()
    };
    
    return session;
  }

  async updateLearningSession(
    session: LearningSession, 
    updates: Partial<LearningSession>
  ): Promise<LearningSession> {
    return { ...session, ...updates };
  }

  // Leaderboard and ranking
  async getLeaderboard(limit: number = 10): Promise<UserStats[]> {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .order('total_xp', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  }

  async updateUserRanking(userId: string): Promise<void> {
    const { data: userStats } = await supabase
      .from('user_stats')
      .select('total_xp')
      .eq('user_id', userId)
      .single();
    
    if (!userStats) return;
    
    const { count } = await supabase
      .from('user_stats')
      .select('*', { count: 'exact' })
      .gt('total_xp', userStats.total_xp);
    
    const ranking = (count || 0) + 1;
    
    await supabase
      .from('user_stats')
      .update({ rank_position: ranking })
      .eq('user_id', userId);
  }
}

export const gamificationService = GamificationService.getInstance();
