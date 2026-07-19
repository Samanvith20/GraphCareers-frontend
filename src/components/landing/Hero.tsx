import { motion } from "framer-motion";
import { ArrowRight, Bot, Target, FileCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden flex flex-col items-center justify-center">
      {/* Absolute Background Effects */}
      <div className="absolute inset-0 bg-background" />
      {/* Core glow */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80%] max-w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Badge variant="glow" className="mb-6 sm:mb-8 px-3 py-1.5 sm:px-5 sm:py-2 gap-2 border-primary/30 bg-primary/10">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
            <span className="text-primary text-[10px] sm:text-xs font-medium tracking-wide">THE FUTURE OF JOB SEARCH</span>
          </Badge>
        </motion.div>

        <motion.h1
          className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6 sm:mb-8 leading-[1.15]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        >
          Find the right job. Fix your resume.<br className="hidden sm:block" />
          <span className="text-gradient-primary">Message recruiters directly.</span>
        </motion.h1>

        <motion.p
          className="max-w-2xl mx-auto text-base sm:text-xl text-muted-foreground mb-8 sm:mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          GraphCareers does the hard work for you. We find jobs that perfectly match your skills, format your resume so employers actually see it, and write the perfect email for you to send to hiring managers.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
        >
          <Link to="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full group text-lg px-8 h-14 bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow rounded-full">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <a href="#how-it-works" className="w-full sm:w-auto">
            {/* TODO: replace with watch demo for further engagement */}
            <Button size="lg" variant="outline" className="w-full text-lg px-8 h-14 rounded-full border-border">
              See How It Works
            </Button>
          </a>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          className="flex flex-wrap mt-12 sm:mt-16 items-center justify-center gap-2 sm:gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
        >
          {[
            { icon: Target, text: "AI Skill Matching" },
            { icon: FileCheck, text: "ATS Resume Builder" },
            { icon: Mail, text: "Cold Email AI" },
            { icon: Bot, text: "Career Agent" },
          ].map((item, i) => (
            <div
              key={item.text}
              className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs sm:text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white hover:border-primary/50 transition-all duration-300 cursor-default"
            >
              <item.icon className="h-4 w-4 text-primary" />
              {item.text}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Abstract Floating Elements for high-end feel */}
      <motion.div 
        className="absolute left-[10%] top-[20%] w-24 h-24 bg-primary/20 rounded-full blur-[40px] pointer-events-none"
        animate={{ y: [0, -30, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute right-[10%] top-[40%] w-32 h-32 bg-accent/20 rounded-full blur-[50px] pointer-events-none"
        animate={{ y: [0, 40, 0], scale: [1, 1.3, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </section>
  );
};

export default Hero;
