# Building a Multi-Agent Debate Engine with MCP
## How I independently implemented Generate-Debate-Evolve before reading the papers

*Published: December 2024*

---

> **TL;DR**
> - I built a 3-round multi-model debate engine using MCP (Model Context Protocol).
> - It orchestrates multiple LLMs to generate independent answers, cross-examine them, and synthesize an evolved final response.
> - When I later read about "Generate–Debate–Evolve" patterns in research papers, I realized I had already been using a practical version in production workflows.
> - This post focuses on engineering: orchestration, cost/latency, caching, and auditability.

> **Disclaimer**
> I'm not claiming to outperform any research lab. I'm saying I **independently shipped a working debate engine before encountering the formal write-ups**.
> This project is not affiliated with Google DeepMind or any provider.

---

## 1. The Problem: Single-Model Brittleness

LLMs are impressive, but a one-shot answer is often:
- overly confident,
- weak on counterexamples,
- and hard to audit.

In research and engineering, "sounds plausible" is not enough.
I needed a system that **forces critique before synthesis**.

---

## 2. The Pattern: Generate → Debate → Evolve

I implemented a simple but strict 3-round protocol:

### Round 1 — Generate (Divergence)
Each model answers independently.
No peeking. No consensus pressure.

**Goal:** maximize diversity of hypotheses and perspectives.

### Round 2 — Debate (Cross-examination)
Each model must critique other models' answers:
- Identify hidden assumptions
- Provide counterexamples
- Propose stronger alternatives
- Flag uncertainty / missing evidence

**Goal:** turn "confidence" into "tested arguments."

### Round 3 — Evolve (Convergence)
A designated "Chair" model (Claude) synthesizes:
- best claims
- strongest critiques
- remaining risks
- a short verification checklist

**Goal:** an output that's not only better, but explainable.

---

## 3. Why MCP: I Wanted an Engine, Not a Chatbot

MCP (Model Context Protocol) lets me package this debate system as reusable tools:
- callable from Claude Desktop, IDEs, and agent runtimes,
- portable across clients,
- and composable with other toolchains (RAG, codegen, workflows).

In short: **debate becomes infrastructure**.

### The Tools I Built

| Tool | Purpose |
|------|---------|
| `ask_council_questions` | Generate 40 structured questions before debate |
| `start_council_discussion` | Run the 3-round debate |
| `query_knowledge_base` | RAG search with auto model selection |
| `analyze_query_complexity` | Route to appropriate models |
| `add_document` | Ingest documents into knowledge base |

---

## 4. The Hard Parts Were Engineering, Not Prompting

### (1) Cost Control
Multi-model debates can get expensive fast.
So I added policies:
- **Submarine Mode**: non-selected models stay in standby (33-67% savings)
- Route easy queries to cheaper/faster models
- Run 2 rounds for simple tasks, 3 rounds for complex ones
- Cache semantically similar requests

### (2) Latency
Debate is inherently slower.
Parallel calls + streaming synthesis make a huge difference.

Current benchmarks:
| Task | Response Time |
|------|--------------|
| Single model query | 0.8-2s |
| Full council (3 rounds, 4 models) | 15-25s |

### (3) Auditability
In real work, people ask:
> "Why did it conclude that?"

So I log:
- per-round prompts,
- each model's critiques,
- synthesis inputs/outputs,
- model configs and timestamps.

### (4) Safety & Tool Permissions
MCP tools can touch data and systems.
I enforce:
- least privilege,
- explicit confirmations for state-changing tools,
- redaction and rate limits.

---

## 5. A Minimal Orchestration Sketch

```
INPUT: user_query

Round1 = [Model_i.generate(user_query) for i in models]  // parallel
Round2 = [Model_i.critique(Round1, policy) for i in models]  // parallel
Final  = Chair.synthesize(user_query, Round1, Round2, policy)

OUTPUT: Final (+ traces)
```

The actual implementation handles:
- API failures and retries
- Token counting and cost tracking
- Persona injection per model
- RAG context assembly

---

## 6. Measuring If It Actually Helps

If you claim "more reliable answers," you need evaluation.
What worked for me:

### Evaluation Framework

**Fixed query set** (50–200 prompts)

**Blind human rating** (single-model vs council)

**Dimensions:**
- Correctness
- Uncertainty handling
- Evidence use (if RAG enabled)
- Actionability

**System metrics:**
- p50/p95 latency
- Cost per query
- Cache hit rate

### Early Results

| Metric | Single Model | Council |
|--------|-------------|---------|
| Correctness (human eval) | ~85% | ~93% |
| Flags uncertainty | Rarely | Usually |
| Cost per query | $0.02 | $0.08-0.13 |

*Note: These are internal observations, not rigorous benchmarks.*

---

## 7. What's Next

The pattern itself is not enough.
Next steps that matter:

1. **Asynchronous execution** (better parallelism + streaming UX)
2. **Tournament evolution** (multiple debates → select best)
3. **Judge loops** (scoring critiques, spot-check by humans)
4. **Integration with domain stacks** (research methods, code patterns, reproducible experiments)

---

## 8. Lessons Learned

### What Worked
- Forcing models to critique each other catches errors I would have missed
- Submarine Mode makes it economically viable
- MCP packaging means I can reuse this across projects

### What Didn't Work
- Early versions tried to make all 4 models participate every time → too expensive
- Synchronous round execution was too slow → parallel calls helped
- Generic prompts produced weak critiques → domain-specific critique templates improved quality

### Surprises
- Models are better at critiquing than generating
- Perplexity's web search often found counterexamples other models missed
- Claude as synthesizer worked better than GPT-4o for final convergence

---

## Links

- **Repository**: [github.com/seanshin0214/ai-council-mcp](https://github.com/seanshin0214/ai-council-mcp)
- **MCP Spec**: [modelcontextprotocol.io/specification](https://modelcontextprotocol.io/specification/)
- **Related Research**: [Towards an AI co-scientist (arXiv)](https://arxiv.org/abs/2502.18864)

---

## Closing Thought

Patterns are easy to name after the fact.
But shipping a system means:
- cost policies,
- latency handling,
- traces,
- safety,
- and reproducibility.

That's the difference between a demo and an engine.

I built the engine first. The papers came later.

---

*Questions or feedback? Open an issue on [GitHub](https://github.com/seanshin0214/ai-council-mcp/issues).*
