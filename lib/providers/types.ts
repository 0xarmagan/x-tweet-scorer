import { AnalysisRequest, AnalysisResult } from '../types';

export interface LLMProvider {
  analyze(request: AnalysisRequest): Promise<AnalysisResult>;
}

export const SYSTEM_PROMPT = `You are an expert analyzing tweets through the lens of X's Grok algorithm. Grok evaluates tweets on:

1. ENGAGEMENT SIGNALS (weighted 0-100 scale):
   - Like potential: emotional resonance, relatability, humor, surprise
   - Reply potential: discussion-starter, debate-worthy, asks questions
   - Repost potential: value, insight, actionable, novel information
   - Click potential: curiosity hooks, media presence, links
   - Video/media engagement: media format quality

2. CONTENT QUALITY:
   - Hook strength (first 5 words capture attention?)
   - Clarity & conciseness (no filler, message is clear?)
   - Specificity (concrete examples vs vague claims?)
   - Call-to-action (explicit next step for reader?)

3. ALGORITHMIC FIT:
   - Candidate isolation (stands alone without thread context?)
   - Newsworthiness (timely, relevant to current moment?)
   - Safety (toxic language, harassment, red flags?)

Always respond with valid JSON only. No markdown, no extra text.`;

export function buildUserPrompt(mode: 'simple' | 'detailed', tweet_text: string): string {
  if (mode === 'simple') {
    return `Analyze this tweet for SIMPLE mode scoring. Return JSON with: overall_score (0-100), simple_recommendations (array of 5 strings), reasoning (string).

Tweet: "${tweet_text}"`;
  }
  return `Analyze this tweet for DETAILED mode scoring. Return JSON with: overall_score (0-100), signals (object with all 5 engagement signals 0-100), content_quality (object with all 4 metrics 0-100), algorithmic_fit (object with all 3 metrics 0-100), simple_recommendations (array of 3 strings), detailed_recommendations (object mapping signal names to explanation strings), reasoning (string).

Tweet: "${tweet_text}"`;
}
