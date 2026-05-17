export type TweetFormat = 'text' | 'image' | 'video' | 'article' | 'poll' | 'gif' | 'thread';

export interface AnalysisRequest {
  tweet_text: string;
  mode: 'simple' | 'detailed';
  format: TweetFormat;
}

export interface EngagementSignals {
  like_potential: number;
  reply_potential: number;
  repost_potential: number;
  quote_potential: number;
  share_potential: number;
  click_potential: number;
  profile_click_potential: number;
  video_potential: number;
  dwell_time_potential: number;
  follow_potential: number;
  bookmark_potential: number;
  photo_engagement: number;
}

export interface NegativeSignals {
  not_interested_risk: number;
  mute_risk: number;
  block_risk: number;
}

export interface ContentQuality {
  hook_strength: number;
  clarity: number;
  specificity: number;
  authenticity: number;
}

export interface SimpleRecommendations {
  overall_score: number;
  simple_recommendations: string[];
  reasoning: string;
}

export interface DetailedAnalysis extends SimpleRecommendations {
  signals: EngagementSignals;
  negative_signals: NegativeSignals;
  content_quality: ContentQuality;
  detailed_recommendations: Record<string, string>;
}

export type AnalysisResult = SimpleRecommendations | DetailedAnalysis;
