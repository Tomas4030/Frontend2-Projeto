import { type ReactNode } from "react";
import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "../app/globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "./providers";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Veydral",
};

const pixel = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-PT">
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className={`${pixel.variable} min-h-screen flex flex-col`}>
        <Providers>
          <Navbar />

          
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
