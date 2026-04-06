import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PayNudge — Stop Chasing Payments",
    template: "%s | PayNudge",
  },
  description:
    "AI-written payment reminders for freelancers. Friendly, firm, or final. Get paid without the awkward follow-ups.",
  metadataBase: new URL("https://paynudge.com"),
  keywords: [
    "freelance invoices",
    "payment reminder",
    "payment recovery",
    "AI payment nudge",
    "get paid faster",
    "invoice follow up",
  ],
  authors: [{ name: "PayNudge" }],
  creator: "PayNudge",
  category: "business",
  openGraph: {
    title: "PayNudge — Stop Chasing Payments",
    description:
      "AI-written payment reminders for freelancers. Friendly, firm, or final.",
    url: "https://paynudge.com",
    siteName: "PayNudge",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PayNudge — Stop Chasing Payments",
    description:
      "AI-written payment reminders for freelancers. Get paid without the awkward follow-ups.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-screen bg-white text-gray-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}