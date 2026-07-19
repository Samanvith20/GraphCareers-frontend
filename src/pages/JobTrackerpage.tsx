import { useState, useMemo } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useUserJobApplications } from "@/hooks/useUserjobapplications";
import ErrorPage from "./ErrorPage";
import { EditJobDialog } from "@/components/EditJobDialog";

import { ApplicationHeader } from "@/components/tracker/ApplicationHeader";
import { ApplicationToolbar } from "@/components/tracker/ApplicationToolbar";
import { ApplicationMetrics } from "@/components/tracker/ApplicationMetrics";
import { ApplicationTable } from "@/components/tracker/ApplicationTable";
import { EmptyState } from "@/components/tracker/EmptyState";

const JobTrackerPage = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: jobs = [], isLoading, isError } = useUserJobApplications();

  // Derived metrics counts
  const counts = useMemo(() => {
    return jobs.reduce((acc, job) => {
      acc.all = (acc.all || 0) + 1;
      const st = job.status || "saved";
      acc[st] = (acc[st] || 0) + 1;
      return acc;
    }, { all: 0 } as Record<string, number>);
  }, [jobs]);

  // Filtering
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Status filter
      if (statusFilter !== "all" && job.status !== statusFilter) return false;
      // Search filter
      if (search.trim() !== "") {
        const query = search.toLowerCase();
        const t1 = (job.jobTitle || "").toLowerCase().includes(query);
        const t2 = (job.company || "").toLowerCase().includes(query);
        const t3 = (job.source || "").toLowerCase().includes(query);
        if (!t1 && !t2 && !t3) return false;
      }
      return true;
    });
  }, [jobs, statusFilter, search]);

  if (isError) {
    return (
      <AppLayout>
        <ErrorPage />
      </AppLayout>
    );
  }

  const hasFilters = statusFilter !== "all" || search.trim() !== "";
  const isEmpty = filteredJobs.length === 0;

  return (
    <AppLayout>
      <div className="h-full bg-[#09090B]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
          
          <ApplicationHeader 
            onAddJob={() => {
              setSelectedJob(null);
              setDialogOpen(true);
            }} 
          />
          
          <ApplicationToolbar 
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
          
          <ApplicationMetrics counts={counts} />
          
          {isEmpty && !isLoading ? (
            <div className="mt-8">
              <EmptyState 
                hasFilters={hasFilters}
                onClearFilters={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
              />
            </div>
          ) : (
            <div className="mt-8">
              <ApplicationTable 
                jobs={filteredJobs} 
                onEdit={(job) => {
                  setSelectedJob(job);
                  setDialogOpen(true);
                }} 
                isLoading={isLoading} 
              />
            </div>
          )}

          <EditJobDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            job={selectedJob}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default JobTrackerPage;
