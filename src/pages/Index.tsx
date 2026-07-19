import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
const Index = () => {
  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <Navbar />
      <Hero />
      <div id="features">
        <Features />
      </div>
      <div id="how-it-works">
        <HowItWorks />
      </div>

      <div id="faq">
        <FAQ />
      </div>
      {/* <CTA /> */}
      <Footer />
    </div>
  );
};

export default Index;
