/**
 * Gemini Chat Service Adapter
 * Infrastructure layer - integrates with Google Generative AI
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message } from "@/domain/entities/Message";
import type { IChatService } from "@/ports/IChatService";
import type { Attachment } from "@/shared/contracts/chat.contract";

export class GeminiChatService implements IChatService {
  private genAI: GoogleGenerativeAI;
  private defaultModelName: string;
  private systemInstruction: string;

  constructor(apiKey: string, defaultModelName: string = "gemini-2.5-flash") {
    if (!apiKey) {
      throw new Error("Google Generative AI API key is required");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.defaultModelName = defaultModelName;

    // System instruction for HTML code generation in markdown
    this.systemInstruction = `You are a helpful AI assistant. When generating Terms of Service, Privacy Policies, or any legal/document templates:

1. ALWAYS provide the content in TWO formats:
   - First, provide a readable markdown version
   - Second, provide the COMPLETE HTML code wrapped in a markdown code block

2. The HTML code MUST be:
   - Fully formatted and ready to use
   - Include proper semantic HTML5 tags
   - Include inline CSS styles for professional formatting
   - Be copyable and usable directly
   - Wrapped in markdown code blocks with \`\`\`html

3. Example format:

## Your Content in Markdown

# Terms of Service

## 1. Introduction
Welcome to our service...

## HTML Template (Copy-Ready)

Below is the complete HTML code you can copy and use:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms of Service</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    h1 {
      color: #2c3e50;
      border-bottom: 3px solid #3498db;
      padding-bottom: 10px;
    }
    h2 {
      color: #34495e;
      margin-top: 30px;
    }
    p {
      margin: 15px 0;
    }
  </style>
</head>
<body>
  <h1>Terms of Service</h1>
  <h2>1. Introduction</h2>
  <p>Welcome to our service...</p>
</body>
</html>
\`\`\`

4. For other responses, use markdown formatting with code blocks for any code examples.

Remember: Always make HTML templates complete, production-ready, and easily copyable!`;
  }

  async sendMessage(
    content: string,
    _attachments?: Attachment[],
    context?: Message[],
    modelId?: string,
  ): Promise<Message> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: modelId || this.defaultModelName,
        systemInstruction: this.systemInstruction,
      });

      // Build conversation history for context
      const history = this.buildHistory(context);

      // Start chat with history
      const chat = model.startChat({
        history,
      });

      // Send message
      const result = await chat.sendMessage(content);
      const response = result.response;
      const text = response.text();

      return Message.create("assistant", text);
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error(
        `Failed to get response from Gemini: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async streamMessage(
    content: string,
    _attachments: Attachment[] | undefined,
    context: Message[],
    onChunk: (chunk: string) => void,
    modelId?: string,
  ): Promise<Message> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: modelId || this.defaultModelName,
        systemInstruction: this.systemInstruction,
      });

      // Build conversation history
      const history = this.buildHistory(context);

      // Start chat with history
      const chat = model.startChat({
        history,
      });

      // Stream message
      const result = await chat.sendMessageStream(content);

      let fullResponse = "";

      // Process stream chunks
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        onChunk(chunkText);
      }

      return Message.create("assistant", fullResponse);
    } catch (error) {
      console.error("Gemini Streaming Error:", error);
      throw new Error(
        `Failed to stream response from Gemini: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Build conversation history for Gemini API
   * Converts our Message entities to Gemini's format
   */
  private buildHistory(
    context?: Message[],
  ): Array<{ role: string; parts: Array<{ text: string }> }> {
    if (!context || context.length === 0) {
      return [];
    }

    return context.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));
  }
}
