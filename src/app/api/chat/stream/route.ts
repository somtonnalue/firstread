/**
 * Chat Streaming API Route
 * POST /api/chat/stream - Stream a message response
 */

import { Message } from "@/domain/entities/Message";
import { serverContainer } from "@/infra/di/container.server";
import { auth } from "@/lib/auth";
import { ChatStreamRequestSchema } from "@/shared/contracts/api.contract";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    console.log("Stream API received:", { threadId: body.threadId, content: body.content?.substring(0, 50) });
    const validatedData = ChatStreamRequestSchema.parse(body);

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

    // Create a TransformStream for streaming
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Execute streaming use case in the background
    (async () => {
      try {
        const result = await serverContainer.streamMessageUseCase.execute({
          content: validatedData.content,
          attachments: validatedData.attachments,
          threadId: validatedData.threadId,
          modelId: validatedData.modelId,
          userId: session.user!.id!,
          onChunk: (chunk: string) => {
            // Send each chunk to the client
            writer.write(
              encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`),
            );
          },
        });

        // Send the final thread ID to the client
        writer.write(
          encoder.encode(`data: ${JSON.stringify({ threadId: result.thread.id })}\n\n`),
        );

        // Send done signal
        writer.write(encoder.encode("data: [DONE]\n\n"));
        await writer.close();
      } catch (error) {
        console.error("Streaming error:", error);
        writer.write(
          encoder.encode(
            `data: ${JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" })}\n\n`,
          ),
        );
        await writer.close();
      }
    })();

    // Return the stream
    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Stream API Error:", error);

    // Handle Zod validation errors
    if (error instanceof Error && error.name === "ZodError") {
      return new Response(
        JSON.stringify({
          error: "Validation Error",
          message: error.message,
          details: (error as any).issues,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
