import { type NextRequest } from "next/server";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateId,
  type UIMessage,
} from "ai";
import { requireCurrentUser } from "@/lib/auth";
import { chatService } from "@/features/ai/services/chat-service";
import { checkRateLimit } from "@/lib/ai/rate-limiter";
import { CHAT_PROVIDER_RATE_LIMIT_USER_MESSAGE } from "@/lib/ai/chat-rate-limit-messages";
import { isProviderRateLimitError } from "@/lib/ai/is-provider-rate-limit-error";
import { logger } from "@/lib/logger";
import { AppError } from "@/lib/errors";
import { postRequestBodySchema, type PostRequestBody } from "./schema";

export const maxDuration = 60;

const getIsToolApprovalContinuation = (
  uiMessages: UIMessage[],
  lastMessage: UIMessage | undefined,
) => {
  if (uiMessages.length === 0) {
    return false;
  }

  const hasApprovalPart = uiMessages.some((msg) =>
    msg.parts?.some((part) => {
      if (!part || typeof part !== "object" || !("state" in part)) {
        return false;
      }
      const state = (part as { state?: string }).state;
      return state === "approval-responded" || state === "output-denied";
    }),
  );

  const lastIsNotUser = lastMessage?.role !== "user";

  return hasApprovalPart || Boolean(lastIsNotUser);
};

export async function POST(req: NextRequest) {
  let requestBody: PostRequestBody;

  try {
    const json = await req.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new AppError("bad_request:api").toResponse();
  }

  try {
    const user = await requireCurrentUser();

    if (!checkRateLimit(user.id)) {
      return new AppError("rate_limit:chat").toResponse();
    }

    const { message, messages } = requestBody;

    let uiMessages: UIMessage[];

    if (messages && messages.length > 0) {
      uiMessages = messages as UIMessage[];
    } else if (message) {
      uiMessages = [message as UIMessage];
    } else {
      return new AppError("bad_request:api").toResponse();
    }

    const lastMessage = uiMessages.at(-1);
    const isToolApprovalContinuation = getIsToolApprovalContinuation(
      uiMessages,
      lastMessage,
    );

    const modelMessages = await convertToModelMessages(uiMessages);

    logger.info("Chat request", {
      userId: user.id,
      messageCount: modelMessages.length,
      lastMessage: modelMessages[modelMessages.length - 1]?.role,
      isToolApprovalContinuation,
    });

    const stream = createUIMessageStream({
      originalMessages: isToolApprovalContinuation ? uiMessages : undefined,
      execute: async ({ writer: dataStream }) => {
        const result = await chatService.streamChat({
          messages: modelMessages,
          userId: user.id,
          userName: user.name || undefined,
        });

        dataStream.merge(result.toUIMessageStream());
      },
      generateId,
      onFinish: async ({ messages: finishedMessages }) => {
        logger.info("Chat stream finished", {
          userId: user.id,
          messageCount: finishedMessages.length,
        });
      },
      onError: (error) => {
        if (isProviderRateLimitError(error)) {
          return CHAT_PROVIDER_RATE_LIMIT_USER_MESSAGE;
        }
        if (error instanceof Error && error.message?.includes("high demand")) {
          return "The AI service is experiencing high demand. Please try again in a moment.";
        }
        return "Something went wrong and your last message was not applied. Nothing was saved—try again.";
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    const vercelId = req.headers.get("x-vercel-id");

    if (error instanceof AppError) {
      return error.toResponse();
    }

    logger.error("Unhandled chat API error:", { error, vercelId });
    return new AppError("offline:chat").toResponse();
  }
}
