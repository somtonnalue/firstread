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
 * Remove HTML code block from markdown content
 * Returns only the markdown preview without the HTML code block
 */
export function removeHtmlCodeBlock(content: string): string {
  // Remove everything from ```html onwards
  const htmlBlockRegex = /```html[\s\S]*$/i;
  return content.replace(htmlBlockRegex, "").trim();
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
 * Sanitize HTML to remove unsupported CSS features for html2canvas
 * Converts modern CSS color functions (lab, lch, oklab, etc.) to fallback colors
 */
function sanitizeHtmlForPdf(html: string): string {
  // Remove or convert unsupported color functions
  let sanitized = html;
  
  // Replace lab() colors with fallback
  sanitized = sanitized.replace(/lab\([^)]+\)/gi, "#000000");
  sanitized = sanitized.replace(/lch\([^)]+\)/gi, "#000000");
  sanitized = sanitized.replace(/oklab\([^)]+\)/gi, "#000000");
  sanitized = sanitized.replace(/oklch\([^)]+\)/gi, "#000000");
  
  return sanitized;
}

/**
 * Download HTML content as PDF
 * Renders in a hidden off-screen container to prevent screen glitching
 */
export async function downloadPdf(
  html: string,
  filename: string = "document.pdf",
): Promise<void> {
  const html2pdf = (await import("html2pdf.js")).default;

  // Sanitize HTML to remove unsupported CSS features
  const sanitizedHtml = sanitizeHtmlForPdf(html);

  // Create a completely isolated container with shadow DOM
  const tempContainer = document.createElement("div");
  tempContainer.style.cssText = `
    position: fixed !important;
    left: -9999px !important;
    top: -9999px !important;
    width: 210mm !important;
    visibility: hidden !important;
    overflow: hidden !important;
    background: #ffffff !important;
    color: #000000 !important;
    font-family: Arial, sans-serif !important;
    all: initial !important;
  `;
  
  // Create an iframe for complete isolation from page styles
  const iframe = document.createElement("iframe");
  iframe.style.cssText = `
    position: fixed !important;
    left: -9999px !important;
    top: -9999px !important;
    width: 210mm !important;
    height: 297mm !important;
    border: none !important;
    visibility: hidden !important;
  `;
  
  document.body.appendChild(iframe);
  
  // Write HTML to iframe to isolate from parent styles
  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    throw new Error("Failed to create isolated document for PDF generation");
  }
  
  iframeDoc.open();
  iframeDoc.write(sanitizedHtml);
  iframeDoc.close();

  try {
    // Wait for iframe to fully load
    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log("🔍 [DEBUG] iframeDoc.body:", iframeDoc.body);
    console.log("🔍 [DEBUG] sanitizedHtml:", sanitizedHtml);
    
    // Generate and download PDF from iframe body
    await html2pdf()
      .from(iframeDoc.body)
      .set({
        margin: 10,
        filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: false,
          windowWidth: 794, // A4 width in pixels at 96 DPI
          windowHeight: 1123, // A4 height in pixels at 96 DPI
          backgroundColor: "#ffffff",
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .save();
  } finally {
    // Always remove the iframe
    document.body.removeChild(iframe);
  }
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
