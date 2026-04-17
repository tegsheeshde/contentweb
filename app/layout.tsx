import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mongolian Stream — Монгол кино нэг дор",
  description: "Шилдэг Монгол кино, сериал, баримтат бичлэгийг HD чанартайгаар үзнэ үү.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn" className={`${inter.variable} h-full antialiased font-sans`}>
      <body className="min-h-full flex flex-col bg-[#0a0a0a]">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
