import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Loader2,
  AlertTriangle,
  Lock,
  Unlock,
  Copy,
  Check,
  ExternalLink,
  Linkedin,
  Building2,
  Clock,
  Sparkles,
  ArrowRight,
  Search,
  TrendingUp,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import {
  useGetReferrals,
  useRevealReferralContact,
  ReferralContact,
  ReferralRequest,
} from "@/hooks/useReferrals";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import ErrorPage from "./ErrorPage";

import { ZeroCreditsFeedbackModal } from "@/components/ZeroCreditsFeedbackModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getScoreColor(score: number): {
  bg: string;
  text: string;
  bar: string;
  label: string;
} {
  if (score >= 90)
    return {
      bg: "bg-[#00D084]/10",
      text: "text-[#00D084]",
      bar: "bg-[#00D084]",
      label: "Excellent",
    };
  if (score >= 60)
    return {
      bg: "bg-yellow-500/10",
      text: "text-yellow-400",
      bar: "bg-yellow-400",
      label: "Good",
    };
  return {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    bar: "bg-orange-400",
    label: "Fair",
  };
}

// ─── Animations ───────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const contactVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      delay: i * 0.06,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

// ─── Skeleton Loading ─────────────────────────────────────────────────────────

const StatCardSkeleton = () => (
  <div className="rounded-2xl border border-white/[0.06] bg-[#111113] p-5 space-y-3">
    <Skeleton className="h-4 w-20 bg-white/[0.05]" />
    <Skeleton className="h-8 w-12 bg-white/[0.06]" />
    <Skeleton className="h-3 w-28 bg-white/[0.04]" />
  </div>
);

const CompanyCardSkeleton = () => (
  <div className="rounded-2xl border border-white/[0.06] bg-[#111113] overflow-hidden">
    <div className="p-5 space-y-4 border-b border-white/[0.05]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl bg-white/[0.05]" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28 bg-white/[0.06]" />
            <Skeleton className="h-3 w-20 bg-white/[0.04]" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 rounded-full bg-white/[0.05]" />
      </div>
    </div>
    <div className="p-5 space-y-3">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3 rounded-xl border border-white/[0.05]"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full bg-white/[0.05]" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-24 bg-white/[0.06]" />
              <Skeleton className="h-3 w-16 bg-white/[0.04]" />
            </div>
          </div>
          <Skeleton className="h-8 w-24 rounded-lg bg-white/[0.05]" />
        </div>
      ))}
    </div>
  </div>
);

// ─── Stat Cards ───────────────────────────────────────────────────────────────

interface StatsBarProps {
  referrals: ReferralRequest[];
}

const StatsBar = ({ referrals }: StatsBarProps) => {
  const stats = useMemo(() => {
    const totalCompanies = referrals.length;
    const totalContacts = referrals.reduce(
      (sum, r) => sum + r.contacts.length,
      0
    );
    const revealedContacts = referrals.reduce(
      (sum, r) => sum + r.contacts.filter((c) => c.isRevealed).length,
      0
    );
    const pendingRequests = referrals.filter(
      (r) => r.status === "pending"
    ).length;
    return { totalCompanies, totalContacts, revealedContacts, pendingRequests };
  }, [referrals]);

  const statItems = [
    {
      label: "Companies",
      value: stats.totalCompanies,
      icon: Building2,
      color: "text-[#00D084]",
      bg: "bg-[#00D084]/10",
    },
    {
      label: "Contacts Found",
      value: stats.totalContacts,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      label: "Revealed",
      value: stats.revealedContacts,
      icon: Unlock,
      color: "text-violet-400",
      bg: "bg-violet-400/10",
    },
    {
      label: "Processing",
      value: stats.pendingRequests,
      icon: Loader2,
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {statItems.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.35,
            delay: i * 0.06,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="group rounded-2xl border border-white/[0.06] bg-[#111113] p-4 sm:p-5 transition-all duration-200 hover:border-white/[0.1] hover:bg-[#131315]"
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center",
                stat.bg
              )}
            >
              <stat.icon
                className={cn(
                  "h-4 w-4",
                  stat.color,
                  stat.label === "Processing" && stat.value > 0
                    ? "animate-spin"
                    : ""
                )}
              />
            </div>
            <span className="text-xs font-medium text-[#6b7280] uppercase tracking-wider">
              {stat.label}
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-white tabular-nums leading-none">
            {stat.value}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

// ─── Contact Card ─────────────────────────────────────────────────────────────

function ContactCard({
  contact,
  index,
  request,
  dashboardCredits,
  onOpenFeedbackModal,
}: {
  contact: ReferralContact;
  index: number;
  request: ReferralRequest;
  dashboardCredits: number;
  onOpenFeedbackModal: () => void;
}) {
  const revealMutation = useRevealReferralContact();
  const [isRevealing, setIsRevealing] = useState(false);
  const [justCopied, setJustCopied] = useState(false);
  const [localEmail, setLocalEmail] = useState<string | null>(null);

  const isRevealed = contact.isRevealed || localEmail !== null;
  const email = localEmail || contact.email;

  const handleReveal = () => {
    if (dashboardCredits === 0) {
      onOpenFeedbackModal();
      return;
    }

    if (!contact.providerPersonId) {
      toast.error("Contact information is incomplete. Cannot reveal.");
      return;
    }

    const domain = request.companyDomain || request.companyName.toLowerCase().replace(/[^a-z0-9]/g, '') + '.com';

    setIsRevealing(true);
    revealMutation.mutate(
      { 
        providerPersonId: contact.providerPersonId,
        companyDomain: domain,
        fullName: contact.fullName,
        title: contact.title,
        linkedinUrl: contact.linkedinUrl
      },
      {
        onSuccess: (res) => {
          setIsRevealing(false);
          if (res.success) {
            toast.success(`${contact.fullName}'s email revealed!`);
            if (res.data?.contact?.email) {
              setLocalEmail(res.data.contact.email);
            }
          }
        },
        onError: (err: any) => {
          setIsRevealing(false);
          // If we hit 402 or string indicates insufficient credits, show the modal
          if (err?.message?.includes("INSUFFICIENT_CONTACT_CREDITS") || err?.message?.includes("402") || err?.message?.toLowerCase().includes("payment")) {
            onOpenFeedbackModal();
          } else {
            toast.error(err.message || "Failed to reveal contact.");
          }
        },
      }
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setJustCopied(true);
    toast.success("Email copied to clipboard!");
    setTimeout(() => setJustCopied(false), 2000);
  };

  const scoreInfo = contact.score ? getScoreColor(contact.score) : null;

  // Generate initials for avatar
  const initials = contact.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div
      custom={index}
      variants={contactVariants}
      initial="hidden"
      animate="visible"
      className="group relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 sm:p-4 transition-all duration-200 hover:border-white/[0.1] hover:bg-white/[0.035]"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#00D084]/20 to-blue-500/20 border border-white/[0.08] flex items-center justify-center">
            <span className="text-xs font-bold text-white/80">{initials}</span>
          </div>
          {contact.linkedinUrl && (
            <a
              href={contact.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute -bottom-0.5 -right-0.5 h-4.5 w-4.5 rounded-full bg-[#0A66C2] border-2 border-[#111113] flex items-center justify-center hover:scale-110 transition-transform"
              title="LinkedIn Profile"
            >
              <Linkedin className="h-2.5 w-2.5 text-white" />
            </a>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-semibold text-white truncate">
              {contact.fullName}
            </p>
            {contact.linkedinUrl && (
              <a
                href={contact.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1 text-[10px] font-medium text-[#0A66C2]/80 hover:text-[#0A66C2] transition-colors"
              >
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>
          <p className="text-xs text-[#6b7280] truncate">{contact.title}</p>

          {/* Score bar — only on larger screens inline, stacked on mobile */}
          {scoreInfo && contact.score !== undefined && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden max-w-[100px]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(contact.score, 100)}%` }}
                  transition={{ duration: 0.6, delay: index * 0.08 }}
                  className={cn("h-full rounded-full", scoreInfo.bar)}
                />
              </div>
              <span
                className={cn("text-[10px] font-semibold", scoreInfo.text)}
              >
                {contact.score}
              </span>
            </div>
          )}

          {/* Email row */}
          {isRevealed && email ? (
            <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#00D084]/[0.08] border border-[#00D084]/15">
              <span className="text-xs font-medium text-[#00D084] font-mono tracking-wide">
                {email}
              </span>
              <button
                onClick={() => copyToClipboard(email)}
                className="text-[#00D084]/60 hover:text-[#00D084] transition-colors"
                title="Copy email"
              >
                {justCopied ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
          ) : (
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <Lock className="h-3 w-3 text-[#4b5563]" />
              <span className="text-[11px] font-medium text-[#4b5563]">
                Email locked
              </span>
            </div>
          )}
        </div>

        {/* Action */}
        <div className="shrink-0 self-center">
          {isRevealed ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#00D084]/[0.08] border border-[#00D084]/15">
              <Check className="h-3.5 w-3.5 text-[#00D084]" />
              <span className="text-xs font-semibold text-[#00D084] hidden sm:inline">
                Revealed
              </span>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={handleReveal}
              disabled={isRevealing}
              className="h-8 sm:h-9 rounded-xl bg-white text-[#09090B] hover:bg-gray-100 gap-1.5 px-3 sm:px-4 text-[11px] sm:text-xs font-semibold shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
            >
              {isRevealing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Unlock className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">Unlock</span>
              <span className="text-[10px] opacity-60 hidden sm:inline">
                1 credit
              </span>
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Company Referral Card ────────────────────────────────────────────────────

function CompanyCard({
  request,
  index,
  dashboardCredits,
  onOpenFeedbackModal,
}: {
  request: ReferralRequest;
  index: number;
  dashboardCredits: number;
  onOpenFeedbackModal: () => void;
}) {
  // Company initial for the icon
  const companyInitial = request.companyName.charAt(0).toUpperCase();

  return (
    <motion.div
      variants={itemVariants}
      className="group rounded-2xl border border-white/[0.06] bg-[#111113] shadow-card overflow-hidden transition-all duration-200 hover:border-white/[0.1]"
    >
      {/* Card Header */}
      <div className="relative px-5 pt-5 pb-4 border-b border-white/[0.05]">
        {/* Subtle gradient accent on top */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#00D084]/20 to-transparent" />

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#00D084]/15 to-[#00D084]/5 border border-[#00D084]/10 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-[#00D084]">
                {companyInitial}
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-white truncate">
                {request.companyName}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1 text-[11px] text-[#6b7280]">
                  <Clock className="h-3 w-3" />
                  {formatRelativeTime(request.requestedAt)}
                </span>
                {request.jobTitleContext && (
                  <>
                    <span className="text-[#4b5563]">·</span>
                    <span className="text-[11px] text-[#6b7280] truncate max-w-[120px] sm:max-w-[200px]">
                      {request.jobTitleContext}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Status badge */}
          {request.status === "pending" && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/[0.08] border border-yellow-500/15 shrink-0">
              <Loader2 className="h-3 w-3 text-yellow-400 animate-spin" />
              <span className="text-[11px] font-semibold text-yellow-400">
                Searching
              </span>
            </div>
          )}
          {request.status === "failed_no_contacts" && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/[0.08] border border-red-500/15 shrink-0">
              <AlertTriangle className="h-3 w-3 text-red-400" />
              <span className="text-[11px] font-semibold text-red-400">
                No Results
              </span>
            </div>
          )}
          {request.status === "completed" && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00D084]/[0.08] border border-[#00D084]/15 shrink-0">
              <Check className="h-3 w-3 text-[#00D084]" />
              <span className="text-[11px] font-semibold text-[#00D084]">
                {request.contacts.length} found
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5">
        {/* Pending state */}
        {request.status === "pending" && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="relative mb-5">
              <div className="h-14 w-14 rounded-2xl bg-[#00D084]/[0.08] border border-[#00D084]/15 flex items-center justify-center">
                <Search className="h-6 w-6 text-[#00D084]" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-2xl border border-[#00D084]/20"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
            <p className="text-sm font-semibold text-white mb-1">
              Scanning network…
            </p>
            <p className="text-xs text-[#6b7280] max-w-[260px]">
              Searching for the best contacts at {request.companyName}. This
              usually takes a few seconds.
            </p>
          </div>
        )}

        {/* Failed state */}
        {request.status === "failed_no_contacts" && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="h-14 w-14 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5">
              <AlertTriangle className="h-6 w-6 text-[#4b5563]" />
            </div>
            <p className="text-sm font-semibold text-white mb-1">
              No contacts found
            </p>
            <p className="text-xs text-[#6b7280] max-w-[260px]">
              We couldn't find high-quality contacts at{" "}
              {request.companyName}. Try another company or check back later.
            </p>
          </div>
        )}

        {/* Completed with contacts */}
        {request.status === "completed" && request.contacts.length > 0 && (
          <div className="space-y-2.5">
            {request.contacts.slice(0, 10).map((contact, ci) => (
              <ContactCard 
                key={contact.id} 
                contact={contact} 
                index={ci} 
                request={request} 
                dashboardCredits={dashboardCredits}
                onOpenFeedbackModal={onOpenFeedbackModal}
              />
            ))}
            {request.contacts.length > 10 && (
              <p className="text-center text-xs text-[#6b7280] pt-2">
                +{request.contacts.length - 10} more contacts
              </p>
            )}
          </div>
        )}

        {/* Completed but empty */}
        {request.status === "completed" && request.contacts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-8 w-8 text-[#4b5563] mb-3" />
            <p className="text-sm text-[#6b7280]">
              No contacts available for this request.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col items-center justify-center py-16 sm:py-24 text-center"
  >
    {/* Animated icon */}
    <div className="relative mb-6">
      <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-[#00D084]/10 to-blue-500/10 border border-white/[0.06] flex items-center justify-center">
        <Users className="h-9 w-9 text-[#6b7280]" />
      </div>
      <motion.div
        className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-[#00D084]/15 border border-[#00D084]/20 flex items-center justify-center"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles className="h-3 w-3 text-[#00D084]" />
      </motion.div>
    </div>

    <h3 className="text-xl font-bold text-white mb-2">
      No referrals requested yet
    </h3>
    <p className="text-sm text-[#6b7280] max-w-sm mx-auto mb-8 leading-relaxed">
      Find referrals from your Jobs feed. Click &quot;Find Referral&quot; on any
      job card to discover contacts at that company.
    </p>

    <Link to="/jobs">
      <Button className="h-10 rounded-xl bg-[#00D084] text-[#09090B] hover:bg-[#00c07a] hover:shadow-[0_0_20px_-4px_rgba(0,208,132,0.4)] gap-2 px-6 text-sm font-semibold transition-all active:scale-[0.98]">
        Browse Jobs
        <ArrowRight className="h-4 w-4" />
      </Button>
    </Link>
  </motion.div>
);

// ─── Loading State ────────────────────────────────────────────────────────────

const LoadingState = () => (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
    {/* Header skeleton */}
    <div className="space-y-2">
      <Skeleton className="h-8 w-52 bg-white/[0.05]" />
      <Skeleton className="h-4 w-72 bg-white/[0.04]" />
    </div>

    {/* Stat cards skeleton */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>

    {/* Company cards skeleton */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      {[...Array(2)].map((_, i) => (
        <CompanyCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const ReferralsPage = () => {
  const { data: dashboardData, isLoading, isError } = useGetReferrals();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const referrals = dashboardData?.requests;
  const dashboardCredits = dashboardData?.credits?.remaining ?? 0;

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingState />
      </AppLayout>
    );
  }

  if (isError || !referrals) {
    return (
      <AppLayout>
        <ErrorPage />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <ZeroCreditsFeedbackModal open={showFeedbackModal} onOpenChange={setShowFeedbackModal} />
        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-[28px] font-bold text-white tracking-tight flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-[#00D084]/10 border border-[#00D084]/20 flex items-center justify-center shrink-0">
                  <Users className="h-4.5 w-4.5 text-[#00D084]" />
                </div>
                Referrals
              </h1>
              <p className="text-sm text-[#6b7280] mt-1.5 ml-12 sm:ml-12">
                Discover contacts and unlock their emails to request referrals.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {referrals.length > 0 && (
                <Link to="/jobs">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03] text-[#9ca3af] hover:text-white hover:bg-white/[0.06] gap-2 text-xs font-medium transition-all"
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    Find More Referrals
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {referrals.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* ── Stats ── */}
            <StatsBar referrals={referrals} />

            {/* ── Company Cards ── */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 xl:grid-cols-2 gap-5"
            >
              {referrals.map((req, i) => (
                <CompanyCard
                  key={req.requestId}
                  request={req}
                  index={i}
                  dashboardCredits={dashboardCredits}
                  onOpenFeedbackModal={() => setShowFeedbackModal(true)}
                />
              ))}
            </motion.div>
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default ReferralsPage;
