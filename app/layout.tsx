import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { getCurrentLocale } from "@/lib/i18n/server";

const siteUrl = "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "XO Gaming - Gaming Center Reservations",
    template: "%s | XO Gaming",
  },
  description:
    "Book gaming PCs and PlayStation 4 sessions at XO Gaming. Live availability, instant confirmation, no payment required.",
  applicationName: "XO Gaming",
  keywords: [
    "gaming center",
    "esports",
    "PC reservation",
    "PlayStation 4 booking",
    "gaming cafe",
  ],
  openGraph: {
    title: "XO Gaming - Gaming Center Reservations",
    description:
      "Book gaming PCs and PlayStation 4 sessions at XO Gaming. Live availability, instant confirmation.",
    url: siteUrl,
    siteName: "XO Gaming",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "XO Gaming - Gaming Center Reservations",
    description:
      "Book gaming PCs and PlayStation 4 sessions at XO Gaming.",
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getCurrentLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";
  return (
    <html lang={locale} dir={dir} className="dark" suppressHydrationWarning>
      <body className="min-h-dvh font-sans antialiased">
        <I18nProvider locale={locale}>
          <AnimatedBackground />
          {children}
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  );
}
