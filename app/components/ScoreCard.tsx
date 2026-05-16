'use client';

import { SimpleRecommendations } from '@/lib/types';

interface ScoreCardProps {
  result: SimpleRecommendations;
}

export function ScoreCard({ result }: ScoreCardProps) {
  const scoreColor =
    result.overall_score >= 80
      ? 'text-green-600'
      : result.overall_score >= 60
        ? 'text-blue-600'
        : result.overall_score >= 40
          ? 'text-yellow-600'
          : 'text-red-600';

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-8 border border-slate-200">
        <div className="text-center mb-8">
          <p className="text-gray-600 text-sm uppercase tracking-wide mb-2">
            Engagement Score
          </p>
          <div className={`text-6xl font-bold ${scoreColor}`}>
            {result.overall_score}
          </div>
          <p className="text-gray-500 text-sm mt-2">/100</p>
        </div>

        <div className="mb-8 p-4 bg-white rounded border border-slate-200">
          <p className="text-gray-700 italic">{result.reasoning}</p>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 mb-4">
            Quick Recommendations
          </h3>
          {result.simple_recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 bg-white rounded border border-slate-200 hover:border-slate-300 transition-colors"
            >
              <div className="flex-shrink-0 text-blue-600 font-bold">
                {idx + 1}.
              </div>
              <p className="text-gray-700">{rec}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-8 w-full bg-slate-200 text-slate-800 font-medium py-2 rounded-lg hover:bg-slate-300 transition-colors"
        >
          Analyze Another Tweet
        </button>
      </div>
    </div>
  );
}
