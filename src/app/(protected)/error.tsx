/**
 * Protected Routes Error Page
 * Catches errors within authenticated/protected routes
 */

"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProtectedError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Protected route error:", error);
  }, [error]);

  const isAuthError = error.message?.toLowerCase().includes("auth") || 
                       error.message?.toLowerCase().includes("session") ||
                       error.message?.toLowerCase().includes("unauthorized");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/10 dark:to-orange-950/10 px-4">
      <Card className="w-full max-w-md border-red-200 dark:border-red-900">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-900 dark:text-red-100">
            {isAuthError ? "Authentication Error" : "Something Went Wrong"}
          </CardTitle>
          <CardDescription className="text-red-700 dark:text-red-400 mt-2">
            {isAuthError 
              ? "There was a problem with your authentication session."
              : "An unexpected error occurred while processing your request."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {process.env.NODE_ENV === "development" && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-4 border border-red-200 dark:border-red-900">
              <p className="text-xs font-mono text-red-900 dark:text-red-300 break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600 dark:text-red-500 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={reset}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            {isAuthError ? (
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out & Try Again
              </Button>
            ) : (
              <Button
                className="w-full"
                asChild
              >
                <Link href="/chat">
                  <Home className="mr-2 h-4 w-4" />
                  Go to Chat
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

