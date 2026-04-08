"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles, RotateCcw, UserRound, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "ereteam-chat-v1";

const WELCOME: Message = {
  role: "assistant",
  content: "Hi! I'm Ereteam's AI assistant. Ask me anything about our services, products, clients, or expertise.",
};

const SUGGESTIONS = [
  "What services do you offer?",
  "Tell me about your products",
  "Which industries do you work in?",
  "How can I contact you?",
];

function MessageText({ content }: { content: string }) {
  const parts = content.split(/(\[.+?\]\(.+?\))/g);
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\[(.+?)\]\((.+?)\)$/);
        if (match) {
          const [, text, href] = match;
          return href.startsWith("/") ? (
            <Link key={i} href={href} className="underline underline-offset-2 font-medium hover:opacity-80 transition-opacity" style={{ color: "#60a5fa" }}>
              {text}
            </Link>
          ) : (
            <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 font-medium hover:opacity-80 transition-opacity" style={{ color: "#60a5fa" }}>
              {text}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
      ))}
    </div>
  );
}

function BotAvatar() {
  return (
    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: "linear-gradient(135deg, #1A6FA8, #0C9472)" }}>
      <Sparkles size={13} color="white" />
    </div>
  );
}

interface LeadForm { name: string; email: string; company: string; message: string; }

export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLead, setShowLead] = useState(false);
  const [leadForm, setLeadForm] = useState<LeadForm>({ name: "", email: "", company: "", message: "" });
  const [leadSent, setLeadSent] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Restore from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setMessages(JSON.parse(saved));
    } catch {}
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, showLead]);

  const clearChat = () => {
    setMessages([WELCOME]);
    setShowLead(false);
    setLeadSent(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: Message = { role: "user", content };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.filter((m) => m !== WELCOME),
          currentPage: pathname,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages([...history, { role: "assistant", content: data.content }]);
    } catch {
      setMessages([...history, { role: "assistant", content: "Something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const submitLead = async () => {
    if (!leadForm.name || !leadForm.email) return;
    setLeadLoading(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...leadForm, page: pathname }),
      });
      setLeadSent(true);
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: `Thanks, ${leadForm.name}! One of our experts will reach out to you at **${leadForm.email}** shortly. In the meantime, feel free to explore our [services](/services) or [use cases](/use-cases).`,
      }]);
      setShowLead(false);
    } catch {
      setLeadSent(false);
    } finally {
      setLeadLoading(false);
    }
  };

  const hasConversation = messages.filter((m) => m.role === "user").length > 0;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.94 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex flex-col rounded-2xl overflow-hidden shadow-2xl"
            style={{
              width: "min(370px, calc(100vw - 32px))",
              height: "min(540px, calc(100svh - 100px))",
              background: "#07111f",
              border: "1px solid rgba(26,111,168,0.35)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(26,111,168,0.1)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 flex-shrink-0"
              style={{ background: "linear-gradient(135deg, rgba(26,111,168,0.2), rgba(12,148,114,0.1))", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #1A6FA8, #0C9472)" }}>
                  <Sparkles size={16} color="white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Ereteam AI</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hasConversation && (
                  <button onClick={clearChat} className="text-gray-500 hover:text-white transition-colors p-1" title="Clear conversation">
                    <RotateCcw size={15} />
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white transition-colors p-1">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.08) transparent" }}>

              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && <BotAvatar />}
                  <div className="max-w-[78%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed whitespace-pre-line"
                    style={msg.role === "user"
                      ? { background: "linear-gradient(135deg, #1A6FA8, #155d8f)", color: "white", borderBottomRightRadius: 4 }
                      : { background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.88)", borderBottomLeftRadius: 4, border: "1px solid rgba(255,255,255,0.06)" }
                    }>
                    <MessageText content={msg.content} />
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2.5 justify-start">
                  <BotAvatar />
                  <div className="rounded-2xl px-4 py-2.5"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.06)", borderBottomLeftRadius: 4 }}>
                    <TypingDots />
                  </div>
                </div>
              )}

              {/* Suggested questions */}
              {!hasConversation && !loading && (
                <div className="flex flex-col gap-2 mt-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => send(s)}
                      className="flex items-center justify-between text-left text-[12px] px-3 py-2.5 rounded-xl transition-all hover:opacity-90"
                      style={{ background: "rgba(26,111,168,0.1)", border: "1px solid rgba(26,111,168,0.25)", color: "rgba(255,255,255,0.75)" }}>
                      <span>{s}</span>
                      <ChevronRight size={13} className="flex-shrink-0 opacity-50" />
                    </button>
                  ))}
                </div>
              )}

              {/* Talk to expert offer */}
              {hasConversation && !showLead && !leadSent && !loading && (
                <motion.button
                  onClick={() => setShowLead(true)}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-medium transition-all hover:opacity-90"
                  style={{ background: "rgba(12,148,114,0.1)", border: "1px solid rgba(12,148,114,0.3)", color: "#4ade80" }}>
                  <UserRound size={13} />
                  Talk to an expert
                </motion.button>
              )}

              {/* Lead form */}
              <AnimatePresence>
                {showLead && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="rounded-2xl p-4 space-y-3"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(26,111,168,0.3)" }}>
                    <div className="text-[13px] font-semibold text-white">Leave your details</div>
                    <div className="text-[11px] text-gray-400">Our team will reach out within 1 business day.</div>
                    {(["name", "email", "company"] as const).map((field) => (
                      <input key={field}
                        value={leadForm[field]}
                        onChange={(e) => setLeadForm((p) => ({ ...p, [field]: e.target.value }))}
                        placeholder={field === "name" ? "Your name *" : field === "email" ? "Work email *" : "Company (optional)"}
                        className="w-full rounded-lg px-3 py-2 text-[12px] text-white placeholder-gray-600 outline-none"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 16 }}
                      />
                    ))}
                    <textarea
                      value={leadForm.message}
                      onChange={(e) => setLeadForm((p) => ({ ...p, message: e.target.value }))}
                      placeholder="Your message (optional)"
                      rows={3}
                      className="w-full rounded-lg px-3 py-2 text-[12px] text-white placeholder-gray-600 outline-none resize-none"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 16 }}
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setShowLead(false)}
                        className="flex-1 py-2 rounded-lg text-[12px] text-gray-400 hover:text-white transition-colors"
                        style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                        Cancel
                      </button>
                      <button onClick={submitLead} disabled={!leadForm.name || !leadForm.email || leadLoading}
                        className="flex-1 py-2 rounded-lg text-[12px] font-semibold text-white disabled:opacity-40 transition-all"
                        style={{ background: "linear-gradient(135deg, #1A6FA8, #0C9472)" }}>
                        {leadLoading ? "Sending..." : "Send →"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 pb-4 pt-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center gap-2 rounded-xl px-4 py-2.5"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <input ref={inputRef} value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                  placeholder="Type your question..."
                  className="flex-1 bg-transparent text-[13px] text-white placeholder-gray-600 outline-none"
                  style={{ fontSize: 16 }} />
                <button onClick={() => send()} disabled={!input.trim() || loading}
                  className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-25"
                  style={{ background: "linear-gradient(135deg, #1A6FA8, #0C9472)" }}>
                  <Send size={13} color="white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <div className="relative">
        {!open && (
          <>
            <motion.div className="absolute inset-0 rounded-2xl"
              style={{ background: "linear-gradient(135deg, #1A6FA8, #0C9472)", filter: "blur(12px)", opacity: 0.6 }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
            <motion.div className="absolute inset-0 rounded-2xl"
              style={{ border: "1.5px solid rgba(26,111,168,0.7)" }}
              animate={{ scale: [1, 1.25, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }} />
          </>
        )}
        <motion.button onClick={() => setOpen((v) => !v)}
          className="relative flex items-center gap-2.5 px-4 rounded-2xl shadow-xl"
          style={{ background: "linear-gradient(135deg, #1A6FA8, #0C9472)", height: 52 }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X size={20} color="white" />
              </motion.span>
            ) : (
              <motion.span key="spark" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <Sparkles size={20} color="white" />
              </motion.span>
            )}
          </AnimatePresence>
          {!open && <div className="text-[13px] font-bold text-white leading-none">Ask AI</div>}
        </motion.button>
      </div>
    </div>
  );
}
