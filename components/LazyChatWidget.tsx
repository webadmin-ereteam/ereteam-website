"use client";

import type { ComponentType } from "react";
import { useEffect, useState } from "react";

export default function LazyChatWidget() {
  const [ChatWidget, setChatWidget] = useState<ComponentType | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadChat = () => {
      void import("./ChatWidget").then((module) => {
        if (!cancelled) setChatWidget(() => module.default);
      });
    };

    const scheduleLoad = () => {
      const requestIdle = window.requestIdleCallback?.bind(window);
      if (requestIdle) {
        requestIdle(loadChat, { timeout: 2_500 });
      } else {
        globalThis.setTimeout(loadChat, 1_500);
      }
    };

    if (document.readyState === "complete") scheduleLoad();
    else window.addEventListener("load", scheduleLoad, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", scheduleLoad);
    };
  }, []);

  return ChatWidget ? <ChatWidget /> : null;
}
