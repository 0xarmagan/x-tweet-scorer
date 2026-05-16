'use client';

import { useState } from 'react';

interface TweetInputProps {
  onSubmit: (tweet: string, mode: 'simple' | 'detailed') => void;
  isLoading: boolean;
}

export function TweetInput({ onSubmit, isLoading }: TweetInputProps) {
  const [tweet, setTweet] = useState('');
  const [mode, setMode] = useState<'simple' | 'detailed'>('simple');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tweet.trim()) {
      onSubmit(tweet, mode);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="mb-4">
        <label htmlFor="tweet" className="block text-sm font-medium mb-2">
          Paste your tweet
        </label>
        <textarea
          id="tweet"
          value={tweet}
          onChange={(e) => setTweet(e.target.value)}
          placeholder="What's happening?!"
          className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          disabled={isLoading}
        />
        <div className="text-xs text-gray-500 mt-1">
          {tweet.length} characters
        </div>
      </div>

      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Analysis Mode:</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'simple' | 'detailed')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value="simple">Simple (Quick Tips)</option>
            <option value="detailed">Detailed (Full Breakdown)</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={!tweet.trim() || isLoading}
        className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Analyzing...' : 'Analyze Tweet'}
      </button>
    </form>
  );
}
