import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://moneybags.app"),
  title: {
    default: "Mr. Moneybags — Invest Fake Money",
    template: "%s | Mr. Moneybags",
  },
  description:
    "Simulate famous market crashes and bull runs with real financial instruments. No real money required. Snark included.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "Mr. Moneybags — Invest Fake Money",
    description:
      "Simulate famous market crashes and bull runs with real financial instruments. No real money required.",
    type: "website",
    url: "https://moneybags.app",
    siteName: "Mr. Moneybags",
  },
  twitter: {
    card: "summary",
    title: "Mr. Moneybags — Invest Fake Money",
    description:
      "Simulate famous market crashes and bull runs. No real money required.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-base text-primary`}
      >
        {children}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2954508563135581"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
