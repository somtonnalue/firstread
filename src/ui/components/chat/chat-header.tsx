/**
 * ChatHeader Component - Presentation Layer
 * Header with model selector and actions
 */

"use client";

import { Download, MoreHorizontal, Settings, Trash2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AVAILABLE_MODELS } from "@/shared/contracts/chat.contract";

interface ChatHeaderProps {
  onClearChat?: () => void;
  onExportChat?: () => void;
  selectedModel?: string;
  sidebarOpen?: boolean;
  onModelChange?: (modelId: string) => void;
  authButton?: React.ReactNode;
}

export function ChatHeader({
  onClearChat,
  onExportChat,
  sidebarOpen,
  selectedModel = "gemini-2.5-flash-lite",
  onModelChange,
  authButton,
}: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className={`flex h-14 ${sidebarOpen ? "w-[calc(100vw_-_400px)]" : "w-[calc(100vw_-_60px)]"} items-center justify-between px-4 sm:px-6 lg:px-8`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight">FirstRead</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedModel} onValueChange={onModelChange}>
            <SelectTrigger className="w-[200px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_MODELS.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{model.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {model.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ThemeToggle />

          {authButton}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onExportChat}>
                <Download className="mr-2 h-4 w-4" />
                Export chat
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onClearChat}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
