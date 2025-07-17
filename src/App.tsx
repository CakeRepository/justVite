import React from 'react';
import { ChatSession } from './types';
import { storageService } from './services/storageService';
import { useAuth } from './contexts/AuthContext';
import TopicSelector from './components/TopicSelector';
import ChatInterface from './components/ChatInterface';
import SessionList from './components/SessionList';
import TestConnection from './components/TestConnection';
import ChatTest from './components/ChatTest';
import AuthForm from './components/AuthForm';
import UserProfile from './components/UserProfile';

type AppView = 'topic-selector' | 'chat' | 'session-list' | 'test' | 'chat-test';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [view, setView] = React.useState<AppView>('topic-selector');
  const [sessions, setSessions] = React.useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = React.useState<ChatSession | null>(null);
  const [showProfile, setShowProfile] = React.useState(false);
  const [loadingSessions, setLoadingSessions] = React.useState(false);

  // Load sessions from storage on mount and when user changes
  React.useEffect(() => {
    const loadSessionsData = async () => {
      if (loading) return; // Wait for auth to be ready
      
      setLoadingSessions(true);
      try {
        // If user just logged in, migrate any localStorage sessions
        if (user) {
          await storageService.migrateSessions();
        }
        
        const savedSessions = await storageService.loadSessions();
        setSessions(savedSessions);
      } catch (error) {
        console.error('Error loading sessions:', error);
      } finally {
        setLoadingSessions(false);
      }
    };

    loadSessionsData();
  }, [user, loading]);

  // Save sessions to storage whenever they change
  React.useEffect(() => {
    if (sessions.length > 0 && !loadingSessions) {
      storageService.saveSessions(sessions);
    }
  }, [sessions, loadingSessions]);

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

  const handleSessionUpdate = async (updatedSession: ChatSession) => {
    setSessions(prev => 
      prev.map(s => s.id === updatedSession.id ? updatedSession : s)
    );
    setCurrentSession(updatedSession);
    
    // Save the updated session to the database
    await storageService.saveSession(updatedSession);
  };

  const handleSessionDelete = async () => {
    if (currentSession) {
      // Delete from database
      await storageService.deleteSessionFromDB(currentSession.id);
      
      // Update local state
      setSessions(prev => storageService.removeSessionFromArray(prev, currentSession.id));
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

  // Show loading screen while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth form if user is not authenticated
  if (!user) {
    return <AuthForm />;
  }

  // User is authenticated, show the main app
  return (
    <div className="min-h-screen bg-gray-50">
      {/* User Profile Modal */}
      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}

      {view === 'topic-selector' && (
        <div className="relative">
          {/* User info and navigation */}
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={() => setShowProfile(true)}
              className="bg-white shadow-md rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              {user.email}
            </button>
          </div>

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
          
          {loadingSessions ? (
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your sessions...</p>
              </div>
            </div>
          ) : (
            <TopicSelector
              onTopicSelect={handleTopicSelect}
              onCustomTopic={handleTopicSelect}
            />
          )}
        </div>
      )}

      {view === 'chat-test' && (
        <div className="min-h-screen bg-gray-50">
          <div className="p-4 flex justify-between items-center">
            <button
              onClick={handleNewSession}
              className="btn-secondary"
            >
              ← Back to Topics
            </button>
            <button
              onClick={() => setShowProfile(true)}
              className="bg-white shadow-md rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              {user.email}
            </button>
          </div>
          <ChatTest />
        </div>
      )}

      {view === 'test' && (
        <div className="min-h-screen bg-gray-50">
          <div className="p-4 flex justify-between items-center">
            <button
              onClick={handleNewSession}
              className="btn-secondary"
            >
              ← Back to Topics
            </button>
            <button
              onClick={() => setShowProfile(true)}
              className="bg-white shadow-md rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            >
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              {user.email}
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
