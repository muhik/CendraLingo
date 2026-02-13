import type { Metadata } from "next";
import { Geist, Geist_Mono, Lexend } from "next/font/google"; // Import Lexend
import "./globals.css";
import { Toaster } from "sonner";
import { AdManager } from "@/components/ads/ad-manager";
import { FacebookPixel } from "@/components/analytics/facebook-pixel";
import { db } from "@/db/drizzle";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cendra Lingo",
  description: "Belajar Bahasa Inggris Seru Bersama Cendrawasih!",
  icons: {
    icon: "/liana.png",
    apple: "/liana.png",
  }
};

import { Suspense } from "react";

// ... imports

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch Pixel ID Server-Side (with fallback)
  let pixelId = null;
  try {
    const settings = await db.select().from(siteSettings).where(eq(siteSettings.key, "facebook_pixel_id"));
    pixelId = settings[0]?.value || "1689241645387577"; // Fallback to hardcoded ID
  } catch (error) {
    console.error("Failed to fetch pixel ID:", error);
    pixelId = "1689241645387577"; // Hard fallback
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${lexend.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Toaster position="top-center" richColors closeButton theme="light" />
        <AdManager />
        <Suspense fallback={null}>
          <FacebookPixel pixelId={pixelId} />
        </Suspense>
      </body>
    </html>
  );
}
