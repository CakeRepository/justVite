import React from 'react';
import { ChatSession } from './types';
import { storageService } from './services/storageService';
import TopicSelector from './components/TopicSelector';
import ChatInterface from './components/ChatInterface';
import SessionList from './components/SessionList';
import TestConnection from './components/TestConnection';
import ChatTest from './components/ChatTest';

type AppView = 'topic-selector' | 'chat' | 'session-list' | 'test' | 'chat-test';

const App: React.FC = () => {
  const [view, setView] = React.useState<AppView>('topic-selector');
  const [sessions, setSessions] = React.useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = React.useState<ChatSession | null>(null);

  // Load sessions from storage on mount
  React.useEffect(() => {
    const savedSessions = storageService.loadSessions();
    setSessions(savedSessions);
  }, []);

  // Save sessions to storage whenever they change
  React.useEffect(() => {
    storageService.saveSessions(sessions);
  }, [sessions]);

  const handleTopicSelect = (topic: string) => {
    const newSession = storageService.createSession(topic);
    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
    setView('chat');
  };

  const handleSessionSelect = (session: ChatSession) => {
    setCurrentSession(session);
    setView('chat');
  };

  const handleSessionUpdate = (updatedSession: ChatSession) => {
    setSessions(prev => 
      prev.map(s => s.id === updatedSession.id ? updatedSession : s)
    );
    setCurrentSession(updatedSession);
  };

  const handleSessionDelete = () => {
    if (currentSession) {
      setSessions(prev => prev.filter(s => s.id !== currentSession.id));
      setCurrentSession(null);
      setView('topic-selector');
    }
  };

  const handleBackToTopics = () => {
    setCurrentSession(null);
    setView('topic-selector');
  };

  const handleShowSessions = () => {
    setView('session-list');
  };

  const handleNewSession = () => {
    setView('topic-selector');
  };

  const handleShowTest = () => {
    setView('test');
  };

  const handleShowChatTest = () => {
    setView('chat-test');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {view === 'topic-selector' && (
        <div className="relative">
          {sessions.length > 0 && (
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button
                onClick={handleShowChatTest}
                className="btn-secondary"
              >
                Chat Test
              </button>
              <button
                onClick={handleShowTest}
                className="btn-secondary"
              >
                Test Connection
              </button>
              <button
                onClick={handleShowSessions}
                className="btn-secondary"
              >
                View Sessions ({sessions.length})
              </button>
            </div>
          )}
          {sessions.length === 0 && (
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button
                onClick={handleShowChatTest}
                className="btn-secondary"
              >
                Chat Test
              </button>
              <button
                onClick={handleShowTest}
                className="btn-secondary"
              >
                Test Connection
              </button>
            </div>
          )}
          <TopicSelector
            onTopicSelect={handleTopicSelect}
            onCustomTopic={handleTopicSelect}
          />
        </div>
      )}

      {view === 'chat-test' && (
        <div className="min-h-screen bg-gray-50">
          <div className="p-4">
            <button
              onClick={handleNewSession}
              className="btn-secondary mb-4"
            >
              ← Back to Topics
            </button>
          </div>
          <ChatTest />
        </div>
      )}

      {view === 'test' && (
        <div className="min-h-screen bg-gray-50">
          <div className="p-4">
            <button
              onClick={handleNewSession}
              className="btn-secondary mb-4"
            >
              ← Back to Topics
            </button>
          </div>
          <TestConnection />
        </div>
      )}

      {view === 'session-list' && (
        <div className="h-screen flex">
          <SessionList
            sessions={sessions}
            onSessionSelect={handleSessionSelect}
            onNewSession={handleNewSession}
          />
          <div className="flex-1 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Select a session to continue
              </h2>
              <p className="text-gray-600 mb-6">
                Choose from your previous conversations or start a new one
              </p>
              <button
                onClick={handleNewSession}
                className="btn-primary"
              >
                Start New Session
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'chat' && currentSession && (
        <div className="h-screen">
          <ChatInterface
            session={currentSession}
            onSessionUpdate={handleSessionUpdate}
            onBack={handleBackToTopics}
            onDelete={handleSessionDelete}
          />
        </div>
      )}
    </div>
  );
};

export default App;
