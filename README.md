# X Tweet Scorer

Analyze how your tweets align with X's algorithm. Get an engagement score (0-100) and actionable recommendations.

## Features

- **Tweet Analysis**: Paste any tweet and get instant feedback
- **Engagement Scoring**: 0-100 score based on like/reply/repost potential
- **Actionable Tips**: Quick, concrete recommendations to improve engagement
- **Simple UI**: Clean, fast interface for rapid iteration

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless)
- **AI**: Anthropic Claude 3.5 Sonnet
- **Hosting**: Vercel (recommended) or self-hosted Node.js

## Getting Started

### Prerequisites

- Node.js 20+
- Anthropic API key (get one at https://console.anthropic.com)

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd x-tweet-scorer
```

2. Install dependencies
```bash
npm install
```

3. Create `.env.local` and add your API key
```bash
echo "ANTHROPIC_API_KEY=your_key_here" > .env.local
```

4. Run development server
```bash
npm run dev
```

5. Open http://localhost:3000

### Deployment

**Deploy to Vercel (recommended):**

1. Push code to GitHub
2. Connect repo to Vercel
3. Add `ANTHROPIC_API_KEY` environment variable in Vercel dashboard
4. Deploy

**Self-hosted:**

```bash
npm run build
npm run start
```

## Project Structure

```
app/
├── page.tsx                 # Main page
├── layout.tsx               # Root layout
├── api/analyze/route.ts    # Claude API endpoint
└── components/
    ├── TweetInput.tsx       # Input form
    ├── ScoreCard.tsx        # Results display
    └── LoadingSpinner.tsx   # Loading state
lib/
├── claude.ts                # Claude API client
└── types.ts                 # TypeScript interfaces
```

## How It Works

1. User pastes a tweet
2. Frontend sends to `/api/analyze`
3. Backend constructs prompt aligned with X algorithm principles
4. Claude analyzes and returns engagement signals
5. Frontend displays score + recommendations

## Future Features

- Detailed mode with signal-by-signal breakdown
- Comparison against high-performing tweets
- Batch analysis of multiple tweets
- Export results as JSON

## License

MIT

## References

- [X Algorithm GitHub](https://github.com/xai-org/x-algorithm)
- [Anthropic Claude API](https://docs.anthropic.com)
