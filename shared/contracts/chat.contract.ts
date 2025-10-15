/**
 * Chat Contracts - Shared types and Zod schemas
 * Following contract-first principle
 */

import { z } from "zod";

// ============================================================
// SCHEMAS
// ============================================================

export const MessageRoleSchema = z.enum(["user", "assistant", "system"]);

export const AttachmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  size: z.number(),
  url: z.string().optional(),
});

export const MessageSchema = z.object({
  id: z.string(),
  role: MessageRoleSchema,
  content: z.string(),
  timestamp: z.date(),
  isStreaming: z.boolean().optional(),
  attachments: z.array(AttachmentSchema).optional(),
});

export const ChatThreadSchema = z.object({
  id: z.string(),
  title: z.string(),
  messages: z.array(MessageSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ChatModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  maxTokens: z.number(),
});

// ============================================================
// INFERRED TYPES (DTOs)
// ============================================================

export type MessageRole = z.infer<typeof MessageRoleSchema>;
export type Attachment = z.infer<typeof AttachmentSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type ChatThread = z.infer<typeof ChatThreadSchema>;
export type ChatModel = z.infer<typeof ChatModelSchema>;

// ============================================================
// REQUEST/RESPONSE CONTRACTS
// ============================================================

export const SendMessageRequestSchema = z.object({
  content: z.string().min(1),
  attachments: z.array(AttachmentSchema).optional(),
  threadId: z.string().optional(),
  modelId: z.string().optional(),
});

export const SendMessageResponseSchema = z.object({
  message: MessageSchema,
  threadId: z.string(),
});

export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;
export type SendMessageResponse = z.infer<typeof SendMessageResponseSchema>;

// ============================================================
// CONSTANTS
// ============================================================

export const AVAILABLE_MODELS: ChatModel[] = [
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    description: "State-of-the-art thinking model for complex reasoning",
    maxTokens: 2000000,
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "Best price-performance, well-rounded capabilities",
    maxTokens: 1000000,
  },
  {
    id: "gemini-2.5-flash-lite",
    name: "Gemini 2.5 Flash-Lite",
    description: "Fastest model optimized for cost-efficiency",
    maxTokens: 1000000,
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    description: "Second generation workhorse with 1M token context",
    maxTokens: 1000000,
  },
  {
    id: "gemini-2.0-flash-lite",
    name: "Gemini 2.0 Flash-Lite",
    description: "Second generation small workhorse model",
    maxTokens: 1000000,
  },
];
