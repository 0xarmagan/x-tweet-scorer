# Tweet Composer with Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current `TweetInput` with a `TweetComposer` component that adds a media upload zone, auto-detects format from the file, and shows an X-style tweet preview card before the user clicks Analyze.

**Architecture:** New `TweetComposer` component (`app/components/TweetComposer.tsx`) handles two steps internally (`compose | preview`). Step 1 is the current composer UI plus a media upload zone; Step 2 renders a tweet preview card. `page.tsx` swaps `TweetInput` for `TweetComposer` — same `onSubmit` interface, no backend changes.

**Tech Stack:** Next.js 16, React 18, TypeScript, Tailwind CSS, browser File API (object URLs)

---

### Task 1: TweetComposer — compose step with media upload

**Files:**
- Create: `app/components/TweetComposer.tsx`

- [ ] **Step 1: Create the full compose step**

Write `app/components/TweetComposer.tsx` with this exact content:

```tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { TweetFormat } from '@/lib/types';

const SAMPLE_TWEET = "Just shipped a feature that cuts our API latency by 40%. The trick? Stop fetching data you don't need. Lazy loading isn't just for images.";
const CHAR_LIMIT = 280;
const MEDIA_FORMATS: TweetFormat[] = ['image', 'video', 'gif'];

const FORMAT_OPTIONS: { value: TweetFormat; label: string; icon: string }[] = [
  { value: 'text',    label: 'Text',    icon: '📝' },
  { value: 'image',   label: 'Image',   icon: '🖼️' },
  { value: 'video',   label: 'Video',   icon: '🎬' },
  { value: 'article', label: 'Article', icon: '📰' },
  { value: 'poll',    label: 'Poll',    icon: '📊' },
  { value: 'gif',     label: 'GIF',     icon: '🎞️' },
  { value: 'thread',  label: 'Thread',  icon: '🧵' },
];

function detectFormat(file: File): TweetFormat {
  if (file.type.startsWith('video/')) return 'video';
  if (file.type === 'image/gif') return 'gif';
  if (file.type.startsWith('image/')) return 'image';
  return 'text';
}

type Step = 'compose' | 'preview';

interface TweetComposerProps {
  onSubmit: (tweet: string, mode: 'simple' | 'detailed', format: TweetFormat) => void;
  isLoading: boolean;
}

export function TweetComposer({ onSubmit, isLoading }: TweetComposerProps) {
  const [step, setStep] = useState<Step>('compose');
  const [tweet, setTweet] = useState('');
  const [mode, setMode] = useState<'simple' | 'detailed'>('simple');
  const [format, setFormat] = useState<TweetFormat>('text');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${ta.scrollHeight}px`;
  }, [tweet]);

  useEffect(() => {
    return () => {
      if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    };
  }, [mediaUrl]);

  const attachFile = useCallback((file: File) => {
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    setMediaFile(file);
    setMediaUrl(URL.createObjectURL(file));
    setFormat(detectFormat(file));
  }, [mediaUrl]);

  const removeMedia = () => {
    if (mediaUrl) URL.revokeObjectURL(mediaUrl);
    setMediaFile(null);
    setMediaUrl(null);
    setFormat('text');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) attachFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) attachFile(file);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && tweet.trim()) {
      setStep('preview');
    }
  };

  const isOverLimit = tweet.length > CHAR_LIMIT;
  const hasMedia = mediaFile !== null;

  if (step === 'preview') {
    return null; // replaced in Task 2
  }

  return (
    <div className="w-full">
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
              Source:{' '}
              <a href="https://github.com/xai-org/x-algorithm" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
                github.com/xai-org/x-algorithm
              </a>{' '}
              (May 2026)
            </p>
          </div>
        )}
      </div>

      <div className="w-full space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Analysis Mode</p>
          <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
            {(['simple', 'detailed'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  mode === m ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
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

        <div>
          <label htmlFor="tweet" className="block text-sm font-medium text-gray-700 mb-2">
            Tweet Text
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
              isOverLimit ? 'border-red-400 focus:ring-red-300' : 'border-gray-300 focus:ring-blue-500'
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

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Attach Media <span className="font-normal text-gray-400">(optional)</span>
          </p>
          {hasMedia ? (
            <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
              {format === 'video' ? (
                <video src={mediaUrl ?? undefined} className="w-16 h-16 rounded object-cover" />
              ) : (
                <img src={mediaUrl ?? undefined} alt="media preview" className="w-16 h-16 rounded object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{mediaFile!.name}</p>
                <p className="text-xs text-gray-400">
                  {FORMAT_OPTIONS.find((f) => f.value === format)?.icon} {format}
                </p>
              </div>
              <button
                type="button"
                onClick={removeMedia}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none px-1"
                aria-label="Remove media"
              >
                ×
              </button>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
                isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-gray-50'
              }`}
            >
              <div className="text-2xl mb-1">📎</div>
              <p className="text-sm text-gray-500">
                Drop image, GIF, or video · or{' '}
                <span className="text-blue-500 underline">browse</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">JPG · PNG · GIF · MP4 · MOV</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Tweet Format
            {hasMedia && (
              <span className="ml-2 text-xs font-normal text-gray-400">auto-detected from file</span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {FORMAT_OPTIONS.map(({ value, label, icon }) => {
              const isMediaPill = MEDIA_FORMATS.includes(value);
              const isDisabled = hasMedia && isMediaPill && value !== format;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => { if (!isDisabled) setFormat(value); }}
                  disabled={isDisabled}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${
                    format === value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : isDisabled
                      ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {icon} {label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          disabled={!tweet.trim() || isLoading || isOverLimit}
          onClick={() => setStep('preview')}
          className="w-full bg-slate-900 text-white font-medium py-2.5 rounded-lg hover:bg-slate-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Preview Tweet →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd /Users/armagan/x-tweet-scorer && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
cd /Users/armagan/x-tweet-scorer && git add app/components/TweetComposer.tsx && git commit -m "feat: add TweetComposer compose step with media upload"
```

---

### Task 2: TweetComposer — preview step

**Files:**
- Modify: `app/components/TweetComposer.tsx`

- [ ] **Step 1: Replace the `if (step === 'preview') { return null; }` block**

In `app/components/TweetComposer.tsx`, find the block:

```tsx
  if (step === 'preview') {
    return null; // replaced in Task 2
  }
```

Replace it with the full preview step:

```tsx
  if (step === 'preview') {
    const formatOption = FORMAT_OPTIONS.find((f) => f.value === format);
    return (
      <div className="w-full space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Your Tweet Preview</p>
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div className="p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-sm text-gray-900">Your Name</span>
                    <span className="text-sm text-gray-400">@yourhandle · now</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {tweet}
                  </p>
                </div>
              </div>

              {mediaUrl && (
                <div className="mt-3">
                  {format === 'video' ? (
                    <video
                      src={mediaUrl}
                      controls
                      className="rounded-xl w-full max-h-64 object-cover"
                    />
                  ) : (
                    <img
                      src={mediaUrl}
                      alt="tweet media"
                      className="rounded-xl w-full object-cover max-h-64"
                    />
                  )}
                </div>
              )}

              <div className="flex gap-5 mt-3 text-gray-400 text-sm">
                <span>💬</span>
                <span>🔁</span>
                <span>❤️</span>
                <span>🔖</span>
                <span>↗️</span>
              </div>
            </div>

            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Format: <strong className="text-gray-700">{formatOption?.icon} {formatOption?.label}</strong>
              </span>
              <button
                type="button"
                onClick={() => setStep('compose')}
                className="text-xs text-blue-500 hover:text-blue-700"
              >
                change ↗
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep('compose')}
            className="flex-1 border border-gray-200 text-gray-600 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            ← Edit
          </button>
          <button
            type="button"
            onClick={() => onSubmit(tweet, mode, format)}
            disabled={isLoading}
            className="flex-2 w-full bg-blue-600 text-white font-medium py-2.5 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </span>
            ) : (
              'Analyze Tweet ✦'
            )}
          </button>
        </div>
      </div>
    );
  }
```

- [ ] **Step 2: TypeScript check**

```bash
cd /Users/armagan/x-tweet-scorer && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors.

- [ ] **Step 3: Lint check**

```bash
cd /Users/armagan/x-tweet-scorer && npm run lint 2>&1 | grep -v "skills/tweet-scorer"
```

Expected: no errors (only pre-existing warnings in `skills/tweet-scorer/handler.ts` are acceptable).

- [ ] **Step 4: Commit**

```bash
cd /Users/armagan/x-tweet-scorer && git add app/components/TweetComposer.tsx && git commit -m "feat: add preview step to TweetComposer"
```

---

### Task 3: Wire TweetComposer into page.tsx and smoke test

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Swap import in page.tsx**

In `app/page.tsx`, change:

```ts
import { TweetInput } from './components/TweetInput';
```

to:

```ts
import { TweetComposer } from './components/TweetComposer';
```

- [ ] **Step 2: Swap usage in JSX**

In `app/page.tsx`, find:

```tsx
        {!result && !loading && (
          <TweetInput onSubmit={handleAnalyze} isLoading={loading} />
        )}
```

Change to:

```tsx
        {!result && !loading && (
          <TweetComposer onSubmit={handleAnalyze} isLoading={loading} />
        )}
```

- [ ] **Step 3: TypeScript check — zero errors**

```bash
cd /Users/armagan/x-tweet-scorer && npx tsc --noEmit
```

Expected: no output (zero errors).

- [ ] **Step 4: Lint check — zero errors**

```bash
cd /Users/armagan/x-tweet-scorer && npm run lint 2>&1 | grep -v "skills/tweet-scorer"
```

Expected: no errors.

- [ ] **Step 5: Start dev server and smoke test**

```bash
cd /Users/armagan/x-tweet-scorer && npm run dev
```

Open http://localhost:3000. Verify the compose step:
1. Textarea, mode toggle, media upload zone, format selector, and "Preview Tweet →" button all visible
2. "Preview Tweet →" is disabled with empty textarea; enabled after typing
3. Upload an image → thumbnail appears, format auto-selects "🖼️ Image", other media pills (Video, GIF) go gray/disabled
4. Remove the image → upload zone returns, format resets to "📝 Text"
5. Type tweet text + keep image attached → click "Preview Tweet →"

Verify the preview step:
6. X-style tweet card renders with the tweet text
7. Uploaded image appears below the text in the card
8. Format badge shows "🖼️ Image · change ↗"
9. Click "← Edit" → returns to compose with all state preserved (text, image, format intact)
10. Back in compose → click "Preview Tweet →" again → click "Analyze Tweet ✦" → score card appears

- [ ] **Step 6: Commit**

```bash
cd /Users/armagan/x-tweet-scorer && git add app/page.tsx && git commit -m "feat: wire TweetComposer into page replacing TweetInput"
```
