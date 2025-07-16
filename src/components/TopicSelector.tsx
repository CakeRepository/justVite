import React from 'react';
import { motion } from 'framer-motion';
import { TOPIC_SUGGESTIONS } from '../config/constants';
import { TopicSuggestion } from '../types';

interface TopicSelectorProps {
  onTopicSelect: (topic: string) => void;
  onCustomTopic: (topic: string) => void;
}

const TopicSelector: React.FC<TopicSelectorProps> = ({ onTopicSelect, onCustomTopic }) => {
  const [customTopic, setCustomTopic] = React.useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTopic.trim()) {
      onCustomTopic(customTopic.trim());
      setCustomTopic('');
    }
  };

  const getDifficultyColor = (difficulty: TopicSuggestion['difficulty']) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          🎓 Socratic Tutor
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Learn through guided questioning and discovery. Choose a topic to begin your journey
          or enter your own question.
        </p>
      </div>

      {/* Custom Topic Input */}
      <div className="mb-8">
        <form onSubmit={handleCustomSubmit} className="flex gap-3 max-w-lg mx-auto">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="Enter your own topic or question..."
            className="input-field flex-1"
          />
          <button
            type="submit"
            disabled={!customTopic.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Learning
          </button>
        </form>
      </div>

      <div className="text-center mb-6">
        <span className="text-gray-500">or choose from these topics:</span>
      </div>

      {/* Topic Suggestions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOPIC_SUGGESTIONS.map((topic, index) => (
          <motion.div
            key={topic.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onTopicSelect(topic.title)}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">{topic.title}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(topic.difficulty)}`}>
                {topic.difficulty}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-3">{topic.description}</p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {topic.category}
              </span>
              <span className="text-primary-600 text-sm font-medium">
                Start exploring →
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Features */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="text-3xl mb-2">🤔</div>
          <h3 className="font-semibold text-gray-900 mb-2">Socratic Method</h3>
          <p className="text-sm text-gray-600">
            Learn through guided questions that help you discover answers yourself
          </p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">😊</div>
          <h3 className="font-semibold text-gray-900 mb-2">Supportive Guidance</h3>
          <p className="text-sm text-gray-600">
            Encouraging conversation to keep you motivated and engaged
          </p>
        </div>
        <div className="text-center">
          <div className="text-3xl mb-2">💡</div>
          <h3 className="font-semibold text-gray-900 mb-2">Clear Explanations</h3>
          <p className="text-sm text-gray-600">
            Helpful hints and explanations when you need them most
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default TopicSelector;
