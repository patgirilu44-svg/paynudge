import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PayNudge — Get Paid. Without the Awkward.",
    template: "%s | PayNudge",
  },
  description:
    "AI-powered payment recovery for freelancers. Send the right nudge at the right time and get invoices paid faster.",
  metadataBase: new URL("https://paynudge.com"),
  keywords: ["freelance", "invoices", "payment recovery", "AI", "get paid"],
  authors: [{ name: "PayNudge" }],
  creator: "PayNudge",
  category: "business",
  openGraph: {
    title: "PayNudge — Get Paid. Without the Awkward.",
    description: "AI-powered payment recovery for freelancers.",
    url: "https://paynudge.com",
    siteName: "PayNudge",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PayNudge",
    description: "AI-powered payment recovery for freelancers.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-page text-foreground antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
