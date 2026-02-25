import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "../app/globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "./providers";
import { Footer} from "@/components/landing/Footer";

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
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
