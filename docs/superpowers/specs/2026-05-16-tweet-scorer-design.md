# X Tweet Scorer — Design Spec

**Date:** May 16, 2026  
**Project:** X Tweet Scorer  
**Version:** 1.0  

---

## Overview

A web app that analyzes tweets against the X algorithm's ranking principles (Grok transformer, engagement signals, candidate isolation) and provides score-based recommendations. Users paste tweet text, receive an engagement score (0-100) with actionable feedback, and optionally dive into detailed signal breakdowns.

---

## Core Requirements

- **Format:** Next.js web app (full-stack, TypeScript)
- **Input Method:** Paste tweet text (no X API integration)
- **No user accounts** — stateless tool, no persistence
- **Scoring Modes:** 
  - Simple (score + 3-5 quick tips)
  - Detailed (score + per-signal breakdown + reasoning) — optional toggle
- **Scoring Engine:** Claude API (semantic analysis of tweet engagement potential)

---

## Architecture

### Tech Stack
- **Frontend:** Next.js 15+, React 18+, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes (serverless)
- **AI Model:** Claude 3.5 Sonnet (via Anthropic SDK)
- **Hosting:** Vercel (or self-hosted Node)

### System Components

```
┌─────────────────────────────────────────┐
│         Next.js Web App                 │
├─────────────────────────────────────────┤
│  Frontend (React + Tailwind)            │
│  ├─ Tweet Input Component               │
│  ├─ Mode Toggle (Simple/Detailed)       │
│  ├─ Score Display Card                  │
│  ├─ Signals Breakdown (Detailed)        │
│  └─ Recommendations Panel               │
├─────────────────────────────────────────┤
│  API Routes (/api/analyze)              │
│  ├─ Accepts: { tweet_text, mode }      │
│  ├─ Calls Claude with system prompt     │
│  └─ Returns: JSON scoring result        │
├─────────────────────────────────────────┤
│  Claude API (via Anthropic SDK)         │
│  └─ Analyzes tweet through X algo lens  │
└─────────────────────────────────────────┘
```

---

## Scoring System

### Input
- Tweet text (max 280 characters, but tool accepts longer for analysis)
- Mode flag: "simple" or "detailed"

### Claude System Prompt (Abbreviated)
```
You are an expert analyzing tweets through the lens of X's Grok algorithm.
Grok evaluates tweets on:

1. ENGAGEMENT SIGNALS (weighted 0-100):
   - Like potential: emotional resonance, relatability, humor
   - Reply potential: discussion-starter, debate-worthy, asks questions
   - Repost potential: value, insight, actionable, novel
   - Click potential: curiosity, hooks, media presence
   - Video/media engagement: media format quality

2. CONTENT QUALITY:
   - Hook strength (first 5 words capture attention)
   - Clarity & conciseness (no filler, clear message)
   - Specificity (concrete examples vs vague claims)
   - Call-to-action (explicit next step for reader)

3. ALGORITHMIC FIT:
   - Candidate isolation: stands alone without context?
   - Newsworthiness: timely, relevant to current moment?
   - Safety: toxic language, harassment flags?

Output JSON with:
{
  "overall_score": 0-100,
  "signals": {
    "like_potential": 0-100,
    "reply_potential": 0-100,
    "repost_potential": 0-100,
    "click_potential": 0-100,
    "video_potential": 0-100
  },
  "content_quality": {
    "hook_strength": 0-100,
    "clarity": 0-100,
    "specificity": 0-100,
    "call_to_action": 0-100
  },
  "algorithmic_fit": {
    "candidate_isolation": 0-100,
    "newsworthiness": 0-100,
    "safety": 0-100
  },
  "simple_recommendations": ["tip1", "tip2", "tip3"],
  "detailed_recommendations": {
    "like_potential": "explanation + how to improve",
    "reply_potential": "explanation + how to improve",
    ...
  },
  "reasoning": "1-2 sentence explanation of overall score"
}
```

### Output Format

**Simple Mode:**
```
Engagement Score: 72/100
✅ Strong hook — first 5 words grab attention
✅ Clear call-to-action — tells reader what to do next
⚠️  Low specificity — use concrete examples instead of generalizations
💡 Add a question to boost reply potential
💡 Include relevant media to increase click potential
```

**Detailed Mode:** (expandable)
```
ENGAGEMENT SIGNALS
├─ Like Potential: 78/100 — Emotionally resonant, relatable angle
├─ Reply Potential: 65/100 — Asks implicit questions but could be more direct
├─ Repost Potential: 82/100 — High value, actionable insight
├─ Click Potential: 70/100 — Would benefit from media or link
└─ Video Potential: 0/100 — No media included

CONTENT QUALITY
├─ Hook Strength: 85/100 — First 5 words are compelling
├─ Clarity: 75/100 — Message is clear but could be tighter
├─ Specificity: 60/100 — Use concrete examples, not generalizations
└─ Call-to-Action: 80/100 — Strong implicit CTA

ALGORITHMIC FIT
├─ Candidate Isolation: 90/100 — Stands alone, doesn't need thread context
├─ Newsworthiness: 70/100 — Relevant but not time-critical
└─ Safety: 100/100 — No red flags

RECOMMENDATIONS BY SIGNAL
Like Potential (+8 points possible):
  Current: Emotional hook is good, but specificity is low
  Action: Add a concrete example. Instead of "this is amazing," say "this saves 3 hours/week"

Reply Potential (+35 points possible):
  Current: Implicit question but not direct
  Action: Turn into explicit question. "What's your biggest challenge with X?" gets more replies than "This is hard"

Repost Potential (+18 points possible):
  Current: Actionable and valuable, keep it
  Action: No change needed

[etc for each signal]

OVERALL REASONING
This tweet has a strong foundation (72/100) with excellent candidate isolation and a clear hook. 
The biggest opportunities are in reply potential (+35 points) via a direct question, and specificity 
in content quality (+20 points). Focus on one of those next.
```

---

## Data Flow

1. **User Input:**
   - Pastes tweet text in textarea
   - Selects mode (simple/detailed)
   - Clicks "Analyze"

2. **Frontend → Backend:**
   - POST `/api/analyze`
   - Payload: `{ tweet_text: string, mode: "simple" | "detailed" }`

3. **Backend → Claude:**
   - Constructs system prompt with scoring criteria
   - Calls `client.messages.create()` with model="claude-3-5-sonnet"
   - Streams response or waits for completion

4. **Backend → Frontend:**
   - Returns JSON: `{ overall_score, signals, recommendations, reasoning }`
   - Frontend renders in mode-appropriate format

5. **Frontend Display:**
   - Simple mode: Score card + quick tips
   - Detailed mode: Expandable sections for each signal group

---

## UI/UX

### Page Layout
- Header: "X Tweet Scorer" + tagline ("Analyze how your tweets align with X's algorithm")
- Main section:
  - Tweet input area (textarea, 280 char limit indicator)
  - Mode toggle (Simple / Detailed)
  - Analyze button (disabled until tweet is entered)
- Results section (appears below after analyze):
  - Score card (large, prominent)
  - Simple recommendations (always visible)
  - "See Detailed Analysis" link/button (hidden in simple mode)
  - Detailed breakdown (collapses/expands)
- Footer: "Powered by Claude API" + link to X algorithm GitHub

### Interactions
- Real-time character count under textarea
- Analyze button loading state (spinner)
- Error handling: show toast/alert if API fails
- Copy button on each recommendation
- Ability to paste another tweet and re-analyze

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Empty tweet | Disable Analyze button, show hint |
| API rate limit | Show error message, suggest retry in 30 seconds |
| Claude API error | Show user-friendly error, log to console |
| Network timeout | Retry up to 2x, then show error |
| Malformed response | Log error, show "Something went wrong" message |

---

## Development Phases

### Phase 1: MVP
- Basic input form + API route
- Simple mode scoring only
- Basic result display
- Tailwind styling

### Phase 2: Detailed Mode
- Expand Claude prompt to include signal breakdowns
- Build detailed result UI with expandable sections
- Improve visual hierarchy

### Phase 3: Polish & Optimization
- Add animations/transitions
- Implement result copying
- Add example tweets for users to try
- Optimize API calls (caching, streaming)
- Mobile responsiveness

---

## Environment Variables

```
ANTHROPIC_API_KEY=sk-...
NEXT_PUBLIC_API_URL=http://localhost:3000 (or production URL)
```

---

## Success Criteria

- ✅ User can paste a tweet and get a score within 2-3 seconds
- ✅ Simple mode shows score + 3-5 tips clearly
- ✅ Detailed mode shows signal breakdowns with reasoning
- ✅ Recommendations are actionable (not vague)
- ✅ UI works on desktop and mobile
- ✅ API handles errors gracefully

---

## Out of Scope

- X API integration (removed to reduce costs)
- User accounts or history
- Batch analysis of multiple tweets
- Real-time X feed analysis
- Machine learning model training
