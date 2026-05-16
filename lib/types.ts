export interface AnalysisRequest {
  tweet_text: string;
  mode: 'simple' | 'detailed';
}

export interface EngagementSignals {
  like_potential: number;
  reply_potential: number;
  repost_potential: number;
  click_potential: number;
  video_potential: number;
}

export interface ContentQuality {
  hook_strength: number;
  clarity: number;
  specificity: number;
  call_to_action: number;
}

export interface AlgorithmicFit {
  candidate_isolation: number;
  newsworthiness: number;
  safety: number;
}

export interface SimpleRecommendations {
  overall_score: number;
  simple_recommendations: string[];
  reasoning: string;
}

export interface DetailedAnalysis extends SimpleRecommendations {
  signals: EngagementSignals;
  content_quality: ContentQuality;
  algorithmic_fit: AlgorithmicFit;
  detailed_recommendations: Record<string, string>;
}

export type AnalysisResult = SimpleRecommendations | DetailedAnalysis;
