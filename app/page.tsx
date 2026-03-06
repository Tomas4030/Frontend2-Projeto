
import HeroSection from "@/components/landing/HeroSextion";
import FeaturesSection from "@/components/landing/FeaturesSection";
import GamifiedSection from "@/components/landing/Progress";
import PixelBackground from "@/components/PixelBackground";

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
