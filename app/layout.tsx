import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "../app/globals.css";
import Navbar from "@/components/landing/Navbar";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Veydral",
};

const pixel = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-PT">
      <body className={pixel.variable}>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
