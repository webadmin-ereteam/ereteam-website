import { useState } from "react";
import { useLocalStorage } from "./useLocalStorage";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "ereteam-iq-v1";

export const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content: "Hi, I'm Ereteam AI. Ask me anything about our services, products, clients, or expertise.",
};

export function useChat(pathname: string) {
  const [messages, setMessages] = useLocalStorage<Message[]>(STORAGE_KEY, [WELCOME_MESSAGE]);
  const [loading, setLoading] = useState(false);

  const clearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return false;

    const userMsg: Message = { role: "user", content: content.trim() };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.filter((m) => m.content !== WELCOME_MESSAGE.content),
          currentPage: pathname,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setMessages([...history, { role: "assistant", content: data.content }]);
      return true;
    } catch {
      setMessages([...history, { role: "assistant", content: "Something went wrong. Please try again." }]);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const hasConversation = messages.filter((m) => m.role === "user").length > 0;

  return {
    messages,
    loading,
    hasConversation,
    sendMessage,
    clearChat,
    setMessages // Expose this for the lead form bot response
  };
}
