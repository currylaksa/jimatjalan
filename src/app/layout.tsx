import type { Metadata, Viewport } from "next";
import { Saira, Saira_Condensed, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";

// Self-hosted at build → no runtime Google Fonts dependency (deploy/venue-safe).
const body = Saira({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-body", display: "swap" });
const display = Saira_Condensed({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display", display: "swap" });
const mono = Spline_Sans_Mono({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "JimatJalan",
  description: "Know when to fill up. Save more every week.",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "JimatJalan" },
};

export const viewport: Viewport = {
  themeColor: "#ffb020",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
