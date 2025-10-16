import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "FirstRead - AI Document Generator | Generate Terms of Service, Privacy Policies & More",
  description:
    "Generate professional legal documents, Terms of Service, Privacy Policies, and website content with AI. Download as HTML or PDF. Powered by Google Gemini AI with real-time streaming.",
  keywords: [
    "AI document generator",
    "Terms of Service generator",
    "Privacy Policy generator",
    "legal documents AI",
    "HTML template generator",
    "PDF generator",
    "Gemini AI",
    "document automation",
    "AI chat interface",
  ],
  authors: [
    {
      name: "Somtochukwu N Leroy",
      url: "https://twitter.com/somtonnalue",
    },
  ],
  creator: "Somtochukwu N Leroy",
  publisher: "somtonnalue",
  openGraph: {
    title: "FirstRead - AI Document Generator",
    description:
      "Generate professional legal documents with AI. Download as HTML or PDF instantly.",
    type: "website",
    locale: "en_US",
    siteName: "FirstRead",
  },
  twitter: {
    card: "summary_large_image",
    title: "FirstRead - AI Document Generator",
    description:
      "Generate Terms of Service, Privacy Policies, and more with AI. Download as HTML/PDF.",
    creator: "@somtonnalue",
  },
  robots: {
    index: true,
    follow: true,
  },
  applicationName: "FirstRead",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
