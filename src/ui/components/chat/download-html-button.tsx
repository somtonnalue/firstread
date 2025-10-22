/**
 * Download HTML Button Component
 * Allows downloading extracted HTML as HTML or PDF
 */

"use client";

import { Check, Download, FileCode, FileText } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  downloadHtml,
  downloadPdf,
  getSuggestedFilename,
} from "@/lib/html-extractor";

interface DownloadHtmlButtonProps {
  htmlContent: string;
  messageId: string;
  onOpenChange?: (open: boolean) => void;
}

export function DownloadHtmlButton({ htmlContent, onOpenChange }: DownloadHtmlButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    onOpenChange?.(open);
  };

  const handleDownloadHtml = () => {
    try {
      const filename = getSuggestedFilename(htmlContent);
      downloadHtml(htmlContent, `${filename}.html`);
      toast.success("HTML downloaded successfully");
    } catch (error) {
      console.error("Download HTML error:", error);
      toast.error("Failed to download HTML");
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const filename = getSuggestedFilename(htmlContent);
      await downloadPdf(htmlContent, `${filename}.pdf`);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Download PDF error:", error);
      toast.error("Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isDownloading}
          className="h-8 px-2"
        >
          {isDownloading ? (
            <Check className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span className="ml-1 text-xs">
            {isDownloading ? "Downloading..." : "Download"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={handleDownloadHtml}>
          <FileCode className="mr-2 h-4 w-4" />
          Download as HTML
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadPdf} disabled={isDownloading} className="hidden">
          <FileText className="mr-2 h-4 w-4" />
          Download as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
