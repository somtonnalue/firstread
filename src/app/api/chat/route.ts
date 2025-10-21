/**
 * Chat API Route
 * POST /api/chat - Send a message and get response
 */

import { NextResponse } from "next/server";
import { Message } from "@/domain/entities/Message";
import { serverContainer } from "@/infra/di/container.server";
import { auth } from "@/lib/auth";
import {
  ChatRequestSchema,
  type ChatResponse,
  type ErrorResponse,
} from "@/shared/contracts/api.contract";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = ChatRequestSchema.parse(body);

    // Convert context to Message entities if provided
    const _contextMessages = validatedData.context?.map(
      (msg) =>
        new Message(
          msg.id,
          msg.role,
          msg.content,
          msg.timestamp,
          msg.attachments,
          msg.isStreaming,
        ),
    );

    // Execute use case through DI container
    const result = await serverContainer.sendMessageUseCase.execute({
      content: validatedData.content,
      attachments: validatedData.attachments,
      threadId: validatedData.threadId,
      modelId: validatedData.modelId,
      userId: session.user!.id!,
    });

    // Build response
    const response: ChatResponse = {
      message: {
        id: result.assistantMessage.id,
        role: result.assistantMessage.role,
        content: result.assistantMessage.content,
        timestamp: result.assistantMessage.timestamp,
        attachments: result.assistantMessage.attachments,
        isStreaming: result.assistantMessage.isStreaming,
      },
      threadId: result.thread.id,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Chat API Error:", error);

    // Zod validation error
    if (error instanceof Error && error.name === "ZodError") {
      const errorResponse: ErrorResponse = {
        error: "Validation Error",
        message: error.message,
        statusCode: 400,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // General error
    const errorResponse: ErrorResponse = {
      error: "Internal Server Error",
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
      statusCode: 500,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
