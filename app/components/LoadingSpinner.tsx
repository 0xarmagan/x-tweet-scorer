'use client';

import { useEffect, useState } from 'react';

interface LoadingSpinnerProps {
  onCancel: () => void;
}

export function LoadingSpinner({ onCancel }: LoadingSpinnerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full mt-8">
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <div className="w-12 h-12 border-4 border-slate-200 rounded-full animate-spin border-t-blue-600" role="status" aria-label="Analyzing tweet" />
        <div className="text-center">
          <p className="text-gray-700 font-medium">Analyzing your tweet...</p>
          <p className="text-gray-400 text-sm mt-1">{elapsed}s elapsed</p>
        </div>
        <button
          onClick={onCancel}
          className="text-sm text-gray-400 hover:text-gray-600 underline mt-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
