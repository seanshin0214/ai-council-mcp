# AI Council MCP
> **Generate → Debate → Evolve**
> An MCP-native, multi-model debate engine for more reliable answers and auditable reasoning.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-blue)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](#)
[![MCP](https://img.shields.io/badge/MCP-Compatible-brightgreen)](https://modelcontextprotocol.io/)
[![Version](https://img.shields.io/badge/Version-2.0.0-success)](#)

> **Non-affiliation notice**
> This project is **not affiliated with** Google DeepMind or any model provider.
> "Generate–Debate–Evolve" is used as a generic description of a multi-agent deliberation pattern.

---

## What is AI Council?

**AI Council MCP** is a debate orchestrator that coordinates multiple LLMs through structured rounds of:
1. **independent generation**,
2. **cross-examination**, and
3. **final synthesis**.

The goal is not to "sound smart" — it's to make answers:
- **more robust** (less single-model brittleness),
- **more transparent** (who claimed what and why),
- **more controllable** (cost/latency policies via Submarine Mode),
- and **more reusable** (exposed as MCP tools).

---

## Why debate (instead of one-shot answers)?

Single-model outputs can be fast but fragile:
- hidden assumptions go unchallenged
- confident errors slip through
- important counterexamples are missed

AI Council forces explicit critique before final synthesis.

> Recommended mindset: "reduce error risk" rather than "eliminate hallucination."

---

## How it works (3-Round Council)

### Round 1 — Generate (Divergence)
Each model produces an answer **independently** (no peeking at others).

### Round 2 — Debate (Cross-examination)
Each model must:
- identify weak assumptions
- present counterexamples
- propose improvements
- flag uncertainty / missing evidence

### Round 3 — Evolve (Convergence)
A designated "Chair" model (Claude) synthesizes:
- the strongest claims
- the best critiques
- an updated conclusion
- and a short risk/next-checklist

---

## Key Features

### 1. Multi-model orchestration (4 AI Models)
| Model | Version | Best For |
|-------|---------|----------|
| **Claude 3.5 Sonnet** | claude-3-5-sonnet-20241022 | Complex reasoning, synthesis |
| **GPT-4o** | gpt-4o | Balanced general tasks |
| **Gemini 2.0 Flash** | gemini-2.0-flash-exp | Fast responses, large docs |
| **Perplexity Sonar Pro** | sonar-pro | Real-time web search |

### 2. Submarine Mode (33-67% Token Savings)
Non-selected models stay in standby to reduce costs. Only activated models participate in each round.

### 3. Semantic Caching (Redis)
Cache semantically similar queries to reduce cost and latency (~70% for repeated queries).

### 4. RAG System (Athena)
- PostgreSQL + pgvector for semantic search
- OpenAI embeddings (text-embedding-3-small, 1536 dimensions)
- Temporary document prioritization

### 5. Persona System
Apply expert perspectives to each AI model:
- Economist, Political Analyst, Tech Expert, Cultural Critic

### 6. Audit-friendly traces
Save prompts, critiques, and synthesis inputs/outputs for review.

---

## MCP Tools (8 Total)

| Tool | Description |
|------|-------------|
| `query_knowledge_base` | RAG search + automatic model selection |
| `add_document` | Add single document with auto-chunking + embedding |
| `add_multiple_documents` | Batch document upload |
| `analyze_query_complexity` | Estimate complexity + recommend routing |
| `search_documents` | Keyword search across documents |
| `request_knowledge` | Request info when knowledge base is empty |
| `ask_council_questions` | Generate 40 structured questions before debate |
| `start_council_discussion` | Run 3-round multi-model debate |

---

## Architecture

```
MCP Client (Claude Desktop / IDE / Agent Runtime)
        |
        | JSON-RPC (MCP)
        v
+-----------------------------------+
|        AI Council MCP Server      |
| - Smart Router / Submarine Mode   |
| - Debate Orchestrator (3 rounds)  |
| - Persona System                  |
| - Tool handlers                   |
+--------------------+--------------+
                     |
         +-----------+-----------+
         |                       |
+--------v--------+    +---------v--------+
| PostgreSQL      |    | Redis            |
| (pgvector)      |    | (Semantic Cache) |
| - Documents     |    | - Query Cache    |
| - Embeddings    |    | - Sessions       |
+----------------+    +------------------+
```

---

## Quickstart

### Prerequisites
- Node.js 18+
- Docker + docker-compose (for PostgreSQL, Redis)
- API Keys: OpenAI, Google AI, Perplexity (required), Anthropic (optional)

### 1. Install
```bash
git clone https://github.com/seanshin0214/ai-council-mcp.git
cd ai-council-mcp
npm install
```

### 2. Start Infrastructure
```bash
docker-compose up -d
```

### 3. Build
```bash
npm run build
```

### 4. Configure Claude Desktop

Edit `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "ai-council": {
      "command": "node",
      "args": ["C:\\path\\to\\ai-council-mcp\\dist\\mcp-server.js"],
      "env": {
        "OPENAI_API_KEY": "sk-proj-...",
        "GOOGLE_API_KEY": "AIzaSy...",
        "PERPLEXITY_API_KEY": "pplx-...",
        "ANTHROPIC_API_KEY": "sk-ant-...",
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

**Important:** Do NOT use `.env` file (causes JSON-RPC issues). Enter all variables directly in config.

### 5. Restart Claude Desktop

---

## Usage Examples

### Council Discussion (Core Feature)

**Option 1: Get questions first (recommended)**
```
@ai-council ask_council_questions

→ AI generates 40 structured questions
→ Answer them (min 10 chars, recommended 50+)
→ Discussion starts automatically
```

**Option 2: Start directly**
```
@ai-council start_council_discussion

user_answers: "Background information here..."
discussion_topic: "Future of electric vehicle market"
```

### RAG Query
```
@ai-council query_knowledge_base

query: "What are the latest EV market trends?"
model: "auto"  // or "gpt4", "gemini", "perplexity", "claude"
```

---

## Evaluation (Recommended)

If you claim reliability improvements, measure it:

| Metric | Method |
|--------|--------|
| **Correctness** | Blind comparison (single-model vs council), human rating |
| **Uncertainty handling** | Does it flag what it doesn't know? |
| **Evidence use** | Citations from RAG (if enabled) |
| **Cost** | $ per query with/without caching |
| **Latency** | p50 / p95 response times |

---

## Cost Estimates

| Task | Approx. Cost |
|------|-------------|
| Single model query | $0.01-0.03 |
| Full council discussion (3 rounds, 4 models) | $0.08-0.20 |
| With Smart Routing (33-67% savings) | $0.03-0.13 |
| Cached response | Near-zero |

**You pay your own API costs.** This runs locally with YOUR API keys.

---

## Security Notes

- **Never commit API keys** (use env vars in Claude Desktop config)
- Sanitize logs (PII redaction)
- Rate limits and timeouts enforced
- Delete `.env` file if exists

---

## Roadmap

- [ ] Asynchronous execution (parallel calls, streaming synthesis)
- [ ] Tournament-style evolution (multiple debates, best-of selection)
- [ ] Better judge/evaluator loops (automatic critique scoring)
- [ ] Plugin policies (cost ceilings, domain constraints)

---

## References

- [MCP Specification](https://modelcontextprotocol.io/specification/)
- [Towards an AI co-scientist (arXiv)](https://arxiv.org/abs/2502.18864)

---

## License

MIT License - see [LICENSE](./LICENSE)

---

## Contributing

Pull requests welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<div align="center">

**Made by [@seanshin0214](https://github.com/seanshin0214)**

*"When multiple AIs debate, better answers emerge"*

</div>
