import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Course, CourseLesson, UserProgress, GameEvent, Message, TutorState } from '../types';
import { gamificationService } from '../services/gamificationService';
import { tutorService } from '../services/tutorService';
import { supabase } from '../config/supabase';
import { DEFAULT_TUTOR_STATE } from '../config/constants';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import LoadingSpinner from './LoadingSpinner';

interface CoursePlayerProps {
  course: Course;
  onBack: () => void;
  onCourseComplete: (course: Course) => void;
}

const CoursePlayer: React.FC<CoursePlayerProps> = ({ course, onBack, onCourseComplete }) => {
  const [currentLesson, setCurrentLesson] = useState<CourseLesson>(course.lessons[0]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [tutorState, setTutorState] = useState<TutorState>(DEFAULT_TUTOR_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
  const [showEvents, setShowEvents] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [questionsAsked, setQuestionsAsked] = useState<number>(0);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [lessonCompleted, setLessonCompleted] = useState<boolean>(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUserProgress();
    initializeLesson();
  }, [course.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadUserProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userProgress = await gamificationService.getCourseProgress(user.id, course.id);
        setProgress(userProgress);
        
        if (userProgress) {
          const lessonIndex = Math.min(userProgress.current_lesson, course.lessons.length - 1);
          setCurrentLesson(course.lessons[lessonIndex]);
        }
      }
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  const initializeLesson = () => {
    const welcomeMessage: Message = {
      id: `lesson-intro-${currentLesson.id}`,
      role: 'assistant',
      content: `Welcome to "${currentLesson.title}"! 🎓\n\n${currentLesson.description}\n\nLet's explore this topic together. What would you like to know first?`,
      timestamp: new Date(),
      agent: 'conversationalist'
    };

    setMessages([welcomeMessage]);
    setTutorState(DEFAULT_TUTOR_STATE);
    setSessionStartTime(Date.now());
    setQuestionsAsked(0);
    setHintsUsed(0);
    setLessonCompleted(false);
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setQuestionsAsked(prev => prev + 1);

    try {
      const response = await tutorService.sendMessage(
        [...messages, userMessage],
        `${course.title} - ${currentLesson.title}`,
        tutorState
      );

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.combinedMessage,
        timestamp: new Date(),
        agent: response.active_agent
      };

      setMessages(prev => [...prev, aiMessage]);
      setTutorState(response.next_state);

      // Check if hint was used
      if (response.next_state.hint_level > tutorState.hint_level) {
        setHintsUsed(prev => prev + 1);
      }

      // Check for lesson completion criteria
      await checkLessonCompletion();

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        agent: 'explainer'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const checkLessonCompletion = async () => {
    // Simple completion criteria - adjust based on your needs
    const userMessages = messages.filter(m => m.role === 'user').length;
    const hasGoodEngagement = userMessages >= 3;

    if (hasGoodEngagement && !lessonCompleted) {
      setLessonCompleted(true);
      await completeLesson();
    }
  };

  const completeLesson = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !progress) return;

      const timeSpent = Math.round((Date.now() - sessionStartTime) / 1000);
      const score = calculateLessonScore();

      const result = await gamificationService.completeLesson(
        user.id,
        course.id,
        currentLesson.id,
        score,
        timeSpent
      );

      setProgress(result.progress);
      setGameEvents(result.events);
      setShowEvents(true);

      // Show completion message
      const completionMessage: Message = {
        id: `completion-${Date.now()}`,
        role: 'assistant',
        content: `🎉 Congratulations! You've completed "${currentLesson.title}"!\n\nYour score: ${score}/100\nTime spent: ${Math.round(timeSpent / 60)} minutes\n\nYou've earned ${result.events.find(e => e.type === 'xp_gained')?.data.amount || 0} XP!`,
        timestamp: new Date(),
        agent: 'conversationalist'
      };

      setMessages(prev => [...prev, completionMessage]);

      // Check if course is complete
      if (result.progress.completion_percentage === 100) {
        setTimeout(() => {
          onCourseComplete(course);
        }, 3000);
      }

    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const calculateLessonScore = (): number => {
    const baseScore = 100;
    const messagePenalty = Math.max(0, (questionsAsked - 5) * 2);
    const hintPenalty = hintsUsed * 10;
    const attemptPenalty = tutorState.attempt_number * 5;

    return Math.max(10, Math.min(100, baseScore - messagePenalty - hintPenalty - attemptPenalty));
  };

  const navigateToLesson = (lessonIndex: number) => {
    if (lessonIndex >= 0 && lessonIndex < course.lessons.length) {
      setCurrentLesson(course.lessons[lessonIndex]);
      initializeLesson();
    }
  };

  const canAccessLesson = (lessonIndex: number): boolean => {
    if (!progress) return lessonIndex === 0;
    return lessonIndex <= progress.current_lesson;
  };

  const isLessonCompleted = (lessonIndex: number): boolean => {
    if (!progress) return false;
    return progress.completed_lessons.includes(lessonIndex);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-3 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {course.title} - {currentLesson.title}
              </h1>
              <p className="text-sm text-gray-600">
                Lesson {currentLesson.id} of {course.lessons.length}
              </p>
            </div>
          </div>
          {progress && (
            <div className="text-right">
              <div className="text-sm text-gray-600">Progress</div>
              <div className="text-lg font-semibold text-primary-600">
                {progress.completion_percentage}%
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Lesson Navigation Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Course Progress</h3>
            
            {/* Progress Bar */}
            {progress && (
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Overall Progress</span>
                  <span>{progress.completion_percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress.completion_percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Lesson List */}
            <div className="space-y-2">
              {course.lessons.map((lesson, index) => (
                <button
                  key={lesson.id}
                  onClick={() => navigateToLesson(index)}
                  disabled={!canAccessLesson(index)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    currentLesson.id === lesson.id
                      ? 'bg-primary-50 border-primary-200 text-primary-700'
                      : canAccessLesson(index)
                      ? 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                      : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{lesson.title}</div>
                      <div className="text-sm text-gray-500 mt-1">{lesson.description}</div>
                    </div>
                    <div className="ml-2">
                      {isLessonCompleted(index) ? (
                        <span className="text-green-500">✓</span>
                      ) : currentLesson.id === lesson.id ? (
                        <span className="text-primary-500">▶</span>
                      ) : canAccessLesson(index) ? (
                        <span className="text-gray-400">○</span>
                      ) : (
                        <span className="text-gray-300">🔒</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-center">
                <LoadingSpinner />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <MessageInput
              onSendMessage={handleSendMessage}
              isLoading={isLoading || lessonCompleted}
              placeholder={lessonCompleted ? "Lesson completed! Great job!" : "Ask a question or share your thoughts..."}
            />
          </div>
        </div>
      </div>

      {/* Game Events Overlay */}
      <AnimatePresence>
        {showEvents && gameEvents.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowEvents(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Achievements Unlocked! 🎉</h3>
              <div className="space-y-3">
                {gameEvents.map((event, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl mr-3">
                      {event.type === 'xp_gained' ? '⭐' : 
                       event.type === 'achievement_unlocked' ? '🏆' : 
                       event.type === 'level_up' ? '🆙' : 
                       event.type === 'course_completed' ? '🎓' : '🎯'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {event.type === 'xp_gained' && `+${event.data.amount} XP`}
                        {event.type === 'achievement_unlocked' && event.data.name}
                        {event.type === 'level_up' && `Level Up! Level ${event.data.newLevel}`}
                        {event.type === 'course_completed' && `Course Completed!`}
                      </div>
                      <div className="text-sm text-gray-600">
                        {event.type === 'xp_gained' && event.data.reason}
                        {event.type === 'achievement_unlocked' && event.data.description}
                        {event.type === 'course_completed' && `+${event.data.bonus_xp} Bonus XP`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowEvents(false)}
                className="w-full mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Continue Learning
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoursePlayer;
