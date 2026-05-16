'use client';

import { AnalysisResult, DetailedAnalysis } from '@/lib/types';

interface ScoreCardProps {
  result: AnalysisResult;
  mode: 'simple' | 'detailed';
  onReset: () => void;
}

function ScoreBar({ value, color = 'bg-blue-500' }: { value: number; color?: string }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
      <div
        className={`h-2 rounded-full transition-all ${color}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function getTier(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Excellent', color: 'text-green-600' };
  if (score >= 65) return { label: 'Good', color: 'text-blue-600' };
  if (score >= 45) return { label: 'Needs Work', color: 'text-yellow-600' };
  return { label: 'At Risk', color: 'text-red-600' };
}

function getBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 65) return 'bg-blue-500';
  if (score >= 45) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getRiskColor(score: number): string {
  if (score >= 60) return 'bg-red-500';
  if (score >= 30) return 'bg-yellow-500';
  return 'bg-green-500';
}

function getRiskTierColor(score: number): string {
  if (score >= 60) return 'text-red-600';
  if (score >= 30) return 'text-yellow-600';
  return 'text-green-600';
}

export function ScoreCard({ result, mode, onReset }: ScoreCardProps) {
  const tier = getTier(result.overall_score);
  const isDetailed = mode === 'detailed' && 'signals' in result;
  const detailed = isDetailed ? (result as DetailedAnalysis) : null;

  return (
    <div className="w-full animate-fade-in">
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-8 border border-slate-200 mb-4">
        <div className="text-center mb-6">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-1">Engagement Score</p>
          <div className={`text-7xl font-bold ${tier.color}`}>{result.overall_score}</div>
          <p className={`text-sm font-semibold mt-1 ${tier.color}`}>{tier.label}</p>
          <ScoreBar value={result.overall_score} color={getBarColor(result.overall_score)} />
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Reasoning</p>
          <p className="text-gray-700 text-sm">{result.reasoning}</p>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Quick Recommendations</p>
          <div className="space-y-2">
            {result.simple_recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-blue-600 font-bold text-sm flex-shrink-0">{idx + 1}.</span>
                <p className="text-gray-700 text-sm">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {detailed && (
        <div className="space-y-4 mb-4">
          {/* All 12 positive engagement signals */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Engagement Signals</h3>
            <div className="space-y-3">
              {[
                { label: '🔁 Repost Potential', value: detailed.signals.repost_potential, weight: '×20' },
                { label: '💬 Quote Potential', value: detailed.signals.quote_potential, weight: '×18' },
                { label: '🔗 Share Potential', value: detailed.signals.share_potential, weight: '×15' },
                { label: '🎥 Video Potential', value: detailed.signals.video_potential, weight: '×14' },
                { label: '↩️ Reply Potential', value: detailed.signals.reply_potential, weight: '×13.5' },
                { label: '👤 Profile Click', value: detailed.signals.profile_click_potential, weight: '×12' },
                { label: '🔗 Click Potential', value: detailed.signals.click_potential, weight: '×11' },
                { label: '🔖 Bookmark Potential', value: detailed.signals.bookmark_potential, weight: '×10' },
                { label: '👥 Follow Potential', value: detailed.signals.follow_potential, weight: '×9' },
                { label: '📷 Photo Engagement', value: detailed.signals.photo_engagement, weight: '×8' },
                { label: '⏱️ Dwell Time', value: detailed.signals.dwell_time_potential, weight: '×6' },
                { label: '❤️ Like Potential', value: detailed.signals.like_potential, weight: '×1' },
              ].map(({ label, value, weight }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{label} <span className="text-gray-400 text-xs">{weight}</span></span>
                    <span className={`font-semibold ${getTier(value).color}`}>{value}</span>
                  </div>
                  <ScoreBar value={value} color={getBarColor(value)} />
                </div>
              ))}
            </div>
          </div>

          {/* Negative/Risk signals */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-1 text-sm uppercase tracking-wide">Risk Signals</h3>
            <p className="text-xs text-gray-400 mb-4">Higher = more likely to suppress your reach</p>
            <div className="space-y-3">
              {[
                { label: '😐 Not Interested Risk', value: detailed.negative_signals.not_interested_risk, weight: '×-5' },
                { label: '🔇 Mute Risk', value: detailed.negative_signals.mute_risk, weight: '×-15' },
                { label: '🚫 Block Risk', value: detailed.negative_signals.block_risk, weight: '×-20' },
              ].map(({ label, value, weight }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{label} <span className="text-gray-400 text-xs">{weight}</span></span>
                    <span className={`font-semibold ${getRiskTierColor(value)}`}>{value}</span>
                  </div>
                  <ScoreBar value={value} color={getRiskColor(value)} />
                </div>
              ))}
            </div>
          </div>

          {/* Content Quality */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Content Quality</h3>
            <div className="space-y-3">
              {[
                { label: 'Hook Strength', value: detailed.content_quality.hook_strength },
                { label: 'Clarity', value: detailed.content_quality.clarity },
                { label: 'Specificity', value: detailed.content_quality.specificity },
                { label: 'Authenticity', value: detailed.content_quality.authenticity },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className={`font-semibold ${getTier(value).color}`}>{value}</span>
                  </div>
                  <ScoreBar value={value} color={getBarColor(value)} />
                </div>
              ))}
            </div>
          </div>

          {/* Detailed recommendations */}
          {detailed.detailed_recommendations && Object.keys(detailed.detailed_recommendations).length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Detailed Recommendations</h3>
              <div className="space-y-3">
                {Object.entries(detailed.detailed_recommendations).map(([key, value]) => (
                  <div key={key} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
                      {key.replace(/_/g, ' ')}
                    </p>
                    <p className="text-gray-700 text-sm">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={onReset}
        className="w-full bg-slate-100 text-slate-700 font-medium py-2.5 rounded-lg hover:bg-slate-200 transition-colors"
      >
        Analyze Another Tweet
      </button>
    </div>
  );
}
