import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/layout/AppLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import {
  Send,
  StopCircle,
  Loader2,
  Sparkles,
  BriefcaseIcon,
  TrendingUp,
  BookOpen,
  Target,
  Bot,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

type Message = {
  role: "user" | "assistant";
  content: string;
};

function sanitizeMessages(messages: Message[]) {
  return messages
    .filter((m) => typeof m.content === "string" && m.content.trim() !== "")
    .map((m) => ({ role: m.role, content: m.content }));
}

const SUGGESTED_PROMPTS = [
  { icon: Target, text: "What should I learn next in my career?", label: "Skill Gap" },
  { icon: BriefcaseIcon, text: "What jobs am I most qualified for right now?", label: "Best Fit Jobs" },
  { icon: TrendingUp, text: "Give me a 30-day roadmap to get a job", label: "Roadmap" },
  { icon: BookOpen, text: "Analyze my career progression", label: "Career Path" },
];

const TOOL_LABELS: Record<string, string> = {
  getUserData: "Reading your profile",
  getUserMatchedJobs: "Scanning job matches",
  getCareerProgression: "Analyzing career path",
};

export default function ChatPage() {
  const { data: user, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, toolStatus]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleSend = async (text?: string) => {
  const query = (text ?? input).trim();
  if (!query || !user || loading) return;

  const userMessage: Message = { role: "user", content: query };
  
  // ✅ Only add user message to UI — NO empty assistant bubble yet
  const apiMessages = sanitizeMessages([...messages, userMessage]);

  setMessages((prev) => [...prev, userMessage]);
  setInput("");
  setLoading(true);
  setToolStatus(null);
  abortRef.current = new AbortController();

  try {
    const res = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userId: user.id, messages: apiMessages }),
      signal: abortRef.current.signal,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));

      if (res.status === 429) {
      
      
        toast.error(err.error || "Something went wrong. Please try again.");
      }
      return;
    }

    if (!res.body) throw new Error("No response stream");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let assistantBubbleAdded = false; // ✅ track if bubble exists

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) continue;
        const prefix = line.slice(0, 2);
        const raw = line.slice(2);

        try {
          switch (prefix) {
            case "0:": {
              const token: string = JSON.parse(raw);
              if (!token) break;

              // ✅ Add assistant bubble only when first token arrives
              if (!assistantBubbleAdded) {
                assistantBubbleAdded = true;
                setMessages((prev) => [
                  ...prev,
                  { role: "assistant", content: token },
                ]);
              } else {
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last?.role === "assistant") {
                    updated[updated.length - 1] = {
                      ...last,
                      content: last.content + token,
                    };
                  }
                  return updated;
                });
              }
              break;
            }

            case "9:": {
              const { toolName } = JSON.parse(raw);
              setToolStatus(TOOL_LABELS[toolName] ?? "Thinking...");
              break;
            }

            case "a:":
            case "d:":
              setToolStatus(null);
              break;

            case "3:": {
              const { error } = JSON.parse(raw);
              setToolStatus(null);
              toast.error(error || "Something went wrong");
              break;
            }
          }
        } catch {}
      }
    }

  } catch (err: any) {
    if (err?.name === "AbortError") return;
    toast.error("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
    setToolStatus(null);
  }
};

  const handleStop = () => {
    abortRef.current?.abort();
    setLoading(false);
    setToolStatus(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (authLoading) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-8 w-8 text-primary" />
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  const isEmpty = messages.length === 0;

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full h-[calc(100vh-3.5rem)]">

        {/* Header */}
        <motion.div
          className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-border/40"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="relative">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
          </div>
          <div className="flex-1">
            <h1 className="text-sm font-semibold text-foreground">Career Chatbot</h1>
            <p className="text-xs text-muted-foreground">Your career intelligence mentor</p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <motion.div
              className="h-1.5 w-1.5 rounded-full bg-emerald-500"
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-[10px] font-medium text-emerald-400">Online</span>
          </div>
        </motion.div>

        {/* Messages area */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="px-4 sm:px-6 py-6">
            {isEmpty ? (
              <motion.div
                className="flex flex-col items-center justify-center min-h-[50vh] gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Welcome card */}
                <div className="text-center space-y-3">
                  <motion.div
                    className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Bot className="h-8 w-8 text-primary" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-foreground">
                    Hi {user?.name?.split(" ")[0] ?? "there"} 👋
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                    I'm your career mentor. I can help you with skill gaps,
                    job search, career roadmaps, and more.
                  </p>
                </div>

                {/* Suggested prompts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-md">
                  {SUGGESTED_PROMPTS.map(({ icon: Icon, text, label }, i) => (
                    <motion.button
                      key={label}
                      onClick={() => handleSend(text)}
                      className="group text-left p-3.5 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 space-y-1.5"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-2 text-primary">
                        <Icon className="h-4 w-4" />
                        <span className="text-xs font-semibold">{label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-5">
                <AnimatePresence initial={false}>
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Assistant avatar */}
                      {msg.role === "assistant" && (
                        <div className="flex-shrink-0 mt-1">
                          <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                          </div>
                        </div>
                      )}

                      {/* Message bubble */}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-card border border-border/50 text-foreground rounded-bl-md"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <div className="prose prose-sm prose-invert max-w-none prose-p:my-1.5 prose-li:my-0.5 prose-headings:text-foreground prose-a:text-primary">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                            {loading && idx === messages.length - 1 && !msg.content && (
                              <motion.div
                                className="flex gap-1 py-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                              >
                                {[0, 1, 2].map((i) => (
                                  <motion.span
                                    key={i}
                                    className="h-1.5 w-1.5 rounded-full bg-primary/60"
                                    animate={{ y: [0, -4, 0] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                  />
                                ))}
                              </motion.div>
                            )}
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Tool status */}
                <AnimatePresence>
                  {toolStatus && (
                    <motion.div
                      className="flex gap-3"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          >
                            <Loader2 className="h-3.5 w-3.5 text-primary" />
                          </motion.div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl rounded-bl-md bg-card border border-border/50">
                        <span className="text-xs text-muted-foreground font-medium">{toolStatus}</span>
                        <div className="flex gap-0.5">
                          {[0, 1, 2].map((i) => (
                            <motion.span
                              key={i}
                              className="h-1 w-1 rounded-full bg-primary/50"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
          <div ref={bottomRef} />
        </ScrollArea>

        {/* Input area */}
        <div className="px-4 sm:px-6 py-4 border-t border-border/40">
          <div className="flex items-end gap-3 p-3 rounded-2xl border border-border/60 bg-card/50 focus-within:border-primary/40 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your career..."
              disabled={loading}
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-sm placeholder:text-muted-foreground/60 min-h-[24px] max-h-[120px] leading-6 disabled:opacity-50"
            />
            <button
              onClick={loading ? handleStop : () => handleSend()}
              disabled={!loading && !input.trim()}
              className={`
                flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200
                ${loading
                  ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                  : input.trim()
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20"
                    : "bg-muted text-muted-foreground/40 cursor-not-allowed"
                }
              `}
            >
              {loading ? <StopCircle size={15} /> : <Send size={14} />}
            </button>
          </div>
          <p className="text-center text-[10px] text-muted-foreground/40 mt-2">
            Chatbot uses your profile data to give personalized advice
          </p>
        </div>

      </div>
    </AppLayout>
  );
}
