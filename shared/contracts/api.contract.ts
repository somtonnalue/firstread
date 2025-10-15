/**
 * API Contracts - Request/Response schemas for HTTP endpoints
 * Following contract-first principle
 */

import { z } from "zod";
import { AttachmentSchema, MessageRoleSchema } from "./chat.contract";

// ============================================================
// CHAT API CONTRACTS
// ============================================================

/**
 * Message schema for API (timestamps as ISO strings)
 * Dates are serialized as strings over HTTP
 */
export const ApiMessageSchema = z.object({
  id: z.string(),
  role: MessageRoleSchema,
  content: z.string(),
  timestamp: z.coerce.date(), // Accepts string and converts to Date
  isStreaming: z.boolean().optional(),
  attachments: z.array(AttachmentSchema).optional(),
});

/**
 * POST /api/chat - Send a message
 */
export const ChatRequestSchema = z.object({
  content: z.string().min(1, "Message content is required"),
  attachments: z.array(AttachmentSchema).optional(),
  threadId: z.string().optional(),
  modelId: z.string().optional(),
  context: z.array(ApiMessageSchema).optional(),
});

export const ChatResponseSchema = z.object({
  message: ApiMessageSchema,
  threadId: z.string(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;

/**
 * POST /api/chat/stream - Stream a message
 */
export const ChatStreamRequestSchema = ChatRequestSchema;

export type ChatStreamRequest = z.infer<typeof ChatStreamRequestSchema>;

// ============================================================
// ERROR RESPONSE CONTRACT
// ============================================================

export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
