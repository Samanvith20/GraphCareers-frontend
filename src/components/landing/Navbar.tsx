import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <a href="/" className="text-lg font-bold tracking-tight text-foreground">
            <span className="text-primary">Graph</span>Careers
          </a>

          {/* Desktop Nav */}
          <div className="hidden sm:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </div>
          
          <div className="hidden sm:block">
            <Link to="/login">
              <Button variant="hero" size="sm">
                Get Started
              </Button>
            </Link> 
          </div>

          {/* Mobile Hamburger Toggle */}
          <button
            className="sm:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "100vh" }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-0 z-40 bg-background/95 backdrop-blur-md sm:hidden flex flex-col items-center pt-24 space-y-8"
          >
            <a href="#features" className="text-xl font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#how-it-works" className="text-xl font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#faq" className="text-xl font-medium text-muted-foreground hover:text-foreground transition-colors" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
            
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="hero" size="lg" className="w-full max-w-[200px]">
                Get Started
              </Button>
            </Link> 
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
