import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  MapPin, 
  Banknote, 
  Clock, 
  ArrowUpDown,
  Laptop,
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { PlatformBadge } from "./PlatformBadge";
import { ActionMenu } from "./ActionMenu";

interface ApplicationTableProps {
  jobs: any[];
  onEdit: (job: any) => void;
  isLoading?: boolean;
}

export function ApplicationTable({ jobs, onEdit, isLoading }: ApplicationTableProps) {
  const [sortField, setSortField] = useState<string>("createdAt");
  const [sortDesc, setSortDesc] = useState(true);

  if (isLoading) {
    return (
      <div className="w-full border border-white/10 rounded-xl overflow-hidden bg-[#111113]">
        <div className="h-12 border-b border-white/5 bg-white/[0.02]" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 border-b border-white/5 animate-pulse bg-white/[0.01]" />
        ))}
      </div>
    );
  }

  const sortedJobs = [...jobs].sort((a, b) => {
    let valA = a[sortField] || "";
    let valB = b[sortField] || "";
    if (sortField === "createdAt") {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    }
    if (valA < valB) return sortDesc ? 1 : -1;
    if (valA > valB) return sortDesc ? -1 : 1;
    return 0;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortField(field);
      setSortDesc(true);
    }
  };

  const SortHeader = ({ label, field }: { label: string, field: string }) => (
    <button 
      onClick={() => handleSort(field)}
      className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 uppercase tracking-wider group outline-none"
    >
      {label}
      <ArrowUpDown className={cn(
        "h-3 w-3 transition-opacity", 
        sortField === field ? "opacity-100 text-zinc-300" : "opacity-0 group-hover:opacity-50"
      )} />
    </button>
  );

  return (
    <div className="w-full border border-white/10 rounded-xl overflow-hidden bg-[#111113] shadow-sm flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02] h-11">
              <th className="px-3 font-medium min-w-[200px] w-1/4"><SortHeader label="Role" field="jobTitle" /></th>
              <th className="px-3 font-medium min-w-[160px] w-1/5"><SortHeader label="Company" field="company" /></th>
              <th className="px-3 font-medium min-w-[100px]"><SortHeader label="Platform" field="source" /></th>
              <th className="px-3 font-medium min-w-[100px] hidden md:table-cell"><SortHeader label="Location" field="location" /></th>
              <th className="px-3 font-medium min-w-[100px] hidden lg:table-cell"><SortHeader label="Applied" field="createdAt" /></th>
              <th className="px-3 font-medium min-w-[130px]"><SortHeader label="Status" field="status" /></th>
      
              <th className="px-3 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {sortedJobs.map((job) => (
                <motion.tr 
                  key={job.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group h-16"
                >
                  <td className="px-3">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-zinc-100 line-clamp-1">{job.jobTitle}</span>
                      <div className="flex items-center gap-2 mt-1">
                        {/* Fake tags for demonstration of SaaS look, as the original model didn't have these exact fields */}
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-zinc-500">
                          <Briefcase className="h-3 w-3" /> Full Time
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        {job.company?.[0]?.toUpperCase() || <Building2 className="h-3.5 w-3.5 text-zinc-400" />}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-sm text-zinc-200 line-clamp-1">{job.company}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3">
                    <PlatformBadge platform={job.source} />
                  </td>
                  <td className="px-3 hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">{job.location || "Remote"}</span>
                    </div>
                  </td>
                  <td className="px-3 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <Clock className="h-3 w-3" />
                      {new Date(job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </td>
                  <td className="px-3">
                    <StatusBadge job={job} />
                  </td>
                  <td className="px-3">
                    <ActionMenu job={job} onEdit={onEdit} />
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      
      {/* Pagination footer (Mocked visually for now) */}
      <div className="h-12 border-t border-white/10 bg-[#09090b]/50 flex items-center justify-between px-4">
        <span className="text-xs text-zinc-500">Showing {jobs.length} applications</span>
        <div className="flex items-center gap-1">
          <button className="px-2 py-1 text-xs text-zinc-400 hover:text-white disabled:opacity-50" disabled>Previous</button>
          <button className="px-2 py-1 text-xs text-zinc-400 hover:text-white disabled:opacity-50" disabled>Next</button>
        </div>
      </div>
    </div>
  );
}
