"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import {
  messageHasInFlightToolWork,
  pickRandomToolActivityMessage,
} from "@/features/ai/lib/chat-tool-messages";
import type { ChatMessage } from "@/lib/ai/chat-message";

export const useRotatingToolActivityLabel = (
  status: UseChatHelpers<ChatMessage>["status"],
  messages: ChatMessage[],
) => {
  const lastMessage = messages.at(-1);
  const active =
    status === "streaming" &&
    lastMessage?.role === "assistant" &&
    messageHasInFlightToolWork(lastMessage.parts);

  const [label, setLabel] = useState(() => pickRandomToolActivityMessage());

  useEffect(() => {
    if (!active) {
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNextRotation = (delayMs: number) => {
      timeoutId = setTimeout(() => {
        if (cancelled) {
          return;
        }
        setLabel(pickRandomToolActivityMessage());
        scheduleNextRotation(2200 + Math.random() * 3800);
      }, delayMs);
    };

    scheduleNextRotation(0);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [active]);

  return { active, label };
};
