/**
 * ChatInput Component - Presentation Layer
 * Input field for sending messages
 */

"use client";

import {
  FileText,
  Image as ImageIcon,
  Paperclip,
  Square,
  X,
} from "lucide-react";
import {
  forwardRef,
  type KeyboardEvent,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Attachment } from "@/shared/contracts/chat.contract";

interface ChatInputProps {
  onSend: (message: string, attachments?: Attachment[]) => void;
  onStop?: () => void;
  isLoading?: boolean;
  isStreaming?: boolean;
  placeholder?: string;
  initialValue?: string;
}

export interface ChatInputRef {
  setValue: (value: string) => void;
  focus: () => void;
}

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(
  function ChatInput(
    {
      onSend,
      onStop,
      isLoading = false,
      isStreaming = false,
      placeholder = "Message Assistant...",
      initialValue = "",
    },
    ref,
  ) {
    const [message, setMessage] = useState(initialValue);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      setValue: (value: string) => {
        setMessage(value);
        // Auto-resize textarea
        if (textareaRef.current) {
          textareaRef.current.value = value;
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
      },
      focus: () => {
        textareaRef.current?.focus();
      },
    }));

    // Update message when initialValue changes
    useEffect(() => {
      if (initialValue) {
        setMessage(initialValue);
      }
    }, [initialValue]);

    const handleSend = () => {
      if (message.trim() && !isLoading) {
        onSend(message, attachments.length > 0 ? attachments : undefined);
        setMessage("");
        setAttachments([]);
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const newAttachments: Attachment[] = files.map((file) => ({
        id: `${Date.now()}-${file.name}`,
        name: file.name,
        type: file.type,
        size: file.size,
      }));
      setAttachments((prev) => [...prev, ...newAttachments]);
    };

    const removeAttachment = (id: string) => {
      setAttachments((prev) => prev.filter((att) => att.id !== id));
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMessage(e.target.value);
      // Auto-resize textarea
      e.target.style.height = "auto";
      e.target.style.height = `${e.target.scrollHeight}px`;
    };

    const getFileIcon = (type: string) => {
      if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
      return <FileText className="h-4 w-4" />;
    };

    return (
      <div className="border-t bg-background">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          {attachments.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 rounded-lg border bg-muted px-3 py-2"
                >
                  {getFileIcon(attachment.type)}
                  <span className="text-xs font-medium">{attachment.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(attachment.id)}
                    className="h-4 w-4 p-0 hover:bg-transparent"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="relative flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx,.txt"
            />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="h-10 w-10 flex-shrink-0"
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            <div className="relative flex-1">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={isLoading}
                className={cn(
                  "min-h-[52px] max-h-[200px] resize-none pr-12",
                  "focus-visible:ring-1",
                )}
                rows={1}
              />
              {isStreaming ? (
                <Button
                  onClick={onStop}
                  size="sm"
                  variant="destructive"
                  className="absolute bottom-2 right-2 h-8 px-3"
                >
                  <Square className="h-3 w-3 mr-1" />
                  Stop
                </Button>
              ) : (
                <Button
                  onClick={handleSend}
                  disabled={!message.trim() || isLoading}
                  size="sm"
                  className="absolute bottom-2 right-2 h-8 px-3"
                >
                  {isLoading ? "Generating" : "Generate"}
                </Button>
              )}
            </div>
          </div>

          <p className="mt-2 text-center text-xs text-muted-foreground">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </div>
    );
  },
);
