# Tweet Format-Aware Scoring

**Date:** 2026-05-17  
**Status:** Approved  

## Problem

The scorer currently treats all tweets as text-only. The Phoenix algorithm already includes format-specific signals (P_video_view ×14, P_photo_expand ×8, P_link_click ×11), but the LLM must guess whether media is present. This produces inaccurate signal probabilities — a video tweet scored without knowing it's a video will underestimate P_video_view.

## Solution

Add a **format selector** to the UI. Pass the selected format through to the LLM prompt as context. The LLM uses the format to score format-specific signals accurately.

## Formats

7 supported formats:

| Value | Label | Key scoring impact |
|-------|-------|--------------------|
| `text` | Text | Baseline — no media signals |
| `image` | Image | P_photo_expand ↑, P_dwell_time ↑ |
| `video` | Video | P_video_view ↑, P_share ↑, P_photo_expand = 0 |
| `article` | Article | P_link_click ↑↑, P_dwell_time ↑↑, P_bookmark ↑ |
| `poll` | Poll | P_reply ↑, P_dwell_time ↑, P_share ↓ |
| `gif` | GIF | P_photo_expand ↑, P_dwell_time ↑ (treated as animated image) |
| `thread` | Thread | P_follow ↑, P_profile_click ↑, P_dwell_time ↑↑ |

## Changes

### 1. `lib/types.ts`

Add `TweetFormat` type and extend `AnalysisRequest`:

```ts
export type TweetFormat = 'text' | 'image' | 'video' | 'article' | 'poll' | 'gif' | 'thread';

export interface AnalysisRequest {
  tweet_text: string;
  mode: 'simple' | 'detailed';
  format: TweetFormat; // new — defaults to 'text' if omitted
}
```

### 2. `lib/providers/types.ts` — `buildUserPrompt`

Add `format: TweetFormat` parameter. Prepend a format context block to the user prompt.

Each format block is 5–7 lines covering:
- Which signals are definitely activated / not applicable
- Baseline adjustments (e.g., "videos get 3× more shares than text")
- Any negative signal implications (e.g., polls can't be shared outside X easily)

Example for `video`:
```
TWEET FORMAT: video
Format scoring context:
- P_video_view (*14): Definitely activated — score based on topic relevance and hook quality
- P_photo_expand (*8): Not applicable — score 0
- P_dwell_time (*6): Higher baseline; users stop to watch
- P_share (*15): Videos get ~3× more shares than text tweets — adjust upward
- P_not_interested (*-5): Higher risk if video is low quality or misleading thumbnail
```

### 3. `app/api/analyze/route.ts`

- Accept `format` in the request body
- Validate it's one of the 7 values (default to `'text'` if missing for backward compat)
- Pass through to `analyzeTweet`

### 4. `lib/llm.ts`

Pass `format` from `AnalysisRequest` through to `buildUserPrompt`.

### 5. `lib/providers/claude.ts` and `lib/providers/ollama.ts`

Both call `buildUserPrompt(mode, tweet_text)` — update to pass `format` as third argument.

### 6. `app/components/TweetInput.tsx`

Add a **Tweet Format** row below the textarea, above the submit button:

- 7 pill-style toggle buttons in a wrap-friendly row
- One always selected (default: `text`)
- Selected state: blue fill (matches existing Simple/Detailed toggle style)
- Labels with emoji icons: 📝 Text · 🖼 Image · 🎬 Video · 📰 Article · 📊 Poll · 🎞 GIF · 🧵 Thread
- `format` state added to component; passed to `onSubmit`

Update `TweetInputProps.onSubmit` signature:
```ts
onSubmit: (tweet: string, mode: 'simple' | 'detailed', format: TweetFormat) => void;
```

### 7. `app/page.tsx`

Update `handleAnalyze` to accept and forward `format` to the API body.

## Out of Scope

- Uploading actual media files — format is a selector only, not a file upload
- Format-specific display in ScoreCard — results display unchanged
- Changing the official Phoenix signal weights — only prompt context changes
