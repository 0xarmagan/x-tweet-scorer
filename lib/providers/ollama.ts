import { AnalysisRequest, AnalysisResult } from '../types';
import { LLMProvider, SYSTEM_PROMPT, buildUserPrompt } from './types';

export class OllamaProvider implements LLMProvider {
  private baseUrl: string;
  private model: string;

  constructor() {
    this.baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.model = process.env.OLLAMA_MODEL || 'mistral';
  }

  async analyze(request: AnalysisRequest): Promise<AnalysisResult> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(request.mode, request.tweet_text) },
        ],
        stream: false,
        format: 'json',
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const text = data?.message?.content ?? '';

    try {
      return JSON.parse(text) as AnalysisResult;
    } catch {
      throw new Error('Invalid JSON response from Ollama. Try a more capable model.');
    }
  }
}
