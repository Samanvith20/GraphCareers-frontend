import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ChatPage() {
  return (
    <AppLayout>
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <motion.div 
          className="max-w-md w-full text-center space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative mx-auto w-24 h-24 mb-8">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative flex items-center justify-center w-full h-full bg-background border border-border/50 rounded-2xl shadow-glow">
              <Bot className="h-10 w-10 text-primary" />
              <div className="absolute -top-2 -right-2 bg-background p-1.5 rounded-xl border border-border/50 shadow-sm">
                <Sparkles className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              AI Career Agent
            </h1>
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              Coming Soon
            </div>
          </div>
          
          <p className="text-muted-foreground leading-relaxed">
            We are building a deeply integrated, intelligent chat agent that knows your skills, goals, and market trends. Soon, you'll be able to have real-time conversations to map out your exact career moves.
          </p>
          
          <div className="pt-6">
            <Link to="/jobs">
              <Button variant="hero" size="lg" className="w-full sm:w-auto">
                Explore Jobs Meanwhile
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}