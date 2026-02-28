import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const CTA = () => {
  return (
    <section className="relative py-14 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <Card className="relative p-12 sm:p-16 text-center overflow-hidden">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
            <h2 className="relative text-3xl sm:text-4xl font-bold mb-4">
              Ready to take control of your <span className="text-gradient-primary">career?</span>
            </h2>
            <p className="relative text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Join thousands of professionals using data-driven insights to find their next role faster.
            </p>
            <Button variant="hero" size="lg" className="relative group">
              Start for Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
