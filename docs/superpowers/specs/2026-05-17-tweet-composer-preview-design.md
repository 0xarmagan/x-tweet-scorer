# Tweet Composer with Preview Design

**Date:** 2026-05-17
**Status:** Approved

## Problem

The current format selector requires users to manually pick a format label. A richer UX lets users actually compose the tweet with media attached, auto-detects the format, and shows a rendered X-style preview before analyzing — removing guesswork and making the format context more accurate.

## Solution

Replace `TweetInput` usage in `page.tsx` with a new `TweetComposer` component that supports a two-step flow: **Compose → Preview → Analyze**. The existing format selector remains functional for non-media formats (Text, Article, Poll, Thread).

## Architecture

**Files changed:**
- **Create:** `app/components/TweetComposer.tsx` — two-step composer component
- **Modify:** `app/page.tsx` — swap `TweetInput` import/usage for `TweetComposer` (2 lines)
- **Unchanged:** `app/components/TweetInput.tsx`, all backend files, `lib/types.ts`, providers

`TweetComposer` has the same external interface as `TweetInput`:
```ts
interface TweetComposerProps {
  onSubmit: (tweet: string, mode: 'simple' | 'detailed', format: TweetFormat) => void;
  isLoading: boolean;
}
```

No backend changes — `format` flows to the API exactly as before.

## Component State

```ts
type Step = 'compose' | 'preview';

const [step, setStep] = useState<Step>('compose');
const [tweet, setTweet] = useState('');
const [mode, setMode] = useState<'simple' | 'detailed'>('simple');
const [format, setFormat] = useState<TweetFormat>('text');
const [mediaFile, setMediaFile] = useState<File | null>(null);
const [mediaUrl, setMediaUrl] = useState<string | null>(null);
```

`mediaUrl` is a browser object URL created via `URL.createObjectURL(file)`. It is revoked in a `useEffect` cleanup to prevent memory leaks.

## Format Auto-Detection

When a file is attached:
```ts
function detectFormat(file: File): TweetFormat {
  if (file.type.startsWith('video/')) return 'video';
  if (file.type === 'image/gif') return 'gif';
  if (file.type.startsWith('image/')) return 'image';
  return 'text';
}
```

- Detected format is set via `setFormat(detectFormat(file))`
- Media pills (Image, Video, GIF) are auto-selected and other media pills disabled when a file is present
- Non-media pills (Text, Article, Poll, Thread) remain clickable at all times
- Removing the file resets format to `'text'` and re-enables all pills

Accepted file types: `image/*,video/*`

## Step 1: Compose

Rendered when `step === 'compose'`. Contains (top to bottom):

1. **"How does this work?" info panel** — collapsed by default, identical to current TweetInput
2. **Analysis Mode toggle** — Simple / Detailed segmented control (unchanged)
3. **Tweet textarea** — 280 char limit, auto-resize, character counter (unchanged)
4. **Media upload zone** — dashed border drop area + click-to-browse; accepts `image/*,video/*`
   - Empty state: "📎 Drop image, GIF, or video · or browse"
   - Filled state: thumbnail preview + filename + `×` remove button
   - Drag-and-drop: `onDragOver` / `onDrop` handlers on the zone div
5. **Format selector** — all 7 pills; media pills disabled (not hidden) when file attached; shows tooltip hint "Auto-detected from file" on disabled pills
6. **"Preview Tweet →" button** — disabled when `tweet.trim()` is empty; dark background (`bg-slate-900`)

## Step 2: Preview

Rendered when `step === 'preview'`. Contains:

1. **X-style tweet card** (rounded border, white background):
   - Avatar placeholder (gray circle) + display name "Your Name" + handle "@yourhandle · now"
   - Tweet text
   - Media block (only if `mediaUrl` is set):
     - Image/GIF: `<img src={mediaUrl} alt="tweet media" className="rounded-xl w-full object-cover max-h-64" />`
     - Video: `<video src={mediaUrl} controls className="rounded-xl w-full max-h-64" />`
   - Engagement row: 💬 🔁 ❤️ 🔖 ↗️ (decorative, non-interactive)
   - **Format badge row** (bottom of card, light gray background):
     `Format auto-detected: 🖼️ Image  ·  change ↗`
     Clicking "change" calls `setStep('compose')`
2. **Button row:**
   - `← Edit` (outlined, secondary) — calls `setStep('compose')`
   - `Analyze Tweet ✦` (blue, primary, full-width) — calls `onSubmit(tweet, mode, format)`

## page.tsx Changes

Two-line swap:
```ts
// Before
import { TweetInput } from './components/TweetInput';
// ...
<TweetInput onSubmit={handleAnalyze} isLoading={loading} />

// After
import { TweetComposer } from './components/TweetComposer';
// ...
<TweetComposer onSubmit={handleAnalyze} isLoading={loading} />
```

## Out of Scope

- Uploading media to any server or passing it to the LLM
- Displaying the actual username/avatar (static placeholder only)
- Video thumbnail generation
- File size validation beyond browser defaults
- Accessibility improvements beyond what already exists
