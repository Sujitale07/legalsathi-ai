import type { Metadata } from "next";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-code",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "LegalSathi AI",
  description: "AI-powered legal assistant for Nepal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${playfair.variable} ${inter.variable} ${mono.variable} h-full`}
      >
        <body className="min-h-full flex flex-col antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
