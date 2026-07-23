import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Send, X, Bot, User, Trash2, ArrowRight, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  "Search CSE220 lecture notes",
  "Roommates under 6000 BDT",
  "Any urgent O+ blood requests?",
  "Calculators or books for sale",
];

export function AiAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      role: "assistant",
      text: "Hello! I am **MyCampus AI Assistant**. Ask me anything about roommates, marketplace listings, emergency blood requests, academic notes, or lost items!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage: Message = {
      id: "user-" + Date.now(),
      role: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const assistantId = "assistant-" + Date.now();
    const placeholderAssistant: Message = {
      id: assistantId,
      role: "assistant",
      text: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage, placeholderAssistant]);
    if (!textToSend) setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("auth_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        "X-Requested-With": "XMLHttpRequest",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({ message: query }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response stream");

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.substring(6).trim();
            if (dataStr === "[DONE]") break;

            try {
              const { text } = JSON.parse(dataStr);
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId ? { ...msg, text: msg.text + text } : msg
                )
              );
            } catch (e) {
              // Ignore non-json fragment
            }
          }
        }
      }
    } catch (error) {
      console.error("AI stream error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                text: "I encountered an error fetching active campus records. Please try again.",
              }
            : msg
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        text: "Chat cleared! How else can I help you across campus today?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed z-40 flex h-13 w-13 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer",
          open
            ? "bottom-24 right-6 lg:bottom-8 lg:right-8 ring-4 ring-primary/20"
            : "bottom-20 right-5 lg:bottom-6 lg:right-8"
        )}
        aria-label="Toggle AI Assistant"
        type="button"
      >
        <div className="relative flex items-center justify-center">
          <Sparkles className="h-6 w-6 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </div>
      </button>

      {/* Floating Chat Window Drawer */}
      {open && (
        <div className="fixed bottom-36 right-4 z-50 flex h-[520px] w-96 max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-border bg-surface shadow-2xl backdrop-blur-2xl transition-all duration-300 lg:bottom-22 lg:right-8 animate-in fade-in slide-in-from-bottom-4">
          {/* Top Bar / Header */}
          <div className="flex items-center justify-between border-b border-border bg-surface-2/60 px-4 py-3 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold tracking-tight text-foreground">MyCampus AI</span>
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-primary">RAG</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Grounded Campus Database
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
                title="Clear chat"
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Suggestions Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border/60 bg-background/50 px-3 py-2 text-[11px] scrollbar-hide">
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="shrink-0 rounded-full border border-border bg-surface px-2.5 py-1 text-muted-foreground transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary cursor-pointer"
                type="button"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn("flex gap-2.5", m.role === "user" ? "justify-end" : "justify-start")}
              >
                {m.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div className="max-w-[82%] space-y-1">
                  <div
                    className={cn(
                      "rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-xs"
                        : "bg-surface-2 border border-border text-foreground rounded-tl-xs"
                    )}
                  >
                    {renderFormattedText(m.text)}
                    {m.text === "" && loading && (
                      <span className="inline-flex items-center gap-1 text-muted-foreground font-mono">
                        <span className="animate-bounce">.</span>
                        <span className="animate-bounce [animation-delay:0.2s]">.</span>
                        <span className="animate-bounce [animation-delay:0.4s]">.</span>
                      </span>
                    )}
                  </div>
                  <div
                    className={cn(
                      "px-1 font-mono text-[9px] text-muted-foreground/60",
                      m.role === "user" ? "text-right" : "text-left"
                    )}
                  >
                    {m.timestamp}
                  </div>
                </div>
                {m.role === "user" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Input Area */}
          <div className="border-t border-border bg-surface-2/40 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about roommates, items, blood, notes..."
                disabled={loading}
                className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground transition hover:opacity-90 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Format text and convert DB record tokens like [MARKETPLACE #34] or **MARKETPLACE #34 ** into direct clickable links
 */
function renderFormattedText(text: string) {
  if (!text) return null;

  // Flexible pattern to match [MARKETPLACE #34], **MARKETPLACE #34 **, MARKETPLACE #34, etc.
  const pattern = /(?:\*\*|\[)?\b(ROOMMATE|MARKETPLACE|BLOOD_REQUEST|RESOURCE|EXCHANGE|LOST_FOUND)\s*#(\d+)\b(?:\s*\*+)?(?:\s*\])?/gi;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(parseMarkdownChunk(text.substring(lastIndex, match.index), `txt-${lastIndex}`));
    }

    const type = match[1].toUpperCase();
    const id = match[2];

    let route = "/app";
    let label = `${type.replace("_", " ")} #${id}`;

    switch (type) {
      case "ROOMMATE":
        route = `/app/roommates?open=${id}`;
        label = `Roommate #${id}`;
        break;
      case "MARKETPLACE":
        route = `/app/marketplace?open=${id}`;
        label = `Listing #${id}`;
        break;
      case "BLOOD_REQUEST":
        route = `/app/blood?open=${id}`;
        label = `Blood Request #${id}`;
        break;
      case "RESOURCE":
        route = `/app/resources?open=${id}`;
        label = `Resource #${id}`;
        break;
      case "EXCHANGE":
        route = `/app/exchange?open=${id}`;
        label = `Swap Post #${id}`;
        break;
      case "LOST_FOUND":
        route = `/app/lost-found?open=${id}`;
        label = `Lost & Found #${id}`;
        break;
    }

    parts.push(
      <Link
        key={`${type}-${id}-${match.index}`}
        to={route}
        className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-bold text-primary hover:bg-primary/20 hover:border-primary/30 transition cursor-pointer my-0.5"
      >
        View {label} <ArrowRight className="h-3 w-3" />
      </Link>
    );

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(parseMarkdownChunk(text.substring(lastIndex), `txt-${lastIndex}`));
  }

  return <span className="whitespace-pre-wrap leading-relaxed">{parts}</span>;
}

/**
 * Basic inline markdown text chunk helper (strips excessive markdown artifacts)
 */
function parseMarkdownChunk(chunk: string, keyPrefix: string): React.ReactNode {
  if (!chunk) return null;
  // Replace bold syntax **text** with clean bolding
  const parts = chunk.split(/(\*\*[^*]+\*\*)/g);
  return (
    <React.Fragment key={keyPrefix}>
      {parts.map((p, idx) => {
        if (p.startsWith("**") && p.endsWith("**")) {
          return <strong key={`${keyPrefix}-${idx}`} className="font-semibold text-foreground">{p.slice(2, -2)}</strong>;
        }
        return p;
      })}
    </React.Fragment>
  );
}

function getCsrfToken(): string {
  const match = document.cookie.match(new RegExp("(^| )XSRF-TOKEN=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : "";
}
