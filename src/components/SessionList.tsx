import React from 'react';
import { motion } from 'framer-motion';
import { ChatSession } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface SessionListProps {
  sessions: ChatSession[];
  onSessionSelect: (session: ChatSession) => void;
  onNewSession: () => void;
}

const SessionList: React.FC<SessionListProps> = ({ sessions, onSessionSelect, onNewSession }) => {
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-80 bg-white border-r border-gray-200 flex flex-col h-full"
    >
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Chat Sessions</h2>
        <button
          onClick={onNewSession}
          className="w-full btn-primary"
        >
          + New Session
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sortedSessions.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No sessions yet.</p>
            <p className="text-sm mt-1">Start your first conversation!</p>
          </div>
        ) : (
          <div className="p-2">
            {sortedSessions.map((session) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 mb-2 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onSessionSelect(session)}
              >
                <h3 className="font-medium text-gray-900 truncate mb-1">
                  {session.topic}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  {session.messages.length} messages
                </p>
                <p className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SessionList;
