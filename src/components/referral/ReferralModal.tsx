import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Users, Linkedin, Lock, Unlock, Check, AlertTriangle, Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDiscoverContacts, useRevealContact, ContactCandidate } from "@/hooks/useReferrals";
import { useProfile } from "@/hooks/useProfile";
import { cn } from "@/lib/utils";

interface ReferralModalProps {
  open: boolean;
  onClose: () => void;
  jobTitle: string;
  companyName: string;
  jobId?: string;
}

export function ReferralModal({ open, onClose, jobTitle, companyName, jobId }: ReferralModalProps) {
  const { data: profile } = useProfile();
  const discoverMutation = useDiscoverContacts();
  const revealMutation = useRevealContact();
  
  const [candidates, setCandidates] = useState<ContactCandidate[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "empty" | "invalid_domain">("idle");
  const [revealingId, setRevealingId] = useState<string | null>(null);
  const [resolvedDomain, setResolvedDomain] = useState<string>("");

  useEffect(() => {
    if (open) {
      handleDiscover();
    } else {
      // Reset state on close
      setTimeout(() => {
        setCandidates([]);
        setStatus("idle");
        setRevealingId(null);
        setResolvedDomain("");
      }, 300);
    }
  }, [open]);

  const handleDiscover = async () => {
    setStatus("loading");

    let realDomain = `${companyName.toLowerCase().replace(/\s+/g, '')}.com`;
    try {
      const clearbitRes = await fetch(`https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(companyName)}`);
      if (clearbitRes.ok) {
        const suggestions = await clearbitRes.json();
        console.log("suggestions for domain:;", suggestions);
        if (suggestions && suggestions.length > 0) {
          realDomain = suggestions[0].domain;
        }
      }
    } catch (err) {
      console.warn("Clearbit domain resolution failed, using fallback.");
    }
    
    setResolvedDomain(realDomain);

    discoverMutation.mutate(
      { jobTitle, companyName, companyDomain: realDomain, jobId },
      {
        onSuccess: (res) => {
          if (res.status === "INVALID_DOMAIN") {
            setStatus("invalid_domain");
          } else if (res.success && res.data?.candidates && res.data.candidates.length > 0) {
            setCandidates(res.data.candidates);
            setStatus("success");
          } else {
            setStatus("empty");
          }
        },
        onError: () => {
          setStatus("empty");
          toast.error("Failed to fetch referrals. Please try again.");
        }
      }
    );
  };

  const handleReveal = (candidate: ContactCandidate) => {
    if ((profile?.credits ?? 0) < 1) {
      toast.error("Insufficient credits. Please upgrade to reveal contacts.");
      return;
    }

    setRevealingId(candidate.providerPersonId);
    
    revealMutation.mutate(
      {
        providerPersonId: candidate.providerPersonId,
        companyDomain: resolvedDomain,
        fullName: candidate.fullName,
        title: candidate.title,
        linkedinUrl: candidate.linkedinUrl
      },
      {
        onSuccess: (res) => {
          setRevealingId(null);
          if (res.success && res.data?.contact) {
            const updatedContact = res.data.contact;
            setCandidates(prev => prev.map(c => 
              c.providerPersonId === candidate.providerPersonId ? { ...c, ...updatedContact, isRevealed: true } : c
            ));
            toast.success("Contact revealed successfully!");
          }
        },
        onError: (err: any) => {
          setRevealingId(null);
          if (err.message?.includes("INSUFFICIENT_CONTACT_CREDITS")) {
            toast.error("You do not have enough contact reveal credits.");
          } else {
            toast.error(err.message || "Failed to reveal contact.");
          }
        }
      }
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Email copied to clipboard!");
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-[#09090B] border border-white/[0.08] rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="shrink-0 px-6 py-4 border-b border-white/[0.08] flex items-center justify-between bg-[#111113]">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-[#00D084]" />
                Find Referrals
              </h2>
              <p className="text-sm text-[#6b7280] mt-0.5">
                {companyName} &middot; {jobTitle}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00D084]/[0.08] border border-[#00D084]/15 text-[#00D084] text-xs font-medium">
                <span className="font-bold">{profile?.credits ?? 0}</span> credits remaining
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-lg text-[#6b7280] hover:text-white hover:bg-white/[0.05] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {status === "loading" && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 mb-6 rounded-2xl bg-[#00D084]/10 border border-[#00D084]/20 flex items-center justify-center">
                  <Search className="h-8 w-8 text-[#00D084] animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Scouring our network...</h3>
                <p className="text-[#6b7280] text-sm max-w-xs mx-auto">
                  Finding the best recruiters and engineering managers at {companyName}. This usually takes a few seconds.
                </p>
              </div>
            )}

            {status === "empty" && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 mb-6 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-[#6b7280]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No contacts found</h3>
                <p className="text-[#6b7280] text-sm max-w-xs mx-auto mb-6">
                  We couldn't find any verified contacts for this role at {companyName} at this time.
                </p>
                <Button variant="outline" onClick={onClose} className="rounded-xl border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-white">
                  Close Window
                </Button>
              </div>
            )}

            {status === "invalid_domain" && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-16 w-16 mb-6 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-[#6b7280]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Could not verify company domain</h3>
                <p className="text-[#6b7280] text-sm max-w-xs mx-auto mb-6">
                  We could not verify the exact company domain for {companyName}. No contacts found.
                </p>
                <Button variant="outline" onClick={onClose} className="rounded-xl border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.07] text-white">
                  Close Window
                </Button>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-4">
                <div className="mb-2">
                  <p className="text-sm text-[#9ca3af]">
                    Found <strong className="text-white">{candidates.length}</strong> potential contacts for referrals.
                  </p>
                </div>
                
                <div className="grid gap-3">
                  {candidates.map((candidate, i) => (
                    <motion.div 
                      key={candidate.providerPersonId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-xl border border-white/[0.08] bg-[#111113] hover:border-white/[0.15] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      {/* Left: Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-white text-base truncate">{candidate.fullName}</h4>
                          {candidate.linkedinUrl && (
                            <a 
                              href={candidate.linkedinUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#0077b5] hover:text-[#00a0dc] transition-colors p-1"
                              title="LinkedIn Profile"
                            >
                              <Linkedin className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                        <p className="text-sm text-[#6b7280] truncate mb-2">{candidate.title}</p>
                        
                        {candidate.isRevealed ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#00D084]/10 border border-[#00D084]/20">
                            <span className="text-sm font-medium text-[#00D084] tracking-wide">{candidate.email}</span>
                            <button 
                              onClick={() => copyToClipboard(candidate.email)}
                              className="ml-2 text-[#00D084]/70 hover:text-[#00D084] transition-colors"
                              title="Copy email"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                            <Lock className="h-3.5 w-3.5 text-[#6b7280]" />
                            <span className="text-sm font-medium text-[#6b7280] tracking-widest">{candidate.email}</span>
                          </div>
                        )}
                      </div>

                      {/* Right: Action */}
                      <div className="shrink-0">
                        {candidate.isRevealed ? (
                          <div className="flex items-center gap-1.5 text-sm font-medium text-[#00D084] px-4 py-2">
                            <Check className="h-4 w-4" />
                            Revealed
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleReveal(candidate)}
                            disabled={revealingId === candidate.providerPersonId}
                            className="w-full sm:w-auto rounded-xl bg-white text-black hover:bg-gray-200 gap-2 h-9"
                          >
                            {revealingId === candidate.providerPersonId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Unlock className="h-4 w-4" />
                            )}
                            Reveal (1 Credit)
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
