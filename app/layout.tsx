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
  display: "swap", // Prevent FOIT (Flash of Invisible Text)
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-PT">
      <head>
        {/* Preconnect to Cloudinary for faster LCP image */}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className={`${pixel.variable} min-h-screen flex flex-col`}>
        <Providers>
          <Navbar />

          {/* Conteúdo principal cresce */}
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
