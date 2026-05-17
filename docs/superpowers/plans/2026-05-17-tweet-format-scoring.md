# Tweet Format-Aware Scoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 7-option tweet format selector (Text/Image/Video/Article/Poll/GIF/Thread) that injects format-specific context into the LLM prompt for accurate Phoenix signal scoring.

**Architecture:** Format flows UI → `AnalysisRequest` → API route → `buildUserPrompt`. A `getFormatContext(format)` helper returns a 5–7 line context block that is prepended to the user prompt. The LLM uses this to correctly score format-specific signals (P_video_view, P_photo_expand, P_link_click, etc.) without changing the official Phoenix weights.

**Tech Stack:** Next.js, TypeScript, React, Anthropic SDK / Ollama API

---

### Task 1: Add TweetFormat type

**Files:**
- Modify: `lib/types.ts`

- [ ] **Step 1: Add TweetFormat and update AnalysisRequest**

Open `lib/types.ts`. Replace the existing `AnalysisRequest` interface with:

```ts
export type TweetFormat = 'text' | 'image' | 'video' | 'article' | 'poll' | 'gif' | 'thread';

export interface AnalysisRequest {
  tweet_text: string;
  mode: 'simple' | 'detailed';
  format: TweetFormat;
}
```

Leave all other interfaces (`EngagementSignals`, `NegativeSignals`, `ContentQuality`, `SimpleRecommendations`, `DetailedAnalysis`, `AnalysisResult`) unchanged.

- [ ] **Step 2: Check TypeScript**

```bash
cd /Users/armagan/x-tweet-scorer && npx tsc --noEmit 2>&1 | head -30
```

Expected: errors about `format` missing in callers — that's correct. We'll fix them in subsequent tasks. No other errors.

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts && git commit -m "feat: add TweetFormat type to AnalysisRequest"
```

---

### Task 2: Add format context injection to buildUserPrompt

**Files:**
- Modify: `lib/providers/types.ts`

- [ ] **Step 1: Add TweetFormat import at the top of the file**

At line 1 of `lib/providers/types.ts`, add:

```ts
import { TweetFormat } from '../types';
```

- [ ] **Step 2: Add getFormatContext helper**

Add this function directly above `export const SYSTEM_PROMPT`:

```ts
export function getFormatContext(format: TweetFormat): string {
  const contexts: Record<TweetFormat, string> = {
    text: `TWEET FORMAT: text
Format scoring context:
- Text-only tweet. No media attached.
- P_photo_expand (*8): Not applicable — score 0
- P_video_view (*14): Not applicable — score 0
- P_dwell_time (*6): Depends entirely on copy quality and length`,

    image: `TWEET FORMAT: image
Format scoring context:
- This tweet has 1–4 images attached.
- P_photo_expand (*8): Definitely activated — score based on image relevance and visual quality
- P_video_view (*14): Not applicable — score 0
- P_dwell_time (*6): Higher baseline; users stop to view images
- P_share (*15): Images get ~2× more shares than text tweets — adjust upward`,

    video: `TWEET FORMAT: video
Format scoring context:
- This tweet has a video attached.
- P_video_view (*14): Definitely activated — score based on topic relevance and hook quality
- P_photo_expand (*8): Not applicable — score 0
- P_dwell_time (*6): Higher baseline; users stop to watch
- P_share (*15): Videos get ~3× more shares than text tweets — adjust upward
- P_not_interested (*-5): Higher risk if video appears low quality or misleading`,

    article: `TWEET FORMAT: article
Format scoring context:
- This is an X Article (long-form content linked from the tweet).
- P_link_click (*11): Definitely activated — article tweets drive strong click intent
- P_dwell_time (*6): Very high baseline; readers commit significant time
- P_bookmark (*10): Elevated — articles are saved for later reading
- P_retweet (*20): Strong if article provides unique insight or original data
- P_photo_expand (*8): Not applicable — score 0
- P_video_view (*14): Not applicable — score 0`,

    poll: `TWEET FORMAT: poll
Format scoring context:
- This tweet has a poll attached.
- P_reply (*13.5): Elevated; polls generate discussion around results
- P_dwell_time (*6): High; users stop to read options and vote
- P_like (*1): Often lower than average; users vote instead of liking
- P_share (*15): Below average; polls are harder to share outside X
- P_photo_expand (*8): Not applicable — score 0
- P_video_view (*14): Not applicable — score 0`,

    gif: `TWEET FORMAT: gif
Format scoring context:
- This tweet has an animated GIF attached. Treat as animated image.
- P_photo_expand (*8): Definitely activated — score based on GIF relevance, humor, or emotion
- P_video_view (*14): Not applicable — score 0
- P_dwell_time (*6): Moderate boost; GIFs loop and hold attention briefly
- P_share (*15): High if GIF is funny, relatable, or culturally relevant
- P_not_interested (*-5): Higher risk if GIF feels low-effort or spammy`,

    thread: `TWEET FORMAT: thread
Format scoring context:
- This is the first tweet of a thread.
- P_follow_author (*9): Elevated; threads signal expertise and depth
- P_profile_click (*12): Elevated; readers want to learn more about the author
- P_dwell_time (*6): Highest baseline of all formats; readers commit to the full thread
- P_bookmark (*10): High; threads are saved to read later
- P_retweet (*20): Strong if thread tells a compelling story or shares exclusive knowledge
- P_reply (*13.5): Strong once readers have finished the full thread`,
  };

  return contexts[format];
}
```

- [ ] **Step 3: Update buildUserPrompt signature and inject context**

Change the function signature from:
```ts
export function buildUserPrompt(mode: 'simple' | 'detailed', tweet_text: string): string {
```
to:
```ts
export function buildUserPrompt(mode: 'simple' | 'detailed', tweet_text: string, format: TweetFormat = 'text'): string {
  const formatContext = getFormatContext(format);
```

Then in the `if (mode === 'simple')` branch, change the opening of the return template literal from:
```ts
    return `SIMPLE MODE - X ALGORITHM ANALYSIS (OFFICIAL):
```
to:
```ts
    return `${formatContext}

SIMPLE MODE - X ALGORITHM ANALYSIS (OFFICIAL):
```

And in the `return` for detailed mode, change:
```ts
  return `DETAILED MODE - X ALGORITHM ANALYSIS (OFFICIAL):
```
to:
```ts
  return `${formatContext}

DETAILED MODE - X ALGORITHM ANALYSIS (OFFICIAL):
```

- [ ] **Step 4: Check TypeScript**

```bash
cd /Users/armagan/x-tweet-scorer && npx tsc --noEmit 2>&1 | head -30
```

Expected: same caller errors as Task 1 (not yet fixed), no new errors.

- [ ] **Step 5: Commit**

```bash
git add lib/providers/types.ts && git commit -m "feat: add getFormatContext and inject format into buildUserPrompt"
```

---

### Task 3: Update providers to pass format

**Files:**
- Modify: `lib/providers/claude.ts` line 19
- Modify: `lib/providers/ollama.ts` line 21

- [ ] **Step 1: Update claude.ts**

In `lib/providers/claude.ts`, line 19, change:
```ts
messages: [{ role: 'user', content: buildUserPrompt(request.mode, request.tweet_text) }],
```
to:
```ts
messages: [{ role: 'user', content: buildUserPrompt(request.mode, request.tweet_text, request.format) }],
```

- [ ] **Step 2: Update ollama.ts**

In `lib/providers/ollama.ts`, line 21, change:
```ts
          { role: 'user', content: buildUserPrompt(request.mode, request.tweet_text) },
```
to:
```ts
          { role: 'user', content: buildUserPrompt(request.mode, request.tweet_text, request.format) },
```

- [ ] **Step 3: Check TypeScript**

```bash
cd /Users/armagan/x-tweet-scorer && npx tsc --noEmit 2>&1 | head -30
```

Expected: only API route and TweetInput/page.tsx caller errors remain.

- [ ] **Step 4: Commit**

```bash
git add lib/providers/claude.ts lib/providers/ollama.ts && git commit -m "feat: pass format through to buildUserPrompt in both providers"
```

---

### Task 4: Update API route

**Files:**
- Modify: `app/api/analyze/route.ts`

- [ ] **Step 1: Replace route handler with format-aware version**

Replace the entire contents of `app/api/analyze/route.ts` with:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { analyzeTweet } from '@/lib/llm';
import { AnalysisRequest, TweetFormat } from '@/lib/types';

const VALID_FORMATS: TweetFormat[] = ['text', 'image', 'video', 'article', 'poll', 'gif', 'thread'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.tweet_text || !body.mode) {
      return NextResponse.json(
        { error: 'Missing required fields: tweet_text, mode' },
        { status: 400 }
      );
    }

    if (body.tweet_text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tweet text cannot be empty' },
        { status: 400 }
      );
    }

    if (!['simple', 'detailed'].includes(body.mode)) {
      return NextResponse.json(
        { error: 'Mode must be "simple" or "detailed"' },
        { status: 400 }
      );
    }

    const analysisRequest: AnalysisRequest = {
      tweet_text: body.tweet_text,
      mode: body.mode,
      format: VALID_FORMATS.includes(body.format) ? body.format : 'text',
    };

    const result = await analyzeTweet(analysisRequest);
    return NextResponse.json(result);
  } catch (error) {
    console.error('API error:', error);

    if (error instanceof Error) {
      if (error.message.includes('API')) {
        return NextResponse.json(
          { error: 'Claude API error. Please check your API key and quota.' },
          { status: 500 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Check TypeScript**

```bash
cd /Users/armagan/x-tweet-scorer && npx tsc --noEmit 2>&1 | head -30
```

Expected: only TweetInput and page.tsx errors remain.

- [ ] **Step 3: Commit**

```bash
git add app/api/analyze/route.ts && git commit -m "feat: accept and validate format in analyze API route"
```

---

### Task 5: Add format selector to TweetInput

**Files:**
- Modify: `app/components/TweetInput.tsx`

- [ ] **Step 1: Replace TweetInput with format-aware version**

Replace the entire contents of `app/components/TweetInput.tsx` with:

```tsx
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
              <span className="font-semibold text-gray-800">What it does:</span> Scores your tweet (0–100) by predicting how X's algorithm would rank it — based on the official open-source Phoenix transformer model.
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
```

- [ ] **Step 2: Check TypeScript**

```bash
cd /Users/armagan/x-tweet-scorer && npx tsc --noEmit 2>&1 | head -30
```

Expected: only page.tsx error about handleAnalyze signature mismatch.

- [ ] **Step 3: Commit**

```bash
git add app/components/TweetInput.tsx && git commit -m "feat: add tweet format selector to TweetInput"
```

---

### Task 6: Wire format through page.tsx and smoke test

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add TweetFormat import**

At the top of `app/page.tsx`, add to the existing imports:

```ts
import { AnalysisResult, TweetFormat } from '@/lib/types';
```

- [ ] **Step 2: Update handleAnalyze signature and API call**

Change the `handleAnalyze` function signature from:
```ts
const handleAnalyze = async (tweet: string, mode: 'simple' | 'detailed') => {
```
to:
```ts
const handleAnalyze = async (tweet: string, mode: 'simple' | 'detailed', format: TweetFormat) => {
```

Change the `body` in the fetch call from:
```ts
body: JSON.stringify({ tweet_text: tweet, mode }),
```
to:
```ts
body: JSON.stringify({ tweet_text: tweet, mode, format }),
```

- [ ] **Step 3: Verify zero TypeScript errors**

```bash
cd /Users/armagan/x-tweet-scorer && npx tsc --noEmit
```

Expected: no output (zero errors).

- [ ] **Step 4: Start dev server and smoke test**

```bash
npm run dev
```

Open http://localhost:3000. Verify:
1. **Format row appears** between the textarea and Analyze button with 7 pill buttons
2. **Default:** "📝 Text" is blue/selected
3. **Click "🎬 Video"** — it highlights blue, Text deselects
4. **Submit with Video** — open browser DevTools → Network → the request body shows `"format":"video"`
5. **Score returns** — a result card renders without errors

- [ ] **Step 5: Spot-check format impact**

Submit the same tweet twice:
- Once as **Text**
- Once as **Video**

Tweet to use: `"Just launched my new course on building AI agents. 5 hours of content, real projects, free for the first 100 signups."`

The Video score should be noticeably higher (P_video_view ×14 and P_share ×15 both boosted). If both scores are identical, check that the format context block is appearing in the prompt by adding a `console.log(userPrompt.slice(0, 200))` temporarily in `lib/providers/claude.ts` line 19 area.

- [ ] **Step 6: Final commit**

```bash
git add app/page.tsx && git commit -m "feat: wire tweet format through page and complete format-aware scoring"
```
