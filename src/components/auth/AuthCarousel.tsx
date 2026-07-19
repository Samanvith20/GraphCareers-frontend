import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Mail, CheckCircle } from "lucide-react";

const slides = [
  {
    icon: Briefcase,
    title: "Access 5+ Lakh Jobs",
    description: "Discover roles matched perfectly to your skills from our extensive, ever-growing database of opportunities.",
  },
  {
    icon: CheckCircle,
    title: "ATS-Friendly Optimization",
    description: "Seamlessly optimize your profile for platforms like Naukri, Foundit, and Instahyre to get noticed by ATS faster.",
  },
  {
    icon: Mail,
    title: "Direct Recruiter Access",
    description: "Get verified recruiter emails and let our AI draft the perfect cold email to drastically boost your hiring chances.",
  }
];

export function AuthCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000); // changes every 5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden lg:flex relative bg-zinc-950 items-center justify-center overflow-hidden border-l border-border/20 w-1/2 h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="relative z-10 w-full max-w-lg mx-12 h-[320px]" style={{ perspective: "1000px" }}>
        <AnimatePresence>
          <motion.div 
            key={current}
            initial={{ opacity: 0, x: 80, rotateY: -10, scale: 0.95, filter: "blur(12px)" }}
            animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -80, rotateY: 10, scale: 0.95, filter: "blur(12px)" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 p-12 glass-card rounded-2xl shadow-2xl flex flex-col justify-center"
          >
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-6 border border-primary/30">
              {(() => {
                const Icon = slides[current].icon;
                return <Icon className="h-6 w-6 text-primary" />;
              })()}
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
              {slides[current].title}
            </h2>
            <p className="text-lg text-zinc-400 leading-relaxed">
              {slides[current].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
