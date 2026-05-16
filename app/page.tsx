'use client';

import { useState } from 'react';
import { TweetInput } from './components/TweetInput';
import { ScoreCard } from './components/ScoreCard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { SimpleRecommendations } from '@/lib/types';

export default function Home() {
  const [result, setResult] = useState<SimpleRecommendations | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (tweet: string, mode: 'simple' | 'detailed') => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweet_text: tweet, mode }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze tweet');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            X Tweet Scorer
          </h1>
          <p className="text-gray-600">
            Analyze how your tweets align with X's algorithm. Get an engagement
            score and actionable recommendations.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        <TweetInput onSubmit={handleAnalyze} isLoading={loading} />

        {loading && <LoadingSpinner />}

        {error && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        )}

        {result && !loading && <ScoreCard result={result} />}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 mt-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-gray-600 text-sm">
            Powered by Claude API ·{' '}
            <a
              href="https://github.com/xai-org/x-algorithm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700"
            >
              X Algorithm on GitHub
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
