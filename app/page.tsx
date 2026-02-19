import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSextion";
import FeaturesSection from "@/components/landing/funfa";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
    </div>
  );
}
