import { Search, ListFilter, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ApplicationToolbarProps {
  search: string;
  setSearch: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
}

export function ApplicationToolbar({ search, setSearch, statusFilter, setStatusFilter }: ApplicationToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-b border-white/5">
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          placeholder="Search jobs, companies, skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-[#111113] border-white/10 text-sm h-10 w-full focus-visible:ring-1 focus-visible:ring-primary/50 placeholder:text-zinc-500"
        />
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
        {/* Simple filters for now instead of complex popovers if not available */}
        <div className="flex bg-[#111113] p-1 rounded-lg border border-white/10">
          {["all", "applied", "interviewing", "offer", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                statusFilter === s
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        
        <Button variant="outline" size="icon" className="h-9 w-9 border-white/10 bg-[#111113] text-zinc-400 hover:text-white shrink-0">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
