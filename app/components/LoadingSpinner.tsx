'use client';

export function LoadingSpinner() {
  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div className="flex flex-col items-center justify-center py-12">
        <div className="inline-flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-slate-300 rounded-full animate-spin border-t-blue-600"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">
          Analyzing your tweet...
        </p>
        <p className="text-gray-500 text-sm mt-1">
          This usually takes 2-3 seconds
        </p>
      </div>
    </div>
  );
}
