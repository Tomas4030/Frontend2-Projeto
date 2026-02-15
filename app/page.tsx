import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSextion";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
    </div>
  );
}
