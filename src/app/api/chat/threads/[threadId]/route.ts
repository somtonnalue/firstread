/**
 * Chat Thread Management API Route - Infrastructure Layer
 * Handles thread operations (get, rename, delete)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/infra/database/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { threadId } = await params;

    // Get thread with messages
    const threadData = await prisma.chatThread.findUnique({
      where: {
        id: threadId,
        userId: session.user.id, // Ensure user owns the thread
      },
      include: {
        messages: {
          orderBy: { timestamp: "asc" },
        },
      },
    });

    if (!threadData) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    // Transform the data
    const response = {
      id: threadData.id,
      title: threadData.title || "Untitled",
      messages: threadData.messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
        attachments: msg.attachments,
        isStreaming: msg.isStreaming,
      })),
      createdAt: threadData.createdAt.toISOString(),
      updatedAt: threadData.updatedAt.toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to get thread:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { threadId } = await params;
    const { title } = await request.json();

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Update thread title
    const updatedThread = await prisma.chatThread.update({
      where: {
        id: threadId,
        userId: session.user.id, // Ensure user owns the thread
      },
      data: {
        title: title.trim(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Thread updated successfully",
      thread: {
        id: updatedThread.id,
        title: updatedThread.title,
      },
    });
  } catch (error) {
    console.error("Failed to update thread:", error);

    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { threadId } = await params;

    // Delete thread and all its messages
    await prisma.chatThread.delete({
      where: {
        id: threadId,
        userId: session.user.id, // Ensure user owns the thread
      },
    });

    return NextResponse.json({
      message: "Thread deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete thread:", error);

    if (
      error instanceof Error &&
      error.message.includes("Record to delete not found")
    ) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
