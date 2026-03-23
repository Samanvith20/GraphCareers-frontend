import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import AppLayout from "@/components/layout/AppLayout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import {
  Send, StopCircle, Loader2, Sparkles, BriefcaseIcon,
  TrendingUp, BookOpen, Target, Bot, Zap, ArrowRight,
  Plus, MessageSquare, Trash2, Crown, Menu,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

type Message = {
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
  errorType?: "credits" | "generic";
};

type Session = {
  id: string;
  title: string;
  messageCount: number;
  updatedAt: string;
};

const SUGGESTED_PROMPTS = [
  { icon: Target,        text: "What should I learn next in my career?",      label: "Skill Gap"    },
  { icon: BriefcaseIcon, text: "What jobs am I most qualified for right now?", label: "Best Fit Jobs" },
  { icon: TrendingUp,    text: "Give me a 30-day roadmap to get a job",        label: "Roadmap"      },
  { icon: BookOpen,      text: "Analyze my career progression",                label: "Career Path"  },
];

const TOOL_LABELS: Record<string, string> = {
  getUserData:          "Reading your profile",
  getUserMatchedJobs:   "Scanning job matches",
  getCareerProgression: "Analyzing career path",
};

function formatSessionTime(dateStr: string) {
  const date = new Date(dateStr);
  const now  = new Date();
  const days = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7)  return `${days}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function CreditErrorBubble({ message }: { message: string }) {
  return (
    <div className="flex gap-3 justify-start">
      <div className="flex-shrink-0 mt-1 h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
        <Zap className="h-3.5 w-3.5 text-amber-400" />
      </div>
      <div className="max-w-[80%] rounded-2xl rounded-bl-md border border-amber-500/20 bg-amber-500/5 px-4 py-3 space-y-2">
        <p className="text-sm text-amber-300 leading-relaxed">{message}</p>
        <Link to="/pricing" className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors">
          Upgrade for more credits <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function GenericErrorBubble({ message }: { message: string }) {
  return (
    <div className="flex gap-3 justify-start">
      <div className="flex-shrink-0 mt-1 h-7 w-7 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center">
        <Sparkles className="h-3.5 w-3.5 text-destructive" />
      </div>
      <div className="max-w-[80%] rounded-2xl rounded-bl-md border border-destructive/20 bg-destructive/5 px-4 py-3">
        <p className="text-sm text-destructive/80 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}

function SessionItem({
  session, isActive, onSelect, onDelete,
}: { session: Session; isActive: boolean; onSelect: () => void; onDelete: (e: React.MouseEvent) => void }) {
  const [hovering, setHovering] = useState(false);
  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 flex items-start gap-2 relative ${
        isActive ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/60 border border-transparent"
      }`}
    >
      <MessageSquare className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
      <div className="flex-1 min-w-0 pr-4">
        <p className={`text-xs font-medium truncate leading-snug ${isActive ? "text-primary" : "text-foreground"}`}>
          {session.title}
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{formatSessionTime(session.updatedAt)}</p>
      </div>
      <AnimatePresence>
        {hovering && (
          <motion.button
            onClick={onDelete}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md bg-background border border-border/50 flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.1 }}
          >
            <Trash2 className="h-3 w-3" />
          </motion.button>
        )}
      </AnimatePresence>
    </button>
  );
}

function SidebarContent({
  sessions, activeSessionId, isPro, loadingSessions,
  onNewChat, onSelectSession, onDeleteSession,
}: {
  sessions: Session[]; activeSessionId: string | null; isPro: boolean; loadingSessions: boolean;
  onNewChat: () => void; onSelectSession: (id: string) => void; onDeleteSession: (id: string) => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-4 border-b border-border/40 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
          </div>
          <span className="text-sm font-semibold text-foreground">Chats</span>
        </div>
        <button onClick={onNewChat} className="h-7 w-7 rounded-lg hover:bg-primary/10 flex items-center justify-center transition-colors text-muted-foreground hover:text-primary" title="New chat">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-2 py-2 space-y-0.5">
          {loadingSessions ? (
            <div className="flex items-center justify-center py-8"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 px-3">
              <p className="text-xs text-muted-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Start chatting to begin</p>
            </div>
          ) : sessions.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              isActive={session.id === activeSessionId}
              onSelect={() => onSelectSession(session.id)}
              onDelete={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
            />
          ))}
        </div>
      </ScrollArea>

      {!isPro && (
        <div className="px-3 py-3 border-t border-border/40 flex-shrink-0">
          <Link to="/pricing">
            <div className="flex items-center gap-2 p-2.5 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer">
              <Crown className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-primary">Upgrade to Pro</p>
                <p className="text-[10px] text-muted-foreground truncate">Unlimited history + AI memory</p>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  const { data: user, isLoading: authLoading } = useAuth();

  const [sessions,        setSessions]        = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [isPro,           setIsPro]           = useState(false);
  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [messages,        setMessages]        = useState<Message[]>([]);
  const [input,           setInput]           = useState("");
  const [loading,         setLoading]         = useState(false);
  const [toolStatus,      setToolStatus]      = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef  = useRef<AbortController | null>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, toolStatus]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  useEffect(() => { if (user) fetchSessions(); }, [user]);

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await fetch(`${BASE_URL}/api/ai/sessions`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setSessions(data.sessions ?? []);
      setIsPro(data.isPro ?? false);
    } catch (err) { console.error(err); }
    finally { setLoadingSessions(false); }
  };

  const handleSelectSession = async (sessionId: string) => {
    if (sessionId === activeSessionId || loading) return;
    try {
      const res = await fetch(`${BASE_URL}/api/ai/sessions/${sessionId}/messages`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setMessages((data.messages ?? []).map((m: any) => ({ role: m.role, content: m.content })));
      setActiveSessionId(sessionId);
    } catch { toast.error("Failed to load conversation"); }
  };

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setActiveSessionId(null);
    setInput("");
    setToolStatus(null);
    abortRef.current?.abort();
  }, []);

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await fetch(`${BASE_URL}/api/ai/sessions/${sessionId}`, { method: "DELETE", credentials: "include" });
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) handleNewChat();
    } catch { toast.error("Failed to delete conversation"); }
  };

  const prependSession = useCallback((sessionId: string) => {
    setSessions((prev) => {
      if (prev.some((s) => s.id === sessionId)) return prev;
      return [{ id: sessionId, title: "New chat", messageCount: 0, updatedAt: new Date().toISOString() }, ...prev];
    });
  }, []);

  const appendError = (msg: string, type: "credits" | "generic" = "generic") => {
    setMessages((prev) => [...prev, { role: "assistant", content: msg, isError: true, errorType: type }]);
  };

  const handleSend = async (text?: string) => {
    const query = (text ?? input).trim();
    if (!query || !user || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setInput("");
    setLoading(true);
    setToolStatus(null);
    abortRef.current = new AbortController();

    try {
      const res = await fetch(`${BASE_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userMessage: query, sessionId: activeSessionId }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        let errMsg = "Something went wrong. Please try again.";
        try { const b = await res.json(); if (b?.error) errMsg = b.error; } catch {}
        appendError(errMsg, res.status === 402 ? "credits" : "generic");
        if (res.status !== 402) toast.error(errMsg);
        return;
      }

      if (!res.body) throw new Error("No response stream");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantBubbleAdded = false;
      let currentSessionId = activeSessionId;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const prefix = line.slice(0, 2);
          const raw    = line.slice(2);

          try {
            switch (prefix) {
              case "s:": {
                const { sessionId } = JSON.parse(raw);
                currentSessionId = sessionId;
                if (!activeSessionId) {
                  setActiveSessionId(sessionId);
                  prependSession(sessionId);
                }
                break;
              }
              case "0:": {
                const token: string = JSON.parse(raw);
                if (!token) break;
                if (!assistantBubbleAdded) {
                  assistantBubbleAdded = true;
                  setMessages((prev) => [...prev, { role: "assistant", content: token }]);
                } else {
                  setMessages((prev) => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    if (last?.role === "assistant" && !last.isError) {
                      updated[updated.length - 1] = { ...last, content: last.content + token };
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
              case "d:": {
                setToolStatus(null);
                if (currentSessionId) {
                  setSessions((prev) => prev.map((s) =>
                    s.id === currentSessionId ? { ...s, updatedAt: new Date().toISOString() } : s
                  ));
                }
                break;
              }
              case "3:": {
                const parsed = JSON.parse(raw);
                const errMsg = parsed?.error ?? "Something went wrong";
                setToolStatus(null);
                appendError(errMsg, errMsg.toLowerCase().includes("credit") ? "credits" : "generic");
                break;
              }
            }
          } catch (e) { console.error("Stream parse:", e); }
        }
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      const msg = "Something went wrong. Please try again.";
      toast.error(msg);
      appendError(msg, "generic");
    } finally {
      setLoading(false);
      setToolStatus(null);
    }
  };

  const handleStop = () => { abortRef.current?.abort(); setLoading(false); setToolStatus(null); };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  if (authLoading) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center min-h-[60vh]">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
            <Loader2 className="h-8 w-8 text-primary" />
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  const isEmpty = messages.length === 0;
  const activeTitle = sessions.find((s) => s.id === activeSessionId)?.title;

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">

        {/* Desktop sidebar */}
        <div className="hidden lg:flex w-64 flex-shrink-0 border-r border-border/40 h-full">
          <SidebarContent
            sessions={sessions} activeSessionId={activeSessionId} isPro={isPro}
            loadingSessions={loadingSessions} onNewChat={handleNewChat}
            onSelectSession={handleSelectSession} onDeleteSession={handleDeleteSession}
          />
        </div>

        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-20 lg:hidden"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                className="fixed top-0 left-0 h-full w-64 z-30 bg-background border-r border-border/40 lg:hidden"
                initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
              >
                <SidebarContent
                  sessions={sessions} activeSessionId={activeSessionId} isPro={isPro}
                  loadingSessions={loadingSessions}
                  onNewChat={() => { handleNewChat(); setSidebarOpen(false); }}
                  onSelectSession={(id) => { handleSelectSession(id); setSidebarOpen(false); }}
                  onDeleteSession={handleDeleteSession}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0 h-full">

          {/* Header */}
          <motion.div
            className="flex items-center gap-3 px-4 sm:px-6 py-4 border-b border-border/40 flex-shrink-0"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          >
            <button onClick={() => setSidebarOpen(true)} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors text-muted-foreground lg:hidden flex-shrink-0">
              <Menu className="h-4 w-4" />
            </button>

            <div className="relative flex-shrink-0">
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-semibold text-foreground truncate">
                {activeTitle ?? "Career Chatbot"}
              </h1>
              <p className="text-xs text-muted-foreground">Your career intelligence mentor</p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleNewChat}
                className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border/60 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> New chat
              </button>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <motion.div className="h-1.5 w-1.5 rounded-full bg-emerald-500" animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }} />
                <span className="text-[10px] font-medium text-emerald-400">Online</span>
              </div>
            </div>
          </motion.div>

          {/* Messages */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto w-full">
              {isEmpty ? (
                <motion.div className="flex flex-col items-center justify-center min-h-[50vh] gap-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                  <div className="text-center space-y-3">
                    <motion.div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center" animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                      <Bot className="h-8 w-8 text-primary" />
                    </motion.div>
                    <h2 className="text-xl font-bold text-foreground">Hi {user?.name?.split(" ")[0] ?? "there"} 👋</h2>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                      I'm your career mentor. Ask me about skill gaps, job search, roadmaps, and more.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-md">
                    {SUGGESTED_PROMPTS.map(({ icon: Icon, text, label }, i) => (
                      <motion.button key={label} onClick={() => handleSend(text)}
                        className="group text-left p-3.5 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 space-y-1.5"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <div className="flex items-center gap-2 text-primary"><Icon className="h-4 w-4" /><span className="text-xs font-semibold">{label}</span></div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-5">
                  <AnimatePresence initial={false}>
                    {messages.map((msg, idx) => {
                      if (msg.isError) return (
                        <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                          {msg.errorType === "credits" ? <CreditErrorBubble message={msg.content} /> : <GenericErrorBubble message={msg.content} />}
                        </motion.div>
                      );
                      return (
                        <motion.div key={idx} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                          {msg.role === "assistant" && (
                            <div className="flex-shrink-0 mt-1 h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                              <Sparkles className="h-3.5 w-3.5 text-primary" />
                            </div>
                          )}
                          <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card border border-border/50 text-foreground rounded-bl-md"}`}>
                            {msg.role === "assistant" ? (
                              <div className="prose prose-sm prose-invert max-w-none prose-p:my-1.5 prose-li:my-0.5 prose-headings:text-foreground prose-a:text-primary">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                {loading && idx === messages.length - 1 && msg.content === "" && (
                                  <motion.div className="flex gap-1 py-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    {[0, 1, 2].map((i) => <motion.span key={i} className="h-1.5 w-1.5 rounded-full bg-primary/60" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />)}
                                  </motion.div>
                                )}
                              </div>
                            ) : msg.content}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>

                  <AnimatePresence>
                    {loading && !messages.some((m, i) => m.role === "assistant" && !m.isError && i === messages.length - 1) && (
                      <motion.div className="flex gap-3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                        <div className="flex-shrink-0 mt-1 h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}><Loader2 className="h-3.5 w-3.5 text-primary" /></motion.div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl rounded-bl-md bg-card border border-border/50">
                          <span className="text-xs text-muted-foreground font-medium">{toolStatus ?? "Thinking…"}</span>
                          <div className="flex gap-0.5">
                            {[0, 1, 2].map((i) => <motion.span key={i} className="h-1 w-1 rounded-full bg-primary/50" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />)}
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

          {/* Input */}
          <div className="px-4 sm:px-6 py-4 border-t border-border/40 flex-shrink-0">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-3 p-3 rounded-2xl border border-border/60 bg-card/50 focus-within:border-primary/40 transition-colors">
                <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder="Ask about your career..." disabled={loading} rows={1}
                  className="flex-1 bg-transparent resize-none outline-none text-sm placeholder:text-muted-foreground/60 min-h-[24px] max-h-[120px] leading-6 disabled:opacity-50"
                />
                <button onClick={loading ? handleStop : () => handleSend()} disabled={!loading && !input.trim()}
                  className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${loading ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : input.trim() ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20" : "bg-muted text-muted-foreground/40 cursor-not-allowed"}`}>
                  {loading ? <StopCircle size={15} /> : <Send size={14} />}
                </button>
              </div>
              <p className="text-center text-[10px] text-muted-foreground/40 mt-2">Chatbot uses your profile data to give personalised advice</p>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}