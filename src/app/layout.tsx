import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PLProvider } from "@/lib/pl-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "P&L Creation System | Master's Edge",
  description: "Professional financial modeling and P&L creation tool for The Master's Edge Program by Total Success AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased dark:bg-background`}>
        <PLProvider>
          {children}
        </PLProvider>
      </body>
    </html>
  );
}
