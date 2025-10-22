/**
 * Global Error Boundary
 * Catches errors in the root layout (use sparingly, wraps entire app)
 */

"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 px-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg border border-red-200 overflow-hidden">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-10 w-10 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-red-900 mb-2">
                Critical Error
              </h1>
              <p className="text-red-700 mb-6">
                A critical error occurred. Please try refreshing the page.
              </p>

              {process.env.NODE_ENV === "development" && error.message && (
                <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 text-left">
                  <p className="text-xs font-mono text-red-900 break-all">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-red-600 mt-2">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={reset}
                className="inline-flex items-center justify-center rounded-md bg-red-600 px-6 py-3 text-sm font-medium text-white hover:bg-red-700 transition-colors"
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

