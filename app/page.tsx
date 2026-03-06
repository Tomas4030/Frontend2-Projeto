import dynamic from "next/dynamic";
import HeroSection from "@/components/landing/HeroSextion";
import PixelBackground from "@/components/PixelBackground";

// Lazy load below-fold components to reduce initial bundle
const FeaturesSection = dynamic(
  () => import("@/components/landing/FeaturesSection"),
  {
    loading: () => <div className="py-24" />,
  },
);
const GamifiedSection = dynamic(() => import("@/components/landing/Progress"), {
  loading: () => <div className="py-20" />,
});

export default function Home() {
  return (
    <div className="min-h-screen">
      <PixelBackground />
      <HeroSection />
      <FeaturesSection />
      <GamifiedSection />
    </div>
  );
}
