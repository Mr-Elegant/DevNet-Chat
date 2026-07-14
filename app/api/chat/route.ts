import { convertToModelMessages, streamText, tool } from "ai";
import { CHAT_SYSTEM_PROMPT } from "@/lib/prompt";
import { prisma } from "@/lib/db";
import { MessageRole } from "@/lib/generated/prisma/enums";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { NextRequest } from "next/server";

const openRouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY!,
});

// Convert a stored DB message into the UIMessage shape expected by the AI SDK.
function dbMessageToUI(msg) {
  try {
    const parts = JSON.parse(msg.content);

    // Only forward text parts here; the stream can safely ignore non-text DB payloads.
    const textParts = parts.filter((part) => {
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
function partsToJSON(message) {
  if (Array.isArray(message.parts)) {
    return JSON.stringify(message.parts);
  }
  return JSON.stringify([{ type: "text", text: message.content || "" }]);
}

// Fallback when AI SDK conversion fails or the incoming message shape is partial.
function fallbackConversion(message) {
  return message
    .map((msg) => ({
      role: msg.role,
      content: msg.parts
        .filter((p) => p.type === "text")
        .map((p) => p.text)
        .join("\n"),
    }))
    .filter((m) => m.content);
}

export async function POST(req: NextRequest) {
  try {
    // The client sends the chat id, the latest message batch, and the selected model.
    const {
      chatId,
      messages: newMessages,
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

    // Rebuild the conversation in UI format, then append the new client messages.
    const previousUI = dbMessages.map(dbMessageToUI).filter(Boolean);
    const newUI = Array.isArray(newMessages) ? newMessages : [newMessages];
    const allMessages = [...previousUI, ...newUI];

    // Convert the UI message list to the AI model's message format for streaming.
    let modelMessages = await convertToModelMessages(allMessages);

    const result = streamText({
      model: openRouter.chat(model),
      system: CHAT_SYSTEM_PROMPT,
      messages: modelMessages,
    });

    // Stream the response to the client and persist both sides once generation finishes.
    return result.toUIMessageStreamResponse({
      sendReasoning: true,
      originalMessages: allMessages,
      onFinish: async ({ responseMessage }) => {
        try {
          const messageToSave = [];
          if (!skipUserMessage) {
            // Save the last user message unless the caller already stored it.
            const lastUserMsg = newUI[newUI.length - 1];
            if (lastUserMsg?.role === "user") {
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
            await prisma.message.createMany({data: messageToSave})
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
