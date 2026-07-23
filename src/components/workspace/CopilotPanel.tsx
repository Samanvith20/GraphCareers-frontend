import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, Zap, ArrowRight, FileText, Minimize2, ArrowUpRight } from "lucide-react";
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
    { label: "Improve ATS to 90+", icon: <ArrowUpRight className="h-3 w-3" /> },
    { label: "Rewrite Summary", icon: <FileText className="h-3 w-3" /> },
    { label: "Improve Bullet Points", icon: <Zap className="h-3 w-3" /> },
    { label: "Reduce to One Page", icon: <Minimize2 className="h-3 w-3" /> },
  ];

  return (
    <div className="flex h-full flex-col bg-card/60 backdrop-blur-xl border-r border-border/50">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/50 p-4 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-foreground tracking-tight">AI Resume Copilot</h2>
          <p className="text-[10px] text-muted-foreground">Always ready to help you improve</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("flex gap-3 max-w-[90%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}
          >
            {msg.role === "assistant" && (
              <div className="h-6 w-6 shrink-0 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center mt-0.5">
                <Sparkles className="h-3 w-3 text-primary" />
              </div>
            )}
            <div className={cn(
              "px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm",
              msg.role === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted/50 border border-border/50 text-foreground/90 rounded-tl-sm"
            )}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
              
              {/* If it's the first assistant message, show Quick Actions */}
              {msg.role === "assistant" && i === 0 && (
                <div className="mt-4 flex flex-col gap-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Quick Actions</p>
                  {QUICK_ACTIONS.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => onActionClick(action.label)}
                      className="flex items-center gap-2 text-left bg-background/50 hover:bg-primary/10 hover:text-primary transition-colors border border-border/50 px-3 py-2 rounded-lg text-xs"
                    >
                      {action.icon}
                      <span className="flex-1">{action.label}</span>
                      <ArrowRight className="h-3 w-3 opacity-50" />
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
