import {
  CHAT_APP_RATE_LIMIT_CODE,
  CHAT_PROVIDER_RATE_LIMIT_USER_MESSAGE,
} from "@/lib/ai/chat-rate-limit-messages";

export type ChatErrorDisplayVariant =
  | "app_rate_limit"
  | "provider_rate_limit"
  | "generic";

export type ChatErrorDisplay = {
  variant: ChatErrorDisplayVariant;
  title: string;
  description: string;
};

const tryParseAppErrorJson = (raw: string): { code?: string; message?: string } | null => {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{")) {
    return null;
  }
  try {
    return JSON.parse(trimmed) as { code?: string; message?: string };
  } catch {
    return null;
  }
};

export const getChatErrorDisplay = (error: Error | undefined): ChatErrorDisplay | null => {
  if (!error?.message) {
    return null;
  }

  const raw = error.message;
  const parsed = tryParseAppErrorJson(raw);
  if (parsed?.code === CHAT_APP_RATE_LIMIT_CODE && parsed.message) {
    return {
      variant: "app_rate_limit",
      title: "Message limit",
      description: parsed.message,
    };
  }

  if (raw === CHAT_PROVIDER_RATE_LIMIT_USER_MESSAGE) {
    return {
      variant: "provider_rate_limit",
      title: "AI usage limit",
      description: raw,
    };
  }

  if (
    raw.includes("The AI service is experiencing high demand") ||
    raw.includes("high demand")
  ) {
    return {
      variant: "provider_rate_limit",
      title: "AI service is busy",
      description: raw,
    };
  }

  const truncated =
    raw.length > 360 ? `${raw.slice(0, 360).trimEnd()}…` : raw;

  return {
    variant: "generic",
    title: "Could not send your message",
    description: `Nothing was saved. ${truncated}`,
  };
};
