import { Suspense, type ReactNode } from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { Press_Start_2P } from "next/font/google";
import "../app/globals.css";
import Navbar from "@/components/Navbar";
import { GoogleAnalyticsPageTracker } from "@/components/GoogleAnalyticsPageTracker";
import { Providers } from "./providers";
import { Footer } from "@/components/Footer";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  metadataBase: new URL("https://veydral.vercel.app"),
  title: "Veydral – Aventura RPG",
  description:
    "Veydral – Um RPG gamificado para completar quests, evoluir personagens e ganhar itens!",
  keywords: ["RPG", "gamificação", "tarefas", "quest", "personagens"],
  openGraph: {
    title: "Veydral – Aventura RPG",
    description:
      "Completa missões, evolui o teu personagem e ganha recompensas!",
    url: "https://veydral.vercel.app",
    siteName: "Veydral",
    images: [
      {
        url: "/static/hero.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "pt_PT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Veydral – Aventura RPG",
    description:
      "Completa missões, evolui o teu personagem e ganha recompensas!",
    images: ["/static/hero.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
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
        <meta
          name="google-site-verification"
          content="ty-UBwr1OffHPpoc-j1OE99gu7ClzjdWCoR-CPww9RQ"
        />
      </head>
      <body className={`${pixel.variable} min-h-screen flex flex-col`}>
        {GA_MEASUREMENT_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', { send_page_view: false });
              `}
            </Script>
          </>
        ) : null}
        <Providers>
          {GA_MEASUREMENT_ID ? (
            <Suspense fallback={null}>
              <GoogleAnalyticsPageTracker measurementId={GA_MEASUREMENT_ID} />
            </Suspense>
          ) : null}
          <Navbar />

          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
