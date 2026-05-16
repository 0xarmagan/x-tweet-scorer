import Anthropic from '@anthropic-ai/sdk';
import { AnalysisRequest, AnalysisResult } from './types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert analyzing tweets through the lens of X's Grok algorithm. Grok evaluates tweets on:

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

For SIMPLE mode, provide an overall_score (0-100) and 3-5 quick, actionable tips.

For DETAILED mode, provide breakdown for each signal group plus reasoning.

Always respond with valid JSON only. No markdown, no extra text.`;

export async function analyzeTweet(
  request: AnalysisRequest
): Promise<AnalysisResult> {
  const userPrompt =
    request.mode === 'simple'
      ? `Analyze this tweet for SIMPLE mode scoring. Return JSON with: overall_score (0-100), simple_recommendations (array of 5 strings), reasoning (string).

Tweet: "${request.tweet_text}"`
      : `Analyze this tweet for DETAILED mode scoring. Return JSON with: overall_score (0-100), signals (object with all 5 engagement signals 0-100), content_quality (object with all 4 metrics 0-100), algorithmic_fit (object with all 3 metrics 0-100), simple_recommendations (array of 3 strings), detailed_recommendations (object mapping signal names to explanation strings), reasoning (string).

Tweet: "${request.tweet_text}"`;

  const message = await client.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  const responseText =
    message.content[0].type === 'text' ? message.content[0].text : '';

  try {
    const result = JSON.parse(responseText) as AnalysisResult;
    return result;
  } catch (error) {
    console.error('Failed to parse Claude response:', responseText);
    throw new Error('Invalid response format from Claude API');
  }
}
