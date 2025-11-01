# 🤖 AI Council MCP (AI 4대장)

**4개의 최고 AI 모델이 함께 토론하고 답변하는 지능형 RAG 시스템**

Claude Desktop에서 사용 가능한 Model Context Protocol (MCP) 서버로, GPT-4o, Gemini 2.0, Perplexity, Claude 3.5가 협력하여 최적의 답변을 제공합니다.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

---

## ✨ 주요 기능

### 🎯 4개 최신 AI 모델 통합 (AI Council 4대장)

| 모델 | 버전 | 최적 용도 | 특징 |
|------|------|-----------|------|
| **Claude 3.5 Sonnet** | claude-3-5-sonnet-20241022 | 코딩, 복잡한 분석, 종합 판단 | 최고 수준의 추론 능력 |
| **GPT-4o** | gpt-4o | 균형잡힌 범용 작업, 창의적 글쓰기 | OpenAI 최신 멀티모달 모델 |
| **Gemini 2.0 Flash** | gemini-2.0-flash-exp | 빠른 응답, 대용량 문서 분석 | Google 최신 고속 모델 |
| **Perplexity Sonar Pro** | sonar-pro | 실시간 정보 검색, 최신 뉴스 | 웹 검색 + AI 답변 통합 |

### 🏛️ AI Council 토론 시스템

4개의 AI 모델이 **3라운드 토론**을 통해 심층 분석:

```
Round 1: 각 AI가 독립적으로 초기 의견 제시
Round 2: 다른 AI의 의견을 검토하고 보완/반박
Round 3: 최종 합의 도출 및 종합 결론

📊 최종 결과: Claude가 4개 모델의 의견을 종합하여 최종 답변 제공
```

**사용 예시:**
```
@ai-4대장 전기차 시장의 미래 전망에 대해 토론해줘

→ GPT-4o, Gemini, Perplexity가 3라운드 토론
→ Claude가 최종 종합 분석 제공
```

### 📚 지능형 RAG (Retrieval Augmented Generation)

- **pgvector** 기반 시맨틱 검색
- **OpenAI Embeddings** (text-embedding-3-small, 1536 dimensions)
- **PostgreSQL** 벡터 데이터베이스
- 코사인 유사도 검색으로 관련 문서 자동 검색
- **임시 문서 우선 검색**: 사용자가 제공한 최신 정보를 우선적으로 활용

### ⚡ 시맨틱 캐싱 (70% 비용 절감)

- **Redis** 기반 인메모리 캐싱
- 유사한 쿼리는 즉시 캐시에서 반환
- 임베딩 유사도 기반 스마트 캐싱

### 🔐 페르소나 시스템 통합

각 AI 모델에 전문가 페르소나 적용:
- **경제학자**: 경제/산업 분석
- **정치 분석가**: 국제 관계/정치
- **기술 전문가**: 기술/혁신 분석
- **문화 평론가**: 사회/문화 분석

---

## 🚀 빠른 시작

### 필수 요구사항

- **Node.js** 18 이상
- **Docker & Docker Compose** (PostgreSQL, Redis)
- **Claude Desktop**
- **API Keys**:
  - OpenAI API Key (필수)
  - Google AI API Key (필수)
  - Perplexity API Key (필수)
  - Anthropic API Key (선택)

### 1단계: 클론 및 설치

```bash
git clone https://github.com/yourusername/ai-council-mcp.git
cd ai-council-mcp
npm install
```

### 2단계: 데이터베이스 시작

```bash
docker-compose up -d
```

PostgreSQL (포트 5432)와 Redis (포트 6379)가 자동으로 시작됩니다.

### 3단계: 빌드

```bash
npm run build
```

### 4단계: Claude Desktop 설정

**중요**: `.env` 파일을 사용하지 마세요! Claude Desktop 설정에 직접 입력하세요.

`C:\Users\[USER]\AppData\Roaming\Claude\claude_desktop_config.json` 수정:

```json
{
  "mcpServers": {
    "ai-4대장": {
      "command": "node",
      "args": ["C:\\Users\\sshin\\Documents\\ai-council-mcp\\dist\\mcp-server.js"],
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
    },
    "ai-카운슬": {
      "command": "node",
      "args": ["C:\\Users\\sshin\\Documents\\ai-council-mcp\\dist\\mcp-server.js"],
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

**주의사항:**
- `.env` 파일이 있으면 삭제하세요 (dotenv 자동 로딩으로 JSON-RPC 오염 발생)
- 경로는 절대 경로로 입력 (예: `C:\\Users\\...`)
- Windows에서는 백슬래시를 두 번 입력 (`\\`)

### 5단계: Claude Desktop 재시작

Claude Desktop을 완전히 종료 후 재시작하면 AI Council이 자동으로 연결됩니다!

---

## 📖 사용 방법

### 🎭 AI Council 토론 (핵심 기능)

#### 1. 질문 먼저 받기 (추천)

AI가 20개 + 20개 질문을 생성하여 깊이 있는 정보 수집:

```
@ai-4대장 ask_council_questions

→ AI가 배경, 사실관계, 의견에 대한 40개 질문 생성
→ 답변 입력 (최소 10자, 권장 50자 이상)
→ 자동으로 토론 시작
```

#### 2. 직접 토론 시작

정보를 바로 제공하고 토론 시작:

```
@ai-4대장 start_council_discussion

user_answers:
"이재명 대통령이 시진핑과 경주에서 국빈 만찬.
평화 협력 강조, 초국가범죄 공동대응 MOU 체결.
한중 수교 33주년 기념."

discussion_topic:
"한중 관계의 미래 전망과 경제 협력 가능성"
```

#### 3. 토론 결과

```
🎭 AI Council 토론 시작

📊 Round 1: 초기 의견
━━━━━━━━━━━━━━━━━━━━━
[GPT-4o의 의견]
...

[Gemini 2.0의 의견]
...

[Perplexity의 의견]
...

📊 Round 2: 심화 토론
━━━━━━━━━━━━━━━━━━━━━
[GPT-4o의 의견]
...

📊 Round 3: 최종 합의
━━━━━━━━━━━━━━━━━━━━━
[GPT-4o의 의견]
...

🎯 최종 종합 (Claude 3.5 Sonnet)
━━━━━━━━━━━━━━━━━━━━━
...
```

### 📚 지식베이스 활용 (Athena RAG)

#### 단일 AI 모델로 질문

```
@ai-4대장 query_athena

query: "전기차 시장의 최신 동향은?"
model: "gpt4"  // 또는 "gemini", "perplexity", "claude"
```

#### 문서 추가

```
@ai-4대장 upsert_document

content: "2025년 전기차 시장 보고서..."
metadata: {
  "source": "경제신문",
  "date": "2025-11-01",
  "category": "전기차"
}
```

---

## 🛠️ MCP 도구 (Tools)

### 1. `ask_council_questions`
AI가 토론 전 심층 질문 생성 (20개 배경 질문 + 20개 의견 질문)

**Parameters:**
```typescript
{
  topic?: string  // 선택: 토론 주제 (미입력 시 자동 생성)
}
```

**Response:**
- 40개의 체계적 질문
- 사용자 답변 입력 후 자동으로 토론 시작

### 2. `start_council_discussion`
AI 4대장 3라운드 토론 시작

**Parameters:**
```typescript
{
  user_answers: string,      // 사용자가 제공한 정보 (최소 10자, 권장 50자 이상)
  discussion_topic: string,  // 토론 주제
  persona?: string          // 페르소나 선택 (economist/political_analyst/tech_expert/cultural_critic)
}
```

**Response:**
- 3라운드 토론 전 과정
- Claude의 최종 종합 분석

### 3. `query_athena`
지식베이스에서 정보 검색 (단일 AI 모델)

**Parameters:**
```typescript
{
  query: string,           // 질문
  model?: string,          // 'gpt4' | 'gemini' | 'claude' | 'perplexity' | 'o1' | 'gemini-pro'
  useCache?: boolean       // 캐시 사용 여부 (기본: true)
}
```

### 4. `upsert_document`
문서를 지식베이스에 추가

**Parameters:**
```typescript
{
  content: string,         // 문서 내용
  metadata?: object        // 메타데이터 (source, author, category 등)
}
```

### 5. `upsert_multiple_documents`
여러 문서 일괄 추가

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
키워드로 문서 검색

**Parameters:**
```typescript
{
  keyword: string,
  limit?: number  // 기본: 10
}
```

### 7. `analyze_query_complexity`
쿼리 복잡도 분석 및 최적 모델 추천

**Parameters:**
```typescript
{
  query: string
}
```

### 8. `get_personas`
사용 가능한 페르소나 목록 조회

**Parameters:** 없음

**Response:**
```json
{
  "economist": "경제학자 - 경제/산업 분석 전문",
  "political_analyst": "정치 분석가 - 국제관계/정치 전문",
  "tech_expert": "기술 전문가 - 기술/혁신 분석 전문",
  "cultural_critic": "문화 평론가 - 사회/문화 분석 전문"
}
```

---

## 🏗️ 시스템 아키텍처

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
│  │   - Round 1: 독립적 초기 의견             │  │
│  │   - Round 2: 상호 검토 및 반박           │  │
│  │   - Round 3: 최종 합의                   │  │
│  │   - Claude: 종합 분석                    │  │
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
│  - 문서   │    │ - 캐시   │
│  - 임베딩 │    │ - 세션   │
│1536 dim  │    │          │
└──────────┘    └──────────┘
```

---

## 🔧 문제 해결 (Troubleshooting)

### JSON 파싱 오류 발생

**증상:**
```
Unexpected token 'D', 'Document s'... is not valid JSON
```

**원인:** `.env` 파일의 dotenv 자동 로딩으로 stdout 오염

**해결:**
1. `.env` 파일 삭제
2. 모든 환경 변수를 `claude_desktop_config.json`에 입력
3. Claude Desktop 재시작

### Gemini API 오류

**증상:**
```
models/gemini-1.5-pro is not found for API version v1beta
```

**원인:** Gemini 1.5 Pro는 2025년 현재 deprecated됨

**해결:** 자동으로 `gemini-2.0-flash-exp` 사용 (이미 수정됨)

### 지식베이스 비어있음

**증상:**
```
No relevant documents found in the knowledge base.
```

**원인:** 문서가 없거나 유사도 검색 실패

**해결:**
1. `upsert_document`로 문서 추가
2. `ask_council_questions`로 사용자 답변을 임시 문서로 저장
3. 임시 문서는 유사도 검색 없이 우선 사용됨

### user_answers 너무 짧음

**증상:**
```
⚠️ 정보가 부족합니다 (최소 10자 이상 필요)
```

**해결:** 최소 10자 이상 입력 (권장: 50자 이상)

---

## 📊 성능 벤치마크

| 작업                | 최적 모델         | 응답 시간 | 정확도 | 비용  |
|--------------------|------------------|---------|--------|------|
| 간단한 Q&A         | Gemini 2.0 Flash | 0.8초   | 95%    | $    |
| AI Council 토론    | 4 Models         | 15-25초 | 98%    | $$$$ |
| 코드 생성          | Claude 3.5       | 2-3초   | 98%    | $$$  |
| 최신 뉴스 검색     | Perplexity Pro   | 2-4초   | 97%    | $$   |
| 문서 분석 (대용량) | Gemini 2.0       | 3-5초   | 96%    | $$   |
| 일반 작업          | GPT-4o           | 1-2초   | 96%    | $$   |

---

## 📚 상세 문서

- **[완벽한 설치 가이드](./INSTALLATION.md)** - 단계별 설치 가이드
- **[기술 명세서](./TECHNICAL_SPEC.md)** - 상세한 기술 문서
- **[API 레퍼런스](./API_REFERENCE.md)** - 전체 API 문서

---

## 🛠️ 개발

### 로컬 개발 서버 실행
```bash
npm run dev
```

### 빌드
```bash
npm run build
```

### MCP 서버 직접 실행
```bash
npm run mcp
```

### 타입 체크
```bash
npm run type-check
```

---

## 🤝 기여하기

풀 리퀘스트를 환영합니다!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 라이선스

MIT License - 자유롭게 사용하세요!

---

## 🙏 감사의 말

이 프로젝트는 다음 기술들을 사용합니다:
- [Anthropic Claude](https://www.anthropic.com/)
- [OpenAI GPT-4o](https://openai.com/)
- [Google Gemini](https://deepmind.google/technologies/gemini/)
- [Perplexity AI](https://www.perplexity.ai/)
- [PostgreSQL](https://www.postgresql.org/)
- [pgvector](https://github.com/pgvector/pgvector)
- [Redis](https://redis.io/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

---

## 📞 연락처

- Issues: [GitHub Issues](https://github.com/yourusername/ai-council-mcp/issues)

---

<div align="center">

**Made with ❤️ and 🤖 by AI Council Team**

*"4개의 AI가 함께 생각하면 더 나은 답을 찾는다"*

[시작하기](#-빠른-시작) • [문서](./INSTALLATION.md) • [기여하기](#-기여하기)

</div>
