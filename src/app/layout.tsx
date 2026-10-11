import type { Metadata } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";

import { ResultsTicker } from "@/components/site/results-ticker";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getSession } from "@/lib/session";

import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tipsrum",
  description: "Статистически анализ на конни надбягвания",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read once here so the header can swap its actions without a client fetch.
  const session = await getSession();

  return (
    <html
      lang="bg"
      className={`${montserrat.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Ticker and nav stick together as one unit. */}
        <div className="sticky top-0 z-50">
          <ResultsTicker />
          <SiteHeader isAuthenticated={!!session} />
        </div>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
