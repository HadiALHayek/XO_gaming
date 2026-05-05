import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AnimatedBackground } from "@/components/AnimatedBackground";

const siteUrl = "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NeonArena - Gaming Center Reservations",
    template: "%s | NeonArena",
  },
  description:
    "Book gaming PCs and PlayStation 5 sessions at NeonArena. Live availability, instant confirmation, no payment required.",
  applicationName: "NeonArena",
  keywords: [
    "gaming center",
    "esports",
    "PC reservation",
    "PlayStation 5 booking",
    "gaming cafe",
  ],
  openGraph: {
    title: "NeonArena - Gaming Center Reservations",
    description:
      "Book gaming PCs and PlayStation 5 sessions at NeonArena. Live availability, instant confirmation.",
    url: siteUrl,
    siteName: "NeonArena",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeonArena - Gaming Center Reservations",
    description:
      "Book gaming PCs and PlayStation 5 sessions at NeonArena.",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="min-h-dvh font-sans antialiased">
        <AnimatedBackground />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
