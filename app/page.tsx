import Navbar from "@/components/Navbar";
import HeroSection from "@/components/landing/HeroSextion";
import FeaturesSection from "@/components/landing/FeaturesSection";
import GamifiedSection from "@/components/landing/Progress";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <GamifiedSection />
    </div>
  );
}
