import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Course, UserStats, UserProgress, UserAchievement } from '../types';
import { gamificationService } from '../services/gamificationService';
import { supabase } from '../config/supabase';
import TopicSelector from './TopicSelector';
import CourseSelection from './CourseSelection';
import CoursePlayer from './CoursePlayer';
import AchievementPanel from './AchievementPanel';
import Leaderboard from './Leaderboard';
import LoadingSpinner from './LoadingSpinner';

type DashboardView = 'dashboard' | 'topics' | 'courses' | 'course-player' | 'achievements' | 'leaderboard';

const GamifiedDashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<DashboardView>('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const [statsData, progressData, achievementsData] = await Promise.all([
          gamificationService.getUserStats(user.id),
          gamificationService.getUserProgress(user.id),
          gamificationService.getUserAchievements(user.id)
        ]);

        setUserStats(statsData);
        setUserProgress(progressData);
        setRecentAchievements(achievementsData.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    setCurrentView('course-player');
  };

  const handleCourseComplete = (_course: Course) => {
    // Refresh dashboard data and show celebration
    loadDashboardData();
    setCurrentView('dashboard');
    // You could add a celebration animation here
  };

  const calculateXPToNextLevel = (totalXP: number, level: number): number => {
    const nextLevelXP = Math.pow(level, 2) * 100;
    return Math.max(0, nextLevelXP - totalXP);
  };

  const getProgressPercentage = (totalXP: number, level: number): number => {
    const currentLevelXP = Math.pow(level - 1, 2) * 100;
    const nextLevelXP = Math.pow(level, 2) * 100;
    const levelProgress = totalXP - currentLevelXP;
    const levelRange = nextLevelXP - currentLevelXP;
    return Math.min(100, Math.max(0, (levelProgress / levelRange) * 100));
  };

  const renderDashboard = () => {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Dashboard</h1>
          <p className="text-gray-600">Track your progress and continue your learning journey</p>
        </div>

        {/* User Stats Cards */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Level & XP */}
            <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-bold">Level {userStats.level}</div>
                  <div className="text-purple-100">Current Level</div>
                </div>
                <div className="text-4xl">🎯</div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-sm">
                  <span>XP Progress</span>
                  <span>{userStats.total_xp} XP</span>
                </div>
                <div className="w-full bg-purple-400 rounded-full h-2 mt-1">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getProgressPercentage(userStats.total_xp, userStats.level)}%` }}
                  />
                </div>
                <div className="text-xs text-purple-100 mt-1">
                  {calculateXPToNextLevel(userStats.total_xp, userStats.level)} XP to next level
                </div>
              </div>
            </div>

            {/* Courses */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{userStats.courses_completed}</div>
                  <div className="text-gray-600">Courses Completed</div>
                </div>
                <div className="text-4xl">📚</div>
              </div>
              <button 
                onClick={() => setCurrentView('courses')}
                className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors"
              >
                Browse Courses
              </button>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{userStats.achievements_earned}</div>
                  <div className="text-gray-600">Achievements</div>
                </div>
                <div className="text-4xl">🏆</div>
              </div>
              <button 
                onClick={() => setCurrentView('achievements')}
                className="w-full bg-yellow-50 text-yellow-600 py-2 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                View All
              </button>
            </div>

            {/* Ranking */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">#{userStats.rank_position}</div>
                  <div className="text-gray-600">Global Rank</div>
                </div>
                <div className="text-4xl">🏅</div>
              </div>
              <button 
                onClick={() => setCurrentView('leaderboard')}
                className="w-full bg-green-50 text-green-600 py-2 rounded-lg hover:bg-green-100 transition-colors"
              >
                Leaderboard
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Continue Learning */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Continue Learning</h3>
            
            {userProgress.length > 0 ? (
              <div className="space-y-3">
                {userProgress.filter(p => p.status === 'in_progress').slice(0, 3).map(progress => (
                  <div key={progress.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Course Progress</div>
                      <div className="text-sm text-gray-600">{progress.completion_percentage}% complete</div>
                    </div>
                    <button
                      onClick={() => {
                        // Load course and continue
                        setCurrentView('courses');
                      }}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      Continue
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">No courses in progress</div>
                <button
                  onClick={() => setCurrentView('courses')}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Start Learning
                </button>
              </div>
            )}
          </div>

          {/* Recent Achievements */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
            
            {recentAchievements.length > 0 ? (
              <div className="space-y-3">
                {recentAchievements.map(userAchievement => (
                  <div key={userAchievement.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl mr-3">
                      {userAchievement.achievement?.icon || '🏆'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {userAchievement.achievement?.name || 'Achievement'}
                      </div>
                      <div className="text-sm text-gray-600">
                        +{userAchievement.achievement?.reward_xp || 0} XP
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-4">No achievements yet</div>
                <div className="text-sm text-gray-400">Complete lessons to earn achievements!</div>
              </div>
            )}
          </div>
        </div>

        {/* Learning Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white cursor-pointer"
            onClick={() => setCurrentView('courses')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Structured Courses</h3>
                <p className="text-blue-100">Follow guided learning paths with achievements</p>
              </div>
              <div className="text-4xl">🎓</div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-6 text-white cursor-pointer"
            onClick={() => setCurrentView('topics')}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Free Learning</h3>
                <p className="text-green-100">Explore any topic with our Socratic tutor</p>
              </div>
              <div className="text-4xl">🧠</div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'topics':
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-6">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              <TopicSelector 
                onTopicSelect={(topic) => {
                  // Navigate to free chat mode - you might want to implement this
                  console.log('Selected topic:', topic);
                }} 
                onCustomTopic={(topic) => {
                  // Navigate to free chat mode - you might want to implement this
                  console.log('Custom topic:', topic);
                }}
              />
            </div>
          </div>
        );
      case 'courses':
        return (
          <CourseSelection 
            onCourseSelect={handleCourseSelect}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      case 'course-player':
        return selectedCourse ? (
          <CoursePlayer
            course={selectedCourse}
            onBack={() => setCurrentView('courses')}
            onCourseComplete={handleCourseComplete}
          />
        ) : null;
      case 'achievements':
        return <AchievementPanel onBack={() => setCurrentView('dashboard')} />;
      case 'leaderboard':
        return <Leaderboard onBack={() => setCurrentView('dashboard')} />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderCurrentView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default GamifiedDashboard;
