import { useState, useRef, useCallback } from "react";
import type { CopilotMessage } from "@/types/workspace";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export function useCopilotChat(versionId: string | null) {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [activityStatus, setActivityStatus] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || streaming || !versionId) return;

    const newMessages: CopilotMessage[] = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setStreaming(true);
    setActivityStatus("Analyzing...");

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch(`${BASE_URL}/api/resume/copilot/${versionId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messages: newMessages }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const prefix = line.slice(0, 2);
          const raw = line.slice(2);

          try {
            if (prefix === "0:") {
              const token = JSON.parse(raw) as string;
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                updated[updated.length - 1] = { ...last, content: last.content + token };
                return updated;
              });
            } else if (prefix === "9:") {
              const parsed = JSON.parse(raw);
              setActivityStatus(parsed.status || "Processing...");
            } else if (prefix === "a:" || prefix === "d:") {
              setActivityStatus(null);
            }
          } catch (e) {}
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: "Something went wrong." };
          return updated;
        });
      }
    } finally {
      setStreaming(false);
      setActivityStatus(null);
    }
  }, [messages, streaming, versionId]);

  return { messages, setMessages, streaming, activityStatus, sendMessage };
}
