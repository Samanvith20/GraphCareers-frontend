import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { HelpCircle, Check, PackageOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface IncludedCredit {
  label: string;
  tooltip?: string;
}

export interface PurchaseIntentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle: string;
  featureType?: string;
  packName: string;
  price: string;
  includedCredits: IncludedCredit[];
  question?: string;
  answers?: { label: string; value: string }[];
  followUpQuestion?: string;
  followUpAnswers?: { label: string; value: string }[];
  onSubmit?: (result: { intent: string; reason?: string }) => void;
}

export function PurchaseIntentModal({
  open,
  onOpenChange,
  title,
  subtitle,
  featureType,
  packName,
  price,
  includedCredits,
  question = "Would you purchase this pack if it were available today?",
  answers = [
    { label: "Yes, I'd buy it", value: "yes" },
    { label: "Maybe", value: "maybe" },
    { label: "No, I wouldn't", value: "no" },
  ],
  followUpQuestion = "What is the biggest reason?",
  followUpAnswers = [
    { label: "Too expensive", value: "Too expensive" },
    { label: "Need more credits", value: "Need more credits" },
    { label: "Don't need it right now", value: "Don't need it right now" },
    { label: "Not enough value", value: "Not enough value" },
    { label: "Other", value: "Other" },
  ],
  onSubmit,
}: PurchaseIntentModalProps) {
  const [intent, setIntent] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  // Analytics tracking
  useEffect(() => {
    if (open) {
      // console.log("Analytics: Modal opened");
      setIntent("");
      setReason("");
    } else {
      // console.log("Analytics: Modal dismissed");
    }
  }, [open]);

  const handleIntentChange = (val: string) => {
    setIntent(val);
    const label = answers.find((a) => a.value === val)?.label || val;
   // console.log(`Analytics: ${label} clicked`);
  };

  const handleReasonChange = (val: string) => {
    setReason(val);
    //console.log(`Analytics: Feedback reason selected - ${val}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!intent) {
      toast.error("Please select an answer.");
      return;
    }
    const requiresFollowUp = intent === "maybe" || intent === "no";
    if (requiresFollowUp && !reason) {
      toast.error("Please provide a reason.");
      return;
    }
    
    if (onSubmit) {
      onSubmit({ intent, reason });
    } else {
      //console.log("Feedback submitted:", { intent, reason });
      toast.success("Thank you for your feedback!");
      onOpenChange(false);
    }
  };

  const showFollowUp = intent === "maybe" || intent === "no";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-[#09090B]/95 backdrop-blur-xl border border-white/10 text-white shadow-2xl p-0 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00D084]/5 via-transparent to-transparent pointer-events-none" />
        
        <form onSubmit={handleSubmit} className="relative z-10 flex flex-col h-full max-h-[90vh]">
          <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar">
            <DialogHeader className="mb-6 space-y-3">
              {featureType && (
                <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-white/5 border border-white/10 w-fit mx-auto sm:mx-0">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-zinc-400">
                    {featureType}
                  </span>
                </div>
              )}
              <DialogTitle className="text-2xl font-bold tracking-tight text-center sm:text-left">{title}</DialogTitle>
              <DialogDescription className="text-zinc-400 text-[15px] leading-relaxed text-center sm:text-left">
                {subtitle}
              </DialogDescription>
            </DialogHeader>

            {/* Pack Details Card */}
            <div className="relative rounded-2xl bg-white/[0.03] border border-white/10 p-5 mb-8 overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <PackageOpen className="w-24 h-24 text-[#00D084]" />
              </div>
              <div className="relative z-10">
                <div className="flex items-end justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">{packName}</h4>
                  <div className="text-2xl font-bold text-[#00D084]">{price}</div>
                </div>
                
                <div className="space-y-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Includes</div>
                  {includedCredits.map((credit, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-zinc-300">
                      <div className="h-5 w-5 rounded-full bg-[#00D084]/10 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-[#00D084]" />
                      </div>
                      <span>{credit.label}</span>
                      {credit.tooltip && (
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 text-zinc-500 hover:text-zinc-300 cursor-help transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[250px] bg-[#111113] border-white/10 text-zinc-300 text-xs p-3 leading-relaxed">
                              {credit.tooltip}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Intent Question */}
            <div className="space-y-4 mb-6">
              <Label className="text-[15px] font-semibold text-zinc-200 block">
                {question}
              </Label>
              <RadioGroup value={intent} onValueChange={handleIntentChange} className="grid gap-3">
                {answers.map((answer) => (
                  <Label
                    key={answer.value}
                    htmlFor={answer.value}
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-xl border cursor-pointer transition-all duration-200",
                      intent === answer.value
                        ? "bg-[#00D084]/10 border-[#00D084]/40"
                        : "bg-white/[0.02] border-white/10 hover:bg-white/[0.04]"
                    )}
                  >
                    <RadioGroupItem value={answer.value} id={answer.value} className={cn(
                      intent === answer.value ? "border-[#00D084] text-[#00D084]" : ""
                    )} />
                    <span className={cn(
                      "text-sm font-medium",
                      intent === answer.value ? "text-white" : "text-zinc-300"
                    )}>{answer.label}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            {/* Follow-up Question */}
            <AnimatePresence>
              {showFollowUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <Label className="text-[15px] font-semibold text-zinc-200 block">
                    {followUpQuestion}
                  </Label>
                  <RadioGroup value={reason} onValueChange={handleReasonChange} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {followUpAnswers.map((ans) => (
                      <Label
                        key={ans.value}
                        htmlFor={`reason-${ans.value}`}
                        className={cn(
                          "flex items-center space-x-2 p-3 rounded-xl border cursor-pointer transition-all duration-200",
                          reason === ans.value
                            ? "bg-white/10 border-white/30"
                            : "bg-white/[0.02] border-white/10 hover:bg-white/[0.04]"
                        )}
                      >
                        <RadioGroupItem value={ans.value} id={`reason-${ans.value}`} />
                        <span className={cn(
                          "text-xs font-medium",
                          reason === ans.value ? "text-white" : "text-zinc-400"
                        )}>{ans.label}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-6 sm:p-8 pt-4 border-t border-white/5 bg-[#09090B]/50 mt-auto">
            <Button type="submit" className="w-full h-12 rounded-xl bg-white text-[#09090B] hover:bg-zinc-200 font-bold shadow-[0_0_20px_-4px_rgba(255,255,255,0.3)] transition-all">
              Submit Response
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
