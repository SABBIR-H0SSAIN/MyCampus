import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Trash2,
  ArrowUpRight,
  BookOpen,
  Home,
  ShoppingBag,
  Droplet,
  Search,
  CheckCircle2,
  HelpCircle,
  CornerDownLeft,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

interface QuickPrompt {
  icon: React.ReactNode;
  label: string;
  query: string;
}

const QUICK_PROMPTS: QuickPrompt[] = [
  {
    icon: <BookOpen className="h-3 w-3 text-sky-500" />,
    label: "CSE220 Notes",
    query: "Search CSE220 lecture notes and slides",
  },
  {
    icon: <Home className="h-3 w-3 text-emerald-500" />,
    label: "Roommates < 5K",
    query: "Find available roommates under 5000 BDT",
  },
  {
    icon: <Droplet className="h-3 w-3 text-rose-500" />,
    label: "Urgent Blood",
    query: "Any urgent O+ or A+ blood requests?",
  },
  {
    icon: <ShoppingBag className="h-3 w-3 text-amber-500" />,
    label: "Study Table / Tech",
    query: "Show study table, keyboard, or calculators for sale",
  },
];

export function AiAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      role: "assistant",
      text: "👋 Hi! I am your **MyCampus Assistant**.\n\nAsk me anything about **roommates**, **marketplace items**, **emergency blood requests**, **lecture notes**, or **lost & found** records across campus!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

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
                text: "⚠️ I encountered an issue connecting to the campus assistant service. Please check your connection and try again.",
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
        text: "✨ Conversation cleared! How can I assist you with your campus queries today?",
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
          "fixed z-40 flex items-center gap-2.5 rounded-full shadow-2xl transition-all duration-300 active:scale-95 cursor-pointer",
          open
            ? "bottom-24 right-6 lg:bottom-8 lg:right-8 bg-primary text-primary-foreground p-3.5 ring-4 ring-primary/20"
            : "bottom-20 right-5 lg:bottom-6 lg:right-8 bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground px-4 py-3 hover:shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5"
        )}
        aria-label="Toggle AI Assistant"
        type="button"
      >
        <div className="relative flex items-center justify-center">
          <Sparkles className="h-5 w-5 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>
        {!open && (
          <span className="text-xs font-semibold tracking-tight pr-0.5 hidden sm:inline-block">
            Ask Campus AI
          </span>
        )}
      </button>

      {/* Floating Chat Window Drawer */}
      {open && (
        <div className="fixed bottom-36 right-4 z-50 flex h-[560px] w-[410px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-border/80 bg-surface/95 shadow-2xl backdrop-blur-2xl transition-all duration-300 lg:bottom-22 lg:right-8 animate-in fade-in slide-in-from-bottom-5 overflow-hidden">
          {/* Top Bar / Header */}
          <div className="flex items-center justify-between border-b border-border/70 bg-surface-2/70 px-4 py-3.5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20 text-primary shadow-xs">
                <Bot className="h-5 w-5" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-emerald-500"></span>
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold tracking-tight text-foreground">MyCampus Assistant</h3>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Online
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
                title="Clear conversation"
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
                title="Close chat"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Suggestions Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border/50 bg-muted/20 px-3 py-2 text-[11px] scrollbar-hide">
            {QUICK_PROMPTS.map((item, i) => (
              <button
                key={i}
                onClick={() => handleSend(item.query)}
                disabled={loading}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border/80 bg-surface px-2.5 py-1 text-[11px] font-medium text-foreground/80 shadow-2xs transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary active:scale-95 disabled:opacity-50 cursor-pointer"
                type="button"
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs scroll-smooth">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn("flex gap-2.5", m.role === "user" ? "justify-end" : "justify-start")}
              >
                {m.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary mt-0.5">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div className="max-w-[85%] space-y-1">
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 leading-relaxed shadow-xs text-xs",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground font-medium rounded-tr-xs shadow-primary/10"
                        : "bg-surface-2 border border-border/80 text-foreground rounded-tl-xs shadow-2xs"
                    )}
                  >
                    {renderFormattedText(m.text)}
                    {m.text === "" && loading && (
                      <div className="flex items-center gap-1.5 py-1 text-muted-foreground font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce"></span>
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></span>
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></span>
                        <span className="ml-1 text-[11px] text-muted-foreground">Searching campus database...</span>
                      </div>
                    )}
                  </div>
                  <div
                    className={cn(
                      "px-1 font-mono text-[9px] text-muted-foreground/60 tracking-tight",
                      m.role === "user" ? "text-right" : "text-left"
                    )}
                  >
                    {m.timestamp}
                  </div>
                </div>
                {m.role === "user" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted border border-border text-foreground mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Input Area */}
          <div className="border-t border-border/80 bg-surface-2/60 p-3 backdrop-blur-md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about roommates, marketplace, blood..."
                  disabled={loading}
                  className="w-full rounded-xl border border-border/90 bg-background/90 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition shadow-2xs"
                />
              </div>
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-all hover:opacity-95 hover:shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-muted-foreground/70">
              <span>Press <kbd className="rounded bg-muted px-1 py-0.2 font-mono text-[9px] border border-border">Enter ↵</kbd> to send</span>
              <span className="flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5 text-primary" /> Powered by Campus Intelligence
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Format text and convert DB record tokens like [MARKETPLACE #34] or **MARKETPLACE #34 ** into direct interactive cards
 */
function renderFormattedText(text: string) {
  if (!text) return null;

  // Pattern to match entity tags like [MARKETPLACE #34], **MARKETPLACE #34**, ROOMMATE #12, etc.
  const pattern = /(?:\*\*|\[)?\b(ROOMMATE|MARKETPLACE|BLOOD_REQUEST|RESOURCE|EXCHANGE|LOST_FOUND)\s*#(\d+)\b(?:\s*\*+)?(?:\s*\])?/gi;

  const paragraphs = text.split("\n");

  return (
    <div className="space-y-2">
      {paragraphs.map((para, pIdx) => {
        if (!para.trim()) return null;

        // Check if paragraph is a bullet point
        const isBullet = para.trim().startsWith("- ") || para.trim().startsWith("* ");
        const cleanPara = isBullet ? para.trim().substring(2) : para;

        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = pattern.exec(cleanPara)) !== null) {
          if (match.index > lastIndex) {
            parts.push(parseMarkdownChunk(cleanPara.substring(lastIndex, match.index), `txt-${pIdx}-${lastIndex}`));
          }

          const type = match[1].toUpperCase();
          const id = match[2];

          let route = "/app";
          let label = `${type.replace("_", " ")} #${id}`;
          let chipColor = "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20";

          switch (type) {
            case "ROOMMATE":
              route = `/app/roommates?open=${id}`;
              label = `Roommate Listing #${id}`;
              chipColor = "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20";
              break;
            case "MARKETPLACE":
              route = `/app/marketplace?open=${id}`;
              label = `Marketplace #${id}`;
              chipColor = "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20";
              break;
            case "BLOOD_REQUEST":
              route = `/app/blood?open=${id}`;
              label = `Blood Request #${id}`;
              chipColor = "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20";
              break;
            case "RESOURCE":
              route = `/app/resources?open=${id}`;
              label = `Academic File #${id}`;
              chipColor = "bg-sky-500/10 border-sky-500/20 text-sky-700 dark:text-sky-400 hover:bg-sky-500/20";
              break;
            case "EXCHANGE":
              route = `/app/exchange?open=${id}`;
              label = `Swap Post #${id}`;
              chipColor = "bg-indigo-500/10 border-indigo-500/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/20";
              break;
            case "LOST_FOUND":
              route = `/app/lost-found?open=${id}`;
              label = `Lost Item #${id}`;
              chipColor = "bg-purple-500/10 border-purple-500/20 text-purple-700 dark:text-purple-400 hover:bg-purple-500/20";
              break;
          }

          parts.push(
            <Link
              key={`${type}-${id}-${match.index}`}
              to={route}
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10.5px] font-semibold transition-colors cursor-pointer mx-1 my-0.5 align-middle shadow-2xs",
                chipColor
              )}
            >
              <span>{label}</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          );

          lastIndex = pattern.lastIndex;
        }

        if (lastIndex < cleanPara.length) {
          parts.push(parseMarkdownChunk(cleanPara.substring(lastIndex), `txt-${pIdx}-${lastIndex}`));
        }

        if (isBullet) {
          return (
            <div key={pIdx} className="flex items-start gap-2 pl-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary/70 mt-1.5 shrink-0"></span>
              <div className="flex-1 leading-relaxed">{parts}</div>
            </div>
          );
        }

        return (
          <p key={pIdx} className="leading-relaxed">
            {parts}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Inline markdown text chunk helper (handles bold, code, and emphasis)
 */
function parseMarkdownChunk(chunk: string, keyPrefix: string): React.ReactNode {
  if (!chunk) return null;
  const parts = chunk.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <React.Fragment key={keyPrefix}>
      {parts.map((p, idx) => {
        if (p.startsWith("**") && p.endsWith("**")) {
          return (
            <strong key={`${keyPrefix}-${idx}`} className="font-semibold text-foreground">
              {p.slice(2, -2)}
            </strong>
          );
        }
        if (p.startsWith("`") && p.endsWith("`")) {
          return (
            <code
              key={`${keyPrefix}-${idx}`}
              className="rounded bg-muted px-1 py-0.5 font-mono text-[10px] text-foreground border border-border"
            >
              {p.slice(1, -1)}
            </code>
          );
        }
        return p;
      })}
    </React.Fragment>
  );
}

