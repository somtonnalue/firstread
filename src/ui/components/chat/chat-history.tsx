/**
 * Chat History Component - Presentation Layer
 * Displays list of previous chat conversations
 */

"use client";

import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ChatThread {
  id: string;
  title: string;
  messageCount: number;
  lastMessageAt: Date;
  createdAt: Date;
}

interface ChatHistoryProps {
  currentThreadId?: string;
  onThreadSelect: (threadId: string) => void;
  onNewThread: () => void;
  className?: string;
}

export interface ChatHistoryRef {
  refreshHistory: () => void;
}

export const ChatHistory = forwardRef<ChatHistoryRef, ChatHistoryProps>(function ChatHistory({
  currentThreadId,
  onThreadSelect,
  onNewThread,
  className = "",
}, ref) {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingThread, setEditingThread] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  // Fetch chat history
  const fetchThreads = useCallback(async () => {
    console.log("🔍 [DEBUG] ChatHistory.fetchThreads called");
    try {
      setIsLoading(true);
      const response = await fetch("/api/chat/history");
      if (response.ok) {
        const data = await response.json();
        console.log("🔍 [DEBUG] Fetched threads:", data.threads?.length || 0);
        setThreads(data.threads || []);
      }
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  // Expose refresh function to parent component
  useImperativeHandle(ref, () => ({
    refreshHistory: fetchThreads,
  }), [fetchThreads]);

  // Filter threads based on search query
  const filteredThreads = threads.filter((thread) =>
    thread.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRenameThread = async (threadId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/chat/threads/${threadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (response.ok) {
        setThreads((prev) =>
          prev.map((thread) =>
            thread.id === threadId ? { ...thread, title: newTitle } : thread
          )
        );
        setEditingThread(null);
        setNewTitle("");
      }
    } catch (error) {
      console.error("Failed to rename thread:", error);
    }
  };

  const handleDeleteThread = async (threadId: string) => {
    if (!confirm("Are you sure you want to delete this conversation?")) {
      return;
    }

    try {
      const response = await fetch(`/api/chat/threads/${threadId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setThreads((prev) => prev.filter((thread) => thread.id !== threadId));
        if (currentThreadId === threadId) {
          onNewThread();
        }
      }
    } catch (error) {
      console.error("Failed to delete thread:", error);
    }
  };

  const startEditing = (thread: ChatThread) => {
    setEditingThread(thread.id);
    setNewTitle(thread.title);
  };

  return (
    <div className={`flex flex-col h-full bg-background border-r ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Chat History</h2>
          <Button
            onClick={onNewThread}
            size="sm"
            className="h-8 w-8 p-0"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Threads List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
              <div className="text-sm text-muted-foreground">
                {searchQuery ? "No conversations found" : "No conversations yet"}
              </div>
              {!searchQuery && (
                <Button
                  onClick={onNewThread}
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                >
                  Start a conversation
                </Button>
              )}
            </div>
          ) : (
            filteredThreads.map((thread) => (
              <div
                key={thread.id}
                className={`group relative rounded-lg p-3 cursor-pointer transition-colors ${
                  currentThreadId === thread.id
                    ? "bg-accent border border-accent-foreground/20"
                    : "hover:bg-accent/50"
                }`}
                onClick={() => onThreadSelect(thread.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium truncate">
                        {thread.title}
                      </h3>
                      {thread.messageCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {thread.messageCount}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDistanceToNow(thread.lastMessageAt, {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(thread);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteThread(thread.id);
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Rename Dialog */}
      <Dialog
        open={editingThread !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingThread(null);
            setNewTitle("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Conversation</DialogTitle>
            <DialogDescription>
              Enter a new name for this conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Conversation title..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && editingThread && newTitle.trim()) {
                  handleRenameThread(editingThread, newTitle.trim());
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditingThread(null);
                setNewTitle("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (editingThread && newTitle.trim()) {
                  handleRenameThread(editingThread, newTitle.trim());
                }
              }}
              disabled={!newTitle.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});
