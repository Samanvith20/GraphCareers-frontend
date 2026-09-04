import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronsUpDown,
  Download,
  FileText,
  Loader2,
  LockKeyhole,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { ResumeAgentPreview } from "@/components/resumeAgent/ResumeAgentPreview";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useConfirmResumeSkill,
  useDecideResumeProposal,
  useDownloadResumeVersion,
  useResumeAgentChat,
  useResumeAgentMessages,
  useResumeAgentRun,
  useResumeAgentVersion,
  useResumeAgentWorkspace,
  useStartResumeAgent,
  usePlatformRoles,
} from "@/hooks/useResumeAgent";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";
import type { MissingSkillConfirmation, ResumeAgentRun, ResumeProposal, ResumeScore } from "@/types/resumeAgent";

const platformSchema = z.object({
  platform: z.string().min(2, "Choose a platform"),
  role: z.string().trim().min(2, "Choose an available role").max(200),
  location: z.string().trim().max(200).optional(),
});

const manualSchema = z.object({
  jobTitle: z.string().trim().min(2, "Enter the job title").max(300),
  companyName: z.string().trim().max(300).optional(),
  jobDescription: z.string().trim().min(50, "Paste at least 50 characters from the job description").max(100_000),
});

const chatSchema = z.object({ message: z.string().trim().min(1).max(4000) });

const skillSchema = z.object({
  confirmation: z.enum(["used_professionally", "used_in_project", "completed_course", "basic_knowledge", "not_used"]),
  organizationOrProject: z.string().trim().max(300).optional(),
  usageDetails: z.string().trim().max(3000).optional(),
  metric: z.string().trim().max(300).optional(),
}).superRefine((value, context) => {
  if (["used_professionally", "used_in_project"].includes(value.confirmation)) {
    if (!value.organizationOrProject) context.addIssue({ code: "custom", path: ["organizationOrProject"], message: "Enter the matching employer or project" });
    if (!value.usageDetails) context.addIssue({ code: "custom", path: ["usageDetails"], message: "Explain how you used this skill" });
  }
});

type PlatformForm = z.infer<typeof platformSchema>;
type ManualForm = z.infer<typeof manualSchema>;
type ChatForm = z.infer<typeof chatSchema>;
type SkillForm = z.infer<typeof skillSchema>;

const PLATFORMS = [
  { value: "naukri", label: "Naukri" },
  { value: "instahyre", label: "Instahyre" },
  { value: "foundit", label: "Foundit" },
];

const ACTIVE_STATUSES = new Set(["pending", "analyzing", "applying", "validating"]);

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong";
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1 text-xs text-destructive">{message}</p> : null;
}

function ProtectedMasterNotice() {
  return (
    <Alert className="border-primary/20 bg-primary/5">
      <LockKeyhole className="h-4 w-4 text-primary" />
      <AlertTitle>Your master resume stays unchanged</AlertTitle>
      <AlertDescription>
        Every successful optimization creates a separate version. Your uploaded master remains the source of truth and is never overwritten.
      </AlertDescription>
    </Alert>
  );
}

function SetupScreen({ onStarted }: { onStarted: (runId: string) => void }) {
  const { data: profile } = useProfile();
  const workspace = useResumeAgentWorkspace(true);
  const start = useStartResumeAgent();
  const [roleSelectorOpen, setRoleSelectorOpen] = useState(false);
  const platformForm = useForm<PlatformForm>({
    resolver: zodResolver(platformSchema),
    defaultValues: { platform: "naukri", role: "", location: "" },
  });
  const manualForm = useForm<ManualForm>({
    resolver: zodResolver(manualSchema),
    defaultValues: { jobTitle: "", companyName: "", jobDescription: "" },
  });
  const selectedPlatform = platformForm.watch("platform");
  const platformRoles = usePlatformRoles(selectedPlatform);
  const availableRoles = useMemo(() => platformRoles.data?.roles || [], [platformRoles.data?.roles]);

  useEffect(() => {
    if (profile?.role && !platformForm.getValues("role") && availableRoles.length) {
      const profileRole = profile.role.trim().toLowerCase();
      const matchingRole = availableRoles.find((role) => role.name.toLowerCase() === profileRole);
      if (matchingRole) platformForm.setValue("role", matchingRole.name);
    }
    if (profile?.location && !platformForm.getValues("location")) platformForm.setValue("location", profile.location);
  }, [availableRoles, platformForm, profile?.location, profile?.role]);

  const startPlatform = platformForm.handleSubmit(async (values) => {
    try {
      const result = await start.mutateAsync({
        type: "platform",
        values: { ...values, location: values.location || undefined, sampleSize: 100 },
      });
      toast.success("Platform analysis started");
      onStarted(result.run.id);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  });

  const startManual = manualForm.handleSubmit(async (values) => {
    try {
      const result = await start.mutateAsync({
        type: "manual",
        values: { ...values, companyName: values.companyName || undefined },
      });
      toast.success("JD optimization started");
      onStarted(result.run.id);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  });

  if (workspace.isLoading) {
    return <div className="flex min-h-[65vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (workspace.isError) {
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">A parsed master resume is required</h2>
        <p className="mt-2 text-sm text-muted-foreground">{errorMessage(workspace.error)}</p>
        <Button asChild className="mt-6"><Link to="/profile">Upload resume in Profile</Link></Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-10">
      <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div className="max-w-3xl">
          <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/10 text-primary"><Sparkles className="mr-1 h-3 w-3" /> Resume Agent v2</Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Create a targeted resume from your master</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Analyze a job market or paste one exact JD. The agent scores your master, creates only evidence-safe improvements, and saves the result as a new version.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-3 text-right shadow-card">
          <p className="text-xs text-muted-foreground">Available balance</p>
          <p className="text-lg font-bold text-primary">{profile?.credits ?? 0} AI credits</p>
        </div>
      </div>

      <ProtectedMasterNotice />

      <Tabs defaultValue="platform" className="mt-7">
        <TabsList className="grid h-auto w-full max-w-xl grid-cols-2 bg-muted/60 p-1">
          <TabsTrigger value="platform" className="gap-2 py-3"><BarChart3 className="h-4 w-4" /> Platform market</TabsTrigger>
          <TabsTrigger value="manual" className="gap-2 py-3"><FileText className="h-4 w-4" /> Paste a job description</TabsTrigger>
        </TabsList>

        <TabsContent value="platform" className="mt-5">
          <Card className="max-w-3xl border-border bg-card/80 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BriefcaseBusiness className="h-5 w-5 text-primary" /> Optimize for a platform market</CardTitle>
              <CardDescription>We aggregate relevant recent jobs from the selected platform and optimize for common demand—not one specific company.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={startPlatform} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label>Platform</Label>
                    <Controller control={platformForm.control} name="platform" render={({ field }) => (
                      <Select value={field.value} onValueChange={(value) => {
                        field.onChange(value);
                        platformForm.setValue("role", "", { shouldValidate: true });
                        setRoleSelectorOpen(false);
                      }}>
                        <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                        <SelectContent>{PLATFORMS.map((platform) => <SelectItem key={platform.value} value={platform.value}>{platform.label}</SelectItem>)}</SelectContent>
                      </Select>
                    )} />
                  </div>
                  <div>
                    <Label>Target role</Label>
                    <Controller control={platformForm.control} name="role" render={({ field }) => (
                      <Popover open={roleSelectorOpen} onOpenChange={setRoleSelectorOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            aria-expanded={roleSelectorOpen}
                            disabled={platformRoles.isLoading || platformRoles.isError}
                            className="mt-2 w-full justify-between font-normal"
                          >
                            <span className="truncate">
                              {platformRoles.isLoading ? "Loading available roles..." : field.value || "Choose a role available on this platform"}
                            </span>
                            {platformRoles.isLoading ? <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" /> : <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
                          <Command>
                            <CommandInput placeholder="Search available roles..." />
                            <CommandList>
                              <CommandEmpty>No available role found.</CommandEmpty>
                              <CommandGroup>
                                {availableRoles.map((role) => (
                                  <CommandItem
                                    key={role.name}
                                    value={`${role.name} ${role.jobCount}`}
                                    onSelect={() => {
                                      field.onChange(role.name);
                                      platformForm.clearErrors("role");
                                      setRoleSelectorOpen(false);
                                    }}
                                  >
                                    <Check className={cn("mr-2 h-4 w-4", field.value === role.name ? "opacity-100" : "opacity-0")} />
                                    <span className="min-w-0 flex-1 truncate">{role.name}</span>
                                    <span className="ml-3 text-xs text-muted-foreground">{role.jobCount.toLocaleString()} jobs</span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )} />
                    <FieldError message={platformForm.formState.errors.role?.message} />
                    {platformRoles.isError && (
                      <div className="mt-1 flex items-center gap-2 text-xs text-destructive">
                        <span>Available roles could not be loaded.</span>
                        <button type="button" className="font-medium underline underline-offset-2" onClick={() => void platformRoles.refetch()}>Retry</button>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="target-location">Location <span className="text-muted-foreground">(optional)</span></Label>
                  <Input id="target-location" className="mt-2" placeholder="Bengaluru, Remote, India..." {...platformForm.register("location")} />
                </div>
                <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">2 credits are reserved and charged only if an improved version is created.</p>
                  <Button type="submit" disabled={start.isPending} className="gap-2">
                    {start.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />} Analyze market and generate
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="mt-5">
          <Card className="max-w-3xl border-border bg-card/80 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" /> Optimize for one exact job</CardTitle>
              <CardDescription>Paste the complete JD. The generated resume is tailored to its explicit requirements while preserving your verified facts.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={startManual} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="job-title">Job title</Label>
                    <Input id="job-title" className="mt-2" placeholder="Full Stack Engineer" {...manualForm.register("jobTitle")} />
                    <FieldError message={manualForm.formState.errors.jobTitle?.message} />
                  </div>
                  <div>
                    <Label htmlFor="company-name">Company <span className="text-muted-foreground">(optional)</span></Label>
                    <Input id="company-name" className="mt-2" placeholder="Company name" {...manualForm.register("companyName")} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="job-description">Complete job description</Label>
                    <span className="text-xs text-muted-foreground">{manualForm.watch("jobDescription").length.toLocaleString()} characters</span>
                  </div>
                  <Textarea id="job-description" className="mt-2 min-h-[260px] resize-y" placeholder="Paste responsibilities, requirements, preferred skills, location and experience details..." {...manualForm.register("jobDescription")} />
                  <FieldError message={manualForm.formState.errors.jobDescription?.message} />
                </div>
                <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-muted-foreground">3 credits are reserved and charged only if an improved version is created.</p>
                  <Button type="submit" disabled={start.isPending} className="gap-2">
                    {start.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Analyze JD and generate
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ScoreCard({ label, value, previous, icon: Icon }: { label: string; value: number; previous?: number; icon: typeof Target }) {
  const improvement = previous === undefined ? 0 : value - previous;
  return (
    <Card className="border-border bg-card/70">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><Icon className="h-4 w-4" /> {label}</div>
          {improvement > 0 && <Badge className="bg-primary/10 text-primary hover:bg-primary/10">+{improvement}</Badge>}
        </div>
        <div className="mt-3 flex items-end gap-2"><span className="text-3xl font-bold tabular-nums">{value}</span><span className="pb-1 text-xs text-muted-foreground">/100</span></div>
        <Progress value={value} className="mt-3 h-1.5" />
      </CardContent>
    </Card>
  );
}

function ScoreGrid({ current, previous }: { current: ResumeScore; previous?: ResumeScore | null }) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      <ScoreCard label="Overall" value={current.overall} previous={previous?.overall} icon={TrendingUp} />
      <ScoreCard label="ATS compatibility" value={current.atsCompatibility.score} previous={previous?.atsCompatibility.score} icon={ShieldCheck} />
      <ScoreCard label="Target match" value={current.targetMatch.score} previous={previous?.targetMatch.score} icon={Target} />
      <ScoreCard label="Resume quality" value={current.resumeQuality.score} previous={previous?.resumeQuality.score} icon={BarChart3} />
    </div>
  );
}

function ProposalCard({ proposal, busy, onDecision }: { proposal: ResumeProposal; busy: boolean; onDecision: (decision: "approve" | "reject") => void }) {
  const reviewable = ["proposed", "approved"].includes(proposal.status) && !proposal.requiresConfirmation;
  const statusLabel = proposal.status === "approved" ? "ready" : proposal.status;
  const proposalValue = (value: unknown) => {
    if (value === null || value === undefined) return "Not present";
    if (typeof value === "string") return value;
    if (Array.isArray(value) && value.every((item) => typeof item === "string")) return value.join(", ");
    return JSON.stringify(value, null, 2);
  };
  const violationMessage = (violation: ResumeProposal["violations"][number]) => {
    if (violation.code === "UNVERIFIED_SKILL") return `${violation.value} is not verified in your master resume.`;
    if (violation.code === "UNVERIFIED_METRIC") return `${violation.value} is not supported by the same source bullet or your confirmation.`;
    if (violation.code === "PROTECTED_FACT_CHANGED") return `${violation.value} is a protected fact and cannot be changed automatically.`;
    return `${violation.code.replaceAll("_", " ").toLowerCase()}: ${violation.value}`;
  };
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Badge variant="outline" className="mb-2 capitalize">{proposal.type.replaceAll("_", " ")}</Badge>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Why this change was suggested</p>
          <p className="mt-1 text-sm font-medium">{proposal.rationale}</p>
          <p className="mt-1 text-xs text-muted-foreground">Section: {proposal.targetPath}</p>
        </div>
        <Badge variant={proposal.status === "blocked" ? "destructive" : "secondary"} className="capitalize">{statusLabel}</Badge>
      </div>
      <div className="mt-3 grid gap-3 text-xs">
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <p className="mb-1 font-semibold text-muted-foreground">Current</p>
          <p className="whitespace-pre-wrap break-words">{proposalValue(proposal.before)}</p>
        </div>
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <p className="mb-1 font-semibold text-muted-foreground">Proposed</p>
          <p className="whitespace-pre-wrap break-words">{proposalValue(proposal.after)}</p>
        </div>
      </div>
      {proposal.violations.length > 0 && (
        <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <p className="text-xs font-semibold text-destructive">Why this change was blocked</p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-destructive">
            {proposal.violations.map((violation) => (
              <li key={`${violation.code}-${violation.value}`}>{violationMessage(violation)}</li>
            ))}
          </ul>
        </div>
      )}
      {reviewable && (
        <div className="mt-4 flex gap-2">
          <Button size="sm" onClick={() => onDecision("approve")} disabled={busy} className="gap-1"><Check className="h-3.5 w-3.5" /> Apply · 1 credit</Button>
          <Button size="sm" variant="outline" onClick={() => onDecision("reject")} disabled={busy} className="gap-1"><X className="h-3.5 w-3.5" /> Reject</Button>
        </div>
      )}
    </div>
  );
}

function SkillConfirmationDialog({ skill, runId, onClose }: { skill: string | null; runId: string; onClose: () => void }) {
  const confirmSkill = useConfirmResumeSkill(runId);
  const form = useForm<SkillForm>({
    resolver: zodResolver(skillSchema),
    defaultValues: { confirmation: "used_professionally", organizationOrProject: "", usageDetails: "", metric: "" },
  });
  const confirmation = form.watch("confirmation");
  const needsEvidence = confirmation === "used_professionally" || confirmation === "used_in_project";

  useEffect(() => {
    if (skill) form.reset({ confirmation: "used_professionally", organizationOrProject: "", usageDetails: "", metric: "" });
  }, [form, skill]);

  const submit = form.handleSubmit(async (values) => {
    if (!skill) return;
    try {
      const response = await confirmSkill.mutateAsync({
        skill,
        ...values,
        confirmation: values.confirmation as MissingSkillConfirmation,
        applyTo: values.confirmation === "used_professionally" ? "experience" : values.confirmation === "used_in_project" ? "project" : "skills",
      });
      toast.success(response.result.changed ? "Verified skill added to a new resume version" : response.result.message || "Your answer was saved");
      onClose();
    } catch (error) {
      toast.error(errorMessage(error));
    }
  });

  return (
    <Dialog open={Boolean(skill)} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Do you actually have {skill} experience?</DialogTitle>
          <DialogDescription>The agent will never add a missing skill from a click alone. Tell us the truthful evidence first.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Experience type</Label>
            <Controller control={form.control} name="confirmation" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="used_professionally">Used professionally</SelectItem>
                  <SelectItem value="used_in_project">Used in a project</SelectItem>
                  <SelectItem value="completed_course">Completed a course</SelectItem>
                  <SelectItem value="basic_knowledge">Basic knowledge only</SelectItem>
                  <SelectItem value="not_used">I have not used it</SelectItem>
                </SelectContent>
              </Select>
            )} />
          </div>
          {needsEvidence && (
            <>
              <div>
                <Label htmlFor="evidence-owner">Matching {confirmation === "used_professionally" ? "employer" : "project"}</Label>
                <Input id="evidence-owner" className="mt-2" placeholder={confirmation === "used_professionally" ? "Employer already in your resume" : "Project already in your resume"} {...form.register("organizationOrProject")} />
                <FieldError message={form.formState.errors.organizationOrProject?.message} />
              </div>
              <div>
                <Label htmlFor="usage-details">What did you do?</Label>
                <Textarea id="usage-details" className="mt-2" placeholder="Describe your real usage and outcome. Do not add information you cannot defend in an interview." {...form.register("usageDetails")} />
                <FieldError message={form.formState.errors.usageDetails?.message} />
              </div>
              <div>
                <Label htmlFor="usage-metric">Verified metric <span className="text-muted-foreground">(optional)</span></Label>
                <Input id="usage-metric" className="mt-2" placeholder="Example: Reduced deployment time by 40%" {...form.register("metric")} />
              </div>
            </>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={confirmSkill.isPending}>{confirmSkill.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirm truthfully</Button>
          </div>
          <p className="text-xs text-muted-foreground">A confirmed skill creates a separate live resume version and charges 1 credit only when the change is applied.</p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ResumeAgentChat({ runId }: { runId: string }) {
  const messages = useResumeAgentMessages(runId);
  const chat = useResumeAgentChat(runId);
  const form = useForm<ChatForm>({ resolver: zodResolver(chatSchema), defaultValues: { message: "" } });
  const submit = form.handleSubmit(async ({ message }) => {
    try {
      form.reset();
      await chat.mutateAsync(message);
    } catch (error) {
      toast.error(errorMessage(error));
      form.setValue("message", message);
    }
  });

  return (
    <Card className="flex min-h-[520px] flex-col border-border bg-card/80 shadow-card">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="flex items-center gap-2 text-base"><Bot className="h-5 w-5 text-primary" /> Resume Agent</CardTitle>
        <CardDescription>Ask for explanations or request a rewrite. Changes are proposed for review before they are applied.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-0">
        <div className="max-h-[430px] flex-1 space-y-4 overflow-y-auto p-4">
          {!messages.data?.length && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
              I can explain your score, discuss missing skills, or prepare evidence-safe changes. Try “Rewrite my summary for this role.”
            </div>
          )}
          {messages.data?.map((message) => (
            <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[88%] rounded-2xl px-4 py-3 text-sm", message.role === "user" ? "bg-primary text-primary-foreground" : "border border-border bg-muted/40")}>
                {message.content}
              </div>
            </div>
          ))}
          {chat.isPending && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Agent is reviewing your resume...</div>}
        </div>
        <form onSubmit={submit} className="border-t border-border p-3">
          <div className="flex items-end gap-2">
            <Textarea className="min-h-[46px] resize-none" placeholder="Ask about the score or request a safe rewrite..." {...form.register("message")} />
            <Button type="submit" size="icon" disabled={chat.isPending || !form.watch("message").trim()}><Send className="h-4 w-4" /></Button>
          </div>
          <FieldError message={form.formState.errors.message?.message} />
        </form>
      </CardContent>
    </Card>
  );
}

function ProcessingState({ run }: { run?: ResumeAgentRun }) {
  const statusLabel = run?.status === "validating" ? "Validating the generated resume" : run?.status === "applying" ? "Applying evidence-safe changes" : "Analyzing your master resume and target";
  const progress = run?.status === "validating" ? 85 : run?.status === "applying" ? 65 : run?.status === "analyzing" ? 35 : 12;
  return (
    <div className="mx-auto flex min-h-[68vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      <h2 className="mt-6 text-xl font-semibold">{statusLabel}</h2>
      <p className="mt-2 text-sm text-muted-foreground">The agent is scoring, proposing, checking facts, and validating improvement. You can safely leave this page and return.</p>
      <Progress value={progress} className="mt-7 h-2 w-full" />
      <p className="mt-3 text-xs text-muted-foreground capitalize">Status: {run?.status || "loading"}</p>
    </div>
  );
}

function PollingTimeoutState({
  run,
  checking,
  onCheck,
}: {
  run?: ResumeAgentRun;
  checking: boolean;
  onCheck: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[68vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10">
        <AlertCircle className="h-8 w-8 text-amber-400" />
      </div>
      <h2 className="mt-6 text-xl font-semibold">This is taking longer than expected</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Automatic status checks have stopped to avoid polling forever. The background worker may still finish this run, so check the same run again instead of submitting a duplicate request.
      </p>
      <p className="mt-3 text-xs text-muted-foreground capitalize">Last known status: {run?.status || "unavailable"}</p>
      <Button type="button" onClick={onCheck} disabled={checking} className="mt-6 gap-2">
        {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
        Check current status
      </Button>
    </div>
  );
}

function WorkspaceScreen({ runId, onNew }: { runId: string; onNew: () => void }) {
  const runQuery = useResumeAgentRun(runId);
  const run = runQuery.data;
  const versionId = run?.outputVersionId || run?.baseVersionId || null;
  const version = useResumeAgentVersion(versionId);
  const proposalDecision = useDecideResumeProposal(runId);
  const download = useDownloadResumeVersion();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const { data: profile, refetch: refetchProfile } = useProfile();
  const runStatus = run?.status;

  useEffect(() => {
    if (runStatus && !ACTIVE_STATUSES.has(runStatus)) void refetchProfile();
  }, [refetchProfile, runStatus]);

  const currentScore = run?.outputVersionId ? (run.scoreAfter || run.scoreBefore) : (run?.scoreBefore || run?.scoreAfter);
  const creditsCharged = Number(run?.result?.creditsCharged ?? (run?.target?.type === "platform_market" ? 2 : 3));
  const missingSkills = useMemo(() => [
    ...(currentScore?.targetMatch.missingRequiredSkills || []),
    ...(currentScore?.targetMatch.missingPreferredSkills || []),
  ].filter((skill, index, all) => all.indexOf(skill) === index), [currentScore]);
  const skillDemand = useMemo(() => new Map(
    (run?.target?.requirements.market?.rankedSkills || []).map((skill) => [skill.name.toLowerCase(), skill.demandPercent]),
  ), [run?.target?.requirements.market?.rankedSkills]);

  const decide = async (proposalId: string, decision: "approve" | "reject") => {
    try {
      await proposalDecision.mutateAsync({ proposalId, decision });
      toast.success(decision === "approve" ? "Change applied in a new version" : "Proposal rejected");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const downloadVersion = async (format: "pdf" | "docx") => {
    if (!versionId) return;
    try {
      const result = await download.mutateAsync({ versionId, format });
      const url = URL.createObjectURL(result.blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `GraphCareers_Targeted_Resume.${result.format}`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} downloaded`);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  if (runQuery.pollingTimedOut && (!run || ACTIVE_STATUSES.has(run.status))) {
    return <PollingTimeoutState run={run} checking={runQuery.isFetching} onCheck={() => void runQuery.refetch()} />;
  }

  if (runQuery.isLoading || (run && ACTIVE_STATUSES.has(run.status))) return <ProcessingState run={run} />;

  if (runQuery.isError || !run || run.status === "failed") {
    return (
      <div className="mx-auto flex min-h-[65vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="mt-4 text-xl font-semibold">Resume generation failed</h2>
        <p className="mt-2 text-sm text-muted-foreground">{run?.error?.message || errorMessage(runQuery.error)}</p>
        <Button onClick={onNew} className="mt-6 gap-2"><RotateCcw className="h-4 w-4" /> Start again</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
        <div>
          <Button variant="ghost" size="sm" onClick={onNew} className="-ml-3 mb-2 gap-2 text-muted-foreground"><ArrowLeft className="h-4 w-4" /> New targeted resume</Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">{run.target?.jobTitle || "Targeted resume"}</h1>
            <Badge variant="outline" className="capitalize">{run.target?.type === "platform_market" ? `${run.target.platform} market` : "Manual JD"}</Badge>
            {run.target?.requirements.analysisConfidence && <Badge variant="secondary" className="capitalize">{run.target.requirements.analysisConfidence} confidence</Badge>}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{run.target?.companyName || (run.target?.type === "platform_market" ? "Aggregated market target" : "Exact job target")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="h-9 px-3 text-primary">{profile?.credits ?? 0} credits</Badge>
          <Button variant="outline" disabled={!versionId || download.isPending} onClick={() => downloadVersion("docx")} className="gap-2"><Download className="h-4 w-4" /> DOCX</Button>
          <Button disabled={!versionId || download.isPending} onClick={() => downloadVersion("pdf")} className="gap-2"><Download className="h-4 w-4" /> PDF</Button>
        </div>
      </div>

      {run.status === "no_improvement" && (
        <Alert className="mb-5 border-amber-500/30 bg-amber-500/5">
          <ShieldCheck className="h-4 w-4 text-amber-400" />
          <AlertTitle>Your original version was kept</AlertTitle>
          <AlertDescription>{run.result?.reason || "No evidence-safe candidate improved the transparent score, so no new version was created and no credits were charged."}</AlertDescription>
        </Alert>
      )}
      {run.status === "completed" && run.outputVersionId && (
        <Alert className="mb-5 border-primary/20 bg-primary/5">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <AlertTitle>New resume version created</AlertTitle>
          <AlertDescription>
            This generated version is separate from your master resume. {creditsCharged} credit{creditsCharged === 1 ? " was" : "s were"} charged atomically when the version was saved.
          </AlertDescription>
        </Alert>
      )}
      {run.status === "awaiting_confirmation" && !run.outputVersionId && (
        <Alert className="mb-5 border-amber-500/30 bg-amber-500/5">
          <AlertCircle className="h-4 w-4 text-amber-400" />
          <AlertTitle>No generated version was created</AlertTitle>
          <AlertDescription>
            The agent blocked unsupported changes. The preview and downloads below are still your master resume; review each blocked reason before confirming any missing evidence.
          </AlertDescription>
        </Alert>
      )}

      {currentScore && <ScoreGrid current={currentScore} previous={run.scoreAfter ? run.scoreBefore : null} />}

      <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(380px,0.75fr)]">
        <div className="min-w-0 space-y-5">
          {version.isLoading ? (
            <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-border"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
          ) : version.data ? (
            <div key={version.data.id} className="animate-in fade-in duration-300">
              <ResumeAgentPreview snapshot={version.data.snapshotJson} versionNumber={version.data.versionNumber} generated={Boolean(run.outputVersionId)} />
            </div>
          ) : null}
        </div>

        <aside className="space-y-5 xl:sticky xl:top-5">
          <ResumeAgentChat runId={runId} />
          <Card>
            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4 text-primary" /> Suggested skills</CardTitle><CardDescription>These appear in the target role but are not verified in your master resume. Select only skills you genuinely have; after confirmation, the live preview updates to a new version.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Matched</p>
                <div className="flex flex-wrap gap-2">
                  {currentScore?.targetMatch.matchedSkills.length ? currentScore.targetMatch.matchedSkills.map((skill) => <Badge key={skill} className="bg-primary/10 text-primary hover:bg-primary/10"><Check className="mr-1 h-3 w-3" />{skill}</Badge>) : <span className="text-xs text-muted-foreground">No explicit target skills matched yet.</span>}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Available to verify</p>
                <div className="flex flex-wrap gap-2">
                  {missingSkills.length ? missingSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => setSelectedSkill(skill)}
                      className="group inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      <span className="text-[9px] font-bold uppercase tracking-[0.16em] opacity-70">Role</span>
                      <span>{skill}</span>
                      {skillDemand.get(skill.toLowerCase()) !== undefined && <span className="opacity-70">{skillDemand.get(skill.toLowerCase())}%</span>}
                      <span className="text-sm leading-none group-hover:text-primary-foreground">+</span>
                    </button>
                  )) : <span className="text-xs text-muted-foreground">No missing target skills were detected.</span>}
                </div>
              </div>
              {run.target?.requirements.market?.sampleSize !== undefined && (
                <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                  Market target built from <strong className="text-foreground">{run.target.requirements.market.sampleSize}</strong> relevant recent jobs.
                </div>
              )}
            </CardContent>
          </Card>
          {(run.proposals?.length || 0) > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Agent change proposals</CardTitle><CardDescription>Every suggestion includes its reason and evidence check. Blocked proposals were not added to the resume.</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                {run.proposals?.map((proposal) => <ProposalCard key={proposal.id} proposal={proposal} busy={proposalDecision.isPending} onDecision={(decision) => decide(proposal.id, decision)} />)}
              </CardContent>
            </Card>
          )}
        </aside>
      </div>

      <SkillConfirmationDialog skill={selectedSkill} runId={runId} onClose={() => setSelectedSkill(null)} />
    </div>
  );
}

export default function PlatformOptimizePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const runId = searchParams.get("run");
  return (
    <AppLayout>
      {runId ? (
        <WorkspaceScreen runId={runId} onNew={() => setSearchParams({})} />
      ) : (
        <SetupScreen onStarted={(id) => setSearchParams({ run: id })} />
      )}
    </AppLayout>
  );
}
