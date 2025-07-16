import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ChatSession } from '../types';

interface ChatHeaderProps {
  session: ChatSession;
  onBack: () => void;
  onDelete: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ session, onBack, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const calculateQuickScore = (session: ChatSession) => {
    const userMessages = session.messages.filter(m => m.role === 'user').length;
    const engagementScore = Math.min(40, userMessages * 4);
    const attemptPenalty = Math.min(20, session.state.attempt_number * 2);
    const hintPenalty = Math.min(10, session.state.hint_level * 5);
    const progressScore = Math.max(0, 30 - attemptPenalty - hintPenalty);
    
    const total = engagementScore + progressScore + 15; // Base understanding score
    return Math.min(100, total);
  };

  const score = calculateQuickScore(session);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900 truncate max-w-sm">
                {session.topic}
              </h1>
              <p className="text-sm text-gray-500">
                {session.messages.length} messages • {session.createdAt.toLocaleDateString()}
              </p>
            </div>
            
            {/* Compact Score Display */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-gray-700">
                {score}/100
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showDeleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Delete this conversation?</span>
              <button
                onClick={handleDeleteConfirm}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={handleDeleteCancel}
                className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleDeleteClick}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
            >
              <TrashIcon className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatHeader;
