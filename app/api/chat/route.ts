import { convertToModelMessages, streamText, tool , createIdGenerator, type UIMessage} from "ai";
import { CHAT_SYSTEM_PROMPT } from "@/lib/prompt";
import { prisma } from "@/lib/db";
import { MessageRole } from "@/lib/generated/prisma/enums";
import type { Prisma } from "@/lib/generated/prisma/client";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { NextRequest } from "next/server";

const openRouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

type MessagePart = {
  type: string;
  text?: string;
};

type StoredMessage = {
  id: string;
  content: string;
  messageRole: { toLowerCase: () => string };
  createdAt: Date;
};

type StreamMessage = {
  role: string;
  parts: MessagePart[];
  content?: string;
};

// Convert a stored DB message into the UIMessage shape expected by the AI SDK.
function dbMessageToUI(msg: StoredMessage) {
  try {
    const parts = JSON.parse(msg.content) as MessagePart[];

    // Only forward text parts here; the stream can safely ignore non-text DB payloads.
    const textParts = parts.filter((part: MessagePart) => {
      return part.type === "text";
    });
    if (textParts.length === 0) {
      return null;
    }

    return {
      id: msg.id,
      role: msg.messageRole.toLowerCase(),
      parts: textParts,
      createdAt: msg.createdAt,
    };
  } catch {
    return {
      id: msg.id,
      role: msg.messageRole.toLowerCase(),
      parts: [{ type: "text", text: msg.content }],
      createdAt: msg.createdAt,
    };
  }
}

// Persist AI SDK message parts as JSON so we can reconstruct them later.
function partsToJSON(message: { parts?: MessagePart[]; content?: string }) {
  if (Array.isArray(message.parts)) {
    return JSON.stringify(message.parts);
  }
  return JSON.stringify([{ type: "text", text: message.content || "" }]);
}

// Fallback when AI SDK conversion fails or the incoming message shape is partial.
function fallbackConversion(message: StreamMessage[]) {
  return message
    .map((msg: StreamMessage) => ({
      role: msg.role,
      content: msg.parts
        .filter((p: MessagePart) => p.type === "text")
        .map((p: MessagePart) => p.text)
        .join("\n"),
    }))
    .filter((m: { content: string }) => m.content);
}

export async function POST(req: NextRequest) {
  try {
    // The client sends the chat id, the latest message batch, and the selected model.
    const {
      chatId,
      messages,
      model,
      skipUserMessage,
    } = await req.json();

    // Load the saved conversation so the model sees the full thread context.
    const dbMessages = await prisma.message.findMany({
      where: { chatId },
      orderBy: {
        createdAt: "asc",
      },
    });



    const result = streamText({
      model: openRouter.chat(model),
      system: CHAT_SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
    });
    result.consumeStream();

    // Stream the response to the client and persist both sides once generation finishes.
    return result.toUIMessageStreamResponse({
      sendReasoning: true,
      originalMessages: messages,
      onFinish: async ({ responseMessage }) => {
        try {
          const messageToSave: Prisma.MessageCreateManyInput[] = [];
          if (!skipUserMessage) {
            // Save the last user message unless the caller already stored it.
            const lastUserMsg = [...messages].reverse().find((m: UIMessage) => m.role === "user");
            if (lastUserMsg) {
              messageToSave.push({
                chatId,
                content: partsToJSON(lastUserMsg),
                messageRole: MessageRole.USER,
                messageType: "NORMAL",
                model,
              });
            }
          }

          // Save the assistant response only when the model produced content.
          if (responseMessage?.parts && responseMessage.parts.length > 0) {
            messageToSave.push({
              chatId,
              content: partsToJSON(responseMessage),
              messageRole: MessageRole.ASSISTANT,
              messageType: "NORMAL",
              model,
            });
          }

          if(messageToSave.length > 0) {
            await prisma.message.createMany({data: messageToSave, skipDuplicates: true});
          }
        } catch (error) {
            console.error("Error saving messages", error)
        }
      },
    });
  } catch (error) {
        // Return a plain JSON error so the client can surface the failure cleanly.
        console.error("Chat API error: ", error);
        return Response.json(
            {error: (error as Error).message || "Internal server error"},
            {status: 500}
        )
  }
}
