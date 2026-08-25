const CHAT_LOG_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdFNHYuNsukRMKzCkCs2AGbeD1GvoqJ9aOIXsIA2XtpZYxvTQ/formResponse";

type ChatLogEntry = {
  sessionId: string;
  page: string;
  question: string;
  answer: string;
  status: "Answered" | "Error";
};

function getIstanbulDateParts() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());

  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

export async function logChatExchange(entry: ChatLogEntry) {
  try {
    const date = getIstanbulDateParts();
    const body = new URLSearchParams({
      "entry.125589920_year": date.year,
      "entry.125589920_month": date.month,
      "entry.125589920_day": date.day,
      "entry.1729771496": entry.sessionId,
      "entry.184598634": entry.page,
      "entry.91735578": entry.question,
      "entry.1252782736": entry.answer,
      "entry.269491053": entry.status,
    });

    const response = await fetch(CHAT_LOG_FORM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(3_500),
    });

    if (!response.ok) {
      console.warn("Chat log form rejected the submission:", response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.warn(
      "Chat log submission failed:",
      error instanceof Error ? error.message : String(error)
    );
    return false;
  }
}
