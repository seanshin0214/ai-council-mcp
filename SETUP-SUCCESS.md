# AI Council MCP - 성공 설정 가이드

## 테스트 완료일: 2025-12-21

## 작동 확인된 구성

### AI 4대장 모델
| AI | 모델명 | 역할 |
|----|--------|------|
| Claude | claude-sonnet-4-20250514 | 복잡한 추론 + 최종 종합 |
| GPT-4o | gpt-4o | 균형잡힌 범용 분석 |
| Gemini | gemini-2.5-pro | 창의적 시각 + 데이터 분석 |
| Perplexity | sonar-pro | 실시간 웹 검색 + 최신 정보 |

### 임베딩 모델 (폴백 체인)
1. OpenAI: `text-embedding-3-small` (기본)
2. Gemini: `text-embedding-004` (폴백)

## 필수 API 키

```json
{
  "OPENAI_API_KEY": "sk-proj-...",
  "ANTHROPIC_API_KEY": "sk-ant-api03-...",
  "GOOGLE_API_KEY": "AIzaSy...",
  "PERPLEXITY_API_KEY": "pplx-..."
}
```

## Claude Desktop 설정 (claude_desktop_config.json)

```json
"ai-council": {
    "command": "node",
    "args": ["C:/Users/Sean K. S. Shin/MCP_Servers/ai-council-mcp/dist/mcp-server.js"],
    "cwd": "C:/Users/Sean K. S. Shin/MCP_Servers/ai-council-mcp",
    "env": {
        "OPENAI_API_KEY": "your-openai-key",
        "GOOGLE_API_KEY": "your-google-key",
        "PERPLEXITY_API_KEY": "your-perplexity-key",
        "ANTHROPIC_API_KEY": "your-anthropic-key",
        "POSTGRES_HOST": "localhost",
        "POSTGRES_PORT": "5432",
        "POSTGRES_USER": "postgres",
        "POSTGRES_PASSWORD": "postgres",
        "POSTGRES_DB": "ai_council",
        "REDIS_HOST": "localhost",
        "REDIS_PORT": "6379",
        "TRIGGER_KEYWORDS": "ai-council,council,debate,discussion,multi-model,AI카운슬,토론해,AI토론,4대장",
        "SUBMARINE_MODE": "true"
    }
}
```

## Docker 필수 서비스

```bash
# PostgreSQL + Redis 시작
docker start ai-council-postgres ai-council-redis
```

## 사용 가능한 도구 (8개)

| 도구 | 설명 |
|------|------|
| `query_knowledge_base` | RAG 검색 + AI 답변 |
| `add_document` | 문서 추가 |
| `add_multiple_documents` | 다중 문서 추가 |
| `analyze_query_complexity` | 쿼리 복잡도 분석 |
| `search_documents` | 키워드 검색 |
| `request_knowledge` | 지식 요청 |
| `ask_council_questions` | 토론 전 40개 질문 |
| `start_council_discussion` | AI 4대장 토론 시작 |

## 토론 프로세스

```
1. ask_council_questions → 40개 질문 (20 서술적 + 20 도전적)
2. 사용자 답변 제공
3. start_council_discussion → 3라운드 토론
   - Round 1: 초기 분석
   - Round 2: 상호 반응
   - Round 3: 최종 입장
4. Claude가 전체 종합 결론 제시
```

## 토큰 절약 기능

- 질문 유형에 따라 필요한 AI만 활성화
- 불필요한 모델은 "잠수함 모드"로 비활성화
- 최대 25% 토큰 절약

## 트러블슈팅

### 401 인증 오류
- API 키 확인 (특히 Anthropic)
- 키 만료 여부 확인
- 크레딧 잔액 확인

### 모델 오류
- claude-sonnet-4-20250514 (최신)
- gpt-4o (o3 아님!)
- gemini-2.5-pro

### 임베딩 실패
- OpenAI 할당량 초과 시 자동으로 Gemini 폴백

## 수정된 파일

- `dist/mcp-server.js`: AI 4대장 모델 추가, 패턴 업데이트
- `dist/rag/athena.js`: 모델명 수정, Gemini 임베딩 폴백 추가, Lazy initialization
- `dist/rag/upsert.js`: Lazy initialization

---
**마지막 업데이트**: 2025-12-21
**상태**: 정상 작동
