import Anthropic from '@anthropic-ai/sdk';
import { AnalysisRequest, AnalysisResult } from '../types';
import { LLMProvider, SYSTEM_PROMPT, buildUserPrompt } from './types';

export class ClaudeProvider implements LLMProvider {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async analyze(request: AnalysisRequest): Promise<AnalysisResult> {
    const message = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: request.mode === 'detailed' ? 4000 : 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserPrompt(request.mode, request.tweet_text) }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    try {
      return JSON.parse(text) as AnalysisResult;
    } catch {
      throw new Error(`Claude returned non-JSON response. Raw: ${text.slice(0, 100)}`);
    }
  }
}
