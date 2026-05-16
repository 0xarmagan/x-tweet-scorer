import { AnalysisRequest, AnalysisResult } from './types';
import { LLMProvider } from './providers/types';
import { ClaudeProvider } from './providers/claude';
import { OllamaProvider } from './providers/ollama';

function getProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER ?? 'ollama';
  if (provider === 'claude') return new ClaudeProvider();
  if (provider === 'ollama') return new OllamaProvider();
  throw new Error(`Unknown LLM_PROVIDER: "${provider}". Use "claude" or "ollama".`);
}

export async function analyzeTweet(request: AnalysisRequest): Promise<AnalysisResult> {
  return getProvider().analyze(request);
}

export function getProviderName(): string {
  return process.env.LLM_PROVIDER ?? 'ollama';
}
