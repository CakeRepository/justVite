import React from 'react';
import { motion } from 'framer-motion';
import { Message } from '../types';
import { AGENT_COLORS, AGENT_ICONS } from '../config/constants';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: Message;
  isLoading?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLoading = false }) => {
  const isUser = message.role === 'user';
  const agentColor = message.agent ? AGENT_COLORS[message.agent] : '';
  const agentIcon = message.agent ? AGENT_ICONS[message.agent] : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`chat-message ${isUser ? 'user-message' : 'ai-message'}`}
    >
      {!isUser && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{agentIcon}</span>
          <span className={`text-sm font-medium ${agentColor}`}>
            {message.agent ? 
              `${message.agent.charAt(0).toUpperCase()}${message.agent.slice(1)} Tutor` : 
              'AI Tutor'
            }
          </span>
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
      )}
      
      <div className="prose prose-sm max-w-none">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="animate-pulse flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="text-gray-500 text-sm">Thinking...</span>
          </div>
        ) : (
          <ReactMarkdown>{message.content}</ReactMarkdown>
        )}
      </div>
      
      {isUser && (
        <div className="text-right mt-2">
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default MessageBubble;
