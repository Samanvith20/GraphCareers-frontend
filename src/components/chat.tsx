import { useState, useRef } from "react";

export function useChat(userId) {
  const [messages, setMessages] = useState([]);
  const [streaming, setStreaming] = useState(false);
  const [toolStatus, setToolStatus] = useState(null); // shows "Fetching your profile..."
  const abortRef = useRef(null);

  async function sendMessage(userText) {
    if (!userText.trim() || streaming) return;

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setStreaming(true);
    setToolStatus(null);

    // Add empty assistant message to stream into
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, userId }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        
        // Keep incomplete last line in buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          const prefix = line.slice(0, 2);
          const raw = line.slice(2);

          try {
            switch (prefix) {
              case "0:": {
                // Text token
                const token = JSON.parse(raw);
                setMessages((prev) => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  updated[updated.length - 1] = {
                    ...last,
                    content: last.content + token,
                  };
                  return updated;
                });
                break;
              }

              case "9:": {
                // Tool being called — show status to user
                const { toolName } = JSON.parse(raw);
                const statusMap = {
                  getUserData: "Fetching your profile...",
                  getUserMatchedJobs: "Finding matching jobs...",
                  getCareerProgression: "Analyzing career path...",
                };
                setToolStatus(statusMap[toolName] || "Thinking...");
                break;
              }

              case "a:":
                // Tool result received — clear status
                setToolStatus(null);
                break;

              case "d:":
                // Stream finished
                setToolStatus(null);
                break;

              case "3:": {
                // Error from server
                const { error } = JSON.parse(raw);
                console.error("[stream error]", error);
                break;
              }
            }
          } catch {
            // skip malformed line
          }
        }
      }

    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Stream error:", err.message);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: "Something went wrong. Please try again.",
          };
          return updated;
        });
      }
    } finally {
      setStreaming(false);
      setToolStatus(null);
    }
  }

  function stopStream() {
    abortRef.current?.abort();
    setStreaming(false);
    setToolStatus(null);
  }

  return { messages, streaming, toolStatus, sendMessage, stopStream };
}