import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "../components/Providers";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Collaborate - Task & Project Hub",
  description: "Real-time project tracking, role-based workflows, analytics, and intelligent warnings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            richColors
            expand={false}
            closeButton
            toastOptions={{
              style: { borderRadius: '16px', fontSize: '13px' },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
