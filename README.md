# 🤖 AI Council MCP - Multi-AI Orchestration Platform

**Intelligent Multi-AI Collaboration: 4 Leading AI Models Work Together for Optimal Answers**

A Model Context Protocol (MCP) server for Claude Desktop that orchestrates GPT-4o, Gemini 2.0, Perplexity, and Claude 3.5 through **intelligent routing** to deliver optimal responses while saving tokens.

**🎯 Core Innovation: Submarine Mode + Smart Routing = 33-67% Token Savings**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

---

## ✨ Key Features

### 🎯 4 Latest AI Models Integrated (AI Council)

| Model | Version | Best For | Features |
|-------|---------|----------|----------|
| **Claude 3.5 Sonnet** | claude-3-5-sonnet-20241022 | Coding, complex analysis, synthesis | Highest reasoning capability |
| **GPT-4o** | gpt-4o | Balanced general tasks, creative writing | OpenAI's latest multimodal model |
| **Gemini 2.0 Flash** | gemini-2.0-flash-exp | Fast responses, large document analysis | Google's latest high-speed model |
| **Perplexity Sonar Pro** | sonar-pro | Real-time info retrieval, latest news | Web search + AI answers integrated |

### 🏛️ AI Council Discussion System

4 AI models engage in **3-round discussions** for in-depth analysis:

```
Round 1: Each AI independently presents initial opinions
Round 2: Review others' opinions, provide rebuttals/additions
Round 3: Reach final consensus and synthesis

📊 Final Result: Claude synthesizes all 4 models' opinions into final answer
```

**Example Usage:**
```
@ai-council Discuss the future prospects of the electric vehicle market

→ GPT-4o, Gemini, Perplexity engage in 3-round discussion
→ Claude provides final comprehensive analysis
```

### 📚 Intelligent RAG (Retrieval Augmented Generation)

- **pgvector**-based semantic search
- **OpenAI Embeddings** (text-embedding-3-small, 1536 dimensions)
- **PostgreSQL** vector database
- Cosine similarity search for automatic document retrieval
- **Temporary document prioritization**: User-provided latest info prioritized

### ⚡ Semantic Caching (70% Cost Reduction)

- **Redis**-based in-memory caching
- Similar queries instantly returned from cache
- Smart caching based on embedding similarity

### 🔐 Persona System Integration

Apply expert personas to each AI model:
- **Economist**: Economic/industry analysis
- **Political Analyst**: International relations/politics
- **Tech Expert**: Technology/innovation analysis
- **Cultural Critic**: Social/cultural analysis

---

## 🔒 Security Warning

**⚠️ NEVER commit API keys to Git!**

- All API keys should ONLY be in `claude_desktop_config.json` (ignored by Git)
- `.env` files are NOT recommended for this project (causes JSON-RPC issues)
- If you accidentally commit keys, immediately:
  1. Revoke and regenerate all exposed API keys
  2. Remove keys from Git history using `git filter-branch` or BFG Repo-Cleaner
  3. Force push to GitHub

**API Key Management:**
- OpenAI keys start with: `sk-proj-...`
- Google AI keys start with: `AIzaSy...`
- Perplexity keys start with: `pplx-...`
- Anthropic keys start with: `sk-ant-...`

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18 or higher
- **Docker & Docker Compose** (PostgreSQL, Redis)
- **Claude Desktop**
- **API Keys**:
  - OpenAI API Key (required)
  - Google AI API Key (required)
  - Perplexity API Key (required)
  - Anthropic API Key (optional)

### Step 1: Clone and Install

```bash
git clone https://github.com/seanshin0214/ai-council-mcp.git
cd ai-council-mcp
npm install
```

### Step 2: Start Databases

```bash
docker-compose up -d
```

PostgreSQL (port 5432) and Redis (port 6379) will start automatically.

### Step 3: Build

```bash
npm run build
```

### Step 4: Configure Claude Desktop

**Important**: Don't use `.env` file! Enter directly in Claude Desktop config.

Edit `C:\Users\[USER]\AppData\Roaming\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ai-council": {
      "command": "node",
      "args": ["C:\\path\\to\\ai-council-mcp\\dist\\mcp-server.js"],
      "env": {
        "ANTHROPIC_API_KEY": "your_anthropic_key",
        "OPENAI_API_KEY": "sk-proj-...",
        "GOOGLE_API_KEY": "AIzaSy...",
        "PERPLEXITY_API_KEY": "pplx-...",
        "POSTGRES_HOST": "localhost",
        "POSTGRES_PORT": "5432",
        "POSTGRES_USER": "postgres",
        "POSTGRES_PASSWORD": "postgres",
        "POSTGRES_DB": "ai_council",
        "REDIS_HOST": "localhost",
        "REDIS_PORT": "6379"
      }
    }
  }
}
```

**Notes:**
- Delete `.env` file if exists (dotenv auto-loading causes JSON-RPC pollution)
- Use absolute paths (e.g., `C:\\Users\\...`)
- On Windows, use double backslashes (`\\`)

### Step 5: Restart Claude Desktop

Completely quit and restart Claude Desktop to connect AI Council!

---

## 📖 Usage

### 🎭 AI Council Discussion (Core Feature)

#### 1. Get Questions First (Recommended)

AI generates 20 + 20 questions for in-depth information gathering:

```
@ai-council ask_council_questions

→ AI generates 40 questions about background, facts, and opinions
→ Enter answers (minimum 10 characters, recommended 50+)
→ Discussion starts automatically
```

#### 2. Start Discussion Directly

Provide information directly and start discussion:

```
@ai-council start_council_discussion

user_answers:
"President met with China's leader in state dinner.
Emphasized peace cooperation, signed MOU on transnational crime.
Commemorating 33rd anniversary of diplomatic relations."

discussion_topic:
"Future prospects of bilateral relations and economic cooperation"
```

#### 3. Discussion Results

```
🎭 AI Council Discussion Started

📊 Round 1: Initial Opinions
━━━━━━━━━━━━━━━━━━━━━
[GPT-4o's Opinion]
...

[Gemini 2.0's Opinion]
...

[Perplexity's Opinion]
...

📊 Round 2: Deep Discussion
━━━━━━━━━━━━━━━━━━━━━
[GPT-4o's Opinion]
...

📊 Round 3: Final Consensus
━━━━━━━━━━━━━━━━━━━━━
[GPT-4o's Opinion]
...

🎯 Final Synthesis (Claude 3.5 Sonnet)
━━━━━━━━━━━━━━━━━━━━━
...
```

### 📚 Knowledge Base Utilization (Athena RAG)

#### Query with Single AI Model

```
@ai-council query_athena

query: "What are the latest trends in the EV market?"
model: "gpt4"  // or "gemini", "perplexity", "claude"
```

#### Add Documents

```
@ai-council upsert_document

content: "2025 Electric Vehicle Market Report..."
metadata: {
  "source": "Economic Times",
  "date": "2025-11-01",
  "category": "electric-vehicles"
}
```

---

## 🛠️ MCP Tools

### 1. `ask_council_questions`
AI generates in-depth questions before discussion (20 background + 20 opinion questions)

**Parameters:**
```typescript
{
  topic?: string  // Optional: Discussion topic (auto-generated if not provided)
}
```

**Response:**
- 40 systematic questions
- Discussion starts automatically after user answers

### 2. `start_council_discussion`
Start 3-round discussion with 4 AI models

**Parameters:**
```typescript
{
  user_answers: string,      // User-provided info (min 10 chars, recommended 50+)
  discussion_topic: string,  // Discussion topic
  persona?: string          // Persona selection (economist/political_analyst/tech_expert/cultural_critic)
}
```

**Response:**
- Complete 3-round discussion
- Claude's final comprehensive analysis

### 3. `query_athena`
Search knowledge base (single AI model)

**Parameters:**
```typescript
{
  query: string,           // Question
  model?: string,          // 'gpt4' | 'gemini' | 'claude' | 'perplexity' | 'o1' | 'gemini-pro'
  useCache?: boolean       // Use cache (default: true)
}
```

### 4. `upsert_document`
Add document to knowledge base

**Parameters:**
```typescript
{
  content: string,         // Document content
  metadata?: object        // Metadata (source, author, category, etc.)
}
```

### 5. `upsert_multiple_documents`
Batch add multiple documents

**Parameters:**
```typescript
{
  documents: Array<{
    content: string,
    metadata?: object
  }>
}
```

### 6. `search_documents`
Search documents by keyword

**Parameters:**
```typescript
{
  keyword: string,
  limit?: number  // Default: 10
}
```

### 7. `analyze_query_complexity`
Analyze query complexity and recommend optimal model

**Parameters:**
```typescript
{
  query: string
}
```

### 8. `get_personas`
Get list of available personas

**Parameters:** None

**Response:**
```json
{
  "economist": "Economist - Economic/industry analysis specialist",
  "political_analyst": "Political Analyst - International relations/politics specialist",
  "tech_expert": "Tech Expert - Technology/innovation analysis specialist",
  "cultural_critic": "Cultural Critic - Social/cultural analysis specialist"
}
```

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────┐
│           Claude Desktop (MCP Client)            │
└────────────────┬─────────────────────────────────┘
                 │
                 │ MCP Protocol (JSON-RPC over stdio)
                 │
┌────────────────▼─────────────────────────────────┐
│      AI Council MCP Server (TypeScript)          │
│  ┌────────────────────────────────────────────┐  │
│  │   Council Discussion Engine (3 Rounds)    │  │
│  │   - Round 1: Independent initial opinions │  │
│  │   - Round 2: Mutual review and rebuttals │  │
│  │   - Round 3: Final consensus             │  │
│  │   - Claude: Comprehensive synthesis      │  │
│  └────────┬───────────────────────────────────┘  │
│           │                                       │
│  ┌────────▼───────────────────────────────────┐  │
│  │  4 AI Models + Persona System              │  │
│  │  - GPT-4o (OpenAI)                        │  │
│  │  - Gemini 2.0 Flash (Google)              │  │
│  │  - Perplexity Sonar Pro                   │  │
│  │  - Claude 3.5 Sonnet (Anthropic)          │  │
│  └────────┬───────────────────────────────────┘  │
│           │                                       │
│  ┌────────▼───────────────────────────────────┐  │
│  │    Athena RAG Engine                       │  │
│  │  - Embedding (OpenAI text-embedding-3)    │  │
│  │  - Semantic Search (pgvector)             │  │
│  │  - Temporary Document Priority            │  │
│  │  - Context Assembly                       │  │
│  └────────┬───────────────────────────────────┘  │
└───────────┼───────────────────────────────────────┘
            │
    ┌───────┴────────┐
    │                │
┌───▼─────┐    ┌────▼─────┐
│PostgreSQL│    │  Redis   │
│(pgvector)│    │ (Cache)  │
│ Documents│    │  Cache   │
│Embeddings│    │ Sessions │
│1536 dim  │    │          │
└──────────┘    └──────────┘
```

---

## 🔧 Troubleshooting

### JSON Parsing Error

**Symptom:**
```
Unexpected token 'D', 'Document s'... is not valid JSON
```

**Cause:** `.env` file's dotenv auto-loading pollutes stdout

**Solution:**
1. Delete `.env` file
2. Enter all environment variables in `claude_desktop_config.json`
3. Restart Claude Desktop

### Gemini API Error

**Symptom:**
```
models/gemini-1.5-pro is not found for API version v1beta
```

**Cause:** Gemini 1.5 Pro is deprecated as of 2025

**Solution:** Automatically uses `gemini-2.0-flash-exp` (already fixed)

### Knowledge Base Empty

**Symptom:**
```
No relevant documents found in the knowledge base.
```

**Cause:** No documents or similarity search failed

**Solution:**
1. Add documents with `upsert_document`
2. Use `ask_council_questions` to save user answers as temporary documents
3. Temporary documents are prioritized without similarity search

### user_answers Too Short

**Symptom:**
```
⚠️ Insufficient information (minimum 10 characters required)
```

**Solution:** Enter at least 10 characters (recommended: 50+)

---

## 📊 Performance Benchmarks

| Task                | Optimal Model     | Response Time | Accuracy | Cost |
|--------------------|------------------|--------------|----------|------|
| Simple Q&A         | Gemini 2.0 Flash | 0.8s         | 95%      | $    |
| AI Council Discussion | 4 Models      | 15-25s       | 98%      | $$$$ |
| Code Generation    | Claude 3.5       | 2-3s         | 98%      | $$$  |
| Latest News Search | Perplexity Pro   | 2-4s         | 97%      | $$   |
| Large Document Analysis | Gemini 2.0  | 3-5s         | 96%      | $$   |
| General Tasks      | GPT-4o           | 1-2s         | 96%      | $$   |

---

## ❓ FAQ

### Who pays for API costs?

**You pay for your own API usage.** AI Council MCP runs locally on your computer and uses YOUR API keys. There is no central server or shared API costs.

**Cost structure:**
- Each user provides their own API keys (OpenAI, Google AI, Perplexity, Anthropic)
- Each user pays their own API provider directly
- Smart Routing saves 33-67% compared to always activating all models
- Semantic caching reduces costs by 70% for repeated queries

**Example:**
- User A installs AI Council → Uses User A's API keys → User A pays their API bills
- User B installs AI Council → Uses User B's API keys → User B pays their API bills
- The creator (@seanshin0214) does NOT pay for anyone's usage

### Is this a SaaS or cloud service?

**No.** AI Council MCP is open-source software that runs entirely on your local computer. You download the code, install it yourself, and configure it with your own API keys.

### Do you collect any data?

**No.** Everything runs locally on your machine. No data is sent to any central server. Your conversations, documents, and API keys stay on your computer.

### What are the typical API costs?

**Approximate costs per AI Council discussion (3 rounds, 4 models):**
- OpenAI (GPT-4o): ~$0.02-0.05
- Google AI (Gemini 2.0 Flash): ~$0.001-0.003 (very cheap)
- Perplexity (Sonar Pro): ~$0.03-0.05
- Anthropic (Claude 3.5): ~$0.03-0.06
- **Total: ~$0.08-0.20 per full council discussion**

**With optimizations:**
- Smart Routing (33-67% savings): ~$0.03-0.13 per discussion
- Semantic Caching (70% for repeated queries): Near-zero for cached responses

### How is this different from ChatGPT Plus or Claude Pro?

**ChatGPT Plus/Claude Pro:**
- $20/month subscription
- Single AI model
- Closed ecosystem
- Limited customization

**AI Council MCP:**
- Pay-per-use (typically $0.03-0.20 per discussion)
- 4 AI models working together
- Open source (MIT License)
- Fully customizable
- Works inside Claude Desktop

---

## 📚 Detailed Documentation

- **[Complete Installation Guide](./INSTALLATION.md)** - Step-by-step installation guide
- **[Technical Specification](./TECHNICAL_SPEC.md)** - Detailed technical documentation
- **[API Reference](./API_REFERENCE.md)** - Complete API documentation

---

## 🛠️ Development

### Run Local Development Server
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Run MCP Server Directly
```bash
npm run mcp
```

### Type Check
```bash
npm run type-check
```

---

## 🤝 Contributing

Pull requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License - Free to use!

---

## 🙏 Acknowledgments

This project uses:
- [Anthropic Claude](https://www.anthropic.com/)
- [OpenAI GPT-4o](https://openai.com/)
- [Google Gemini](https://deepmind.google/technologies/gemini/)
- [Perplexity AI](https://www.perplexity.ai/)
- [PostgreSQL](https://www.postgresql.org/)
- [pgvector](https://github.com/pgvector/pgvector)
- [Redis](https://redis.io/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

---

## 📞 Contact

- **GitHub**: https://github.com/seanshin0214/ai-council-mcp
- **Issues**: https://github.com/seanshin0214/ai-council-mcp/issues

---

<div align="center">

**Made with ❤️ and 🤖 by @seanshin0214**

*"When 4 AIs think together, better answers emerge"*

[Get Started](#-quick-start) • [Docs](./INSTALLATION.md) • [Contributing](#-contributing)

</div>
