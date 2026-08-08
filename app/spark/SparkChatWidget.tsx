"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Database, Send, X } from "lucide-react";
import styles from "./sparkChat.module.css";

type Message = { role: "user" | "assistant"; content: string; queriedAt?: string };

const suggestions = [
  "Bu ay beklenen faturaların detaylarını göster",
  "New Business faturalarını şirket bazında özetle",
  "Açık orderları owner bazında listele",
];

function MessageText({ content }: { content: string }) {
  const parts = content.split(/(https:\/\/[^\s]+)/g);
  return <>{parts.map((part, index) => part.startsWith("https://")
    ? <a key={index} href={part} target="_blank" rel="noreferrer">Kaydı aç ↗</a>
    : <span key={index}>{part}</span>)}</>;
}

export default function SparkChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (open) window.setTimeout(() => inputRef.current?.focus(), 180); }, [open]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function send(value?: string) {
    const content = (value ?? input).trim();
    if (!content || loading) return;
    const next: Message[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch("/api/spark/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map(({ role, content: text }) => ({ role, content: text })) }),
      });
      const result = await response.json();
      setMessages((current) => [...current, {
        role: "assistant",
        content: response.ok ? result.content : result.error || "Sorgu tamamlanamadı.",
        queriedAt: result.queriedAt,
      }]);
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: "Canlı veri bağlantısı şu anda yanıt vermiyor." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.shell}>
      <AnimatePresence>
        {open && (
          <motion.section
            className={styles.panel}
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            aria-label="Spark veri asistanı"
          >
            <header className={styles.header}>
              <div className={styles.identity}>
                <span className={styles.icon}><Database size={17} /></span>
                <div><b>Revenue Data Assistant</b><small>HubSpot canlı sorgu</small></div>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Asistanı kapat"><X size={19} /></button>
            </header>

            <div className={styles.scope}>
              <Bot size={16} />
              <span>HubSpot verilerine API ile canlı bağlanır; deal, fatura ve order detaylarını salt okunur olarak sorgular.</span>
            </div>

            <div className={styles.messages} aria-live="polite">
              {!messages.length && <div className={styles.suggestions}>
                <p>Veriye ne sormak istersin?</p>
                {suggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => send(suggestion)}>{suggestion}</button>)}
              </div>}
              {messages.map((message, index) => (
                <div key={index} className={`${styles.messageRow} ${message.role === "user" ? styles.userRow : ""}`}>
                  <div className={`${styles.message} ${message.role === "user" ? styles.userMessage : styles.assistantMessage}`}>
                    <MessageText content={message.content} />
                    {message.queriedAt && <small>Canlı HubSpot · {new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" }).format(new Date(message.queriedAt))}</small>}
                  </div>
                </div>
              ))}
              {loading && <div className={styles.loading}><i /><i /><i /><span>HubSpot sorgulanıyor</span></div>}
              <div ref={bottomRef} />
            </div>

            <form className={styles.composer} onSubmit={(event) => { event.preventDefault(); send(); }}>
              <input ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} placeholder="HubSpot verisine bir soru sor…" aria-label="Sorunuz" />
              <button type="submit" disabled={!input.trim() || loading} aria-label="Soruyu gönder"><Send size={16} /></button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
      <motion.button className={styles.launcher} type="button" onClick={() => setOpen((current) => !current)} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} aria-expanded={open}>
        {open ? <X size={19} /> : <Database size={19} />}
        <span>{open ? "Kapat" : "Veriye sor"}</span>
      </motion.button>
    </div>
  );
}
