import { motion } from "framer-motion";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

export function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 px-4 text-center border border-white/5 border-dashed rounded-xl bg-white/[0.01]"
    >
      <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10 shadow-sm">
        <FolderOpen className="h-8 w-8 text-zinc-500" />
      </div>
      
      {hasFilters ? (
        <>
          <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">No results found</h3>
          <p className="text-sm text-zinc-400 max-w-sm mb-6">
            No applications match your current filters. Try changing them or clearing your search.
          </p>
          <Button variant="outline" onClick={onClearFilters} className="border-white/10 bg-[#111113] hover:bg-white/5">
            Clear Filters
          </Button>
        </>
      ) : (
        <>
          <h3 className="text-xl font-semibold text-white mb-2 tracking-tight">No applications yet</h3>
          <p className="text-sm text-zinc-400 max-w-sm mb-6">
            Track every application from every platform. Import your first job to get started.
          </p>
          <Link to="/jobs">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Browse Jobs
            </Button>
          </Link>
        </>
      )}
    </motion.div>
  );
}
