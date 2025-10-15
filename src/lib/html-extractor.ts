/**
 * HTML Extractor Utility
 * Extracts HTML code blocks from markdown content
 */

/**
 * Extract HTML code from markdown content
 * Looks for ```html code blocks
 */
export function extractHtmlFromMarkdown(content: string): string | null {
  // Match HTML code blocks: ```html ... ```
  const htmlBlockRegex = /```html\s*([\s\S]*?)```/i;
  const match = content.match(htmlBlockRegex);

  if (match?.[1]) {
    return match[1].trim();
  }

  return null;
}

/**
 * Check if content contains HTML code blocks
 */
export function hasHtmlCode(content: string): boolean {
  return /```html/i.test(content);
}

/**
 * Download HTML content as a file
 */
export function downloadHtml(
  html: string,
  filename: string = "document.html",
): void {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download HTML content as PDF
 */
export async function downloadPdf(
  html: string,
  filename: string = "document.pdf",
): Promise<void> {
  const html2pdf = (await import("html2pdf.js")).default;

  // Generate and download PDF with configurations
  await html2pdf()
    .from(html)
    .set({
      margin: 10,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .save();
}

/**
 * Get suggested filename from content
 * Tries to extract title from HTML or uses default
 */
export function getSuggestedFilename(html: string): string {
  // Try to extract title from HTML
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  if (titleMatch?.[1]) {
    return titleMatch[1]
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  // Try to extract h1 from HTML
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (h1Match?.[1]) {
    return h1Match[1]
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  // Default fallback
  return "document";
}
