import { motion } from "framer-motion";
import { ArrowRight, Search, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import heroBg from "@/assets/hero-bg.jpg";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Hero = () => {
  const navigate = useNavigate();
  const { data: user, isLoading } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt=""
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge variant="glow" className="mb-8 px-4 py-1.5 gap-2">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
            Powered by Graph Intelligence
          </Badge>
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-4xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Navigate your career
          <br />
          <span className="text-gradient-primary">with skill-matched jobs</span>
        </motion.h1>
        <motion.p
          className="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          GraphCareers scans thousands of jobs from various job platforms & more
          — matches them to your exact skills — and maps your entire career
          growth path. All in one place.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <Link to="/login">
            <Button variant="hero" size="lg" className="group">
              Get Started Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <a href="#how-it-works">
            <Button variant="heroOutline" size="lg">
              See How It Works
            </Button>
          </a>
        </motion.div>

        <motion.div
          className="flex flex-wrap  mt-14 items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {[
            { icon: Search, text: "Multi-platform scraping" },
            { icon: Zap, text: "Skill-based matching" },
            { icon: TrendingUp, text: "Career path mapping" },
          ].map((item, i) => (
            <motion.div
              key={item.text}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/50 text-sm text-muted-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
            >
              <item.icon className="h-3.5 w-3.5 text-primary" />
              {item.text}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
