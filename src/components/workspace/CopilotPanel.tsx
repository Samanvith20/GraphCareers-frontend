import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Zap, ArrowRight, FileText, Minimize2, ArrowUpRight, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { CopilotMessage } from "@/types/workspace";

interface CopilotPanelProps {
  messages: CopilotMessage[];
  streaming: boolean;
  activityStatus: string | null;
  onSendMessage: (msg: string) => void;
  onActionClick: (action: string) => void;
}

export function CopilotPanel({ messages, streaming, activityStatus, onSendMessage, onActionClick }: CopilotPanelProps) {
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activityStatus]);

  const QUICK_ACTIONS = [
    { label: "Improve ATS to 90+", icon: <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" /> },
    { label: "Rewrite Summary for Target Role", icon: <FileText className="h-3.5 w-3.5 text-blue-400" /> },
    { label: "Add Metrics to Experience Bullets", icon: <Zap className="h-3.5 w-3.5 text-amber-400" /> },
    { label: "Optimize Skills Taxonomy", icon: <Minimize2 className="h-3.5 w-3.5 text-purple-400" /> },
  ];

  return (
    <div className="flex h-full flex-col bg-[#0B0F19]/90 backdrop-blur-2xl border-r border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 p-4 shrink-0 bg-[#0E1424]">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              AI Resume Copilot
            </h2>
            <p className="text-[10px] text-slate-400">Powered by GraphCareers LLM</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-400">Active</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-white/10">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("flex gap-2.5 max-w-[92%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}
          >
            {msg.role === "assistant" && (
              <div className="h-7 w-7 shrink-0 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mt-0.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              </div>
            )}
            <div className={cn(
              "px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-md",
              msg.role === "user" ? "bg-emerald-500 text-slate-950 font-semibold rounded-tr-xs shadow-[0_0_20px_rgba(16,185,129,0.25)]" : "bg-[#131B2E] border border-white/10 text-slate-200 rounded-tl-xs"
            )}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
              
              {/* Quick Action Chips on first message */}
              {msg.role === "assistant" && i === 0 && (
                <div className="mt-4 flex flex-col gap-1.5 pt-3 border-t border-white/10">
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1">
                    <Zap className="h-3 w-3 text-emerald-400" /> Suggested Actions
                  </p>
                  {QUICK_ACTIONS.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => onActionClick(action.label)}
                      className="flex items-center gap-2 text-left bg-[#0A0E1A] hover:bg-emerald-500/15 hover:text-emerald-300 transition-all border border-white/10 hover:border-emerald-500/30 px-3 py-2 rounded-xl text-xs font-medium group"
                    >
                      {action.icon}
                      <span className="flex-1">{action.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-emerald-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {activityStatus && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-xs text-muted-foreground">
             <div className="h-6 w-6 shrink-0 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
               <Sparkles className="h-3 w-3 text-primary animate-pulse" />
             </div>
             <span className="animate-pulse">{activityStatus}</span>
          </motion.div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background/50 border-t border-border/50 shrink-0">
        <div className="relative flex items-end gap-2 rounded-xl border border-border/50 bg-card p-2 shadow-sm focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (input.trim() && !streaming) {
                  onSendMessage(input);
                  setInput("");
                }
              }
            }}
            placeholder="Ask AI to rewrite, quantify, or tailor..."
            className="min-h-[44px] max-h-32 resize-none border-0 bg-transparent py-3 px-2 text-[13px] focus-visible:ring-0 shadow-none"
            disabled={streaming}
          />
          <Button
            size="icon"
            className={cn("h-8 w-8 shrink-0 rounded-lg mb-1", input.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}
            onClick={() => {
              if (input.trim() && !streaming) {
                onSendMessage(input);
                setInput("");
              }
            }}
            disabled={!input.trim() || streaming}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[9px] text-center text-muted-foreground mt-2">
          Press Enter to send, Shift + Enter for new line. Uses existing backend APIs.
        </p>
      </div>
    </div>
  );
}
