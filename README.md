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
- **AI**: 
  - Cloud: Anthropic Claude 3.5 Sonnet
  - Local: Ollama (gemma4, Kimi, or other compatible models)
- **Hosting**: Vercel (recommended) or self-hosted Node.js

## Getting Started

### Prerequisites

- Node.js 20+
- **Either:**
  - Anthropic API key (get one at https://console.anthropic.com), OR
  - Ollama installed locally (https://ollama.ai) with a model like gemma2 or mistral

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

3. Create `.env.local` with your configuration

**Option A: Use Anthropic Claude (Cloud)**
```bash
cat > .env.local << EOF
LLM_PROVIDER=claude
ANTHROPIC_API_KEY=your_key_here
EOF
```

**Option B: Use Ollama (Local)**
```bash
# First, pull a model (e.g., gemma2, mistral)
ollama pull gemma2:latest

# Then create .env.local
cat > .env.local << EOF
LLM_PROVIDER=ollama
OLLAMA_MODEL=gemma2
OLLAMA_BASE_URL=http://localhost:11434
EOF
```

4. Run development server
```bash
npm run dev
```

5. If using Ollama, start it in another terminal:
```bash
ollama serve
```

6. Open http://localhost:3000

### Deployment

**Deploy to Vercel (Cloud - Claude only):**

1. Push code to GitHub
2. Connect repo to Vercel
3. Add `LLM_PROVIDER=claude` and `ANTHROPIC_API_KEY` environment variables in Vercel dashboard
4. Deploy

**Self-hosted with Node.js (supports both Claude and Ollama):**

```bash
npm run build
npm run start
```

**Docker (with Ollama):**

```bash
# Include Ollama in your docker-compose or deploy with both services
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
4. AI analyzes and returns engagement signals:
   - Uses Claude (via Anthropic API) if `LLM_PROVIDER=claude`
   - Uses local Ollama model if `LLM_PROVIDER=ollama`
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
- [Ollama](https://ollama.ai)
- [Gemma Models](https://ai.google.dev/gemma)
