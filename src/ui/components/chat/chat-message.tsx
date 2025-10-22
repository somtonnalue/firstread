/**
 * ChatMessage Component - Presentation Layer
 * Displays a single message in the chat
 */

"use client";

import { Check, Copy, FileCode, RotateCw } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Message } from "@/domain/entities/Message";
import {
  extractHtmlFromMarkdown,
  hasHtmlCode,
  removeHtmlCodeBlock,
} from "@/lib/html-extractor";
import { cn } from "@/lib/utils";
import { DownloadHtmlButton } from "./download-html-button";

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;

            if (isInline) {
              return (
                <code
                  className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-lg bg-muted p-4 my-4">
              {children}
            </pre>
          ),
          ul: ({ children }) => (
            <ul className="my-2 ml-6 list-disc [&>li]:mt-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 ml-6 list-decimal [&>li]:mt-1">{children}</ol>
          ),
          h1: ({ children }) => (
            <h1 className="mt-6 mb-4 text-2xl font-bold">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-5 mb-3 text-xl font-bold">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-4 mb-2 text-lg font-semibold">{children}</h3>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-muted-foreground/20 pl-4 italic my-4">
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-4 hover:text-primary/80"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

interface ChatMessageProps {
  message: Message;
  onRegenerate?: (messageId: string) => void;
}

export function ChatMessage({ message, onRegenerate }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.isUser();
  const hasHtml = !isUser && hasHtmlCode(message.content);
  const extractedHtml = hasHtml
    ? extractHtmlFromMarkdown(message.content)
    : null;
  
  // For messages with HTML, show only the TOC/preview without the HTML code block
  const displayContent = hasHtml
    ? removeHtmlCodeBlock(message.content)
    : message.content;

  return (
    <div
      className={cn(
        "group relative flex gap-4 px-4 py-8 sm:px-6 lg:px-8",
        !isUser && "bg-muted/30",
      )}
    >
      <div className="flex-shrink-0">
        <Avatar className="h-8 w-8">
          <AvatarFallback
            className={cn(
              "text-xs font-medium",
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-purple-600 text-white",
            )}
          >
            {isUser ? "You" : "AI"}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            {isUser ? "You" : "Assistant"}
          </span>
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {message.hasAttachments() && message.attachments && (
          <div className="flex flex-wrap gap-2">
            {message.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-xs"
              >
                <span className="font-medium">{attachment.name}</span>
                <span className="text-muted-foreground">
                  ({(attachment.size / 1024).toFixed(1)} KB)
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="prose prose-sm dark:prose-invert max-w-none">
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </p>
          ) : (
            <div className="relative">
              <MarkdownContent content={displayContent} />
              {message.isStreaming && (
                <span className="inline-block w-0.5 h-4 bg-purple-600 typing-cursor ml-0.5 align-middle" />
              )}
            </div>
          )}
        </div>

        {/* HTML Source Code Accordion (for legal documents) */}
        {hasHtml && extractedHtml && !message.isStreaming && (
          <div className="mt-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="html-source" className="border-none">
                <AccordionTrigger className="text-xs text-muted-foreground hover:text-foreground py-2">
                  <div className="flex items-center gap-2">
                    <FileCode className="h-3.5 w-3.5" />
                    <span>View HTML Source Code</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs">
                    <code>{extractedHtml}</code>
                  </pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {!isUser && !message.isStreaming && (
          <div className={cn(
            "flex items-center gap-2 transition-opacity",
            isDropdownOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-2"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span className="ml-1 text-xs">{copied ? "Copied" : "Copy"}</span>
            </Button>

            {hasHtml && extractedHtml && (
              <DownloadHtmlButton
                htmlContent={extractedHtml}
                messageId={message.id}
                onOpenChange={setIsDropdownOpen}
              />
            )}

            {onRegenerate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRegenerate(message.id)}
                className="h-8 px-2"
              >
                <RotateCw className="h-4 w-4" />
                <span className="ml-1 text-xs">Regenerate</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
