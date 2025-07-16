import React from 'react';
import { motion } from 'framer-motion';
import { ChatSession, Message } from '../types';
import { tutorService } from '../services/tutorService';
import { storageService } from '../services/storageService';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TutorScore from './TutorScore';

interface ChatInterfaceProps {
  session: ChatSession;
  onSessionUpdate: (session: ChatSession) => void;
  onBack: () => void;
  onDelete: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  session, 
  onSessionUpdate, 
  onBack, 
  onDelete 
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState<Message | null>(null);
  const [showScore, setShowScore] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [session.messages, loadingMessage]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    storageService.addMessage(session, {
      role: 'user',
      content
    });

    // Update session with user message
    onSessionUpdate({ ...session });

    // Create loading message
    const tempLoadingMessage: Message = {
      id: 'loading',
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };
    setLoadingMessage(tempLoadingMessage);
    setIsLoading(true);

    try {
      // Send to tutor service
      const response = await tutorService.sendMessage(
        session.messages,
        session.topic,
        session.state
      );

      // Add AI response
      storageService.addMessage(session, {
        role: 'assistant',
        content: response.combinedMessage,
        agent: response.active_agent
      });

      // Update session state
      const updatedSession = {
        ...session,
        state: response.next_state
      };

      onSessionUpdate(updatedSession);

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      storageService.addMessage(session, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        agent: 'explainer'
      });
      
      onSessionUpdate({ ...session });
    } finally {
      setIsLoading(false);
      setLoadingMessage(null);
    }
  };

  const allMessages = [...session.messages];
  if (loadingMessage) {
    allMessages.push(loadingMessage);
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        session={session}
        onBack={onBack}
        onDelete={onDelete}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto space-y-4">
              {allMessages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Welcome to your Socratic learning session!
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Topic: <span className="font-medium">{session.topic}</span>
                  </p>
                  <p className="text-gray-500">
                    I'll guide you through questions to help you explore and understand this topic deeply.
                    Ask me anything or share what you already know to get started!
                  </p>
                </motion.div>
              ) : (
                allMessages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isLoading={message.id === 'loading' && isLoading}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          <MessageInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder="Share your thoughts, ask a question, or tell me what you know..."
          />
        </div>

        {/* Score Sidebar - Hidden on mobile, shown on desktop */}
        <div className="hidden lg:block w-80 border-l border-gray-200 bg-gray-50 p-4">
          <TutorScore session={session} className="sticky top-4" />
        </div>

        {/* Mobile Score Toggle */}
        <div className="lg:hidden fixed bottom-20 right-4 z-10">
          <button
            onClick={() => setShowScore(!showScore)}
            className="bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
        </div>

        {/* Mobile Score Overlay */}
        {showScore && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20" onClick={() => setShowScore(false)}>
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-lg">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Learning Progress</h3>
                <button
                  onClick={() => setShowScore(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <TutorScore session={session} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
