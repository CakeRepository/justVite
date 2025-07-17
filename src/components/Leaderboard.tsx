import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserStats } from '../types';
import { gamificationService } from '../services/gamificationService';
import { supabase } from '../config/supabase';
import LoadingSpinner from './LoadingSpinner';

interface LeaderboardProps {
  onBack: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onBack }) => {
  const [leaderboard, setLeaderboard] = useState<UserStats[]>([]);
  const [currentUser, setCurrentUser] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const [leaderboardData, userStatsData] = await Promise.all([
        gamificationService.getLeaderboard(50),
        user ? gamificationService.getUserStats(user.id) : Promise.resolve(null)
      ]);

      setLeaderboard(leaderboardData);
      setCurrentUser(userStatsData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-600 bg-yellow-50';
      case 2: return 'text-gray-600 bg-gray-50';
      case 3: return 'text-amber-600 bg-amber-50';
      default: return 'text-gray-700 bg-white';
    }
  };

  const calculateXPToNextLevel = (totalXP: number, level: number): number => {
    const nextLevelXP = Math.pow(level, 2) * 100;
    return Math.max(0, nextLevelXP - totalXP);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
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
          <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
          <p className="text-gray-600 mt-2">See how you rank against other learners</p>
        </div>
      </div>

      {/* Current User Stats */}
      {currentUser && (
        <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2">Your Stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-bold">{currentUser.level}</div>
                  <div className="text-purple-100">Level</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{currentUser.total_xp}</div>
                  <div className="text-purple-100">XP</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">#{currentUser.rank_position}</div>
                  <div className="text-purple-100">Rank</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{currentUser.courses_completed}</div>
                  <div className="text-purple-100">Courses</div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-purple-100 mb-1">Next Level</div>
              <div className="text-lg font-semibold">
                {calculateXPToNextLevel(currentUser.total_xp, currentUser.level)} XP
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {leaderboard.slice(0, 3).map((user, index) => (
          <motion.div
            key={user.user_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${getRankColor(index + 1)} rounded-lg p-6 text-center border-2 ${
              index === 0 ? 'border-yellow-200' : 
              index === 1 ? 'border-gray-200' : 'border-amber-200'
            }`}
          >
            <div className="text-4xl mb-2">{getRankIcon(index + 1)}</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">Level {user.level}</div>
            <div className="text-lg text-gray-600 mb-2">{user.total_xp} XP</div>
            <div className="text-sm text-gray-500">
              {user.courses_completed} courses • {user.achievements_earned} achievements
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {user.current_streak} day streak
            </div>
          </motion.div>
        ))}
      </div>

      {/* Full Leaderboard */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Full Rankings</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {leaderboard.map((user, index) => (
            <motion.div
              key={user.user_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                currentUser?.user_id === user.user_id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                  index < 3 ? getRankColor(index + 1) : 'bg-gray-100 text-gray-600'
                }`}>
                  {index < 3 ? getRankIcon(index + 1) : index + 1}
                </div>
                
                <div>
                  <div className="font-semibold text-gray-900">
                    Level {user.level}
                    {currentUser?.user_id === user.user_id && (
                      <span className="ml-2 text-sm text-blue-600 font-medium">(You)</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {user.total_xp} XP • {user.courses_completed} courses
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-600">
                  {user.achievements_earned} achievements
                </div>
                <div className="text-sm text-gray-500">
                  {user.current_streak} day streak
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {leaderboard.length}
          </div>
          <div className="text-sm text-gray-600">Total Learners</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {leaderboard.reduce((sum, user) => sum + user.total_xp, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total XP Earned</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {leaderboard.reduce((sum, user) => sum + user.courses_completed, 0)}
          </div>
          <div className="text-sm text-gray-600">Courses Completed</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(leaderboard.reduce((sum, user) => sum + user.average_score, 0) / Math.max(1, leaderboard.length))}
          </div>
          <div className="text-sm text-gray-600">Average Score</div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
