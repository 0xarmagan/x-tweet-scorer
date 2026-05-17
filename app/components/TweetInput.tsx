'use client';

import { useState, useRef, useEffect } from 'react';
import { TweetFormat } from '@/lib/types';

const SAMPLE_TWEET = "Just shipped a feature that cuts our API latency by 40%. The trick? Stop fetching data you don't need. Lazy loading isn't just for images.";
const CHAR_LIMIT = 280;

const FORMAT_OPTIONS: { value: TweetFormat; label: string; icon: string }[] = [
  { value: 'text',    label: 'Text',    icon: '📝' },
  { value: 'image',   label: 'Image',   icon: '🖼️' },
  { value: 'video',   label: 'Video',   icon: '🎬' },
  { value: 'article', label: 'Article', icon: '📰' },
  { value: 'poll',    label: 'Poll',    icon: '📊' },
  { value: 'gif',     label: 'GIF',     icon: '🎞️' },
  { value: 'thread',  label: 'Thread',  icon: '🧵' },
];

interface TweetInputProps {
  onSubmit: (tweet: string, mode: 'simple' | 'detailed', format: TweetFormat) => void;
  isLoading: boolean;
}

export function TweetInput({ onSubmit, isLoading }: TweetInputProps) {
  const [tweet, setTweet] = useState('');
  const [mode, setMode] = useState<'simple' | 'detailed'>('simple');
  const [format, setFormat] = useState<TweetFormat>('text');
  const [showInfo, setShowInfo] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${ta.scrollHeight}px`;
  }, [tweet]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tweet.trim()) onSubmit(tweet, mode, format);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && tweet.trim()) {
      onSubmit(tweet, mode, format);
    }
  };

  const isOverLimit = tweet.length > CHAR_LIMIT;

  return (
    <div className="w-full">
      {/* How it works panel */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => setShowInfo(!showInfo)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <span>{showInfo ? '▾' : '▸'}</span>
          How does this work?
        </button>

        {showInfo && (
          <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-gray-600 space-y-3">
            <p>
              <span className="font-semibold text-gray-800">What it does:</span> Scores your tweet (0–100) by predicting how X&apos;s algorithm would rank it — based on the official open-source Phoenix transformer model.
            </p>
            <p>
              <span className="font-semibold text-gray-800">How scoring works:</span> The algorithm predicts 15 user actions (retweet, reply, quote, bookmark, etc.) and applies official engagement weights. Retweets carry the most weight (×20), followed by quotes (×18) and shares (×15). Negative signals like mutes and blocks suppress the score.
            </p>
            <div>
              <span className="font-semibold text-gray-800">Two modes:</span>
              <ul className="mt-1 ml-4 space-y-1 list-disc">
                <li><span className="font-medium">Simple</span> — overall score + 3–5 actionable tips</li>
                <li><span className="font-medium">Detailed</span> — all 15 signals with individual scores, risk signals, and per-action recommendations</li>
              </ul>
            </div>
            <p className="text-xs text-gray-400">
              Source: <a href="https://github.com/xai-org/x-algorithm" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">github.com/xai-org/x-algorithm</a> (May 2026)
            </p>
          </div>
        )}
      </div>

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

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Tweet Format</p>
          <div className="flex flex-wrap gap-2">
            {FORMAT_OPTIONS.map(({ value, label, icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormat(value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${
                  format === value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {icon} {label}
              </button>
            ))}
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
    </div>
  );
}
