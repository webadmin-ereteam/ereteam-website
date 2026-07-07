"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircleQuestion, X, Send, Sparkles } from "lucide-react";

type ChatMessage = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Hangi case'ler şu an aktif?",
  "X firması hangi anket sorularını cevapladı?",
  "Hangi case'lerde teklif talep edildi?",
];

export default function AdminChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/presales/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.ok ? data.content : `Hata: ${data.error ?? "bilinmeyen hata"}` },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Bağlantı hatası, tekrar dene." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
            style={{ width: "min(380px, calc(100vw - 48px))", height: "min(520px, calc(100svh - 140px))" }}
          >
            <div className="flex items-center justify-between border-b border-gray-100 bg-brand-dark px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary to-brand-magenta">
                  <Sparkles size={15} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Presales Asistanı</p>
                  <p className="text-[11px] text-white/40">Sadece bu veritabanındaki verilere bakar</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.length === 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-text-muted">
                    Ör: &quot;Acme firması demo aşamasında hangi soruları cevapladı?&quot;
                  </p>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="block w-full rounded-lg border border-gray-200 px-3 py-2 text-left text-xs text-text-body hover:border-brand-primary hover:text-brand-primary"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
                      m.role === "user"
                        ? "rounded-br-sm bg-gradient-to-r from-brand-primary to-brand-magenta text-white"
                        : "rounded-bl-sm border border-gray-100 bg-gray-50 text-text-body"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm border border-gray-100 bg-gray-50 px-3.5 py-2.5 text-xs text-text-muted">
                    yazıyor...
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-gray-100 px-3 py-3">
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                  placeholder="Bir soru sor..."
                  className="flex-1 bg-transparent text-sm text-text-body outline-none placeholder:text-text-muted"
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-brand-primary to-brand-magenta disabled:opacity-30"
                >
                  <Send size={13} className="text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-magenta px-4 py-3.5 text-white shadow-xl"
      >
        {open ? <X size={20} /> : <MessageCircleQuestion size={20} />}
        {!open && <span className="text-sm font-semibold">Asistan</span>}
      </motion.button>
    </div>
  );
}
