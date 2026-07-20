import { PurchaseIntentModal } from "./PurchaseIntentModal";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";

interface ZeroCreditsFeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ZeroCreditsFeedbackModal({ open, onOpenChange }: ZeroCreditsFeedbackModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (result: { intent: string; reason?: string }) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await apiPost("/purchase-intent", {
        featureType: "Contact Reveal Pack",
        packName: "Starter Pack",
        price: "₹99",
        intent: result.intent,
        reason: result.reason,
      });
      toast.success("Thank you for your feedback!");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PurchaseIntentModal
      open={open}
      onOpenChange={onOpenChange}
      title="You're out of Contact Reveal Credits"
      subtitle="Unlock recruiter contacts and continue applying without interruption."
      featureType="Contact Reveal Pack"
      packName="Starter Pack"
      price="₹99"
      includedCredits={[
        {
          label: "20 Contact Reveal Credits",
          tooltip: "One Contact Reveal Credit unlocks one recruiter's contact details (email, LinkedIn profile, or phone number if available) for a job posting.",
        },
        {
          label: "50 AI Credits",
          tooltip: "AI Credits are used for Resume Generation, Resume Optimization, Cover Letter Generation, Job Match Analysis, and future AI-powered features.",
        },
      ]}
      question="Would you purchase this pack if it were available today?"
      answers={[
        { label: "Yes, I'd buy it", value: "yes" },
        { label: "Maybe", value: "maybe" },
        { label: "No, I wouldn't", value: "no" },
      ]}
      followUpQuestion="What is the biggest reason?"
      followUpAnswers={[
        { label: "Too expensive", value: "Too expensive" },
        { label: "Don't need it right now", value: "Don't need it right now" },
        { label: "Not enough value", value: "Not enough value" },
        { label: "Other", value: "Other" },
      ]}
      onSubmit={handleSubmit}
    />
  );
}
