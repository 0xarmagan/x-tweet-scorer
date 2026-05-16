# X Tweet Scorer

**Analyze how your tweets align with X's official algorithm. Get a detailed engagement score (0-100) and actionable recommendations to improve performance.**

This tool implements **X's open-source Phoenix transformer algorithm** (released Jan 2026) with all 15 official engagement signals, weighted multipliers, and trend alignment detection.

---

## Features

### Core Features
- **Official X Algorithm**: Uses exact weights from [github.com/xai-org/x-algorithm](https://github.com/xai-org/x-algorithm)
- **15 Engagement Signals**: Predicts all Phoenix transformer action types (not just 5)
- **Real Engagement Weights**: 
  - Retweets ×20 | Quotes ×18 | Shares ×15 | Replies ×13.5 | Profile Clicks ×12 | Links ×11 | Bookmarks ×10 | Video ×14 | Dwell ×6 | Likes ×1
- **Negative Signals**: Detects block/mute/spam patterns (suppress by 70%)
- **Engagement Sequences**: Predicts viral vs decay patterns
- **Dwell Time**: Estimates how long users will spend reading
- **Trend Alignment**: Scores relevance to breaking news/trending topics
- **Multi-Mode Analysis**:
  - **Simple Mode**: Score + 3-5 tips
  - **Detailed Mode**: All 15 signals + sequence patterns + per-action recommendations

### UI/UX Features
- **Mode Toggle**: Switch between Simple and Detailed analysis
- **Auto-Growing Textarea**: Expands as you type
- **Character Counter**: 0-280 with red warning at 280+
- **Sample Tweet**: Pre-loaded example for testing
- **Keyboard Shortcut**: Cmd/Ctrl+Enter to analyze
- **Loading Timer**: Shows elapsed seconds during analysis
- **Cancel Button**: Abort long-running analyses
- **Score Visualization**: Progress bars for all metrics
- **Tier Labels**: Excellent/Good/Needs Work/At Risk
- **Smooth Reset**: Return to input without page reload

### Supported Backends
- **Anthropic Claude API** (cloud, recommended for production)
- **Ollama** (local, free, privacy-respecting)

---

## Tech Stack

- **Frontend**: Next.js 16, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **AI Engines**:
  - Cloud: Anthropic Claude 3.5 Sonnet
  - Local: Ollama (gemma4, mistral, or compatible models)
- **Hosting**: Vercel, self-hosted Node.js, or Docker

---

## Getting Started

### Prerequisites

- Node.js 20+
- **Choose one:**
  - Anthropic API key: https://console.anthropic.com (free tier available)
  - Ollama: https://ollama.ai (100% local, free)

### Installation

1. **Clone and install**
```bash
git clone <repo-url>
cd x-tweet-scorer
npm install
```

2. **Configure for Claude (cloud)**
```bash
cat > .env.local << EOF
LLM_PROVIDER=claude
ANTHROPIC_API_KEY=your_key_here
EOF
```

**OR configure for Ollama (local)**
```bash
# Pull a model (one-time)
ollama pull gemma4:latest

# Create config
cat > .env.local << EOF
LLM_PROVIDER=ollama
OLLAMA_MODEL=gemma4
OLLAMA_BASE_URL=http://localhost:11434
EOF
```

3. **Start development**
```bash
# Terminal 1: Start Next.js dev server
npm run dev

# Terminal 2 (if using Ollama): Start Ollama
ollama serve
```

4. **Open browser**
```
http://localhost:3000
```

---

## How It Works

### The Official X Algorithm (Phoenix Transformer)

X's algorithm scores tweets by predicting **15 user actions** and applying official engagement weights:

#### Positive Engagement (constructive interactions)
| Action | Weight | What it means |
|--------|--------|---------------|
| Retweet | ×20 | Shares to network (most valuable) |
| Quote | ×18 | Remixes with added value |
| Share | ×15 | Shares outside X (extends reach) |
| Reply | ×13.5 | Drives conversation |
| Profile Click | ×12 | Interest in author |
| Link Click | ×11 | Engagement signal |
| Bookmark | ×10 | Save for later (strong intent) |
| Video View | ×14 | Media consumption |
| Follow | ×9 | Authority recognition |
| Dwell Time | ×6 | Time spent reading |
| Photo Expand | ×8 | Visual engagement |
| Like | ×1 | Baseline positive |

#### Negative Engagement (suppressive signals)
| Action | Weight | Impact |
|--------|--------|--------|
| Not Interested | ×-5 | User deprioritizes |
| Mute | ×-15 | User rejects author |
| Block | ×-20 | Hard stop (70% score reduction) |

### Scoring Formula

```
engagement_score = sum(weight_i * P(action_i))
                 = (20*P_retweet) + (18*P_quote) + (15*P_share)
                   + (13.5*P_reply) + (12*P_profile) + (11*P_link)
                   + (10*P_bookmark) + (14*P_video) + (6*P_dwell)
                   + (9*P_follow) + (8*P_photo) + (1*P_like)
                   - (5*P_not_interested) - (15*P_mute) - (20*P_block)

quality_bonus = (specificity + clarity + hook + authenticity) / 4

overall_score = min(100, max(0,
    (engagement_score / 300) * 50
    + quality_bonus * 30
    + trend_bonus * 12
    + sequence_bonus * 8
))
```

### What Gets Scored

**Engagement Signals** (will users interact?)
- Retweet potential: novel insights, contrarian takes, data-backed claims
- Reply potential: asks questions, sparks debate, invites perspectives
- Quote potential: remixable with commentary
- Share potential: valuable outside X (email, Slack, groups)
- Like potential: emotional resonance, humor, inspiration

**Content Quality** (is it well-written?)
- Specificity: concrete numbers, examples, named sources
- Clarity: scannable, sub-7-second read time
- Hook strength: first 5 words grab attention
- Authenticity: genuine voice, not corporate or AI-sounding

**Engagement Sequences** (will it spread over time?)
- Viral: early replies → amplification → sustained interest
- Decay: passive likes only, no retweets
- Niche: high engagement within specific communities

**Dwell Time** (will users spend time thinking?)
- High: controversial takes, stories, data, questions (10+ seconds)
- Medium: clear but routine content (5-10 seconds)
- Low: generic affirmations (scrolls past)

**Trend Alignment** (is it timely?)
- Breaking news (< 30 min): +20 bonus
- Trending peak (< 2 hrs): +15 bonus
- Trending decay (> 24 hrs): -5 penalty
- Niche trends: +8 bonus
- Evergreen: no bonus/penalty

---

## Project Structure

```
x-tweet-scorer/
├── app/
│   ├── page.tsx                      # Main page (state management)
│   ├── layout.tsx                    # Root layout
│   ├── globals.css                   # Global styles + animations
│   ├── api/
│   │   └── analyze/
│   │       └── route.ts              # /api/analyze endpoint
│   └── components/
│       ├── TweetInput.tsx            # Form (mode toggle, character counter)
│       ├── ScoreCard.tsx             # Results (score bars, recommendations)
│       └── LoadingSpinner.tsx        # Loading state (timer, cancel)
├── lib/
│   ├── types.ts                      # TypeScript interfaces
│   ├── providers/
│   │   ├── types.ts                  # SYSTEM_PROMPT + buildUserPrompt
│   │   ├── claude.ts                 # Claude API provider
│   │   └── ollama.ts                 # Ollama local provider
│   └── llm.ts                        # Provider factory + analyzeTweet
├── public/
│   └── favicon.ico
├── .env.local                        # Configuration (ignored in git)
├── README.md                         # This file
└── package.json
```

---

## Configuration

### Environment Variables

Create `.env.local`:

```bash
# Choose provider: 'claude' or 'ollama'
LLM_PROVIDER=claude

# If using Claude
ANTHROPIC_API_KEY=sk-ant-...

# If using Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma4

# Frontend (optional)
NEXT_PUBLIC_LLM_PROVIDER=claude
NEXT_PUBLIC_OLLAMA_MODEL=gemma4
```

### Model Selection

**For Claude (recommended):**
- Free tier: 5 requests/min (good for testing)
- Paid: $0.003/input token, $0.015/output token

**For Ollama (free, local):**
- **gemma4** (9B): Fast, accurate for scoring
- **mistral** (7B): Smaller, faster
- **neural-chat** (7B): Balanced
- **llama2** (7B): Alternative

Pull a model:
```bash
ollama pull gemma4:latest
```

---

## Deployment

### Cloud (Vercel + Claude)

1. Push to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Add environment variables:
   - `LLM_PROVIDER=claude`
   - `ANTHROPIC_API_KEY=sk-ant-...`
4. Deploy

### Self-Hosted (Node.js + Claude or Ollama)

```bash
npm run build
npm run start
# Open http://localhost:3000
```

### Docker (with Ollama)

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  ollama:
    image: ollama/ollama:latest
    volumes:
      - ollama_data:/root/.ollama
    ports:
      - "11434:11434"

  app:
    build: .
    environment:
      - LLM_PROVIDER=ollama
      - OLLAMA_BASE_URL=http://ollama:11434
      - OLLAMA_MODEL=gemma4
    ports:
      - "3000:3000"
    depends_on:
      - ollama

volumes:
  ollama_data:
```

```bash
docker-compose up
```

---

## Usage

### Simple Mode (Quick Analysis)

1. Paste your tweet
2. Click **Analyze Tweet**
3. Get score + 3-5 actionable tips

Example output:
```
Score: 82/100 (Good)
✓ Specific numbers increase retweet potential (+15)
✓ Asks clear question triggers replies (+10)
✗ Missing visual media (video/image) (-8)
💡 Add screenshot or GIF to boost video potential
```

### Detailed Mode (Deep Dive)

1. Click **Detailed** toggle
2. Click **Analyze Tweet**
3. See all 15 engagement signals with:
   - Individual scores (0-100)
   - Color-coded progress bars (green/blue/yellow/red)
   - Per-action improvement suggestions
   - Engagement sequence prediction
   - Dwell time estimate
   - Trend alignment score

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Enter` | Submit analysis |
| Click sample link | Load example tweet |

---

## API Reference

### POST `/api/analyze`

Analyze a tweet using the official X algorithm.

**Request:**
```json
{
  "tweet_text": "Your tweet here",
  "mode": "simple" | "detailed"
}
```

**Response (Simple Mode):**
```json
{
  "overall_score": 82,
  "simple_recommendations": [
    "Add specific metric (e.g., 'saves 3 hours/week')",
    "Turn statement into question",
    "Include media link or image"
  ],
  "reasoning": "Strong hook and specificity, but needs engagement driver."
}
```

**Response (Detailed Mode):**
```json
{
  "overall_score": 82,
  "signals": {
    "like_potential": 75,
    "reply_potential": 88,
    "repost_potential": 92,
    ...
  },
  "content_quality": {
    "specificity": 90,
    "clarity": 85,
    ...
  },
  "sequence_analysis": {
    "engagement_pattern": "viral",
    "dwell_time_prediction": "10+ seconds"
  },
  "detailed_recommendations": {
    "P_retweet": "Current: 92%. Already excellent. Keep data-backed claims.",
    ...
  }
}
```

---

## Performance Tips

### For High Scores (80+)

1. **Lead with specifics**: Numbers, metrics, concrete examples
2. **Ask questions**: "What's your biggest challenge?" beats "It's hard"
3. **Data-back claims**: "50k tweets analyzed: X results 3.2x better"
4. **Target niches**: Speak to a specific profession/community
5. **Add media**: Video (×14) or images (×8) boost engagement
6. **Make it actionable**: "Do this → get this result"

### For Engagement Sequences

- **First hour**: Spark discussion (replies, quotes)
- **Hours 2-6**: Retweets amplify organically
- **24+ hours**: Momentum depends on evergreen value

### To Avoid Penalties

❌ Engagement bait ("RT if you agree") → -20 points  
❌ Low effort ("Nice", single emoji) → -15 points  
❌ Spam/repetition → -25 points  
❌ Self-promo only → -10 points  
❌ Harassment/misinformation → -70% (hard filter)

---

## Troubleshooting

### "Error: API key invalid"
- Check `ANTHROPIC_API_KEY` in `.env.local`
- Verify key at https://console.anthropic.com

### "Cannot connect to Ollama"
- Ensure `ollama serve` is running in another terminal
- Check `OLLAMA_BASE_URL=http://localhost:11434` in `.env.local`
- Try: `curl http://localhost:11434/api/tags` to verify

### "Slow analysis (> 5 seconds)"
- Claude API: Normal (2-3s with queuing)
- Ollama: Depends on model size (7B = 3-5s, 9B = 5-8s)
- Use smaller model if needed: `OLLAMA_MODEL=mistral`

### "Score seems off"
- The tool predicts engagement probability, not guarantees
- Actual performance depends on: audience, timing, follower count
- Use as optimization guide, not absolute truth

---

## References

- **[X Algorithm (Official)](https://github.com/xai-org/x-algorithm)** — Phoenix transformer open-source code
- **[Anthropic Claude API](https://docs.anthropic.com)** — AI model documentation
- **[Ollama](https://ollama.ai)** — Local LLM runner
- **[Next.js 16](https://nextjs.org/docs)** — Web framework
- **[Tailwind CSS](https://tailwindcss.com/docs)** — Styling framework

---

## License

MIT

---

## Contributing

Found a bug? Want to improve the scoring? Open an issue or PR!

## Support

For issues with:
- **Algorithm accuracy**: Reference [github.com/xai-org/x-algorithm](https://github.com/xai-org/x-algorithm)
- **Claude API**: Check [console.anthropic.com](https://console.anthropic.com)
- **Ollama setup**: Visit [ollama.ai](https://ollama.ai)
