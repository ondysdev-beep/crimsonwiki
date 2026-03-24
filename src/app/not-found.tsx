import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-6xl font-bold text-crimson-500 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-dark-50 mb-2">Page Not Found</h2>
      <p className="text-dark-400 mb-8 max-w-md">
        The page you are looking for does not exist. It may have been moved or deleted.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="px-6 py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white font-medium rounded-lg transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/search"
          className="px-6 py-2.5 bg-dark-800 hover:bg-dark-700 text-dark-100 font-medium rounded-lg border border-dark-600 transition-colors"
        >
          Search Wiki
        </Link>
      </div>
    </div>
  );
}
