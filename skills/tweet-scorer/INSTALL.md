# Tweet Scorer Skill - Installation Guide

Add the Tweet Scorer skill to Claude Code for instant tweet analysis with X's official algorithm.

---

## Installation

### Option 1: Manual Installation (Recommended)

1. **Copy skill to Claude Code**
```bash
# From x-tweet-scorer repo
cp -r skills/tweet-scorer ~/.claude/skills/

# Or if you cloned it elsewhere
cp -r /path/to/x-tweet-scorer/skills/tweet-scorer ~/.claude/skills/
```

2. **Verify installation**
```bash
ls ~/.claude/skills/tweet-scorer/
# Should show: SKILL.md, handler.ts, INSTALL.md
```

3. **Test skill**
In Claude Code, type:
```
/tweet-score "test tweet here"
```

### Option 2: From GitHub

```bash
# Clone the repo
git clone https://github.com/0xarmagan/x-tweet-scorer.git
cd x-tweet-scorer

# Copy skill
cp -r skills/tweet-scorer ~/.claude/skills/
```

### Option 3: Via Claude Code Registry (When Available)

```
/install tweet-scorer
```

---

## Configuration

### 1. Ensure X Tweet Scorer is Running

The skill calls your local X Tweet Scorer API endpoint.

**Option A: Running Locally (Recommended for skill)**
```bash
# In one terminal, start the app
cd x-tweet-scorer
npm install
npm run dev

# Create .env.local
cat > .env.local << EOF
LLM_PROVIDER=claude
ANTHROPIC_API_KEY=your_api_key
EOF

# App runs on http://localhost:3000
```

**Option B: Using Ollama (Free, Local)**
```bash
# Terminal 1: Start Ollama
ollama serve

# Terminal 2: Start app
cd x-tweet-scorer
OLLAMA_MODEL=gemma4 npm run dev
```

### 2. Configure Skill Environment

The skill looks for the API at: `http://localhost:3000/api/analyze`

To use a different endpoint, set in Claude Code:
```bash
export TWEET_SCORER_API="http://your-custom-endpoint.com/api/analyze"
```

### 3. (Optional) Use Remote API

If you deploy X Tweet Scorer to cloud:
```bash
export TWEET_SCORER_API="https://your-app.vercel.app/api/analyze"
```

---

## Usage

### Quick Mode (Fast Analysis)

**Command:**
```
/tweet-score "your tweet text here"
```

**Output:**
```
═══════════════════════════════════════
ENGAGEMENT SCORE: 84/100
GOOD
═══════════════════════════════════════

💡 Analysis:
The tweet has a strong hook and specificity...

✅ Recommendations:
1. Add question to boost replies (+10)
2. Include metric comparison (+8)
3. Link to documentation (+5)
```

**Examples:**
```
/tweet-score "Just launched new dashboard"

/tweet-score "Building a parser that handles 10k+ tweets/sec. AMA"

/tweet-score "The biggest mistake? Optimizing too early. Here's why..."
```

### Interactive Mode (Explore & Iterate)

**Command:**
```
/tweet-score
```

**Interaction:**
```
📝 Paste your tweet (or describe it):
> My new tool saves developers 3 hours per week

Analyzing...

═══════════════════════════════════════
ENGAGEMENT SCORE: 78/100
GOOD
═══════════════════════════════════════

💡 Analysis: Strong value prop, but needs specificity...

✅ Recommendations:
1. Add specific metric (e.g., "3 hours" → "180 minutes on...") (+8)
2. Target audience (which developers?) (+10)
3. Include link/demo (+5)

What next?
[D] Detailed breakdown | [S] Score explanation | [V] Variations | [N] New tweet | [Q] Quit
> V

Generating variations...

Variation (+12):
"Built a tool that saves developers 180 minutes/week on boilerplate code..."

Variation (+8):
"What's the biggest time-sink in your dev workflow? We solved ours..."

Variation (+5):
"3 hours saved per week. That's 150 hours/year. Here's how..."
```

### Detailed Mode

**Command:**
```
/tweet-score-detail "your tweet text"
```

**Output:** All 15 engagement signals with visual breakdown and per-signal recommendations

---

## Features

### Quick Analysis
- Score (0-100)
- Tier label (Excellent/Good/Needs Work/At Risk)
- Top 3-5 actionable recommendations
- Analysis reasoning
- ~1-2 second response

### Interactive Analysis
- Same as quick, plus:
- Detailed 15-signal breakdown
- Score explanation
- Variation suggestions
- Iterative improvement
- Loop until satisfied

### Detailed Breakdown
- All 15 engagement signals with individual scores
- Content quality metrics
- Engagement sequence prediction (viral/decay/niche)
- Dwell time estimate
- Trend alignment
- Per-signal improvement suggestions

---

## Keyboard Shortcuts

Inside interactive mode:
- `[D]` — See all 15 signals in detail
- `[S]` — Understand why you got this score
- `[V]` — Generate 3 variations (different approaches)
- `[N]` — Analyze a different tweet
- `[Q]` — Exit

---

## Troubleshooting

### "Cannot connect to API"
✅ **Solution:**
1. Ensure X Tweet Scorer is running: `npm run dev`
2. Check endpoint: `curl http://localhost:3000/api/analyze`
3. Verify `.env.local` has correct `LLM_PROVIDER`

### "API error: 403"
✅ **Solution:**
1. Check `ANTHROPIC_API_KEY` is set if using Claude
2. Verify key at https://console.anthropic.com
3. Try with Ollama instead: `OLLAMA_MODEL=gemma4 npm run dev`

### "Slow response (>5 seconds)"
✅ **Solution:**
- If using Ollama: Model is 7-9B (normal: 3-8s)
- If using Claude: API latency (normal: 2-3s)
- Try smaller model: `OLLAMA_MODEL=mistral`

### "Skill not found"
✅ **Solution:**
1. Verify skill installed: `ls ~/.claude/skills/tweet-scorer/`
2. Restart Claude Code
3. Try: `/tweet-score "test"` (reload if needed)

---

## Configuration Reference

### Environment Variables

```bash
# Provider
LLM_PROVIDER=claude          # or 'ollama'
ANTHROPIC_API_KEY=sk-ant-... # Claude only

# Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma4          # or mistral, neural-chat, etc

# Skill API
TWEET_SCORER_API=http://localhost:3000/api/analyze
```

### Model Options

**Claude (Cloud)**
- Fast: 1-2 seconds
- High quality: 9-10/10
- Cost: $0.003 per input token (~$0.01-0.03 per tweet)

**Ollama Local**
- Speed: 3-8 seconds (depends on model)
- Quality: 7-8/10
- Cost: $0 (completely free)

Recommended: **gemma4** (9B) - best balance of speed/quality

---

## API Endpoint Reference

The skill calls:
```
POST /api/analyze
Content-Type: application/json

{
  "tweet_text": "your tweet here",
  "mode": "simple" | "detailed"
}
```

**Response (Simple):**
```json
{
  "overall_score": 84,
  "simple_recommendations": [...],
  "reasoning": "..."
}
```

**Response (Detailed):**
```json
{
  "overall_score": 84,
  "signals": { ... },
  "sequence_analysis": { ... },
  "detailed_recommendations": { ... }
}
```

---

## Performance Tips

### Get Higher Scores (80+)
1. **Lead with specifics** — Numbers, metrics, examples
2. **Ask questions** — "What's your biggest X?" works better than statements
3. **Back with data** — Real numbers beat claims
4. **Target a niche** — "For developers" > "For everyone"
5. **Add media** — Video (×14) or image (×8) boost engagement
6. **Be actionable** — "Do X → get Y result"

### Understand Score Components
- **Retweet (×20)**: Novel insights, data, contrarian takes
- **Reply (×13.5)**: Questions, debate, asks for perspective
- **Quote (×18)**: Remixable, adds value, framework-based
- **Content Quality**: Specificity, clarity, hook strength, authenticity

---

## Uninstall

To remove the skill:
```bash
rm -rf ~/.claude/skills/tweet-scorer/
```

---

## Support

**Found a bug?**
- GitHub: https://github.com/0xarmagan/x-tweet-scorer
- Issue template includes: tweet, expected score, actual score

**Want improvements?**
- PRs welcome! Fork, improve, submit PR
- Feature requests: Open an issue

**Need help?**
- Check SKILL.md for command reference
- See troubleshooting section above
- Visit GitHub issues for common problems

---

## Next Steps

1. ✅ Install skill: `cp -r skills/tweet-scorer ~/.claude/skills/`
2. ✅ Start X Tweet Scorer: `npm run dev` (in x-tweet-scorer directory)
3. ✅ Test: `/tweet-score "test tweet"`
4. 🚀 Start analyzing tweets!

---

## License

MIT - Same as X Tweet Scorer
