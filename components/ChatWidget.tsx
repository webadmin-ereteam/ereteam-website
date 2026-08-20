"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, RotateCcw, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useChat } from "../hooks/useChat";
import { useLeadForm } from "../hooks/useLeadForm";

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
            <Link key={i} href={href} className="font-semibold underline underline-offset-2 transition-opacity hover:opacity-70" style={{ color: "#B96F38" }}>
              {text}
            </Link>
          ) : (
            <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-2 transition-opacity hover:opacity-70" style={{ color: "#B96F38" }}>
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
        <motion.div key={i} className="h-1.5 w-1.5 bg-[#B96F38]"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
      ))}
    </div>
  );
}

function AIMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-7 w-7 flex-none items-center justify-center text-[10px] font-bold tracking-[.08em] ${inverse ? "bg-white text-[#071A2A]" : "bg-[#071A2A] text-white"}`}
    >
      AI
    </span>
  );
}

function BotAvatar() {
  return <AIMark />;
}

export default function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    loading,
    hasConversation,
    sendMessage,
    clearChat,
    setMessages
  } = useChat(pathname);

  const {
    showLead,
    setShowLead,
    leadForm,
    setLeadForm,
    leadSent,
    leadLoading,
    submitLead,
    resetLeadForm
  } = useLeadForm(pathname, setMessages);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, showLead]);

  const handleClearChat = () => {
    clearChat();
    resetLeadForm();
  };

  const handleSend = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) return;

    setInput("");
    await sendMessage(content);
  };

  if (pathname.startsWith("/presales") || pathname.startsWith("/spark")) return null;

  return (
    <div className="fixed bottom-3 right-3 z-50 flex flex-col items-end sm:bottom-5 sm:right-5">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex flex-col overflow-hidden"
            style={{
              width: "min(360px, calc(100vw - 24px))",
              height: "min(520px, calc(100svh - 84px))",
              background: "#FBFAF7",
              border: "1px solid rgba(7,26,42,0.16)",
              boxShadow: "0 18px 48px rgba(7,26,42,0.18)",
            }}
          >
            {/* Header */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-[#071A2A]/12 bg-[#FBFAF7] px-4 py-3">
              <div className="flex items-center gap-2.5">
                <AIMark />
                <div className="text-[13px] font-semibold text-[#071A2A]">Ereteam AI</div>
              </div>
              <div className="flex items-center gap-2">
                {hasConversation && (
                  <button onClick={handleClearChat} className="p-1.5 text-[#65727b] transition-colors hover:text-[#071A2A]" title="Clear conversation">
                    <RotateCcw size={15} />
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1.5 text-[#65727b] transition-colors hover:text-[#071A2A]" aria-label="Close Ereteam AI">
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto bg-[#FBFAF7] px-4 py-4"
              style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(7,26,42,0.25) transparent" }}>

              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && <BotAvatar />}
                  <div className="max-w-[84%] px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-line"
                    style={msg.role === "user"
                      ? { background: "#071A2A", color: "white" }
                      : { background: "#F0EEE8", color: "#213846" }
                    }>
                    <MessageText content={msg.content} />
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2.5 justify-start">
                  <BotAvatar />
                  <div className="bg-[#F0EEE8] px-3.5 py-2.5">
                    <TypingDots />
                  </div>
                </div>
              )}

              {/* Suggested questions */}
              {!hasConversation && !loading && (
                <div className="mt-2 divide-y divide-[#071A2A]/10 border-y border-[#071A2A]/10">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => handleSend(s)}
                      className="flex w-full items-center px-1 py-3 text-left text-[12px] text-[#40515d] transition-colors hover:text-[#071A2A]">
                      <span>{s}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Talk to expert offer */}
              {hasConversation && !showLead && !leadSent && !loading && (
                <motion.button
                  onClick={() => setShowLead(true)}
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                  className="flex w-full items-center justify-center gap-2 border border-[#071A2A] bg-[#071A2A] py-3 text-[12px] font-semibold uppercase tracking-[.08em] text-white transition-colors hover:bg-[#B96F38]">
                  <UserRound size={13} />
                  Talk to an expert
                </motion.button>
              )}

              {/* Lead form */}
              <AnimatePresence>
                {showLead && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="space-y-3 border-y border-[#071A2A]/12 bg-white/60 px-1 py-4">
                    <div className="text-[13px] font-semibold text-[#071A2A]">Leave your details</div>
                    <div className="text-[11px] text-[#65727b]">Our team will reach out within 1 business day.</div>
                    {(["name", "email", "company"] as const).map((field) => (
                      <input key={field}
                        value={leadForm[field]}
                        onChange={(e) => setLeadForm((p) => ({ ...p, [field]: e.target.value }))}
                        placeholder={field === "name" ? "Your name *" : field === "email" ? "Work email *" : "Company (optional)"}
                        className="w-full border border-[#071A2A]/16 bg-[#F3F0E8] px-3 py-2 text-[12px] text-[#071A2A] outline-none placeholder:text-[#7f8a91] focus:border-[#B96F38]"
                        style={{ fontSize: 16 }}
                      />
                    ))}
                    <textarea
                      value={leadForm.message}
                      onChange={(e) => setLeadForm((p) => ({ ...p, message: e.target.value }))}
                      placeholder="Your message (optional)"
                      rows={3}
                      className="w-full resize-none border border-[#071A2A]/16 bg-[#F3F0E8] px-3 py-2 text-[12px] text-[#071A2A] outline-none placeholder:text-[#7f8a91] focus:border-[#B96F38]"
                      style={{ fontSize: 16 }}
                    />
                    <div className="flex gap-2">
                      <button onClick={() => setShowLead(false)}
                        className="flex-1 border border-[#071A2A]/18 py-2 text-[12px] text-[#65727b] transition-colors hover:border-[#071A2A] hover:text-[#071A2A]">
                        Cancel
                      </button>
                      <button onClick={submitLead} disabled={!leadForm.name || !leadForm.email || leadLoading}
                        className="flex-1 bg-[#B96F38] py-2 text-[12px] font-semibold text-white transition-colors hover:bg-[#071A2A] disabled:opacity-40">
                        {leadLoading ? "Sending..." : "Send →"}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 border-t border-[#071A2A]/12 bg-[#FBFAF7] p-3">
              <div className="flex items-center gap-2 border border-[#071A2A]/18 bg-white px-3 py-2 focus-within:border-[#071A2A]/50">
                <input ref={inputRef} value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Type your question..."
                  className="flex-1 bg-transparent text-[13px] text-[#071A2A] outline-none placeholder:text-[#7f8a91]"
                  style={{ fontSize: 16 }} />
                <button onClick={() => handleSend()} disabled={!input.trim() || loading}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center bg-[#071A2A] transition-opacity hover:opacity-80 disabled:opacity-25">
                  <Send size={13} color="white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
        onClick={() => setOpen((current) => !current)}
        className="mt-2 flex h-12 items-center gap-2.5 bg-[#071A2A] px-3 pr-4 text-white shadow-[0_10px_28px_rgba(7,26,42,.2)] transition-opacity hover:opacity-90"
        whileHover={{ y: -2 }} whileTap={{ y: 0 }} aria-label={open ? "Close Ereteam AI" : "Open Ereteam AI"}
      >
        <AIMark inverse />
        <span className="text-[12px] font-semibold tracking-[.04em]">Ereteam AI</span>
      </motion.button>
    </div>
  );
}
