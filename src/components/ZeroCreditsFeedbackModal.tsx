import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

interface ZeroCreditsFeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ZeroCreditsFeedbackModal({ open, onOpenChange }: ZeroCreditsFeedbackModalProps) {
  const [interest, setInterest] = useState<string>("yes");
  const [price, setPrice] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (interest === "yes" && !price) {
      toast.error("Please select a price range.");
      return;
    }
    
    // Simulate API call
    console.log("Feedback submitted:", { interest, price });
    toast.success("Thank you for your feedback! We're planning our premium tiers.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[#09090B] border-white/10 text-white">
        <DialogHeader>
          <div className="mx-auto h-12 w-12 rounded-full bg-[#00D084]/10 border border-[#00D084]/20 flex items-center justify-center mb-4">
            <Sparkles className="h-6 w-6 text-[#00D084]" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">Out of Credits!</DialogTitle>
          <DialogDescription className="text-center text-zinc-400 mt-2">
            You've run out of free contact credits! We are currently planning our premium pricing tiers and would love your input.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <Label className="text-sm font-semibold text-zinc-200">
              Would you be interested in purchasing more credits?
            </Label>
            <RadioGroup defaultValue="yes" value={interest} onValueChange={setInterest} className="flex gap-4">
              <div className="flex items-center space-x-2 bg-white/5 border border-white/10 p-3 rounded-lg flex-1">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes" className="cursor-pointer">Yes, I would</Label>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 border border-white/10 p-3 rounded-lg flex-1">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no" className="cursor-pointer">No, thanks</Label>
              </div>
            </RadioGroup>
          </div>

          {interest === "yes" && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-zinc-200">
                What price range seems fair to you for a pack of 20 contact reveals?
              </Label>
              <Select value={price} onValueChange={setPrice}>
                <SelectTrigger className="w-full bg-[#111113] border-white/10">
                  <SelectValue placeholder="Select a price range" />
                </SelectTrigger>
                <SelectContent className="bg-[#111113] border-white/10">
                  <SelectItem value="5">$5</SelectItem>
                  <SelectItem value="10">$10</SelectItem>
                  <SelectItem value="15">$15</SelectItem>
                  <SelectItem value="20">$20+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="submit" className="w-full bg-[#00D084] text-[#09090B] hover:bg-[#00D084]/90 font-bold">
              Submit Feedback
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
