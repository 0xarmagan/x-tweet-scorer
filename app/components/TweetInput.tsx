'use client';

import { useState, useRef, useEffect } from 'react';

const SAMPLE_TWEET = "Just shipped a feature that cuts our API latency by 40%. The trick? Stop fetching data you don't need. Lazy loading isn't just for images.";
const CHAR_LIMIT = 280;

interface TweetInputProps {
  onSubmit: (tweet: string, mode: 'simple' | 'detailed') => void;
  isLoading: boolean;
}

export function TweetInput({ onSubmit, isLoading }: TweetInputProps) {
  const [tweet, setTweet] = useState('');
  const [mode, setMode] = useState<'simple' | 'detailed'>('simple');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${ta.scrollHeight}px`;
  }, [tweet]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tweet.trim()) onSubmit(tweet, mode);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && tweet.trim()) {
      onSubmit(tweet, mode);
    }
  };

  const isOverLimit = tweet.length > CHAR_LIMIT;

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Analysis Mode</p>
        <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
          {(['simple', 'detailed'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                mode === m
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {m === 'simple' ? 'Simple' : 'Detailed'}
              <span className="ml-1 text-xs opacity-70">
                {m === 'simple' ? '(Quick tips)' : '(Full breakdown)'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <label htmlFor="tweet" className="block text-sm font-medium text-gray-700 mb-2">
          Paste your tweet
        </label>
        <textarea
          id="tweet"
          ref={textareaRef}
          value={tweet}
          onChange={(e) => setTweet(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What's happening?!"
          rows={4}
          className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 resize-none overflow-hidden transition-colors ${
            isOverLimit
              ? 'border-red-400 focus:ring-red-300'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          disabled={isLoading}
          aria-label="Tweet text input"
        />
        <div className="flex justify-between items-center mt-1">
          <button
            type="button"
            onClick={() => setTweet(SAMPLE_TWEET)}
            className="text-xs text-blue-500 hover:text-blue-700 underline"
          >
            Try an example
          </button>
          <span className={`text-xs ${isOverLimit ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
            {tweet.length}{isOverLimit ? ` (+${tweet.length - CHAR_LIMIT} over limit)` : '/280'}
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!tweet.trim() || isLoading}
        className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            Analyze Tweet
            <span className="text-xs opacity-60 ml-1">⌘↵</span>
          </>
        )}
      </button>
    </form>
  );
}
