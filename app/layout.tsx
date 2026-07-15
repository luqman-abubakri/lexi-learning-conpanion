import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import PwaClient from "./components/PwaClient";


const geistSans = { variable: "--font-geist-sans" };
const geistMono = { variable: "--font-geist-mono" };

export const metadata: Metadata = {
  metadataBase: new URL("https://lexi-ai.vercel.app"),

  title: {
    default: "Lexi – AI Voice Study Companion",
    template: "%s | Lexi",
  },

  description:
    "Learn faster with Lexi, an AI-powered voice study companion. Practice concepts, ask questions naturally, and improve your learning with personalized AI conversations.",

  keywords: [
    "AI",
    "AI Tutor",
    "AI Study Companion",
    "Voice AI",
    "Education",
    "Learning",
    "Next.js",
    "Vapi",
    "Supabase",
    "Clerk",
    "Artificial Intelligence",
    "Study Assistant",
    "Voice Tutor",
  ],

  authors: [
    {
      name: "Luqman Abubakri",
    },
  ],

  creator: "Luqman Abubakri",

  publisher: "Lexi",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://lexi-ai.vercel.app",
    siteName: "Lexi",
    title: "Lexi – AI Voice Study Companion",
    description:
      "Talk naturally with an AI tutor that helps you study smarter, practice concepts, and learn faster.",

    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Lexi AI",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Lexi – AI Voice Study Companion",
    description:
      "Your intelligent AI study companion powered by voice.",

    images: ["/og-image.png"],
  },

  icons: {
    icon: "/icons/icon-192x192.png",
    shortcut: "/icons/icon-192x192.png",
    apple: "/icons/apple-touch-icon.png",
  },

  themeColor: "#059669",
  applicationName: "Lexi",
  category: "education",


  manifest: "/manifest.webmanifest",

  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lexi",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <Navbar />
          <PwaClient />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}