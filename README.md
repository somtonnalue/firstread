# FirstRead - AI Document Generator

Generate professional documents instantly with AI. Create Terms of Service, Privacy Policies, legal documents, and website content with **Google Gemini AI**. Download as HTML or PDF.

Built with **Hexagonal Architecture** and enterprise-grade code organization by [@somtonnalue](https://twitter.com/somtonnalue).

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Gemini](https://img.shields.io/badge/Gemini-2.5-4285F4?style=for-the-badge&logo=google)
![Architecture](https://img.shields.io/badge/Architecture-Hexagonal-green?style=for-the-badge)

---

## 📖 Documentation

**→ [TRADE-OFFS.md](./TRADE-OFFS.md)** - Architecture decisions, pros/cons, and why I chose Hexagonal Architecture  
**→ [SETUP.md](./SETUP.md)** - Complete installation and configuration guide

---

## ✨ Features

### 🎨 User Experience
- **Modern UI/UX** - Claude-inspired interface with smooth animations
- **🌓 Dark Mode** - Full theme support with system preference detection
- **⚡ Real-Time Streaming** - See AI type word-by-word with blinking cursor
- **💬 Typing Indicator** - Bouncing dots while AI thinks
- **📝 Rich Markdown** - Full markdown with syntax-highlighted code blocks
- **📎 File Attachments** - Support for image and document uploads (UI ready)
- **📥 Download Templates** - Export HTML as HTML or PDF files
- **🎯 Model Selection** - Choose from 5 Gemini models
- **📤 Export Chats** - Save conversations as JSON

### 🤖 AI Capabilities
- **Smart HTML Generation** - Automatically provides copyable HTML templates
- **Document Templates** - Terms of Service, Privacy Policies, etc. with styling
- **Dual Format Output** - Markdown + Production-ready HTML code
- **Context Awareness** - Remembers conversation history
- **Professional Styling** - Generated HTML includes inline CSS

### 🏗️ Technical Excellence
- **Hexagonal Architecture** - Clean separation of domain, application, and infrastructure
- **Ports & Adapters** - Easy to swap AI providers and storage solutions
- **Dependency Injection** - Fully configured DI containers (client & server)
- **Type Safety** - 100% TypeScript with Zod runtime validation
- **Testable** - Each layer can be tested in isolation
- **Production Ready** - Edge runtime, streaming, error handling
- **Accessible** - WCAG 2.1 AA compliant with Radix UI
- **Responsive** - Works on all device sizes

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd firstread
bun install
```

### 2. Get Google AI API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your API key

### 3. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
GOOGLE_GENERATIVE_AI_API_KEY=your-actual-api-key-here
```

### 4. Run

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🤖 Available Gemini Models

| Model                     | Description                     | Best For                         | Context   |
| ------------------------- | ------------------------------- | -------------------------------- | --------- |
| **Gemini 2.5 Pro**        | State-of-the-art thinking model | Complex reasoning, code analysis | 2M tokens |
| **Gemini 2.5 Flash** ⭐    | Best price-performance          | General purpose (default)        | 1M tokens |
| **Gemini 2.5 Flash-Lite** | Fastest, cost-efficient         | High volume, simple tasks        | 1M tokens |
| **Gemini 2.0 Flash**      | Proven workhorse                | Stable production workloads      | 1M tokens |
| **Gemini 2.0 Flash-Lite** | Small, efficient                | Budget-conscious apps            | 1M tokens |

**Default:** Gemini 2.5 Flash (best balance)


---

## 📁 Architecture

```
┌─────────────────────────────────────────────────┐
│         PRESENTATION (Frontend - React)          │
│         Components + Hooks + UI                 │
└───────────────────┬─────────────────────────────┘
                    │ HTTP (Streaming)
                    ▼
┌─────────────────────────────────────────────────┐
│            API ROUTES (Backend)                  │
│    /api/chat  |  /api/chat/stream               │
└───────────────────┬─────────────────────────────┘
                    │ DI Container
                    ▼
┌─────────────────────────────────────────────────┐
│         APPLICATION (Use Cases)                  │
│   SendMessage │ StreamMessage │ ManageThread    │
└───────┬──────────────────┬──────────────────────┘
        │                  │
        ▼                  ▼
┌──────────────┐    ┌─────────────────┐
│   PORTS      │    │  DOMAIN         │
│ (Interfaces) │    │  (Entities)     │
│ IChatService │    │  Message        │
│ IRepository  │    │  ChatThread     │
└──────┬───────┘    └─────────────────┘
       │
       ▼
┌──────────────────────┐
│  ADAPTERS            │
│ • GeminiChatService  │ ← Google AI Integration
│ • ApiChatService     │ ← Frontend API Client
│ • InMemoryRepo       │ ← Storage
└──────────────────────┘
```

**Benefits:**
- ✅ Easy to swap AI providers (Gemini → OpenAI → Claude)
- ✅ Testable at every layer
- ✅ Framework independent business logic
- ✅ No vendor lock-in

---

## 📦 Tech Stack

| Layer             | Technology                          | Version |
| ----------------- | ----------------------------------- | ------- |
| **Framework**     | Next.js (App Router + Edge Runtime) | 15.5.5  |
| **UI**            | React                               | 19.1.0  |
| **Language**      | TypeScript (strict mode)            | 5.x     |
| **AI**            | Google Generative AI (Gemini)       | Latest  |
| **Styling**       | Tailwind CSS                        | 4.x     |
| **Components**    | shadcn/ui (Radix UI)                | Latest  |
| **Validation**    | Zod                                 | 4.1.12  |
| **Markdown**      | react-markdown + rehype-highlight   | Latest  |
| **PDF**           | html2pdf.js + jspdf                 | Latest  |
| **Icons**         | Lucide React                        | 0.545.0 |
| **Notifications** | Sonner                              | 2.0.7   |
| **Theme**         | next-themes                         | 0.4.6   |
| **Linter**        | Biome                               | 2.2.0   |

---

## 🎯 Key Features

### 1. Real-Time Streaming
```
Type a message → AI thinking (● ● ●) → Text streams word by word → Cursor blinks ▊
```

### 2. HTML Template Generation
```
Request: "Generate Terms of Service"
Response: Markdown + Complete HTML template with styling
Action: Download as HTML or PDF
```

### 3. Download Documents
- **HTML** - Instant download, ready to deploy
- **PDF** - High-quality A4 format, ready to share

### 4. Message Actions
- **Copy** - One-click clipboard
- **Download** - HTML/PDF options (when HTML detected)
- **Regenerate** - Get new response (infrastructure ready)

---

## 🛠️ Available Scripts

```bash
# Development
bun dev          # Start dev server with hot reload
bun build        # Build for production
bun start        # Start production server

# Code Quality
bun lint         # Run Biome linter
bun format       # Format code automatically
```

---

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup and installation guide
- **[MODELS_GUIDE.md](./MODELS_GUIDE.md)** - Gemini models comparison and selection
- **[README.md](./README.md)** - This file (overview and getting started)

---

## 🔌 API Endpoints

### POST /api/chat
Standard message endpoint (JSON response)

**Request:**
```json
{
  "content": "Generate a Privacy Policy",
  "context": []
}
```

**Response:**
```json
{
  "message": {
    "id": "msg-123",
    "role": "assistant",
    "content": "Here's your privacy policy...",
    "timestamp": "2024-01-01T00:00:00Z"
  },
  "threadId": "thread-456"
}
```

### POST /api/chat/stream
Streaming endpoint (Server-Sent Events)

**Request:** Same as `/api/chat`

**Response:** SSE stream
```
data: {"chunk": "Here's"}
data: {"chunk": " your"}
data: {"chunk": " policy..."}
data: [DONE]
```

---

## 🚢 Deployment

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push to GitHub
2. Import in Vercel
3. Add `GOOGLE_GENERATIVE_AI_API_KEY` in environment variables
4. Deploy!

### Docker

```bash
docker build -t firstread .
docker run -p 3000:3000 \
  -e GOOGLE_GENERATIVE_AI_API_KEY=your-key \
  firstread
```

### Environment Variables

**Required:**
- `GOOGLE_GENERATIVE_AI_API_KEY` - Your Google AI API key

**Optional:**
- `GEMINI_MODEL` - Default model (defaults to `gemini-2.5-flash`)

---

## 🎓 Example Use Cases

### Legal Documents
```
✅ Terms of Service → HTML + PDF download
✅ Privacy Policy → GDPR compliant + styled
✅ Cookie Policy → Professional template
✅ User Agreement → Ready to deploy
```

### Website Content
```
✅ About Us pages → Complete HTML with CSS
✅ Landing pages → Modern, responsive
✅ FAQ sections → Structured and styled
```

### Development
```
✅ Code review and analysis (use 2.5 Pro)
✅ Generate React components
✅ Debug assistance
✅ Algorithm explanations
```

---

## 🤝 Contributing

This project follows:
- **Hexagonal Architecture** principles
- **TypeScript strict mode**
- **Biome** for linting/formatting
- **Conventional Commits** (recommended)

### Adding Features

1. Define domain entities (if needed)
2. Create use case in application layer
3. Define port (interface) for external dependencies
4. Implement adapter
5. Wire in DI container
6. Update UI

---

## 🎯 Roadmap

### Current (v1.0) ✅
- ✅ Hexagonal Architecture
- ✅ Gemini 2.5 integration
- ✅ Real-time streaming with animations
- ✅ HTML template generation
- ✅ Download as HTML/PDF
- ✅ Complete type safety

### Planned (v2.0)
- [ ] Database persistence (PostgreSQL)
- [ ] User authentication
- [ ] Chat history sidebar
- [ ] Multi-modal support (image uploads)
- [ ] Response caching
- [ ] Rate limiting
- [ ] Multiple AI providers with fallback
- [ ] Unit & E2E tests

---

## 📄 License

MIT License - See [LICENSE](./LICENSE)

---

## 👨‍💻 Author

**Somtochukwu N Leroy** ([@somtonnalue](https://twitter.com/somtonnalue))

Connect on all platforms: **@somtonnalue**
- [Twitter/X](https://twitter.com/somtonnalue)
- [GitHub](https://github.com/somtonnalue)
- [LinkedIn](https://linkedin.com/in/somtonnalue)

---

## 🙏 Acknowledgments

- **Architecture**: Alistair Cockburn's Hexagonal Architecture
- **Design**: Inspired by [Claude](https://claude.ai)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide](https://lucide.dev/)
- **AI**: [Google Generative AI](https://ai.google.dev/)

---

## 📞 Support

- 📖 [Documentation](./docs/)
- 🐛 [Issues](https://github.com/somtonnalue/firstread/issues)
- 💬 [Twitter/X](https://twitter.com/somtonnalue)

---

**Built with ❤️ by Somtochukwu N Leroy (@somtonnalue)**

**Features:** AI Document Generation • Real-time Streaming • HTML/PDF Downloads • Hexagonal Architecture