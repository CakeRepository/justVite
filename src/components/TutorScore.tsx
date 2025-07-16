import React from 'react';
import { motion } from 'framer-motion';
import { ChatSession } from '../types';

interface TutorScoreProps {
  session: ChatSession;
  className?: string;
}

interface ScoreBreakdown {
  engagement: number;
  progress: number;
  understanding: number;
  total: number;
  level: string;
  color: string;
}

const TutorScore: React.FC<TutorScoreProps> = ({ session, className = '' }) => {
  const calculateScore = (session: ChatSession): ScoreBreakdown => {
    const { messages, state } = session;
    
    // Count user messages (engagement)
    const userMessages = messages.filter(m => m.role === 'user');
    const totalMessages = userMessages.length;
    
    // Calculate engagement score (0-40 points)
    const engagementScore = Math.min(40, totalMessages * 4);
    
    // Calculate progress score based on attempts and hints (0-30 points)
    const attemptPenalty = Math.min(20, state.attempt_number * 2);
    const hintPenalty = Math.min(10, state.hint_level * 5);
    const progressScore = Math.max(0, 30 - attemptPenalty - hintPenalty);
    
    // Calculate understanding score based on agent interactions (0-30 points)
    const agentCounts = {
      socratic: 0,
      conversationalist: 0,
      explainer: 0
    };
    
    messages.forEach(msg => {
      if (msg.role === 'assistant' && msg.agent) {
        agentCounts[msg.agent]++;
      }
    });
    
    // Higher score for more socratic interactions (shows deeper thinking)
    const socraticratio = totalMessages > 0 ? agentCounts.socratic / Math.max(1, messages.filter(m => m.role === 'assistant').length) : 0;
    const understandingScore = Math.round(socraticratio * 30);
    
    const total = engagementScore + progressScore + understandingScore;
    
    // Determine level and color
    let level = 'Beginner';
    let color = 'text-red-600';
    
    if (total >= 80) {
      level = 'Master';
      color = 'text-purple-600';
    } else if (total >= 60) {
      level = 'Advanced';
      color = 'text-blue-600';
    } else if (total >= 40) {
      level = 'Intermediate';
      color = 'text-yellow-600';
    } else if (total >= 20) {
      level = 'Developing';
      color = 'text-orange-600';
    }
    
    return {
      engagement: engagementScore,
      progress: progressScore,
      understanding: understandingScore,
      total,
      level,
      color
    };
  };

  const score = calculateScore(session);
  const percentage = Math.round((score.total / 100) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Learning Score</h3>
        <div className="flex items-center gap-2">
          <span className={`text-lg font-bold ${score.color}`}>
            {score.total}/100
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${score.color} bg-opacity-10`} style={{ backgroundColor: score.color.includes('red') ? '#fef2f2' : score.color.includes('purple') ? '#faf5ff' : score.color.includes('blue') ? '#eff6ff' : score.color.includes('yellow') ? '#fffbeb' : '#fff7ed' }}>
            {score.level}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`h-2 rounded-full ${
              percentage >= 80 ? 'bg-purple-500' :
              percentage >= 60 ? 'bg-blue-500' :
              percentage >= 40 ? 'bg-yellow-500' :
              percentage >= 20 ? 'bg-orange-500' : 'bg-red-500'
            }`}
          />
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Engagement</span>
          <span className="font-medium">{score.engagement}/40</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{score.progress}/30</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Understanding</span>
          <span className="font-medium">{score.understanding}/30</span>
        </div>
      </div>

      {/* Session Stats */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-2 text-xs text-center">
          <div>
            <div className="font-medium text-gray-900">{session.messages.filter(m => m.role === 'user').length}</div>
            <div className="text-gray-500">Messages</div>
          </div>
          <div>
            <div className="font-medium text-gray-900">{session.state.attempt_number}</div>
            <div className="text-gray-500">Attempts</div>
          </div>
          <div>
            <div className="font-medium text-gray-900">{session.state.hint_level}</div>
            <div className="text-gray-500">Hints</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TutorScore;
