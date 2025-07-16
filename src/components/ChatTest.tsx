import React from 'react';
import { tutorService } from '../services/tutorService';
import { DEFAULT_TUTOR_STATE } from '../config/constants';
import { Message, TutorState } from '../types';

const ChatTest: React.FC = () => {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [currentState, setCurrentState] = React.useState<TutorState>(DEFAULT_TUTOR_STATE);
  const [isLoading, setIsLoading] = React.useState(false);
  const [input, setInput] = React.useState('');

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await tutorService.sendMessage(
        [...messages, userMessage],
        'Photosynthesis',
        currentState
      );

      // Add AI response
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.combinedMessage,
        timestamp: new Date(),
        agent: response.active_agent
      };

      setMessages(prev => [...prev, aiMessage]);
      setCurrentState(response.next_state);

    } catch (error) {
      console.error('Error:', error);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const getAgentIcon = (agent?: string) => {
    switch (agent) {
      case 'socratic': return '🤔';
      case 'conversationalist': return '😊';
      case 'explainer': return '💡';
      default: return '🤖';
    }
  };

  const getAgentColor = (agent?: string) => {
    switch (agent) {
      case 'socratic': return 'text-blue-600';
      case 'conversationalist': return 'text-green-600';
      case 'explainer': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Chat Test</h2>
        <p className="text-gray-600">Test the full chat flow with your Socratic tutor</p>
        <div className="mt-2 text-sm text-gray-500">
          <span>State: attempts={currentState.attempt_number}, hints={currentState.hint_level}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 h-96 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p>Start a conversation about photosynthesis!</p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1">
                    <span>{getAgentIcon(message.agent)}</span>
                    <span className={`text-xs font-medium ${getAgentColor(message.agent)}`}>
                      {message.agent}
                    </span>
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <div className="text-xs opacity-75 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about photosynthesis..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatTest;
