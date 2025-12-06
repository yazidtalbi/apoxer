import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Game Directory",
  description: "Dark-mode game directory app",
  manifest: "/manifest.json",
  themeColor: "#0E0E0E",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Game Directory",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0E0E0E" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Game Directory" />
      </head>
      <body className={`${inter.variable} antialiased h-full flex flex-col`}>
        <NavBar />
        <main className="flex-1 pt-16 md:pt-16 pb-16 md:pb-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </main>
        <BottomNav />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
