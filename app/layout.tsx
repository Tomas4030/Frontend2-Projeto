"use client"; // <<< IMPORTANTE

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Press_Start_2P } from "next/font/google";
import "../app/globals.css";
import Navbar from "@/components/landing/Navbar";

const pixel = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={pixel.variable}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Sonner />
            <Navbar />
            {children}
          </TooltipProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
