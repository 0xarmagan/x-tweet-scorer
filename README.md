# X Tweet Scorer

Analyze tweets using X's official Phoenix algorithm. Get engagement scores (0-100) and actionable recommendations.

Implements all 15 official engagement signals with real weights from [github.com/xai-org/x-algorithm](https://github.com/xai-org/x-algorithm) (May 2026).

---

## Features

- **Official X Algorithm**: 15 engagement signals with real weights (Retweets ×20, Quotes ×18, Replies ×13.5, etc.)
- **Two interfaces**: Web UI or Claude Code Skill (`/tweet-score`)
- **Two modes**: Quick analysis (3-5 tips) or Detailed (all 15 signals breakdown)
- **Two backends**: Claude API (cloud, fast) or Ollama (local, free)
- **Visual feedback**: Score bars, tier labels (Excellent/Good/Needs Work/At Risk), progress visualization

---

## Quick Start

### Web App

```bash
# 1. Clone and install
git clone https://github.com/0xarmagan/x-tweet-scorer.git
cd x-tweet-scorer
npm install

# 2. Configure (choose one)
# Option A: Claude API
cat > .env.local << EOF
LLM_PROVIDER=claude
ANTHROPIC_API_KEY=your_key_here
EOF

# Option B: Ollama (local)
ollama pull gemma4
cat > .env.local << EOF
LLM_PROVIDER=ollama
OLLAMA_MODEL=gemma4
OLLAMA_BASE_URL=http://localhost:11434
EOF

# 3. Run
npm run dev
# Open http://localhost:3000
```

### Claude Code Skill

```bash
# Install
cp -r skills/tweet-scorer ~/.claude/skills/

# Use in Claude Code IDE
/tweet-score "Your tweet here"           # Quick analysis
/tweet-score                             # Interactive mode
/tweet-score-detail "Your tweet"         # All 15 signals
```

See [Skill Installation Guide](./skills/tweet-scorer/INSTALL.md) for detailed setup.

---

## Configuration

### Environment Variables

```bash
# Provider (required)
LLM_PROVIDER=claude                    # or 'ollama'

# Claude API
ANTHROPIC_API_KEY=sk-ant-...

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma4                    # or mistral, neural-chat

# Skill API endpoint (optional)
TWEET_SCORER_API=http://localhost:3000/api/analyze
```

### Model Options

| Model | Speed | Quality | Cost |
|-------|-------|---------|------|
| Claude API | 2-3s | 9/10 | ~$0.01/tweet |
| Ollama (gemma4) | 5-8s | 8/10 | Free (local) |
| Ollama (mistral) | 3-5s | 7/10 | Free (local) |

---

## Usage

### Web Interface

1. Paste tweet → Select mode (Simple/Detailed) → Click Analyze
2. Get score, tier label, recommendations, and signal breakdown

**Keyboard shortcut:** Cmd/Ctrl+Enter to submit

### Claude Code Skill

```bash
# Quick
/tweet-score "Just shipped a feature that cuts API latency by 40%"
# → 84/100 GOOD + 5 recommendations

# Interactive
/tweet-score
# → Score + menu: [D]etailed [S]core explanation [V]ariations [N]ew tweet [Q]uit

# Detailed
/tweet-score-detail "Your tweet text"
# → All 15 signals with individual scores + per-signal tips
```

---

## API Reference

### POST `/api/analyze`

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"tweet_text": "Your tweet", "mode": "simple"}'
```

**Response:**
```json
{
  "overall_score": 82,
  "simple_recommendations": ["...", "...", "..."],
  "reasoning": "Strong hook and specificity..."
}
```

For detailed mode, also includes: `signals`, `content_quality`, `sequence_analysis`, `detailed_recommendations`.

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Set env vars: `LLM_PROVIDER=claude`, `ANTHROPIC_API_KEY=...`

### Self-Hosted

```bash
npm run build
npm run start
# Open http://localhost:3000
```

### Docker

```bash
docker build -t tweet-scorer .
docker run -p 3000:3000 -e LLM_PROVIDER=claude -e ANTHROPIC_API_KEY=... tweet-scorer
```

---

## Tech Stack

- **Frontend**: Next.js 16, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Anthropic SDK, Ollama API
- **Algorithm**: X's Phoenix transformer (15 signals, official weights)

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "API key invalid" | Verify `ANTHROPIC_API_KEY` at https://console.anthropic.com |
| "Cannot connect to Ollama" | Run `ollama serve` in another terminal, check `OLLAMA_BASE_URL` |
| "Slow analysis (>5s)" | Using Ollama? Normal for 7-9B models. Try smaller: `OLLAMA_MODEL=mistral` |
| "Skill not found" | Verify installed: `ls ~/.claude/skills/tweet-scorer/`, restart Claude Code |

---

## References

- [X Algorithm (Official)](https://github.com/xai-org/x-algorithm) — Phoenix transformer code
- [Anthropic Claude API](https://docs.anthropic.com) — AI model docs
- [Ollama](https://ollama.ai) — Local LLM setup

---

## License

MIT

## Support

- **Algorithm questions**: See [X Algorithm repo](https://github.com/xai-org/x-algorithm)
- **Bug reports**: GitHub issues
- **Skill setup**: [Skill Installation Guide](./skills/tweet-scorer/INSTALL.md)
