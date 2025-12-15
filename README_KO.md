# AI Council MCP
> **Generate → Debate → Evolve**
> MCP 기반 멀티모델 토론(Deliberation) 엔진 — 더 신뢰할 수 있고, 감사 가능한(Auditable) 결과를 위해.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-blue)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](#)
[![MCP](https://img.shields.io/badge/MCP-Compatible-brightgreen)](https://modelcontextprotocol.io/)
[![Version](https://img.shields.io/badge/Version-2.0.0-success)](#)

> **비연관(Non-affiliation) 안내**
> 본 프로젝트는 Google DeepMind 또는 특정 모델 제공사와 무관합니다.
> "Generate–Debate–Evolve"는 멀티 에이전트 숙의 패턴을 설명하기 위한 일반 표현입니다.

---

## AI Council MCP란?

**AI Council MCP**는 여러 LLM을 MCP 도구(tool)로 엮어 다음을 수행합니다:

1. **독립적 답변 생성(Generate)**
2. **상호 검토/반박/보완(Debate)**
3. **최종 종합 및 리스크 정리(Evolve)**

목표는 "그럴듯한 답변"이 아니라,
- 단일 모델의 취약성을 줄이고,
- 논리적 반례를 조기에 드러내고,
- 과정(근거/비판/합성)을 남기는
**엔지니어링 가능한 신뢰성**입니다.

---

## 왜 '토론'이 필요한가?

단일 모델 응답은 빠르지만 다음 문제가 반복됩니다:
- 숨은 가정이 검증되지 않음
- 자신감 있는 오류가 그대로 통과
- 중요한 반례/제약조건 누락

AI Council은 "반박을 강제"해 결과를 진화시킵니다.

> 권장 표현: "환각 제거"가 아니라 "오류 위험 감소 / 신뢰성 향상"

---

## 동작 원리 (3라운드)

### Round 1 — Generate (Divergence)
각 모델이 서로의 답을 보지 못한 채 독립적으로 답변합니다.

### Round 2 — Debate (Cross-examination)
각 모델은 반드시 다음을 수행합니다:
- 논리적 약점 지적
- 반례 제시
- 대안/개선안 제안
- 불확실성 및 추가 검증 항목 표시

### Round 3 — Evolve (Convergence)
"Chair" 모델(Claude)이 모든 비판과 근거를 종합해:
- 최종 결론
- 남은 리스크
- 다음 검증 체크리스트
까지 포함한 결과를 생성합니다.

---

## 핵심 기능

### 1. 멀티모델 오케스트레이션 (4개 AI 모델)

| 모델 | 버전 | 최적 용도 |
|------|------|----------|
| **Claude 3.5 Sonnet** | claude-3-5-sonnet-20241022 | 복잡한 추론, 종합 |
| **GPT-4o** | gpt-4o | 균형잡힌 범용 작업 |
| **Gemini 2.0 Flash** | gemini-2.0-flash-exp | 빠른 응답, 대용량 문서 |
| **Perplexity Sonar Pro** | sonar-pro | 실시간 웹 검색 |

### 2. Submarine Mode (33-67% 토큰 절감)
비선택 모델은 대기 상태로 유지하여 비용 절감. 활성화된 모델만 각 라운드에 참여합니다.

### 3. 시맨틱 캐싱 (Redis)
유사한 쿼리를 캐싱하여 비용과 지연 시간 감소 (반복 쿼리 시 ~70% 절감).

### 4. RAG 시스템 (Athena)
- PostgreSQL + pgvector 기반 시맨틱 검색
- OpenAI 임베딩 (text-embedding-3-small, 1536 차원)
- 임시 문서 우선순위 지정

### 5. 페르소나 시스템
각 AI 모델에 전문가 관점 적용:
- 경제학자, 정치 분석가, 기술 전문가, 문화 비평가

### 6. 감사 가능한 트레이스
라운드별 프롬프트/비판/합성 입력·출력을 저장해 리뷰가 가능합니다.

---

## MCP Tools (8개)

| 도구 | 설명 |
|------|------|
| `query_knowledge_base` | RAG 검색 + 자동 모델 선택 |
| `add_document` | 단일 문서 추가 (자동 청킹 + 임베딩) |
| `add_multiple_documents` | 배치 문서 업로드 |
| `analyze_query_complexity` | 복잡도 추정 + 라우팅 제안 |
| `search_documents` | 문서 키워드 검색 |
| `request_knowledge` | 지식베이스 비어있을 때 정보 요청 |
| `ask_council_questions` | 토론 전 40개 구조화 질문 생성 |
| `start_council_discussion` | 3라운드 멀티모델 토론 실행 |

---

## 아키텍처

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

## 빠른 시작

### 사전 요구사항
- Node.js 18+
- Docker + docker-compose (PostgreSQL, Redis용)
- API 키: OpenAI, Google AI, Perplexity (필수), Anthropic (선택)

### 1. 설치
```bash
git clone https://github.com/seanshin0214/ai-council-mcp.git
cd ai-council-mcp
npm install
```

### 2. 인프라 시작
```bash
docker-compose up -d
```

### 3. 빌드
```bash
npm run build
```

### 4. Claude Desktop 설정

`claude_desktop_config.json` 편집:
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

**중요:** `.env` 파일을 사용하지 마세요 (JSON-RPC 오류 발생). 모든 변수를 설정 파일에 직접 입력하세요.

### 5. Claude Desktop 재시작

---

## 사용 예시

### Council 토론 (핵심 기능)

**옵션 1: 질문 먼저 받기 (권장)**
```
@ai-council ask_council_questions

→ AI가 40개 구조화 질문 생성
→ 답변 입력 (최소 10자, 권장 50자 이상)
→ 토론 자동 시작
```

**옵션 2: 직접 시작**
```
@ai-council start_council_discussion

user_answers: "배경 정보..."
discussion_topic: "전기차 시장의 미래"
```

### RAG 쿼리
```
@ai-council query_knowledge_base

query: "최신 전기차 시장 동향은?"
model: "auto"  // 또는 "gpt4", "gemini", "perplexity", "claude"
```

---

## 평가 (권장)

신뢰성 향상을 주장하려면 측정이 필요합니다:

| 지표 | 방법 |
|------|------|
| **정확성** | 블라인드 비교 (단일 모델 vs Council), 사람 평가 |
| **불확실성 처리** | 모르는 것을 표시하는가? |
| **근거 사용** | RAG 인용 (활성화 시) |
| **비용** | 캐싱 유무에 따른 쿼리당 비용 |
| **지연 시간** | p50 / p95 응답 시간 |

---

## 비용 추정

| 작업 | 대략적 비용 |
|------|------------|
| 단일 모델 쿼리 | $0.01-0.03 |
| 전체 Council 토론 (3라운드, 4모델) | $0.08-0.20 |
| Smart Routing 적용 시 (33-67% 절감) | $0.03-0.13 |
| 캐시된 응답 | 거의 무료 |

**자신의 API 비용을 지불합니다.** 본인의 API 키로 로컬에서 실행됩니다.

---

## 보안 참고사항

- **API 키를 커밋하지 마세요** (Claude Desktop 설정에서 env vars 사용)
- 로그 정제 (PII 삭제)
- 속도 제한 및 타임아웃 적용
- `.env` 파일이 있다면 삭제

---

## 로드맵

- [ ] 비동기 실행 (병렬 호출, 스트리밍 합성)
- [ ] 토너먼트형 진화 (복수 토론, 최적 선택)
- [ ] 평가자 루프 개선 (자동 비판 점수화)
- [ ] 플러그인 정책 (비용 상한, 도메인 제약)

---

## 참고 자료

- [MCP Specification](https://modelcontextprotocol.io/specification/)
- [Towards an AI co-scientist (arXiv)](https://arxiv.org/abs/2502.18864)

---

## 라이선스

MIT License - [LICENSE](./LICENSE) 참조

---

## 기여하기

Pull request 환영합니다!

1. 저장소 포크
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 열기

---

<div align="center">

**Made by [@seanshin0214](https://github.com/seanshin0214)**

*"여러 AI가 토론하면, 더 나은 답이 나온다"*

</div>
