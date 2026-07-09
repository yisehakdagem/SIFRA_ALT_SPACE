"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">️</div>
        <h1 className="text-2xl font-serif font-bold text-dark mb-2">
          Something went wrong
        </h1>
        <p className="text-dark/60 font-sans text-sm mb-6">
          {error.message || "An unexpected error occurred"}
        </p>
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full py-3 bg-olive text-white font-sans font-semibold rounded-lg hover:bg-olive-dark transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="block w-full py-3 border border-olive text-olive font-sans font-semibold rounded-lg hover:bg-olive/5 transition-colors"
          >
            Go to homepage
          </a>
        </div>
      </div>
    </div>
  );
}
