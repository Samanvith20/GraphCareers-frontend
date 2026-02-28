import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useUpsertJobStatus } from "@/hooks/useUpdateJobStatus";

export function EditJobDialog({ job, open, onOpenChange }) {
  const isEdit = Boolean(job);

  const [status, setStatus] = useState("saved");
  const [notes, setNotes] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [source, setSource] = useState("naukri");

  const { mutate, isPending } = useUpsertJobStatus();

  // 🔁 Sync state when dialog opens / job changes
  useEffect(() => {
    if (job) {
      setStatus(job.status ?? "saved");
      setNotes(job.notes ?? "");
      setJobUrl(job.jobUrl ?? "");
      setCompany(job.company ?? "");
      setJobTitle(job.jobTitle ?? "");
      setSource(job.source ?? "naukri");
    } else {
      setStatus("saved");
      setNotes("");
      setJobUrl("");
      setCompany("");
      setJobTitle("");
      setSource("naukri");
    }
  }, [job, open]);

  const onSave = () => {
    mutate(
      {
        jobUrl,
        jobTitle,
        company,
        source,
        status,
        notes,
      },
      {
        onSuccess: () => {
          toast.success(isEdit ? "Job updated successfully" : "Job added successfully");
          onOpenChange(false); // ✅ close on success
        },
        onError: () => {
          toast.error("Failed to save job. Please try again.");
          onOpenChange(false); // ✅ close even on error (as requested)
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Job" : "Track a Job"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* ADD MODE ONLY */}
          {!isEdit && (
            <>
              <Input
              required
                placeholder="Job URL"
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
              />

              <Input
              required
                placeholder="Job title"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />

              <Input
              required
                placeholder="Company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </>
          )}

          {/* STATUS */}
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="saved">Saved</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="interviewing">Interviewing</SelectItem>
                  <SelectItem value="offer">offer</SelectItem>
                      <SelectItem value="rejected">rejected</SelectItem>
              <SelectItem value="ignored">Ignored</SelectItem>
            </SelectContent>
          </Select>

          {/* NOTES */}
          <Textarea
            placeholder="Add notes (interview dates, follow-ups, referrals...)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <Button
            onClick={onSave}
            disabled={isPending}
            className="w-full"
          >
            {isEdit ? "Save changes" : "Add job"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}