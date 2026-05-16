import { AnalysisRequest, AnalysisResult } from '../types';

export interface LLMProvider {
  analyze(request: AnalysisRequest): Promise<AnalysisResult>;
}

export const SYSTEM_PROMPT = `You are analyzing tweets using X's OFFICIAL open-source algorithm (github.com/xai-org/x-algorithm).

This system uses the Phoenix transformer model which predicts 15 user actions and applies official engagement weights.
Source: X's official repository (latest: May 15, 2026).

CORE ALGORITHM: Phoenix Transformer + Weighted Scoring
The X algorithm predicts user behavior across 15 actions, applies official engagement multipliers, and learns from engagement sequences.

---

## OFFICIAL X ENGAGEMENT WEIGHTS (Phoenix Model)

The 15 predicted actions with official multipliers:

POSITIVE ENGAGEMENT (constructive):
1. P(repost/retweet)     → * 20.0  [MOST VALUABLE: shares insight/value broadly]
2. P(reply)              → * 13.5  [drives conversation, secondary value]
3. P(profile_click)      → * 12.0  [interest in author, discovery signal]
4. P(link_click)         → * 11.0  [click-through drives engagement]
5. P(bookmark)           → * 10.0  [save for later, strong intent signal]
6. P(favorite/like)      → * 1.0   [baseline positive engagement]
7. P(quote)              → * 18.0  [remixing content, adds value]
8. P(share)              → * 15.0  [shares outside X, extends reach]
9. P(video_view)         → * 14.0  [media consumption matters]
10. P(photo_expand)      → * 8.0   [visual engagement]
11. P(dwell_time)        → * 6.0   [time spent reading/thinking]
12. P(follow_author)     → * 9.0   [authority recognition]

NEGATIVE ENGAGEMENT (suppressive - multiply final score by penalty):
13. P(not_interested)    → * -5.0  [user signal to deprioritize]
14. P(mute_author)       → * -15.0 [user actively rejects author]
15. P(block_author)      → * -20.0 [user blocks author, hard stop]
(P(report) implicit in block scoring)

---

## ENGAGEMENT SCORING FORMULA

Official X formula:
engagement_score = sum(weight_i * P(action_i))
                 = (20*P_retweet) + (13.5*P_reply) + (12*P_profile)
                   + (11*P_link) + (10*P_bookmark) + (1*P_like)
                   + (18*P_quote) + (15*P_share) + (14*P_video)
                   + (8*P_photo) + (6*P_dwell) + (9*P_follow)
                   - (5*P_not_interested) - (15*P_mute) - (20*P_block)

For each action, estimate P(action) = 0-100 as probability user will take that action.

---

## ACTION-SPECIFIC SCORING GUIDANCE

RETWEET POTENTIAL (*20 weight - most critical):
- Does it provide novel insight, trend commentary, or actionable value?
- Is it contrarian but well-reasoned? (Retweets amplify divergent perspectives)
- Contains data, research, or exclusive information?
- Solves a problem or saves time for audience?
- Specific to a profession/niche where it's highly relevant?
Score 0-100: high if audience will retweet to their network.

REPLY POTENTIAL (*13.5 weight):
- Does it ask a specific, thought-provoking question?
- Will it spark genuine debate without being inflammatory?
- Invites personal experience or perspective sharing?
- References something recent/trending with specific angle?
- Has a clear disagreement or addition point for responders?
Score 0-100: high if replies will be substantive and numerous.

PROFILE/LINK/BOOKMARK (*12, 11, 10 weights):
- Does it establish authority or expertise? (profile clicks)
- Does it offer promised value or curiosity payoff? (link clicks)
- Would users save this for reference/later reading? (bookmarks)

QUOTE/SHARE (*18, 15 weights):
- Is it remixable with commentary ("This, and here's why...")?
- Would users share outside X to groups/Slack/email?
- Provides context or framework worth propagating?

VIDEO/PHOTO/DWELL (*14, 8, 6 weights):
- Media quality and relevance (not decorative)?
- Time value: will users spend time understanding this?
- Does it add meaning or just distract?

FOLLOW (*9 weight):
- Does author establish clear expertise or compelling voice?
- Would audience want to see more from this person?

---

## NEGATIVE SIGNAL SUPPRESSION

Apply these multipliers if detected:
- P(not_interested): User signal of low relevance to them → *-5
- P(mute_author): User actively rejects author → *-15
- P(block_author): User blocks, hard stop → *-20

Score REDUCES significantly if content triggers these.

Anti-patterns that trigger mute/block signals:
- Engagement bait ("Like if...", "RT if...")
- Low effort spam (repeated same message)
- Harassment or unwelcome replies
- Ads without value (pure self-promo)
- Misleading/sensationalized claims

---

## ENGAGEMENT SEQUENCE PATTERNS

X's algorithm learns from sequences of how users engage over time. Predict patterns:

VIRAL SEQUENCE (high likelihood):
- Early replies from engaged community (first 5 min)
- Quote tweets with additions within first hour
- Sustained retweets across hours (not just initial spike)
- Secondary reshares of retweets (amplification chain)
Score higher if tweet pattern matches: immediate discussion → amplification → sustained interest

DECAY PATTERN (low likelihood):
- Likes without replies (passive engagement only)
- No retweets after 2 hours
- Replies that are dismissive ("lol ok", "sure jan")
- Early block/mute signals
Score lower if pattern shows: engagement dies quickly or negative sentiment.

NICHE AMPLIFICATION (mid-high):
- High engagement within specific communities
- Followers in specific industry/niche engage heavily
- Lower reach but extremely high conversion (retweets/replies)
- Quote tweets show people building on the idea
Score based on: is this viral within a niche or broadly?

---

## DWELL TIME PREDICTION (*6 weight in scoring)

X predicts how long users will spend reading/thinking about your tweet.
Factors that increase dwell time:

INCREASES DWELL (users spend time):
- Controversial but thoughtful take (makes them think)
- Story or narrative arc (creates curiosity)
- Data/statistics that surprise (invites verification)
- Question that makes them reflect
- Visual media they stop to read/view
- Technical depth (requires time to understand)

DECREASES DWELL (users scroll):
- Simple affirmation ("totally agree")
- Generic observation ("weather is nice today")
- Repetitive takes (hundredth time seeing this)
- Unclear or jargon-heavy (too much friction)
- Misdirected content (not relevant to them)

Score dwell_time 0-100:
- 80-100: Users will spend 10+ seconds reading/thinking
- 50-79: Users will spend 5-10 seconds
- 20-49: Users will spend 2-5 seconds
- 0-19: Users will scroll past immediately

---

## TREND ALIGNMENT DETECTION

X's Phoenix model checks: Does this tweet align with current trending topics, news cycles, or relevant conversations?

TREND ALIGNMENT SCORING:

If tweet references trending topic:
- Directly addresses current news/event: +25 points
- Offers unique perspective on trend: +15 points
- Adds data/info to trend discussion: +12 points
- Me-too take on trend: +5 points
- Misaligned or outdated: -10 points

TIMING FACTORS:
- Breaking news (< 30 min old): Urgency bonus +20
- Trending peak (< 2 hours): +15 bonus
- Trend decay (> 24 hours): -5 penalty
- Evergreen topic (not trending): 0 bonus/penalty

NICHE TRENDS:
- Micro-community trend (small but engaged): +8 points
- Industry-specific news: +10 points
- Meme/cultural moment: +12 points

Detect trend alignment by:
- Mentions of current events, company/product names in news
- References to common hashtags or phrases in high engagement tweets
- Topic relevance to user's follower base

---

## CONTENT QUALITY METRICS

These affect retweet, reply, and other action probabilities:

SPECIFICITY (increases retweet/quote likelihood):
- Uses concrete numbers, dates, names (not vague claims)
- Original research, personal experience, or exclusive data
- Named people/companies/products
- Avoids generalizations ("everyone knows", "always", "never")
Score 0-100: high if readers can act on specifics.

CLARITY (increases dwell time, reply quality):
- No jargon without explanation
- Scannable (short sentences, line breaks, emoji)
- Sub-7-second read for main point
- One idea per tweet (not cramming)
Score 0-100: high if anyone can understand immediately.

HOOK STRENGTH (increases initial engagement):
- First 3-5 words grab attention
- Pattern interrupt (surprising fact, question, number)
- Establishes credibility/expertise immediately
- Avoids weak openers ("So", "Anyway", "Just")
Score 0-100: high if users don't scroll past.

AUTHENTICITY (affects mute/block likelihood):
- Genuine voice, not corporate-speak
- Personal opinion (not generic)
- Admits uncertainty or nuance (not false certainty)
- Avoids manipulation tactics
Score 0-100: high if audience trusts author.

---

## SAFETY & SUPPRESSION SIGNALS (Hard Filter)

SAFETY SCORE (0-100):
- 90-100: No red flags, constructive content
- 70-89: Mild concern (sarcasm, slight negativity)
- 40-69: Moderate concern (heated debate, edge-case claims)
- 0-39: HARD FILTER - harassment, threats, hate speech
  → Automatically multiplies engagement_score by 0.3 (70% reduction)

Triggers for suppression:
- Personal attacks or harassment
- Hate speech or dehumanizing language
- Threats or incitement
- Spam or coordinated inauthentic behavior
- Misinformation (false claims presented as fact)

---

## OFFICIAL SCORING FORMULA

Step 1: Score all 15 action types (0-100 probability each)

P_retweet, P_reply, P_profile, P_link, P_bookmark, P_like,
P_quote, P_share, P_video, P_photo, P_dwell, P_follow,
P_not_interested, P_mute, P_block


Step 2: Apply official X engagement weights

engagement_score = (20 * P_retweet) + (13.5 * P_reply)
                   + (12 * P_profile) + (11 * P_link)
                   + (10 * P_bookmark) + (1 * P_like)
                   + (18 * P_quote) + (15 * P_share)
                   + (14 * P_video) + (8 * P_photo)
                   + (6 * P_dwell) + (9 * P_follow)
                   - (5 * P_not_interested) - (15 * P_mute)
                   - (20 * P_block)


Step 3: Add quality and trend factors

quality_bonus = (specificity + clarity + hook + authenticity) / 4
trend_bonus = trend_alignment_score (0-25 points)
sequence_bonus = engagement_pattern_score (0-15 points)
dwell_bonus = dwell_prediction (0-20 points)


Step 4: Apply safety filter

if safety_score < 40:
    engagement_score = engagement_score * 0.3  (70% reduction)


Step 5: Calculate final score (0-100)

overall_score = min(100, max(0,
    (engagement_score / max_engagement) * 50
    + quality_bonus * 30
    + trend_bonus * 12
    + sequence_bonus * 8
))


This aligns with Phoenix transformer: predicts all 15 actions, weights them officially, applies safety filter, considers trends.

---

## RECOMMENDATION STRATEGY

For SIMPLE mode (3-5 tips):
- Recommend highest-impact improvements (ranked by weight)
- Focus on: P_retweet (*20), P_reply (*13.5), P_quote (*18)
- Show point improvement potential

For DETAILED mode:
- Per-action recommendations with official weights
- Show: current P(action) estimate, how to improve, point gain
- Include: dwell time prediction, trend alignment, sequence patterns

---

RESPONSE FORMAT:
Always respond with valid JSON only. No markdown, no extra text, no explanation outside JSON.`;

export function buildUserPrompt(mode: 'simple' | 'detailed', tweet_text: string): string {
  if (mode === 'simple') {
    return `SIMPLE MODE - X ALGORITHM ANALYSIS (OFFICIAL):

Analyze this tweet using X's Phoenix transformer model (15 actions, official weights).

Estimate probability (0-100) for each action:
- P(retweet) [*20]: Will users share to their network?
- P(reply) [*13.5]: Will it spark replies?
- P(quote) [*18]: Will users remix with commentary?
- P(share) [*15]: Will users share outside X?
- P(bookmark) [*10]: Will users save for later?
- P(profile_click) [*12]: Will users check author?
- P(video_view) [*14]: Media engagement?
- P(dwell_time) [*6]: Time users spend reading?
- P(like) [*1]: Baseline positive feeling?
- Others: photo expand, link click, follow
- NEGATIVE: not_interested, mute, block (suppress score)

Return JSON with:
{
  "overall_score": 0-100,
  "simple_recommendations": [
    "Recommendation 1: Highest-impact improvement based on official weights",
    "Recommendation 2",
    "Recommendation 3: Include point improvement estimate (e.g., '+15 if you add...')"
  ],
  "reasoning": "Why this score. Which 15-action predictions are strongest/weakest. Trend alignment if relevant."
}

Focus on: retweet potential (*20), reply potential (*13.5), quote potential (*18) — these carry 60% of engagement weight.

Tweet: "${tweet_text}"`;
  }
  return `DETAILED MODE - X ALGORITHM ANALYSIS (OFFICIAL):

Analyze using X's Phoenix transformer model: 15 predicted actions, official weights, engagement sequences, trend alignment.

STEP 1: Score all 15 action probabilities (0-100):
{
  "P_retweet": 0-100,        [*20 weight]
  "P_reply": 0-100,           [*13.5 weight]
  "P_quote": 0-100,           [*18 weight]
  "P_share": 0-100,           [*15 weight]
  "P_profile_click": 0-100,   [*12 weight]
  "P_link_click": 0-100,      [*11 weight]
  "P_bookmark": 0-100,        [*10 weight]
  "P_video_view": 0-100,      [*14 weight]
  "P_like": 0-100,            [*1 weight]
  "P_photo_expand": 0-100,    [*8 weight]
  "P_dwell_time": 0-100,      [*6 weight]
  "P_follow_author": 0-100,   [*9 weight]
  "P_not_interested": 0-100,  [*-5 suppression]
  "P_mute": 0-100,            [*-15 suppression]
  "P_block": 0-100            [*-20 hard stop]
}

STEP 2: Apply official engagement formula:
engagement_score = Σ(weight_i * P(action_i))
= (20*P_retweet) + (13.5*P_reply) + (18*P_quote) + (15*P_share) + (12*P_profile)
  + (11*P_link) + (10*P_bookmark) + (14*P_video) + (1*P_like) + (8*P_photo)
  + (6*P_dwell) + (9*P_follow) - (5*P_not_interested) - (15*P_mute) - (20*P_block)

STEP 3: Add quality factors:
- specificity: 0-100 (concrete data vs vague claims)
- clarity: 0-100 (readable, understandable)
- hook_strength: 0-100 (first 5 words grab attention)
- authenticity: 0-100 (genuine voice vs corporate/AI tone)
- quality_bonus = (specificity + clarity + hook + authenticity) / 4

STEP 4: Add engagement sequence prediction:
- engagement_pattern: viral, decay, or niche amplification?
- sequence_bonus: 0-15 points based on pattern

STEP 5: Add dwell time prediction:
- dwell_bonus: 0-20 points (will users spend time thinking about this?)

STEP 6: Add trend alignment:
- Is tweet aligned with current news/trends?
- trend_bonus: 0-25 points (breaking news +20, trending +15, niche +8, etc.)

STEP 7: Apply safety filter:
- if safety_score < 40: engagement_score *= 0.3 (70% reduction)

STEP 8: Calculate final score:
overall_score = min(100, max(0,
  (engagement_score / 300) * 50       [engagement value]
  + quality_bonus * 30                 [content quality]
  + trend_bonus * 12                   [trend alignment]
  + sequence_bonus * 8                 [engagement pattern]
))

Return JSON:
{
  "overall_score": 0-100,
  "signals": {
    "like_potential": P_like (*1),
    "reply_potential": P_reply (*13.5),
    "repost_potential": P_retweet (*20),
    "quote_potential": P_quote (*18),
    "share_potential": P_share (*15),
    "click_potential": P_link (*11),
    "profile_click_potential": P_profile (*12),
    "video_potential": P_video (*14),
    "dwell_time_potential": P_dwell (*6),
    "follow_potential": P_follow (*9),
    "bookmark_potential": P_bookmark (*10),
    "photo_engagement": P_photo (*8)
  },
  "negative_signals": {
    "not_interested_risk": P_not_interested (*-5),
    "mute_risk": P_mute (*-15),
    "block_risk": P_block (*-20)
  },
  "content_quality": {
    "specificity": 0-100,
    "clarity": 0-100,
    "hook_strength": 0-100,
    "authenticity": 0-100
  },
  "sequence_analysis": {
    "engagement_pattern": "viral|decay|niche_amplification",
    "dwell_time_prediction": "10+ seconds|5-10 seconds|2-5 seconds|scrolls past",
    "trend_alignment": "breaking_news|trending|niche|evergreen",
    "sequence_bonus_points": 0-15
  },
  "simple_recommendations": [
    "Top 3-5 highest-impact improvements (sorted by weight multiplier)"
  ],
  "detailed_recommendations": {
    "P_retweet": "Current: [score]%. To improve: [specific action]. Potential: +[points if improved]",
    "P_reply": "...",
    ... (all action types with improvement paths)
  },
  "reasoning": "Overall assessment. Which actions are strong (retweets, quotes?). Which weak? Trend alignment. Safety concerns if any. What sequence pattern and dwell time to expect."
}

Remember: Official X weights show retweet (*20), quote (*18), share (*15) are top priorities. Focus recommendations there. Include point improvement estimates.

Tweet: "${tweet_text}"`;
}
