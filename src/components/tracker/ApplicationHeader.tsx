import { Button } from "@/components/ui/button";
import { Plus, Download } from "lucide-react";
import { motion } from "framer-motion";

interface ApplicationHeaderProps {
  onAddJob: () => void;
}

export function ApplicationHeader({ onAddJob }: ApplicationHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2"
    >
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-1">Applications</h1>
        <p className="text-zinc-400 text-sm">Track every application from every platform in one place.</p>
      </div>
      
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Button onClick={onAddJob} className="h-9 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm w-full sm:w-auto gap-2">
          <Plus className="h-4 w-4" />
          Import Application
        </Button>
      </div>
    </motion.div>
  );
}
