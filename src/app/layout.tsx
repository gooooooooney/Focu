import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans } from "next/font/google";
import { Providers } from "@/components/providers";


import "./globals.css";
import "allotment/dist/style.css";
import { Toaster } from "sonner";



const notoSans = Noto_Sans({ variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Focu - AI-Powered Web IDE for Vibe Coding",
  description: "Focu is a browser-based IDE inspired by Cursor, designed for seamless vibe coding with AI pair programming, intelligent code completion, and real-time collaboration features.",
  keywords: ["web IDE", "vibe coding", "AI programming", "code editor", "cursor alternative", "browser-based IDE", "pair programming", "real-time collaboration"],
  authors: [{ name: "Focu Team" }],
  creator: "Focu",
  publisher: "Focu",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://focu.gooney.app",
    title: "Focu - AI-Powered Web IDE for Vibe Coding",
    description: "Experience next-gen vibe coding with Focu's AI-powered web IDE. Write code faster with intelligent suggestions and real-time collaboration.",
    siteName: "Focu",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Focu Web IDE Interface Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Focu - AI-Powered Web IDE for Vibe Coding",
    description: "Write code in your browser with AI assistance. Focu brings the power of Cursor-style vibe coding to the web.",
    images: ["/twitter-image.png"],
    creator: "@focu_ide",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  category: "development",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <html lang="en" className={notoSans.variable} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>

          {children}
          <Toaster
          richColors
           />
        </Providers>
      </body>
    </html>
  );
}
