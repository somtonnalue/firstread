/**
 * Chat Threads API Route - Infrastructure Layer
 * Handles thread creation and retrieval
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/infra/database/prisma";
import { z } from "zod";

const CreateThreadSchema = z.object({
  id: z.string(),
  title: z.string(),
  messages: z.array(z.object({
    id: z.string(),
    role: z.enum(["user", "assistant"]),
    content: z.string(),
    timestamp: z.string(),
    attachments: z.any().optional(),
    isStreaming: z.boolean().optional(),
  })),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = CreateThreadSchema.parse(body);

    // Save thread to database
    await prisma.chatThread.upsert({
      where: { id: validatedData.id },
      create: {
        id: validatedData.id,
        title: validatedData.title,
        userId: session.user.id,
        createdAt: new Date(validatedData.createdAt),
        updatedAt: new Date(validatedData.updatedAt),
        messages: {
          create: validatedData.messages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            isStreaming: msg.isStreaming || false,
            attachments: msg.attachments,
          })),
        },
      },
      update: {
        title: validatedData.title,
        updatedAt: new Date(validatedData.updatedAt),
        messages: {
          deleteMany: {},
          create: validatedData.messages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            isStreaming: msg.isStreaming || false,
            attachments: msg.attachments,
          })),
        },
      },
    });

    return NextResponse.json({
      message: "Thread saved successfully",
      threadId: validatedData.id,
    });
  } catch (error) {
    console.error("Failed to save thread:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
