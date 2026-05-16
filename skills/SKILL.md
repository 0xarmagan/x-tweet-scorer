---
name: tweet-scorer
description: Analyze tweets using X's official algorithm. Get engagement score, detailed signals, and actionable recommendations.
version: 1.0.0
author: X Tweet Scorer
---

# Tweet Scorer Skill

Analyze how your tweets align with X's official Phoenix algorithm (15 engagement signals, official weights).

## Commands

### Quick Analysis
```
/tweet-score "your tweet text here"
```
Returns: score + top 3 recommendations

### Interactive Mode
```
/tweet-score
```
- Asks for tweet
- Shows score + analysis
- Offers: detailed view, regenerate, variations, explain score

### Detailed Analysis
```
/tweet-score-detail "your tweet text"
```
Returns: all 15 signals with bars + per-signal recommendations

## Features

- **Official X Algorithm**: All 15 engagement signals with official weights
- **Instant Feedback**: 1-2 second analysis
- **Interactive Iteration**: Ask questions, get rewrites, explore variations
- **Visual Display**: Score bars for all metrics
- **Actionable Tips**: Specific improvements with point estimates
- **Sequence Prediction**: Predicts viral vs decay patterns
- **Trend Alignment**: Detects breaking news, trending, niche topics
- **Dwell Time**: Estimates how long users will read

## Examples

### Quick Mode
```
User: /tweet-score "Just launched dashboard that reduces setup time by 50%"

Skill Output:
═══════════════════════════════════════
ENGAGEMENT SCORE: 84/100 [GOOD]
═══════════════════════════════════════

📊 SIGNAL BREAKDOWN
├─ Retweet Potential: HIGH (×20 weight)
│  → Data-backed, actionable, specific
├─ Reply Potential: MEDIUM (×13.5 weight)
│  → Statement format, would benefit from question
└─ Quote Potential: HIGH (×18 weight)
   → Remixable, adds value

✅ TOP RECOMMENDATIONS
1. Add question to boost replies: "What's your biggest setup challenge?" (+10)
2. Link to dashboard demo or blog: "+8 points"
3. Compare to old time (setup was "2 hours"): "+5 points"

📈 ENGAGEMENT PATTERN
Likely: HIGH initial replies → strong retweet amplification
```

### Interactive Mode
```
User: /tweet-score

Skill: What tweet would you like to analyze? (paste or describe)

User: A thread about API performance tips

Skill: [Analyzes...]

Score: 76/100 [GOOD]
→ Strong technical content (+12)
→ Educational value (+8)
→ Could use specific metrics (+10 if improved)

What would you like to do?
[A] See detailed 15-signal breakdown
[B] Get rewrite suggestions
[C] Explore variations (short vs long)
[D] Explain the score in detail

User: [B]

Skill: 
VARIATION 1 (Focus on Hook):
"We analyzed 10k API calls and found these 3 optimizations save 40% latency..."
→ Predicted score: 88/100 (+12 improvement)

VARIATION 2 (Focus on Question):
"What's your biggest API performance bottleneck? Here are the top 3 we found..."
→ Predicted score: 85/100 (+9 improvement)

VARIATION 3 (Focus on Emotion):
"Just shaved 40% off our API latency using these 3 tricks. Here's how..."
→ Predicted score: 82/100 (+6 improvement)
```

## How It Works

The skill:
1. Takes your tweet text
2. Analyzes 15 engagement signals (official X algorithm weights)
3. Calculates engagement score (0-100)
4. Provides actionable recommendations
5. Predicts engagement patterns
6. Suggests improvements with point estimates
7. Supports iteration in chat

## Configuration

Add to `.env.local`:
```bash
# Use Claude API (recommended for skill)
LLM_PROVIDER=claude
ANTHROPIC_API_KEY=your_key_here

# OR use Ollama (local, free)
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma4
```

## Installation

### For Claude Code Users

1. **Install from Registry** (when available)
```
/install tweet-scorer
```

2. **Or Manual Install**
```bash
# Copy skill to your .claude/skills directory
cp -r skills/tweet-scorer ~/.claude/skills/
```

3. **Verify**
```
/tweet-score "test tweet"
```

## Official Algorithm Reference

### Engagement Weights
| Signal | Weight | What It Means |
|--------|--------|--------------|
| Retweet | ×20 | Shares to network (most valuable) |
| Quote | ×18 | Remixes with commentary |
| Share | ×15 | Shares outside X |
| Reply | ×13.5 | Drives conversation |
| Profile Click | ×12 | Author interest |
| Link Click | ×11 | Engagement signal |
| Bookmark | ×10 | Save for later |
| Video View | ×14 | Media consumption |
| Follow | ×9 | Authority |
| Dwell Time | ×6 | Time spent |
| Photo Expand | ×8 | Visual engagement |
| Like | ×1 | Baseline |

**Negative signals suppress by 70%:**
- Block, mute, not interested

### Scoring Formula
```
engagement_score = sum(weight_i * P(action_i))
overall_score = (engagement/300)*50 + quality*30 + trends*12 + sequence*8
Range: 0-100
```

Source: [github.com/xai-org/x-algorithm](https://github.com/xai-org/x-algorithm)

## Performance Tips

**Score 80+:**
- Lead with specific metrics
- Ask clear questions
- Back up claims with data
- Target niche audiences
- Include media (video/image)
- Make actionable

**Avoid (score -15 to -70):**
- Engagement bait ("RT if...")
- Low effort ("Nice")
- Spam patterns
- Clickbait
- Harassment

## Feedback & Issues

Found a bug? Want to suggest improvements?
- GitHub: [github.com/0xarmagan/x-tweet-scorer](https://github.com/0xarmagan/x-tweet-scorer)
- Issues: Include tweet + expected vs actual score

## License

MIT - Same as X Tweet Scorer
