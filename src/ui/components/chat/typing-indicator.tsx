/**
 * Typing Indicator Component
 * Shows animated dots when AI is thinking
 */

"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function TypingIndicator() {
  return (
    <div className="group relative flex gap-4 px-4 py-8 sm:px-6 lg:px-8 bg-muted/30">
      <div className="flex-shrink-0">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-purple-600 text-white text-xs font-medium">
            AI
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Assistant</span>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div
              className={cn(
                "h-2 w-2 rounded-full bg-purple-600 animate-bounce",
              )}
              style={{ animationDelay: "0ms" }}
            />
            <div
              className={cn(
                "h-2 w-2 rounded-full bg-purple-600 animate-bounce",
              )}
              style={{ animationDelay: "150ms" }}
            />
            <div
              className={cn(
                "h-2 w-2 rounded-full bg-purple-600 animate-bounce",
              )}
              style={{ animationDelay: "300ms" }}
            />
          </div>
          <span className="ml-2 text-sm text-muted-foreground">
            Thinking...
          </span>
        </div>
      </div>
    </div>
  );
}
