# RAG 기반 AI 에이전트 생태계: 8개의 MCP로 만든 AI 두 번째 뇌(AI Second Brain)

*Published: December 2024*

> "페르소나는 선언이 아니라 지식이다. 토론은 혼잣말이 아니라 집단지성이다."

프롬프트 엔지니어링은 분명 유효합니다.
하지만 조직 고유의 지식, 반복 가능한 사고 과정, 검증 가능한 결론이 필요해지는 순간, 빠르게 한계가 드러납니다.

그래서 저는 RAG 기반 AI 에이전트 생태계를 만들었습니다.
필요한 지식을 검색하고, 적절한 사고 방법론을 적용하며, 다수 AI가 구조화된 토론을 거쳐, 최종적으로 결정 가능한 산출물로 합성합니다.

---

## Executive Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                    COMPLETE MCP ECOSYSTEM                                   │
│                                                                             │
│    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                  │
│    │ AI Council  │────▶│  Socratic   │────▶│  Polymath   │                  │
│    │ 4-AI Debate │     │ 58 Methods  │     │ 30+ Domains │                  │
│    └─────────────┘     └─────────────┘     └─────────────┘                  │
│           │                   │                   │                         │
│           ▼                   ▼                   ▼                         │
│    ┌─────────────────────────────────────────────────────┐                  │
│    │              RAG Knowledge Layer                    │                  │
│    │         ChromaDB + SentenceTransformer              │                  │
│    │              2.5MB+ Embedded Knowledge              │                  │
│    └─────────────────────────────────────────────────────┘                  │
│           │                   │                   │                         │
│           ▼                   ▼                   ▼                         │
│    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                  │
│    │   Persona   │     │  DreamTeam  │     │  Research   │                  │
│    │ 142+ Experts│     │ 17 Devs     │     │ Qual/Quant/ │                  │
│    │   967KB     │     │   267KB     │     │    DSR      │                  │
│    └─────────────┘     └─────────────┘     └─────────────┘                  │
│                                                                             │
│    ════════════════════════════════════════════════════════                 │
│    8 MCPs  │  87+ Tools  │  2.5MB+ RAG Knowledge  │  Python/TS              │
│    ════════════════════════════════════════════════════════                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Why This Matters: 기존 접근법의 한계

### 기존 페르소나의 문제

```
System Prompt: "당신은 시니어 백엔드 개발자입니다. 10년 경력의 FastAPI 전문가입니다."
```

- LLM의 사전 학습된 일반 지식에만 의존
- 구체적인 코드 패턴, 체크리스트 없음
- 팀/조직 특화 지식 반영 불가
- "전문가처럼 행동"하지만 "전문가의 지식"은 없음

### 기존 Multi-AI의 문제

```
단순 API 호출: GPT-4 답변 + Claude 답변 + Gemini 답변
```

- 각자 독립적으로 답변 (토론 없음)
- 사고 방법론 없이 즉답
- 지식 기반 없는 일반론
- "여러 AI"일 뿐 "집단지성"이 아님

---

## My Approach: RAG + Multi-AI + Methodology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                         THE INNOVATION STACK                                │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Layer 3: MULTI-AI ORCHESTRATION                                    │   │
│  │  • 4 AI Models (GPT-4o, Gemini 2.0, Perplexity, Claude)             │   │
│  │  • 3-Round Structured Debate                                        │   │
│  │  • Consensus Building & Synthesis                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              ▲                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Layer 2: THINKING METHODOLOGY                                      │   │
│  │  • 58 Socratic Thinking Frameworks                                  │   │
│  │  • 7 Fusion Patterns (Polymath)                                     │   │
│  │  • Hermeneutic Circle Integration                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              ▲                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Layer 1: RAG KNOWLEDGE BASE                                        │   │
│  │  • 2.5MB+ Expert Knowledge Embedded                                 │   │
│  │  • 142+ Personas with Real Expertise                                │   │
│  │  • Domain-Specific Code Patterns & Checklists                       │   │
│  │  • Research Methodologies (Qual/Quant/DSR)                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## The 8 MCPs: Complete Ecosystem

---

### 1. AI Council MCP — Multi-AI 토론 오케스트레이션

> "하나의 AI가 아닌, 4개 AI의 구조화된 토론"

```
┌─────────────────────────────────────────────────────────────────┐
│                     AI COUNCIL DEBATE FLOW                      │
│                                                                 │
│  User Query                                                     │
│      │                                                          │
│      ▼                                                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │ GPT-4o  │  │Gemini2.0│  │Perplexi │  │ Claude  │            │
│  │Analyst  │  │Innovator│  │Researcher│  │Critic   │            │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘            │
│       │            │            │            │                  │
│       └────────────┴─────┬──────┴────────────┘                  │
│                          ▼                                      │
│                   ┌─────────────┐                               │
│                   │  3-Round    │                               │
│                   │  Debate     │                               │
│                   │  Protocol   │                               │
│                   └──────┬──────┘                               │
│                          │                                      │
│       ┌──────────────────┼──────────────────┐                   │
│       ▼                  ▼                  ▼                   │
│  Round 1:           Round 2:           Round 3:                 │
│  Initial Views      Challenge &        Synthesis &              │
│  & Analysis         Refinement         Consensus                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**핵심 차별화:**
- 단순 병렬 호출이 아닌 구조화된 3라운드 토론
- 각 AI에 고유 역할 부여 (분석가, 혁신가, 연구자, 비평가)
- RAG 지식 기반 토론 (페르소나 지식 활용)
- 합의 도출 및 소수 의견 보존

| 구성요소 | 상세 |
|----------|------|
| AI Models | GPT-4o, Gemini 2.0 Flash, Perplexity, Claude 3.5 |
| Debate Rounds | 3 (Initial → Challenge → Synthesis) |
| Knowledge Integration | RAG + Persona System |
| Tech Stack | TypeScript, Node.js 18+, PostgreSQL + pgvector, Redis |

**GitHub**: https://github.com/seanshin0214/ai-council-mcp

---

### 2. Socratic Thinking MCP — 58가지 사고 방법론

> "답을 주기 전에, 올바른 질문을 던진다"

```
┌─────────────────────────────────────────────────────────────────┐
│                  58 THINKING METHODOLOGIES                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ PHILOSOPHICAL   │  │ ANALYTICAL      │  │ CREATIVE        │  │
│  │ • First Princip │  │ • Systems Think │  │ • SCAMPER       │  │
│  │ • Dialectical   │  │ • Root Cause    │  │ • Lateral Think │  │
│  │ • Phenomenology │  │ • MECE          │  │ • Design Think  │  │
│  │ • Hermeneutic   │  │ • Decision Tree │  │ • Biomimicry    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ SCIENTIFIC      │  │ STRATEGIC       │  │ META-COGNITIVE  │  │
│  │ • Hypothesis    │  │ • Game Theory   │  │ • Reflection    │  │
│  │ • Falsification │  │ • Scenario Plan │  │ • Mental Models │  │
│  │ • Abduction     │  │ • SWOT/PESTEL   │  │ • Bias Check    │  │
│  │ • Bayesian      │  │ • Red Team      │  │ • Assumption Map│  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
│                                                                 │
│  Total: 58 Frameworks  │  6 Categories  │  Contextual Select   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**핵심 차별화:**
- 58가지 체계적 사고 프레임워크 내장
- 질문 유형에 따른 자동 방법론 추천
- AI Council과 연동하여 방법론 기반 토론
- 소크라테스식 질문 기반 탐구

| 구성요소 | 상세 |
|----------|------|
| Frameworks | 58가지 (철학/분석/창의/과학/전략/메타) |
| Core Tools | suggest_methodology, apply_framework, socratic_questioning |
| Integration | AI Council MCP와 연동 |
| Tech Stack | Python 3.10+, FastAPI, ChromaDB |

**GitHub**: https://github.com/seanshin0214/socratic-thinking-mcp

---

### 3. Polymath MCP — 30+ 학문 분야 융합 사고

> "아는 폴리매스가 아닌, 연결하고 창조하는 폴리매스"

```
┌─────────────────────────────────────────────────────────────────┐
│                      KSEA FRAMEWORK                             │
│           Knowledge × Skill × Experience × Ability              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────────────┐        ┌──────────────────┐              │
│   │   KNOWLEDGE      │        │     SKILL        │              │
│   │   What & Why     │        │   How To         │              │
│   │   이론, 원리     │        │   방법, 절차     │              │
│   └──────────────────┘        └──────────────────┘              │
│                                                                 │
│   ┌──────────────────┐        ┌──────────────────┐              │
│   │   EXPERIENCE     │        │    ABILITY       │              │
│   │   When & Where   │        │   ASSOCIATE      │              │
│   │   사례, 맥락     │        │   연결, 융합     │              │
│   └──────────────────┘        └──────────────────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   7 FUSION THINKING PATTERNS                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. 은유적 전이      "DNA를 '코드'로 생각하면?"                 │
│  2. 구조적 동형      "파동 방정식이 물리/경제/생태에 반복"      │
│  3. 전제 전복        "행동경제학이 합리성 가정을 뒤집다"        │
│  4. 스케일 점프      "진화론 → 밈 이론 (아이디어의 진화)"       │
│  5. 시간축 변환      "지질학적 시간으로 조직을 보면?"           │
│  6. 경계 개념        "'정보'가 물리-생물-CS를 연결"             │
│  7. 변증법적 종합    "파동-입자 이중성의 초월적 통합"           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**지식 베이스 구조:**

| 폴더 | 내용 | 문서 수 |
|------|------|---------|
| 00-Fusion-Patterns/ | 7가지 융합 패턴 상세 | 8 |
| 01-Fusion-Cases/ | 역사적 융합 사례 | 7 |
| 02-Concepts/ | 핵심 학제간 개념 (KSEA) | 7 |
| 03-Polymaths/ | 위대한 폴리매스 5인 | 5 |
| 04-Big-Questions/ | 분야를 넘는 큰 질문 | 5 |
| 05-Hermeneutics/ | 해석학 메타-방법론 | 4 |
| **Total** | **38 KSEA Documents** | **38** |

**30+ 학문 분야:**
Philosophy, Physics, Mathematics, Economics, Biology, Psychology, Sociology, Computer Science, Linguistics, History, Political Science, Neuroscience, Chemistry, Anthropology, Art History, Music Theory, Literature, Engineering, Medicine, Law, Ecology, Cognitive Science, Information Theory, Game Theory, Network Science, Systems Theory, Evolutionary Biology, Thermodynamics, Quantum Mechanics, Complex Systems, Hermeneutics

| 구성요소 | 상세 |
|----------|------|
| Framework | KSEA (Knowledge-Skill-Experience-Ability) |
| Fusion Patterns | 7가지 |
| Domains | 30+ Academic Disciplines |
| Tools | 10 (search, fusion, socratic, bridge finding) |
| Tech Stack | Python, ChromaDB, Neo4j (Optional) |

---

### 4. Persona MCP — 142+ 전문가 페르소나 (967KB RAG)

> "역할 선언이 아닌, 실제 전문 지식이 임베딩된 페르소나"

```
┌─────────────────────────────────────────────────────────────────┐
│                    PERSONA ARCHITECTURE                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   RAG Knowledge Base                     │   │
│  │                      967KB Total                         │   │
│  │  ┌─────────────────┐    ┌─────────────────────────────┐  │   │
│  │  │  gpt-knowledge  │    │       community             │  │   │
│  │  │     332KB       │    │        635KB                │  │   │
│  │  │   20 Categories │    │    113+ Personas            │  │   │
│  │  └─────────────────┘    └─────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │               ChromaDB Vector Store                      │   │
│  │           SentenceTransformer Embeddings                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  MCP Tool Interface                      │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │   │
│  │  │ search   │ │ suggest  │ │  chain   │ │ CRUD     │    │   │
│  │  │knowledge │ │ persona  │ │ personas │ │ persona  │    │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**지식 예시 - AI Engineer Persona (36KB):**

```markdown
# AI Engineer Expert Knowledge

## GPT-4 Architecture Deep Dive
- Transformer 아키텍처 상세 (Attention, FFN, LayerNorm)
- 토큰화 전략 (BPE, SentencePiece)
- Context Window 최적화 기법

## Claude Development Patterns
- Constitutional AI 원리와 적용
- System Prompt 설계 패턴
- Tool Use 구현 가이드

## Production RAG Systems
- Chunking 전략 (Semantic, Recursive, Sentence)
- Embedding 모델 선택 기준
- Hybrid Search (Dense + Sparse)
- Re-ranking 파이프라인

## LLM Ops Best Practices
- Prompt 버전 관리
- A/B Testing 프레임워크
- 비용 최적화 (Caching, Batching)
- 품질 모니터링 메트릭
```

**선언형 vs RAG 기반 비교:**

| 항목 | 선언형 페르소나 | Persona MCP (RAG) |
|------|-----------------|-------------------|
| 지식 소스 | LLM 사전 학습 | 967KB 커스텀 지식 |
| 컨텍스트 | 전체 로드 | 필요한 청크만 검색 |
| 코드 예시 | LLM이 생성 | 검증된 패턴 제공 |
| 업데이트 | 프롬프트 수정 | 지식 베이스 갱신 |
| 정확도 | 가변적 | 임베딩된 지식 기반 |

| 구성요소 | 상세 |
|----------|------|
| Personas | 142+ (Professional, Technical, Creative, Domain-specific) |
| Knowledge | 967KB (gpt-knowledge 332KB + community 635KB) |
| Tools | 10 (CRUD, search, suggest, chain, analytics) |
| Server Port | 8767 |

---

### 5. DreamTeam MCP — 17명 World-Class 개발팀

> "시니어 개발자 17명의 실제 지식, 코드 패턴, 체크리스트"

```
┌─────────────────────────────────────────────────────────────────┐
│                    DREAMTEAM: 17 EXPERTS                        │
│                       267KB Knowledge                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    ENGINEERING                           │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │   │
│  │  │Solution  │ │Backend   │ │Frontend  │ │ AI/ML    │    │   │
│  │  │Architect │ │Lead      │ │Lead      │ │ Lead     │    │   │
│  │  │  28KB    │ │  24KB    │ │  21KB    │ │  26KB    │    │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │   │
│  │  │ DevOps   │ │Security  │ │  QA      │ │ Mobile   │    │   │
│  │  │  Lead    │ │ Lead     │ │ Lead     │ │ Lead     │    │   │
│  │  │  16KB    │ │   9KB    │ │  11KB    │ │  11KB    │    │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    PRODUCT & DATA                        │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │   │
│  │  │Product   │ │Product   │ │   UX     │ │  Data    │    │   │
│  │  │Manager   │ │Owner     │ │Designer  │ │Engineer  │    │   │
│  │  │   9KB    │ │   6KB    │ │   8KB    │ │   9KB    │    │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    OPERATIONS                            │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │   │
│  │  │Infra     │ │Database  │ │  SRE     │ │Technical │    │   │
│  │  │Lead      │ │Engineer  │ │ Lead     │ │Writer    │    │   │
│  │  │   8KB    │ │   5KB    │ │   5KB    │ │   6KB    │    │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │   │
│  │  ┌──────────┐                                           │   │
│  │  │ Scrum    │                                           │   │
│  │  │ Master   │                                           │   │
│  │  │   7KB    │                                           │   │
│  │  └──────────┘                                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**포함된 고급 지식:**

| 주제 | 내용 |
|------|------|
| Hyperscale Systems | Google Spanner, Meta TAO, Bigtable, Consistent Hashing |
| Advanced Topics | Rust/Go 성능, K8s Operator, eBPF, Module Federation |
| Post-Mortems | AWS S3 장애, Facebook BGP, Cloudflare 사례 분석 |
| Quality Standards | 코드 품질, 성능 기준, 보안 체크리스트 |
| Team Scenarios | 기능 개발, 장애 대응, 기술 부채 해결 |

| 구성요소 | 상세 |
|----------|------|
| Experts | 17명 World-Class 개발팀 |
| Knowledge | 267KB (185개 청크) |
| Tools | 4 (search_knowledge, search_by_role, list_roles, get_stats) |
| Server Port | 8768 |

**GitHub**: https://github.com/seanshin0214/dreamteam-for-development

---

### 6. QualMaster MCP — 질적 연구 방법론

> "현상학, 근거이론, 사례연구의 체계적 가이드"

```
┌─────────────────────────────────────────────────────────────────┐
│                   QUALITATIVE RESEARCH                          │
│                     12 MCP Tools                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              RESEARCH PARADIGMS                          │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐           │   │
│  │  │Positivism  │ │Interpreti- │ │Critical    │           │   │
│  │  │            │ │vism        │ │Theory      │           │   │
│  │  └────────────┘ └────────────┘ └────────────┘           │   │
│  │  ┌────────────┐ ┌────────────┐                          │   │
│  │  │Pragmatism  │ │Construc-   │                          │   │
│  │  │            │ │tivism      │                          │   │
│  │  └────────────┘ └────────────┘                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              RESEARCH TRADITIONS                         │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │   │
│  │  │Phenomenology │ │Grounded      │ │Case Study    │     │   │
│  │  │Husserl,      │ │Theory        │ │Yin, Stake    │     │   │
│  │  │Heidegger     │ │Strauss,Corbin│ │              │     │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘     │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │   │
│  │  │Ethnography   │ │Narrative     │ │Action        │     │   │
│  │  │Geertz        │ │Inquiry       │ │Research      │     │   │
│  │  │              │ │Clandinin     │ │Lewin         │     │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              CODING & ANALYSIS                           │   │
│  │  • Open Coding → Axial Coding → Selective Coding         │   │
│  │  • In-vivo Codes, Pattern Codes                          │   │
│  │  • Thematic Analysis (Braun & Clarke)                    │   │
│  │  • Trustworthiness Criteria (Lincoln & Guba)             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**12 MCP Tools:**

| Tool | 기능 |
|------|------|
| get_paradigms | 연구 패러다임 가이드 |
| get_traditions | 질적 연구 전통 상세 |
| get_coding_guide | 코딩 절차 가이드 |
| assess_quality | 품질 평가 기준 |
| get_sampling_guide | 표본추출 전략 |
| get_interview_guide | 인터뷰 가이드 생성 |
| get_journal_guide | 저널별 작성 가이드 |
| search_knowledge | RAG 지식 검색 |

| 구성요소 | 상세 |
|----------|------|
| Paradigms | 5 (Positivism, Interpretivism, Critical, Pragmatism, Constructivism) |
| Traditions | 6 (Phenomenology, Grounded Theory, Case Study, Ethnography, Narrative, Action Research) |
| Tools | 12 |
| Server Port | 8780 |

---

### 7. QuantMaster MCP — 양적/인과 연구 방법론

> "DID, RDD, IV, PSM — 인과추론의 체계적 가이드와 코드 생성"

```
┌─────────────────────────────────────────────────────────────────┐
│                   QUANTITATIVE & CAUSAL                         │
│                     15 MCP Tools                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              CAUSAL INFERENCE METHODS                    │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  DID (Difference-in-Differences)                 │   │   │
│  │  │  • 정책 효과 분석의 Gold Standard                │   │   │
│  │  │  • Parallel Trends Assumption 검증               │   │   │
│  │  │  • Event Study, Staggered DID                    │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  RDD (Regression Discontinuity Design)           │   │   │
│  │  │  • 임계값 기반 인과효과 추정                     │   │   │
│  │  │  • Sharp vs Fuzzy RDD                            │   │   │
│  │  │  • Bandwidth Selection, Placebo Tests            │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  IV (Instrumental Variables)                     │   │   │
│  │  │  • 내생성 문제 해결                              │   │   │
│  │  │  • Relevance & Exclusion Restriction             │   │   │
│  │  │  • 2SLS, Weak Instrument Tests                   │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  PSM (Propensity Score Matching)                 │   │   │
│  │  │  • 선택 편향 통제                                │   │   │
│  │  │  • Matching, Weighting, Stratification           │   │   │
│  │  │  • Balance Diagnostics                           │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                          │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │  Synthetic Control                               │   │   │
│  │  │  • 단일 처치 단위 인과추론                       │   │   │
│  │  │  • Abadie et al. Method                          │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              AUTO CODE GENERATION                        │   │
│  │  ┌────────────────────┐  ┌────────────────────┐         │   │
│  │  │    R Code          │  │   Stata Code       │         │   │
│  │  │  • fixest          │  │  • reghdfe         │         │   │
│  │  │  • rdrobust        │  │  • rdrobust        │         │   │
│  │  │  • MatchIt         │  │  • psmatch2        │         │   │
│  │  │  • ivreg2          │  │  • ivreg2          │         │   │
│  │  └────────────────────┘  └────────────────────┘         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**15 MCP Tools:**

| Tool | 기능 |
|------|------|
| get_causal_method | 인과추론 방법 상세 가이드 |
| suggest_method | 연구 설계에 맞는 방법 추천 |
| generate_r_code | R 분석 코드 자동 생성 |
| generate_stata_code | Stata 분석 코드 자동 생성 |
| power_analysis | 검정력 분석 |
| format_apa_table | APA 형식 테이블 생성 |
| get_robustness_checks | 강건성 검증 체크리스트 |

| 구성요소 | 상세 |
|----------|------|
| Causal Methods | 5 (DID, RDD, IV, PSM, Synthetic Control) |
| Code Generation | R + Stata |
| Tools | 15 |
| Code Size | 1,512 lines |
| Server Port | 8781 |

---

### 8. DSRMaster MCP — Design Science Research

> "Hevner 7 Guidelines, DSRM 6 Stages, FEDS Framework"

```
┌─────────────────────────────────────────────────────────────────┐
│                  DESIGN SCIENCE RESEARCH                        │
│                     20 MCP Tools                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              HEVNER 7 GUIDELINES                         │   │
│  │                                                          │   │
│  │  G1: Design as an Artifact                               │   │
│  │  G2: Problem Relevance                                   │   │
│  │  G3: Design Evaluation                                   │   │
│  │  G4: Research Contributions                              │   │
│  │  G5: Research Rigor                                      │   │
│  │  G6: Design as a Search Process                          │   │
│  │  G7: Communication of Research                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              DSRM 6 STAGES (Peffers et al.)              │   │
│  │                                                          │   │
│  │  Problem Identify → Define Objectives → Design & Develop │   │
│  │         ↓                                                │   │
│  │  Communication ← Evaluate ← Demonstration                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              FEDS EVALUATION FRAMEWORK                   │   │
│  │                                                          │   │
│  │           Formative ────────────────▶ Summative          │   │
│  │     Artificial │   Quick & Simple    │ Human             │   │
│  │     Naturalistic   Purely Technical                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              ADDITIONAL FRAMEWORKS                       │   │
│  │                                                          │   │
│  │  • CIMO Logic (Context-Intervention-Mechanism-Outcome)   │   │
│  │  • Artifact Types (Constructs, Models, Methods, Instant) │   │
│  │  • Knowledge Contribution Types (Gregor & Hevner)        │   │
│  │  • DSR Publication Schema                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**20 MCP Tools:**

| Category | Tools |
|----------|-------|
| Guidelines | get_hevner_guidelines, assess_guideline_compliance |
| Process | get_dsrm_stages, get_current_stage_guide |
| Evaluation | get_feds_framework, suggest_evaluation_method |
| Artifacts | get_artifact_types, classify_artifact |
| Quality | assess_rigor, get_publication_checklist |
| Integration | search_knowledge, get_cimo_template |

| 구성요소 | 상세 |
|----------|------|
| Core Frameworks | Hevner 7, DSRM 6, FEDS |
| Tools | 20 |
| Server Port | 8782 |
| PRD for v2.0 | 80+ tools planned |

---

## Ecosystem Integration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INTEGRATION ARCHITECTURE                            │
│                                                                             │
│                           USER QUERY                                        │
│                              │                                              │
│                              ▼                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                        AI COUNCIL MCP                                  │ │
│  │                   (4-AI Orchestration Layer)                           │ │
│  │                                                                        │ │
│  │  "이 질문을 4개 AI가 토론할 때, 어떤 사고 방법론을 적용할까?"          │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                              │                                              │
│              ┌───────────────┼───────────────┐                              │
│              ▼               ▼               ▼                              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐               │
│  │ SOCRATIC MCP    │ │ POLYMATH MCP    │ │ PERSONA MCP     │               │
│  │ 58 Methods      │ │ 7 Fusion        │ │ 142+ Experts    │               │
│  │                 │ │ Patterns        │ │                 │               │
│  │ "이 문제는      │ │ "물리학과       │ │ "시니어 백엔드  │               │
│  │  First Principle│ │  경제학을       │ │  개발자의       │               │
│  │  로 접근"       │ │  연결하면?"     │ │  관점에서는..."  │               │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘               │
│              │               │               │                              │
│              └───────────────┼───────────────┘                              │
│                              ▼                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                     RAG KNOWLEDGE LAYER                                │ │
│  │              ChromaDB + SentenceTransformer                            │ │
│  │                                                                        │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐               │ │
│  │  │Persona   │  │DreamTeam │  │Polymath  │  │Research  │               │ │
│  │  │Knowledge │  │Knowledge │  │Knowledge │  │Knowledge │               │ │
│  │  │  967KB   │  │  267KB   │  │   38docs │  │ Embedded │               │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘               │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                    DOMAIN-SPECIFIC MCPs                                │ │
│  │                                                                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                  │ │
│  │  │ QualMaster   │  │ QuantMaster  │  │ DSRMaster    │                  │ │
│  │  │ 질적 연구    │  │ 인과추론     │  │ 설계과학     │                  │ │
│  │  │ 12 Tools     │  │ 15 Tools     │  │ 20 Tools     │                  │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                  │ │
│  │                                                                        │ │
│  │  "내 연구에는 DID가 적합할까, RDD가 적합할까?"                         │ │
│  │  → QuantMaster가 R/Stata 코드까지 생성                                 │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Ecosystem Summary

| MCP | Purpose | Tools | Knowledge | Port |
|-----|---------|-------|-----------|------|
| AI Council | 4-AI 구조화 토론 | 8+ | RAG 통합 | - |
| Socratic | 58 사고 방법론 | 6+ | 방법론 DB | - |
| Polymath | 30+ 학문 융합 | 10 | 38 KSEA docs | - |
| Persona | 142+ 전문가 | 10 | 967KB | 8767 |
| DreamTeam | 17 개발팀 | 4 | 267KB | 8768 |
| QualMaster | 질적 연구 | 12 | Embedded | 8780 |
| QuantMaster | 양적/인과 | 15 | Embedded | 8781 |
| DSRMaster | 설계과학 | 20 | Embedded | 8782 |

### 전체 통계

| Metric | Value |
|--------|-------|
| Total MCPs | 8 |
| Total Tools | 87+ |
| RAG Knowledge | 2.5MB+ |
| Expert Personas | 159+ (142 + 17) |
| Thinking Frameworks | 58 |
| Academic Domains | 30+ |
| Fusion Patterns | 7 |
| Research Methods | Qual 6 + Quant 5 + DSR 3 |

---

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                      TECHNOLOGY STACK                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PROTOCOL        MCP (Model Context Protocol) by Anthropic      │
│                                                                 │
│  LANGUAGES       Python 3.10+  │  TypeScript/Node.js 18+        │
│                                                                 │
│  FRAMEWORKS      FastAPI  │  mcp-server-stdio  │  Uvicorn       │
│                                                                 │
│  VECTOR STORE    ChromaDB                                       │
│                                                                 │
│  GRAPH STORE     Neo4j (Optional, Polymath)                     │
│                                                                 │
│  EMBEDDINGS      SentenceTransformer (all-MiniLM-L6-v2)         │
│                                                                 │
│  DATABASE        PostgreSQL + pgvector  │  Redis (Cache)        │
│                                                                 │
│  AI MODELS       GPT-4o  │  Gemini 2.0  │  Claude 3.5  │  Pplx  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Innovations

### 1. RAG-Based Personas (Not Role Declarations)

**기존:** "당신은 AI 엔지니어입니다"
→ LLM의 일반 지식으로 "~처럼" 행동

**우리:** 36KB AI Engineer 지식이 ChromaDB에 임베딩
→ GPT-4 아키텍처, RAG 파이프라인, LLMOps 실제 지식 검색

### 2. Structured Multi-AI Debate (Not Parallel Calls)

**기존:** GPT 답변 + Claude 답변 + Gemini 답변 나열
→ 각자 독립적 응답, 토론 없음

**우리:** 3라운드 구조화 토론
→ Round 1: 초기 견해 → Round 2: 상호 비판 → Round 3: 합의 도출

### 3. Methodology-Driven Thinking (Not Instant Answers)

**기존:** 질문 → 즉시 답변
→ 사고 과정 없이 결론만

**우리:** 질문 → 방법론 선택 → 체계적 탐구 → 답변
→ 58개 프레임워크 중 적합한 방법론 적용

### 4. Cross-Domain Fusion (Not Siloed Knowledge)

**기존:** 경제학 질문 → 경제학 지식만
→ 분야 간 연결 없음

**우리:** 7가지 융합 패턴으로 30+ 분야 연결
→ "엔트로피가 경제학에서 어떻게 나타나는가?"

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+ (for AI Council)
- ChromaDB

### Quick Install

```bash
# Clone repositories
git clone https://github.com/seanshin0214/ai-council-mcp
git clone https://github.com/seanshin0214/socratic-thinking-mcp
# ... other MCPs

# Install dependencies
pip install -r requirements.txt

# Index knowledge bases
python scripts/index_knowledge.py --clear

# Configure Claude Desktop / ChatGPT
# See each MCP's README for configuration
```

---

## Repository Links

| MCP | GitHub |
|-----|--------|
| AI Council | https://github.com/seanshin0214/ai-council-mcp |
| Socratic | https://github.com/seanshin0214/socratic-thinking-mcp |
| DreamTeam | https://github.com/seanshin0214/dreamteam-for-development |
| Polymath | Coming Soon |
| Persona | Coming Soon |
| QualMaster | Coming Soon |
| QuantMaster | Coming Soon |
| DSRMaster | Coming Soon |

---

## Author

**Sean Shin** ([@seanshin0214](https://github.com/seanshin0214))

- GitHub: https://github.com/seanshin0214
- 33+ Repositories

---

## License

MIT License

---

> "단순한 프롬프트 엔지니어링을 넘어, 실제 지식이 임베딩된 AI 에이전트 생태계"
>
> **8 MCPs × 87+ Tools × 2.5MB+ RAG Knowledge × 159+ Expert Personas**
>
> This is not prompt engineering. This is knowledge engineering.
