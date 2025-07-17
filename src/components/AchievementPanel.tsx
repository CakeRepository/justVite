import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement, UserAchievement, UserStats } from '../types';
import { gamificationService } from '../services/gamificationService';
import { supabase } from '../config/supabase';
import LoadingSpinner from './LoadingSpinner';

interface AchievementPanelProps {
  onBack: () => void;
}

const AchievementPanel: React.FC<AchievementPanelProps> = ({ onBack }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const [allAchievements, userAchievementsData, statsData] = await Promise.all([
        gamificationService.getAchievements(),
        user ? gamificationService.getUserAchievements(user.id) : Promise.resolve([]),
        user ? gamificationService.getUserStats(user.id) : Promise.resolve(null)
      ]);

      setAchievements(allAchievements);
      setUserAchievements(userAchievementsData);
      setUserStats(statsData);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'shadow-sm';
      case 'rare': return 'shadow-md shadow-blue-200';
      case 'epic': return 'shadow-lg shadow-purple-200';
      case 'legendary': return 'shadow-xl shadow-yellow-200';
      default: return 'shadow-sm';
    }
  };

  const isAchievementEarned = (achievementId: string): boolean => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  const getAchievementProgress = (achievement: Achievement): number => {
    if (!userStats) return 0;
    
    switch (achievement.type) {
      case 'score':
        return Math.min(100, (userStats.average_score / achievement.criteria.min_score) * 100);
      case 'completion':
        if (achievement.criteria.courses_completed) {
          return Math.min(100, (userStats.courses_completed / achievement.criteria.courses_completed) * 100);
        }
        return 0;
      case 'streak':
        return Math.min(100, (userStats.best_streak / achievement.criteria.streak_days) * 100);
      case 'engagement':
        if (achievement.criteria.sessions_completed) {
          return Math.min(100, (userStats.total_sessions / achievement.criteria.sessions_completed) * 100);
        }
        return 0;
      default:
        return 0;
    }
  };

  const categories = ['all', ...new Set(achievements.map(a => a.type))];
  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.type === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
          <p className="text-gray-600 mt-2">Track your learning milestones and accomplishments</p>
        </div>
        
        {/* User Stats */}
        {userStats && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 min-w-64">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">Level {userStats.level}</div>
              <div className="text-lg text-gray-700 mb-4">{userStats.total_xp} XP</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-gray-900">{userStats.achievements_earned}</div>
                  <div className="text-gray-600">Achievements</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{userStats.courses_completed}</div>
                  <div className="text-gray-600">Courses</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{userStats.best_streak}</div>
                  <div className="text-gray-600">Best Streak</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">#{userStats.rank_position}</div>
                  <div className="text-gray-600">Rank</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All Types' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredAchievements.map(achievement => {
            const earned = isAchievementEarned(achievement.id);
            const progress = getAchievementProgress(achievement);
            
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`relative bg-white rounded-lg border-2 p-6 transition-all duration-300 ${
                  earned 
                    ? `${getRarityColor(achievement.rarity)} ${getRarityGlow(achievement.rarity)}` 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Earned Badge */}
                {earned && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}

                {/* Achievement Icon */}
                <div className="text-center mb-4">
                  <div className={`text-4xl mb-2 ${earned ? '' : 'grayscale opacity-50'}`}>
                    {achievement.icon}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full font-medium ${getRarityColor(achievement.rarity)}`}>
                    {achievement.rarity.toUpperCase()}
                  </div>
                </div>

                {/* Achievement Info */}
                <div className="text-center">
                  <h3 className={`text-lg font-semibold mb-2 ${earned ? 'text-gray-900' : 'text-gray-500'}`}>
                    {achievement.name}
                  </h3>
                  <p className={`text-sm mb-4 ${earned ? 'text-gray-600' : 'text-gray-400'}`}>
                    {achievement.description}
                  </p>

                  {/* Progress Bar (for unearned achievements) */}
                  {!earned && progress > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 bg-primary-500 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Reward */}
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <span className={earned ? 'text-purple-600' : 'text-gray-400'}>
                      +{achievement.reward_xp} XP
                    </span>
                    {earned && (
                      <span className="text-green-600 font-medium">
                        EARNED
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Achievement Stats */}
      <div className="mt-12 bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Achievement Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {['common', 'rare', 'epic', 'legendary'].map(rarity => {
            const total = achievements.filter(a => a.rarity === rarity).length;
            const earned = userAchievements.filter(ua => {
              const achievement = achievements.find(a => a.id === ua.achievement_id);
              return achievement?.rarity === rarity;
            }).length;
            
            return (
              <div key={rarity} className="text-center">
                <div className={`text-2xl font-bold mb-2 ${
                  rarity === 'common' ? 'text-gray-600' :
                  rarity === 'rare' ? 'text-blue-600' :
                  rarity === 'epic' ? 'text-purple-600' : 'text-yellow-600'
                }`}>
                  {earned}/{total}
                </div>
                <div className="text-sm text-gray-600 capitalize">{rarity}</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      rarity === 'common' ? 'bg-gray-500' :
                      rarity === 'rare' ? 'bg-blue-500' :
                      rarity === 'epic' ? 'bg-purple-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${total > 0 ? (earned / total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AchievementPanel;
