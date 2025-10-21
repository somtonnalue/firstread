/**
 * Chat Page - Protected chat application
 * Uses Hexagonal Architecture through dependency injection
 */

"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ChatHeader } from "@/ui/components/chat/chat-header";
import { ChatInput, type ChatInputRef } from "@/ui/components/chat/chat-input";
import { ChatThread } from "@/ui/components/chat/chat-thread";
import { ChatHistory, type ChatHistoryRef } from "@/ui/components/chat/chat-history";
import { AuthButton } from "@/ui/components/auth/auth-button";
import { ProtectedRoute } from "@/ui/components/auth/protected-route";
import { useChat } from "@/ui/hooks/useChat";
import { Button } from "@/components/ui/button";
import { PanelLeft, X } from "lucide-react";

export default function Home() {
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const chatInputRef = useRef<ChatInputRef>(null);
  const chatHistoryRef = useRef<ChatHistoryRef>(null);

  const handleThreadCreated = () => {
    // Refresh chat history when a new thread is created
    chatHistoryRef.current?.refreshHistory();
  };

  const {
    messages,
    isLoading,
    isStreaming,
    streamingMessageId,
    sendMessage,
    stopStreaming,
    clearMessages,
    exportChat,
    currentThread,
    switchToThread,
    createNewThread,
  } = useChat({
    modelId: selectedModel,
    onError: (error) => {
      toast.error("Failed to send message", {
        description: error.message,
      });
    },
    onThreadCreated: handleThreadCreated,
  });

  const handleClearChat = async () => {
    if (messages.length > 0) {
      if (
        confirm(
          "Are you sure you want to clear all messages? This cannot be undone.",
        )
      ) {
        await clearMessages();
        toast.success("Chat cleared");
      }
    }
  };

  const handleExportChat = async () => {
    const chatData = await exportChat();
    if (!chatData) return;

    const blob = new Blob([chatData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-export-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Chat exported successfully");
  };

  const handlePromptClick = (prompt: string) => {
    chatInputRef.current?.setValue(prompt);
    chatInputRef.current?.focus();
  };

  const handleThreadSelect = (threadId: string) => {
    switchToThread(threadId);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const handleNewThread = () => {
    createNewThread();
    setSidebarOpen(false); // Close sidebar on mobile after creation
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? "w-80" : "w-0"
          } transition-all duration-300 ease-in-out overflow-hidden border-r bg-background`}
        >
          <ChatHistory
            ref={chatHistoryRef}
            currentThreadId={currentThread?.id}
            onThreadSelect={handleThreadSelect}
            onNewThread={handleNewThread}
            className="h-full"
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header with sidebar toggle */}
          <div className="flex items-center border-b bg-background">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="ml-2"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            </Button>
            <ChatHeader
              onClearChat={handleClearChat}
              onExportChat={handleExportChat}
              sidebarOpen={sidebarOpen}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              authButton={<AuthButton />}
            />
          </div>

          {/* Chat Thread */}
          <div className="flex-1 overflow-hidden">
            <ChatThread
              messages={messages}
              isLoading={isLoading}
              isStreaming={isStreaming}
              streamingMessageId={streamingMessageId}
              onPromptClick={handlePromptClick}
            />
          </div>

          {/* Chat Input */}
          <ChatInput
            ref={chatInputRef}
            onSend={sendMessage}
            onStop={stopStreaming}
            isLoading={isLoading}
            isStreaming={isStreaming}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
