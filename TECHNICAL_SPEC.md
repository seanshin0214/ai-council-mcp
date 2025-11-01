# 🔧 AI Council MCP - 기술 명세서

이 문서는 AI Council MCP 서버의 상세한 기술 사양, 아키텍처, API 명세를 다룹니다.

**버전**: 1.0.0
**최종 업데이트**: 2025-01-01
**작성자**: AI Council Team

---

## 📋 목차

1. [시스템 아키텍처](#-시스템-아키텍처)
2. [기술 스택](#-기술-스택)
3. [모듈 구조](#-모듈-구조)
4. [데이터베이스 스키마](#-데이터베이스-스키마)
5. [AI 모델 명세](#-ai-모델-명세)
6. [MCP 프로토콜](#-mcp-프로토콜)
7. [RAG 파이프라인](#-rag-파이프라인)
8. [캐싱 전략](#-캐싱-전략)
9. [보안 사양](#-보안-사양)
10. [성능 최적화](#-성능-최적화)
11. [API 레퍼런스](#-api-레퍼런스)
12. [환경 변수](#-환경-변수)

---

## 🏗️ 시스템 아키텍처

### 전체 시스템 구조

```
┌─────────────────────────────────────────────────────────────┐
│                    Claude Desktop (Client)                   │
│                     - MCP Protocol Consumer                  │
│                     - User Interface                         │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ stdio (MCP Protocol)
                      │ JSON-RPC 2.0
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              AI Council MCP Server (Node.js)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              MCP Server Layer                        │   │
│  │  - Tool Handlers                                     │   │
│  │  - Resource Handlers                                 │   │
│  │  - Prompt Handlers                                   │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐   │
│  │           Business Logic Layer                       │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Query Router (router.ts)                     │  │   │
│  │  │  - Complexity Analysis                        │  │   │
│  │  │  - Model Selection                            │  │   │
│  │  │  - Cost Optimization                          │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Athena RAG Engine (rag/athena.ts)            │  │   │
│  │  │  - Embedding Generation                       │  │   │
│  │  │  - Vector Search                              │  │   │
│  │  │  - Context Assembly                           │  │   │
│  │  │  - Answer Generation                          │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  Document Upsert (rag/upsert.ts)              │  │   │
│  │  │  - Chunking                                   │  │   │
│  │  │  - Embedding                                  │  │   │
│  │  │  - Indexing                                   │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                   │                                          │
│  ┌────────────────▼─────────────────────────────────────┐   │
│  │              Data Access Layer                       │   │
│  │  - Database Pool (db.ts)                            │   │
│  │  - Redis Client (redis.ts)                          │   │
│  │  - Connection Management                            │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────┬──────────────────┬────────────────────────────┘
               │                  │
       ┌───────▼──────┐   ┌───────▼──────┐
       │ PostgreSQL   │   │    Redis     │
       │ + pgvector   │   │   Cache      │
       │              │   │              │
       │ - documents  │   │ - embeddings │
       │ - users      │   │ - sessions   │
       │ - logs       │   │              │
       └──────────────┘   └──────────────┘
               │
       ┌───────▼──────────────────┐
       │   External AI Services   │
       │                          │
       │ - Claude API             │
       │ - OpenAI API (GPT-5, O1) │
       │ - Google Gemini API      │
       │ - Perplexity API         │
       └──────────────────────────┘
```

### 데이터 흐름

```
User Query
    │
    ├─> [1] MCP Server receives query
    │
    ├─> [2] Complexity Analysis (router.ts)
    │        - Regex pattern matching
    │        - Word count
    │        - Query classification
    │        → Recommended Model
    │
    ├─> [3] Cache Check (redis.ts)
    │        - Generate query embedding
    │        - Similarity search in cache
    │        - If hit → return cached answer
    │
    ├─> [4] Vector Search (athena.ts)
    │        - Embedding generation (OpenAI)
    │        - pgvector cosine similarity
    │        - Top-K documents retrieval
    │
    ├─> [5] Context Assembly
    │        - Document ranking
    │        - Context window management
    │        - Prompt construction
    │
    ├─> [6] AI Model Invocation
    │        - API call to selected model
    │        - Streaming or batch response
    │
    ├─> [7] Response Processing
    │        - Format output
    │        - Extract metadata
    │        - Log metrics
    │
    └─> [8] Cache Update & Return
             - Store in Redis
             - Return to client
```

---

## 💻 기술 스택

### Core Technologies

| 카테고리 | 기술 | 버전 | 용도 |
|----------|------|------|------|
| **Runtime** | Node.js | 18+ | JavaScript 실행 환경 |
| **Language** | TypeScript | 5.0 | 타입 안전 개발 |
| **MCP SDK** | @modelcontextprotocol/sdk | 1.20.2 | MCP 서버 구현 |
| **Database** | PostgreSQL | 16 | 주 데이터베이스 |
| **Vector DB** | pgvector | 0.5.0 | 벡터 유사도 검색 |
| **Cache** | Redis | 7 | 인메모리 캐싱 |
| **Container** | Docker | Latest | 컨테이너화 |

### AI & ML Libraries

| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| `@anthropic-ai/sdk` | Latest | Claude API 클라이언트 |
| `openai` | Latest | OpenAI API (GPT-5, O1, Embeddings) |
| `@google/generative-ai` | Latest | Google Gemini API |
| `langchain` | Latest | LLM 체이닝 (선택사항) |

### Development Tools

| 도구 | 버전 | 용도 |
|------|------|------|
| `typescript` | 5.0 | TypeScript 컴파일러 |
| `tsx` | Latest | TypeScript 실행기 |
| `vitest` | Latest | 테스트 프레임워크 |
| `prettier` | Latest | 코드 포매터 |
| `eslint` | Latest | 코드 린터 |

---

## 📁 모듈 구조

### 프로젝트 파일 트리

```
ai-council-mcp/
├── src/
│   ├── mcp-server.ts          # MCP 서버 메인 진입점
│   ├── db.ts                   # PostgreSQL 연결 및 스키마
│   ├── redis.ts                # Redis 클라이언트 및 캐싱
│   ├── router.ts               # 쿼리 복잡도 분석 및 모델 라우팅
│   ├── metrics.ts              # Prometheus 메트릭
│   │
│   ├── rag/
│   │   ├── athena.ts          # RAG 쿼리 엔진
│   │   └── upsert.ts          # 문서 업로드 및 임베딩
│   │
│   └── middleware/
│       ├── security.ts        # OWASP LLM 보안
│       └── auth.ts            # RBAC 인증 (선택)
│
├── dist/                       # TypeScript 빌드 출력
├── tests/                      # 테스트 파일
├── docker-compose.yml          # Docker 서비스 정의
├── tsconfig.json               # TypeScript 설정
├── package.json                # 의존성 및 스크립트
├── .env                        # 환경 변수 (git ignore)
├── README.md                   # 프로젝트 소개
├── INSTALLATION.md             # 설치 가이드
└── TECHNICAL_SPEC.md           # 기술 명세서 (이 문서)
```

### 주요 모듈 설명

#### `mcp-server.ts`
- **역할**: MCP 프로토콜 서버 구현
- **주요 기능**:
  - Tool handlers 등록
  - Resource handlers 등록
  - stdio 통신 관리
- **Dependencies**: `@modelcontextprotocol/sdk`, `db.ts`, `rag/*`

#### `db.ts`
- **역할**: PostgreSQL 연결 및 데이터베이스 관리
- **주요 기능**:
  - Connection pooling
  - Schema initialization
  - pgvector 설정
- **Export**: `pool`, `initDB()`, `testConnection()`

#### `redis.ts`
- **역할**: Redis 클라이언트 및 캐싱 로직
- **주요 기능**:
  - 시맨틱 캐싱
  - TTL 관리 (기본 1시간)
  - 임베딩 유사도 기반 캐시 매칭
- **Export**: `redisClient`, `getCachedResponse()`, `setCachedResponse()`

#### `router.ts`
- **역할**: 쿼리 분석 및 AI 모델 선택
- **주요 기능**:
  - 복잡도 분류 (simple/moderate/complex/expert/realtime)
  - 패턴 매칭 (정규식 기반)
  - 비용 최적화 모델 선택
- **Export**: `analyzeQueryComplexity()`, `selectModelForBudget()`

#### `rag/athena.ts`
- **역할**: RAG 쿼리 처리 엔진
- **주요 기능**:
  - 임베딩 생성 (OpenAI text-embedding-3-small)
  - 벡터 유사도 검색 (pgvector cosine)
  - 컨텍스트 조립
  - AI 모델 호출 및 답변 생성
- **Export**: `queryAthena()`

#### `rag/upsert.ts`
- **역할**: 문서 업로드 및 임베딩
- **주요 기능**:
  - 문서 청킹 (LangChain TextSplitter)
  - 임베딩 생성
  - PostgreSQL 삽입
  - 배치 처리
- **Export**: `upsertDocument()`, `upsertMultipleDocuments()`

---

## 🗄️ 데이터베이스 스키마

### PostgreSQL 테이블

#### `documents` 테이블
```sql
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    embedding vector(1536),  -- OpenAI ada-002 dimension
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 벡터 유사도 인덱스
CREATE INDEX documents_embedding_idx ON documents
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 메타데이터 검색 인덱스
CREATE INDEX documents_metadata_idx ON documents USING GIN (metadata);
```

**필드 설명**:
- `id`: 자동 증가 primary key
- `content`: 문서 원본 텍스트
- `metadata`: JSONB 형식의 메타데이터 (source, author, tags 등)
- `embedding`: 1536차원 벡터 (OpenAI embeddings)
- `created_at`: 생성 시각
- `updated_at`: 수정 시각

#### `users` 테이블 (선택사항 - RBAC 사용 시)
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    api_key VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('reader', 'writer', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX users_api_key_idx ON users (api_key);
```

#### `query_logs` 테이블 (모니터링용)
```sql
CREATE TABLE query_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    query TEXT NOT NULL,
    model_used VARCHAR(100),
    response_time_ms INTEGER,
    tokens_used INTEGER,
    cache_hit BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX query_logs_created_at_idx ON query_logs (created_at DESC);
CREATE INDEX query_logs_model_idx ON query_logs (model_used);
```

### Redis 데이터 구조

#### 캐시 키 포맷
```
cache:query:{hash}
```

#### 캐시 데이터 구조
```json
{
  "answer": "AI 모델의 답변 텍스트",
  "sources": [...],
  "model": "claude",
  "timestamp": 1704067200000,
  "embedding": [0.123, 0.456, ...]
}
```

#### TTL (Time To Live)
- 기본: **3600초 (1시간)**
- 설정 가능 (`REDIS_TTL` 환경변수)

---

## 🤖 AI 모델 명세

### 1. Claude 3.5 Sonnet

**API**: Anthropic Messages API
**Model ID**: `claude-3-5-sonnet-20241022`

```typescript
{
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024,
  temperature: 0.7,  // 조정 가능
  system: string,
  messages: [
    { role: 'user', content: string }
  ]
}
```

**특징**:
- 최대 토큰: 200K 입력
- 응답 시간: 2-3초
- 강점: 코딩, 복잡한 추론
- 비용: $$$ (고가)

**사용 케이스**:
- 코드 생성 및 디버깅
- 복잡한 논리 문제
- 긴 컨텍스트 분석

### 2. GPT-4o

**API**: OpenAI Chat Completions API
**Model ID**: `gpt-4o`

```typescript
{
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: string },
    { role: 'user', content: string }
  ],
  max_completion_tokens: 8192,  // max_tokens 대신 사용
  temperature: 0.7,
  top_p: 1.0
}
```

**특징**:
- 최대 토큰: 128K 입력
- 응답 시간: 1-2초
- 강점: 균형잡힌 범용 성능, 멀티모달
- 비용: $$ (중간)
- **주의**: `max_tokens` 대신 `max_completion_tokens` 사용

**사용 케이스**:
- 일반적인 질문 답변
- 문서 요약
- 번역 및 리라이팅
- 이미지 분석

### 3. Gemini 2.0 Flash

**API**: Google Generative AI API
**Model ID**: `gemini-2.0-flash-exp`

```typescript
{
  model: 'gemini-2.0-flash-exp',  // 2025년 현재 최신 모델
  generationConfig: {
    maxOutputTokens: 8192,
    temperature: 0.7,
    topP: 0.95,
    topK: 40
  },
  contents: [
    { role: 'user', parts: [{ text: string }] }
  ]
}
```

**특징**:
- 최대 토큰: 1M 입력 (초대용량)
- 응답 시간: 0.5-0.8초 (매우 빠름)
- 강점: 빠른 응답, 대용량 컨텍스트, 멀티모달
- 비용: $ (저렴)
- **중요**: Gemini 1.5 Pro는 deprecated됨 → 2.0 Flash 사용 필수

**사용 케이스**:
- 간단한 Q&A
- 빠른 응답 필요 시
- 대량 문서 분석
- 대용량 쿼리 처리

### 4. OpenAI O1

**API**: OpenAI Chat Completions API
**Model ID**: `o1-preview`

```typescript
{
  model: 'o1-preview',
  messages: [
    { role: 'user', content: string }
  ]
  // O1은 system message 미지원
  // temperature, max_tokens 자동 설정
}
```

**특징**:
- 최대 토큰: 128K 입력
- 응답 시간: 5-10초 (내부 추론 시간 포함)
- 강점: 수학, 과학, 복잡한 논리 추론
- 비용: $$$$ (최고가)

**사용 케이스**:
- 수학 증명
- 과학적 추론
- 복잡한 알고리즘 설계

### 5. Perplexity Sonar Pro

**API**: Perplexity API (OpenAI 호환)
**Model ID**: `sonar-pro`

```typescript
{
  model: 'sonar-pro',
  messages: [
    { role: 'system', content: string },
    { role: 'user', content: string }
  ],
  max_tokens: 4096,
  temperature: 0.7
  }
}
```

**특징**:
- 최대 토큰: **1M 입력** (업계 최대!)
- 응답 시간: 3-5초
- 강점: 초대형 컨텍스트 처리
- 비용: $$$ (고가)

**사용 케이스**:
- 전체 책 분석
- 대용량 문서 처리
- 다중 문서 비교

### 6. Perplexity Sonar Pro

**API**: Perplexity API (OpenAI 호환)
**Model ID**: `sonar-pro`

```typescript
{
  model: 'sonar-pro',
  messages: [...],
  max_tokens: 4096,
  temperature: 0.7,
  // Perplexity 특화 파라미터
  search_domain_filter: [],
  search_recency_filter: 'month'
}
```

**특징**:
- 실시간 웹 검색 통합
- 응답 시간: 2-4초
- 강점: 최신 정보, 출처 제공
- 비용: $$ (중간)

**사용 케이스**:
- 최신 뉴스 검색
- 실시간 정보 조회
- 웹 리서치

---

## 🔌 MCP 프로토콜

### MCP Protocol 버전
- **Protocol Version**: 2024-11-05
- **Transport**: stdio (Standard I/O)
- **Encoding**: JSON-RPC 2.0

### MCP Tools

#### 1. `query_knowledge_base`

**Description**: RAG 검색 및 AI 답변 생성

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "검색할 질문"
    },
    "model": {
      "type": "string",
      "enum": ["auto", "claude", "gpt4", "gemini", "o1", "gemini-pro", "perplexity"],
      "default": "auto",
      "description": "사용할 AI 모델"
    },
    "useCache": {
      "type": "boolean",
      "default": true,
      "description": "캐시 사용 여부"
    }
  },
  "required": ["query"]
}
```

**Output**:
```typescript
{
  content: [
    {
      type: 'text',
      text: string  // 답변 + 메타데이터
    }
  ]
}
```

#### 2. `add_document`

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "content": {
      "type": "string",
      "description": "문서 내용"
    },
    "metadata": {
      "type": "object",
      "description": "메타데이터 (선택)"
    }
  },
  "required": ["content"]
}
```

#### 3. `add_multiple_documents`

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "documents": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "content": { "type": "string" },
          "metadata": { "type": "object" }
        },
        "required": ["content"]
      }
    }
  },
  "required": ["documents"]
}
```

#### 4. `analyze_query_complexity`

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "분석할 쿼리"
    }
  },
  "required": ["query"]
}
```

**Output**:
```typescript
{
  complexity: 'simple' | 'moderate' | 'complex' | 'expert' | 'realtime',
  recommendedModel: string,
  reasoning: string
}
```

#### 5. `search_documents`

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "keyword": {
      "type": "string",
      "description": "검색 키워드"
    },
    "limit": {
      "type": "number",
      "default": 10,
      "description": "결과 개수"
    }
  },
  "required": ["keyword"]
}
```

### MCP Resources

AI Council은 문서를 MCP 리소스로 노출합니다:

**Resource URI Format**:
```
ai-council://document/{id}
```

**Resource Schema**:
```typescript
{
  uri: string,           // ai-council://document/123
  mimeType: 'text/plain',
  name: string,          // "Document 123 - source.pdf"
  description: string    // "Created at 2025-01-01..."
}
```

---

## 🔍 RAG 파이프라인

### 1. Embedding Generation

**Model**: OpenAI `text-embedding-3-small`
**Dimension**: 1536

```typescript
async function createEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  });
  return response.data[0].embedding;
}
```

**성능**:
- 처리 속도: ~100ms/쿼리
- 비용: $0.00002/1K 토큰
- 최대 길이: 8191 토큰

### 2. Vector Search

**Algorithm**: IVFFlat (Inverted File with Flat Storage)
**Distance Metric**: Cosine Similarity

```sql
SELECT content, metadata,
       1 - (embedding <=> $1::vector) as similarity
FROM documents
ORDER BY embedding <=> $1::vector
LIMIT 5;
```

**인덱스 설정**:
```sql
CREATE INDEX documents_embedding_idx ON documents
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

**파라미터**:
- `lists`: 100 (튜닝 가능, 데이터셋 크기에 따라)
- `topK`: 5 (기본값)
- similarity threshold: 0.7 (관련성 필터)

### 3. Context Assembly

```typescript
const context = relevantDocs
  .map((doc, idx) => `[${idx + 1}] ${doc.content}`)
  .join('\n\n');

const systemPrompt = `You are Athena, an AI assistant with access to a knowledge base.
Answer the user's question based on the provided context.

Context:
${context}`;
```

**Context Window Management**:
- Claude: 최대 200K 토큰
- GPT-5: 최대 128K 토큰
- Gemini: 최대 32K 토큰
- 자동 잘림 처리

### 4. Answer Generation

각 AI 모델 별로 최적화된 프롬프트 사용:

```typescript
// Claude
{
  role: 'user',
  content: `${systemPrompt}\n\nQuestion: ${query}`
}

// GPT-5
{
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: query }
  ]
}

// Gemini
{
  contents: [
    { role: 'user', parts: [{ text: `${systemPrompt}\n\nQuestion: ${query}` }] }
  ]
}
```

---

## 💾 캐싱 전략

### Semantic Caching

**원리**: 쿼리 임베딩의 유사도 기반 캐시 매칭

```typescript
async function getCachedResponse(queryEmbedding: number[]): Promise<string | null> {
  // 1. Redis에서 모든 캐시된 임베딩 조회
  const cachedEmbeddings = await redis.zRange('embeddings', 0, -1);

  // 2. 코사인 유사도 계산
  for (const cached of cachedEmbeddings) {
    const similarity = cosineSimilarity(queryEmbedding, cached.embedding);

    // 3. 임계값 이상이면 캐시 히트
    if (similarity > 0.95) {
      return await redis.get(`cache:query:${cached.hash}`);
    }
  }

  return null;
}
```

**성능**:
- 캐시 히트율: 60-80% (일반 사용)
- 응답 시간: < 10ms (캐시 히트 시)
- 비용 절감: ~70%

### TTL 설정

```typescript
// 기본 TTL: 1시간
const TTL = parseInt(process.env.REDIS_TTL || '3600');

await redis.setEx(
  `cache:query:${hash}`,
  TTL,
  JSON.stringify(response)
);
```

### Cache Invalidation

```typescript
// 문서 추가 시 관련 캐시 무효화
async function invalidateRelatedCache(documentContent: string) {
  const embedding = await createEmbedding(documentContent);

  // 유사한 쿼리 캐시 삭제
  const similar = await findSimilarEmbeddings(embedding, 0.9);
  for (const hash of similar) {
    await redis.del(`cache:query:${hash}`);
  }
}
```

---

## 🔒 보안 사양

### OWASP LLM Top 10 대응

| 위협 | 대응 방법 | 구현 위치 |
|------|-----------|-----------|
| **LLM01: Prompt Injection** | 입력 검증, 시스템 프롬프트 분리 | `security.ts` |
| **LLM02: Insecure Output Handling** | XSS 필터링, 출력 이스케이핑 | `security.ts` |
| **LLM03: Training Data Poisoning** | 문서 출처 검증, 메타데이터 | `upsert.ts` |
| **LLM04: Model Denial of Service** | Rate limiting, 토큰 제한 | `middleware/` |
| **LLM06: Sensitive Information Disclosure** | PII 필터링, 로그 마스킹 | `security.ts` |
| **LLM07: Insecure Plugin Design** | MCP 프로토콜 검증 | `mcp-server.ts` |
| **LLM08: Excessive Agency** | 권한 제한, 작업 승인 | `auth.ts` |
| **LLM09: Overreliance** | 출처 표시, 신뢰도 점수 | `athena.ts` |
| **LLM10: Model Theft** | API 키 보안, 사용량 제한 | `.env`, `auth.ts` |

### Input Validation

```typescript
function validateInput(query: string): void {
  // 1. 길이 제한
  if (query.length > 10000) {
    throw new Error('Query too long');
  }

  // 2. 악성 패턴 감지
  const maliciousPatterns = [
    /ignore previous instructions/i,
    /you are now/i,
    /system:/i
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(query)) {
      throw new Error('Potential prompt injection detected');
    }
  }

  // 3. PII 필터링
  const piiPatterns = [
    /\d{3}-\d{2}-\d{4}/,  // SSN
    /\d{16}/,             // Credit card
  ];

  for (const pattern of piiPatterns) {
    if (pattern.test(query)) {
      console.warn('PII detected in query');
    }
  }
}
```

### Rate Limiting

```typescript
// IP 기반 레이트 리밋
const limiter = new RateLimiter({
  windowMs: 15 * 60 * 1000,  // 15분
  max: 100                    // 100 요청
});
```

---

## ⚡ 성능 최적화

### 1. Connection Pooling

```typescript
const pool = new Pool({
  max: 20,                    // 최대 연결 수
  idleTimeoutMillis: 30000,   // 유휴 타임아웃
  connectionTimeoutMillis: 2000
});
```

### 2. Batch Processing

```typescript
async function upsertMultipleDocuments(documents: Document[]) {
  const BATCH_SIZE = 50;

  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    const batch = documents.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(doc => upsertDocument(doc)));
  }
}
```

### 3. Streaming Responses (향후 지원)

```typescript
// OpenAI Streaming
const stream = await openai.chat.completions.create({
  model: 'gpt-5',
  messages: [...],
  stream: true
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

---

## 📖 API 레퍼런스

### 내부 함수 API

#### `queryAthena(query, options)`

RAG 쿼리 처리

**Parameters**:
```typescript
query: string
options: {
  model?: 'claude' | 'gpt4' | 'gemini' | 'o1' | 'gemini-pro' | 'perplexity',
  topK?: number,          // 기본 5
  useCache?: boolean      // 기본 true
}
```

**Returns**:
```typescript
{
  answer: string,
  sources: Array<{
    content: string,
    metadata: object
  }>,
  fromCache: boolean
}
```

#### `analyzeQueryComplexity(query)`

쿼리 복잡도 분석

**Parameters**:
```typescript
query: string
```

**Returns**:
```typescript
{
  complexity: 'simple' | 'moderate' | 'complex' | 'expert' | 'realtime',
  recommendedModel: string,
  reasoning: string
}
```

---

## 🌍 환경 변수

### 필수 환경 변수

```env
# AI API Keys
OPENAI_API_KEY=sk-proj-...
GOOGLE_API_KEY=gen-lang-client-...
PERPLEXITY_API_KEY=pplx-...

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=ai_council

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 선택 환경 변수

```env
# Anthropic (Claude Desktop 외부 사용 시)
ANTHROPIC_API_KEY=sk-ant-...

# Performance Tuning
VECTOR_SEARCH_TOP_K=5
REDIS_TTL=3600
MAX_CONTEXT_LENGTH=100000

# Monitoring
PROMETHEUS_PORT=9090
GRAFANA_PORT=3001

# Development
NODE_ENV=development
LOG_LEVEL=info
```

---

## 📞 기술 지원

- **GitHub Issues**: [https://github.com/yourusername/ai-council-mcp/issues](https://github.com/yourusername/ai-council-mcp/issues)
- **Documentation**: [README.md](./README.md)
- **Installation Guide**: [INSTALLATION.md](./INSTALLATION.md)

---

**문서 버전**: 1.0.0
**최종 업데이트**: 2025-01-01
**작성자**: AI Council Team

---

<div align="center">

**Made with ❤️ and 🤖 by AI Council Team**

</div>
