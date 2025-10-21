/**
 * Chat History API Route - Infrastructure Layer
 * Fetches user's chat thread history
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/infra/database/prisma";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch user's chat threads with message counts
    const threads = await prisma.chatThread.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        messages: {
          select: {
            id: true,
            timestamp: true,
          },
          orderBy: {
            timestamp: "desc",
          },
          take: 1,
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Transform the data
    const formattedThreads = threads.map((thread) => ({
      id: thread.id,
      title: thread.title || "Untitled Conversation",
      messageCount: thread._count.messages,
      lastMessageAt: thread.messages[0]?.timestamp || thread.updatedAt,
      createdAt: thread.createdAt,
    }));

    return NextResponse.json({
      threads: formattedThreads,
    });
  } catch (error) {
    console.error("Failed to fetch chat history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
