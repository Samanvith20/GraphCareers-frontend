import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="relative py-24 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="relative p-12 sm:p-20 text-center overflow-hidden rounded-[3rem] bg-zinc-950 border border-white/10 shadow-2xl">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="mb-6 inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/5 border border-white/10 shadow-glow text-primary">
                <Sparkles className="h-8 w-8" />
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight text-white leading-tight">
                Stop applying in the dark. <br className="hidden sm:block" />
                <span className="text-gradient-primary">Start landing offers.</span>
              </h2>
              <p className="text-zinc-400 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                Join ambitious professionals using our data-driven OS to bypass the resume black hole and land their dream roles faster.
              </p>
              
              <Link to="/signup">
                <Button size="lg" className="group text-lg px-10 h-16 bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow rounded-full transition-all hover:scale-105">
                  Get Started for Free
                  <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
