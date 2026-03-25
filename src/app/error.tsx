'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold text-crimson-500 mb-4">Something went wrong</h1>
      <p className="text-dark-400 mb-8 max-w-md">
        An unexpected error occurred. Please try again or go back to the homepage.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white font-medium rounded-lg transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-6 py-2.5 bg-dark-800 hover:bg-dark-700 text-dark-100 font-medium rounded-lg border border-dark-600 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
