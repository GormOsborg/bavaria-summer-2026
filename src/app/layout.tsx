import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bavaria-tur sommeren 2026",
  description: "Reiserute og lugarbooking for sommerturen med S/Y Bavaria 37.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nb"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-foreground/10 bg-background/80 backdrop-blur sticky top-0 z-10">
          <nav className="max-w-5xl mx-auto px-5 py-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <Link href="/" className="font-semibold tracking-tight">
              ⛵ Bavaria-turen 2026
            </Link>
            <span className="text-foreground/40">•</span>
            <Link href="/reiserute" className="hover:text-accent">
              Reiserute
            </Link>
            <Link href="/baten" className="hover:text-accent">
              Båten
            </Link>
            <Link href="/booking" className="hover:text-accent">
              Booking
            </Link>
          </nav>
        </header>
        <main className="flex-1 max-w-5xl w-full mx-auto px-5 py-10">{children}</main>
        <footer className="border-t border-foreground/10 py-6 text-center text-xs text-foreground/60">
          Spørsmål? Ring skipperen.
        </footer>
      </body>
    </html>
  );
}
