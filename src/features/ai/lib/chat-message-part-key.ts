import {
  isDataUIPart,
  isFileUIPart,
  isReasoningUIPart,
  isTextUIPart,
  isToolUIPart,
} from "ai";
import type { ChatMessage } from "@/lib/ai/chat-message";

export const getChatMessagePartReactKey = (
  messageId: string,
  part: ChatMessage["parts"][number],
  index: number,
): string => {
  if (isToolUIPart(part)) {
    return `${messageId}:tool:${part.toolCallId}`;
  }
  if (isTextUIPart(part)) {
    return `${messageId}:text:${index}`;
  }
  if (isReasoningUIPart(part)) {
    return `${messageId}:reasoning:${index}`;
  }
  if (isFileUIPart(part)) {
    return `${messageId}:file:${index}:${part.url}`;
  }
  if (isDataUIPart(part)) {
    return `${messageId}:${part.type}:${part.id ?? index}`;
  }
  if (part.type === "step-start") {
    return `${messageId}:step-start:${index}`;
  }
  if (part.type === "source-url") {
    return `${messageId}:source-url:${part.sourceId}`;
  }
  if (part.type === "source-document") {
    return `${messageId}:source-doc:${part.sourceId}`;
  }
  return `${messageId}:part:${index}`;
};
