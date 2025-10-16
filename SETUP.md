# Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
bun install
# or
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Google Generative AI API key:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your-api-key-here
```

### 3. Get Your Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the API key
4. Paste it into `.env.local`

### 4. Run the Development Server

```bash
bun dev
# or
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Environment Variables

### Required

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Generative AI API key | [Google AI Studio](https://makersuite.google.com/app/apikey) |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_MODEL` | Gemini model to use | `gemini-1.5-flash` |

**Available Models:**
- `gemini-1.5-flash` - Fast and efficient (recommended for development)
- `gemini-1.5-pro` - More capable, slower
- `gemini-1.0-pro` - Legacy model

## 🏗️ Architecture

This application uses **Hexagonal Architecture** (Ports & Adapters):

```
Frontend (React)
    ↓ calls
API Routes (/api/chat)
    ↓ uses
Use Cases (Application Layer)
    ↓ depends on
Ports (Interfaces)
    ↑ implemented by
Adapters (Gemini, Database, etc.)
```

### Key Components

**Domain Layer** (`src/domain/`)
- Pure business logic
- Framework-independent entities
- `Message`, `ChatThread`

**Application Layer** (`src/application/usecases/`)
- Use cases orchestrate domain logic
- `SendMessageUseCase`, `StreamMessageUseCase`

**Ports** (`src/ports/`)
- Interfaces for external dependencies
- `IChatService`, `IChatRepository`

**Adapters** (`src/adapters/`)
- Implementations of ports
- `GeminiChatService` - Google AI integration
- `ApiChatService` - Frontend API client
- `InMemoryChatRepository` - Storage

**Infrastructure** (`src/infra/`)
- Dependency injection containers
- Environment configuration

## 🔧 Development

### Running Locally

```bash
# Development mode with hot reload
bun dev

# Build for production
bun build

# Start production server
bun start
```

### Code Quality

```bash
# Run linter
bun lint

# Format code
bun format
```

### Testing (Coming Soon)

```bash
# Run unit tests
bun test

# Run with coverage
bun test:coverage
```

## 🌐 API Endpoints

### POST /api/chat

Send a message and get a response.

**Request:**
```json
{
  "content": "Hello, how are you?",
  "attachments": [],
  "context": []
}
```

**Response:**
```json
{
  "message": {
    "id": "msg-123",
    "role": "assistant",
    "content": "I'm doing well, thank you!",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "threadId": "thread-456"
}
```

### POST /api/chat/stream

Stream a message response using Server-Sent Events (SSE).

**Request:** Same as `/api/chat`

**Response:** SSE stream
```
data: {"chunk": "I'm"}
data: {"chunk": " doing"}
data: {"chunk": " well!"}
data: [DONE]
```

## 🔄 Switching AI Providers

The architecture makes it easy to swap AI providers:

### Use OpenAI Instead of Gemini

1. **Install OpenAI SDK**
```bash
bun add openai
```

2. **Create Adapter**
```typescript
// src/adapters/OpenAIChatService.ts
export class OpenAIChatService implements IChatService {
  // Implement interface
}
```

3. **Update Server Container**
```typescript
// src/infra/di/container.server.ts
this._chatService = new OpenAIChatService(apiKey);
```

4. **Done!** No changes to domain, use cases, or frontend.

## 📦 Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Docker

```bash
# Build image
docker build -t firstread .

# Run container
docker run -p 3000:3000 \
  -e GOOGLE_GENERATIVE_AI_API_KEY=your-key \
  firstread
```

### Environment Variables in Production

Make sure to set these in your deployment platform:
- `GOOGLE_GENERATIVE_AI_API_KEY` (required)
- `GEMINI_MODEL` (optional)
- `NODE_ENV=production`

## 🐛 Troubleshooting

### "No API key found" Error

**Problem:** Backend is using Mock adapter instead of Gemini.

**Solution:** 
1. Check `.env.local` exists
2. Verify `GOOGLE_GENERATIVE_AI_API_KEY` is set
3. Restart dev server

### API Errors

**Problem:** Getting 500 errors from `/api/chat`

**Solution:**
1. Check browser console for errors
2. Verify API key is valid
3. Check rate limits (Gemini has usage limits)

### Streaming Not Working

**Problem:** Messages not streaming

**Solution:**
1. Ensure you're using `/api/chat/stream` endpoint
2. Check browser supports EventSource
3. Verify network tab shows SSE connection

## 📚 Documentation

- [Hexagonal Architecture Guide](./docs/HEXAGONAL_ARCHITECTURE.md)
- [API Integration Guide](./docs/API_INTEGRATION.md) (Coming soon)
- [Testing Guide](./docs/TESTING.md) (Coming soon)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the architecture guidelines
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE)

---

**Need Help?**
- 📖 [Documentation](./docs/)
- 🐛 [Report Issues](https://github.com/your-repo/issues)
- 💬 [Discussions](https://github.com/your-repo/discussions)

