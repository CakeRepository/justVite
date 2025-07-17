import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Course, UserProgress, UserStats } from '../types';
import { gamificationService } from '../services/gamificationService';
import { supabase } from '../config/supabase';
import LoadingSpinner from './LoadingSpinner';

interface CourseSelectionProps {
  onCourseSelect: (course: Course) => void;
  onBack: () => void;
}

const CourseSelection: React.FC<CourseSelectionProps> = ({ onCourseSelect, onBack }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const [coursesData, progressData, statsData] = await Promise.all([
        gamificationService.getCourses(),
        user ? gamificationService.getUserProgress(user.id) : Promise.resolve([]),
        user ? gamificationService.getUserStats(user.id) : Promise.resolve(null)
      ]);

      setCourses(coursesData);
      setUserProgress(progressData);
      setUserStats(statsData);
    } catch (error) {
      console.error('Error loading course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSelect = async (course: Course) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      let progress = userProgress.find(p => p.course_id === course.id);
      
      if (!progress) {
        // Start new course
        progress = await gamificationService.startCourse(user.id, course.id);
        setUserProgress(prev => [...prev, progress!]);
      }
    }
    
    onCourseSelect(course);
  };

  const getCourseProgress = (courseId: string): UserProgress | undefined => {
    return userProgress.find(p => p.course_id === courseId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'mastered': return 'bg-purple-500';
      default: return 'bg-gray-300';
    }
  };

  const categories = ['all', ...new Set(courses.map(c => c.category))];
  const filteredCourses = selectedCategory === 'all' 
    ? courses 
    : courses.filter(c => c.category === selectedCategory);

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
            Back to Topics
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Choose Your Learning Path</h1>
          <p className="text-gray-600 mt-2">Select a structured course to master new concepts</p>
        </div>
        
        {/* User Stats */}
        {userStats && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 min-w-48">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">Level {userStats.level}</div>
              <div className="text-sm text-gray-600">{userStats.total_xp} XP</div>
              <div className="text-xs text-gray-500 mt-1">
                {userStats.courses_completed} courses completed
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
              {category === 'all' ? 'All Categories' : category}
            </button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredCourses.map(course => {
            const progress = getCourseProgress(course.id);
            
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleCourseSelect(course)}
              >
                <div className="p-6">
                  {/* Course Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {course.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {course.description}
                      </p>
                    </div>
                    <div className="ml-4 text-2xl">
                      {course.rewards.badge}
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty)}`}>
                      {course.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">
                      {course.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {course.lessons.length} lessons
                    </span>
                  </div>

                  {/* Progress Bar */}
                  {progress && (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{progress.completion_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${getStatusColor(progress.status)}`}
                          style={{ width: `${progress.completion_percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{progress.status.replace('_', ' ')}</span>
                        <span>Score: {progress.total_score}</span>
                      </div>
                    </div>
                  )}

                  {/* Rewards */}
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Rewards:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-purple-600 font-medium">
                          {course.rewards.xp} XP
                        </span>
                        <span className="text-gold-600">
                          {course.rewards.badge}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Course Topics Preview */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500 mb-2">Topics covered:</div>
                    <div className="flex flex-wrap gap-1">
                      {course.topics.slice(0, 3).map((topic, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                        >
                          {topic}
                        </span>
                      ))}
                      {course.topics.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                          +{course.topics.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No courses found in this category</div>
          <button
            onClick={() => setSelectedCategory('all')}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Show All Courses
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseSelection;
