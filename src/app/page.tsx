/**
 * Home Page - Entry point for the chat application
 * Uses Hexagonal Architecture through dependency injection
 */

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChatHeader } from "@/ui/components/chat/chat-header";
import { ChatInput } from "@/ui/components/chat/chat-input";
import { ChatThread } from "@/ui/components/chat/chat-thread";
import { useChat } from "@/ui/hooks/useChat";

export default function Home() {
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash");

  const {
    messages,
    isLoading,
    isStreaming,
    streamingMessageId,
    sendMessage,
    stopStreaming,
    clearMessages,
    exportChat,
  } = useChat({
    modelId: selectedModel,
    onError: (error) => {
      toast.error("Failed to send message", {
        description: error.message,
      });
    },
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

  return (
    <div className="flex h-screen flex-col">
      <ChatHeader
        onClearChat={handleClearChat}
        onExportChat={handleExportChat}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />

      <div className="flex-1 overflow-hidden">
        <ChatThread
          messages={messages}
          isLoading={isLoading}
          isStreaming={isStreaming}
          streamingMessageId={streamingMessageId}
        />
      </div>

      <ChatInput
        onSend={sendMessage}
        onStop={stopStreaming}
        isLoading={isLoading}
        isStreaming={isStreaming}
      />
    </div>
  );
}
