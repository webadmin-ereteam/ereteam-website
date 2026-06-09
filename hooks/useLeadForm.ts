import { useState } from "react";
import { Message } from "./useChat";

export interface LeadForm {
  name: string;
  email: string;
  company: string;
  message: string;
}

export function useLeadForm(pathname: string, setMessages: (fn: (prev: Message[]) => Message[]) => void) {
  const [showLead, setShowLead] = useState(false);
  const [leadForm, setLeadForm] = useState<LeadForm>({ name: "", email: "", company: "", message: "" });
  const [leadSent, setLeadSent] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);

  const resetLeadForm = () => {
    setShowLead(false);
    setLeadSent(false);
    setLeadForm({ name: "", email: "", company: "", message: "" });
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

  return {
    showLead,
    setShowLead,
    leadForm,
    setLeadForm,
    leadSent,
    leadLoading,
    submitLead,
    resetLeadForm
  };
}
