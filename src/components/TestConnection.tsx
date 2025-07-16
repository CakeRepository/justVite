import React from 'react';
import { tutorService } from '../services/tutorService';
import { DEFAULT_TUTOR_STATE } from '../config/constants';

const TestConnection: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);

  const testEdgeFunction = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await tutorService.sendMessage(
        [
          {
            id: 'test-1',
            role: 'user',
            content: 'Hello! I want to learn about photosynthesis.',
            timestamp: new Date()
          }
        ],
        'Photosynthesis',
        DEFAULT_TUTOR_STATE
      );

      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Test Edge Function Connection</h2>
      
      <button
        onClick={testEdgeFunction}
        disabled={isLoading}
        className="btn-primary mb-4"
      >
        {isLoading ? 'Testing...' : 'Test Connection'}
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong>Success!</strong>
          <pre className="mt-2 text-sm overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="text-sm text-gray-600 mt-4">
        <p><strong>Function URL:</strong> {import.meta.env.VITE_SUPABASE_URL}/functions/v1/multiagent-chat</p>
        <p><strong>Has Anon Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};

export default TestConnection;
