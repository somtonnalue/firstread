/**
 * ChatThread Component - Presentation Layer
 * Displays the list of messages
 */

"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Message } from "@/domain/entities/Message";
import { ChatMessage } from "./chat-message";
import { TypingIndicator } from "./typing-indicator";

interface ChatThreadProps {
  messages: Message[];
  isLoading?: boolean;
  isStreaming?: boolean;
  streamingMessageId?: string | null;
  onRegenerate?: (messageId: string) => void;
  onPromptClick?: (prompt: string) => void;
}

export function ChatThread({
  messages,
  isLoading,
  isStreaming,
  onRegenerate,
  onPromptClick,
}: ChatThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  // biome-ignore lint/correctness/useExhaustiveDependencies: We want to scroll when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
            <svg
              className="h-8 w-8 text-purple-600 dark:text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <title>Chat Icon</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">
              Generate Professional Documents
            </h2>
            <p className="text-sm text-muted-foreground">
              Create comprehensive legal documents, Terms of Service, Privacy
              Policies, and more with AI. Get production-ready HTML templates
              you can download as HTML or PDF.
            </p>
          </div>
          <div className="grid gap-2 text-left">
            <button
              type="button"
              onClick={() =>
                onPromptClick?.(
                  "Generate a comprehensive Terms of Service for FirstRead, an AI-powered document generation platform. Include user accounts, subscription billing, data usage, intellectual property, and termination clauses.",
                )
              }
              className="rounded-lg border bg-card p-3 text-sm hover:bg-accent hover:border-purple-500 transition-colors text-left"
            >
              <div className="font-medium mb-1">
                📄 Generate Terms of Service
              </div>
              <div className="text-xs text-muted-foreground">
                Comprehensive TOS with subscription and IP clauses
              </div>
            </button>
            <button
              type="button"
              onClick={() =>
                onPromptClick?.(
                  "Generate a GDPR and CCPA compliant Privacy Policy for FirstRead. Include data collection, user rights, cookie policy, data retention, and international data transfers.",
                )
              }
              className="rounded-lg border bg-card p-3 text-sm hover:bg-accent hover:border-purple-500 transition-colors text-left"
            >
              <div className="font-medium mb-1">🔒 Generate Privacy Policy</div>
              <div className="text-xs text-muted-foreground">
                GDPR/CCPA compliant with cookie policy
              </div>
            </button>
            <button
              type="button"
              onClick={() =>
                onPromptClick?.(
                  "Generate a SaaS Master Services Agreement for FirstRead. Include scope of services, payment terms, SLA commitments, data processing agreement, IP ownership, warranties, indemnification, and dispute resolution.",
                )
              }
              className="rounded-lg border bg-card p-3 text-sm hover:bg-accent hover:border-purple-500 transition-colors text-left"
            >
              <div className="font-medium mb-1">📋 Generate SaaS Agreement</div>
              <div className="text-xs text-muted-foreground">
                Complete MSA with SLA and data processing terms
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="mx-auto max-w-4xl">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onRegenerate={onRegenerate}
          />
        ))}

        {isLoading && !isStreaming && messages.length > 0 && (
          <TypingIndicator />
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
