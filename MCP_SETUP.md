# AI Council MCP - Claude Desktop 연동 가이드

## 🎯 개요

AI Council을 Claude Desktop의 MCP 서버로 사용하면:
- Claude Desktop에서 직접 지식 베이스 검색
- 3가지 AI 모델(Claude, GPT-4, Gemini) 활용
- 문서 추가 및 관리
- 시맨틱 캐싱으로 비용 절감

---

## ✅ 설정 완료!

Claude Desktop 설정이 이미 완료되었습니다!

**설정 파일 위치:**
```
C:\Users\sshin\AppData\Roaming\Claude\claude_desktop_config.json
```

**추가된 MCP 서버:**
```json
{
  "ai-council": {
    "command": "node",
    "args": ["C:\\Users\\sshin\\Documents\\ai-council-mcp\\dist\\mcp-server.js"],
    "env": {
      ...
    }
  }
}
```

---

## 🔧 사용 전 준비사항

### 1. API 키 설정

Claude Desktop 설정 파일을 열어서 API 키를 입력하세요:

```json
"env": {
  "ANTHROPIC_API_KEY": "실제_Anthropic_API_키",
  "OPENAI_API_KEY": "실제_OpenAI_API_키",
  "GOOGLE_API_KEY": "실제_Google_API_키",
  ...
}
```

### 2. Docker 인프라 시작

WSL2에서 Docker 컨테이너를 시작하세요:

```bash
# WSL2 접속
wsl

# 프로젝트 디렉토리로 이동
cd /mnt/c/Users/sshin/Documents/ai-council-mcp

# Docker Compose 시작
docker-compose up -d

# 상태 확인
docker ps
```

실행되어야 할 컨테이너:
- ✅ `ai-council-postgres` (포트 5432)
- ✅ `ai-council-redis` (포트 6379)

### 3. Claude Desktop 재시작

설정 파일을 수정했으므로 Claude Desktop을 완전히 종료하고 재시작하세요:

1. Claude Desktop 완전 종료
2. 다시 시작
3. MCP 서버가 자동으로 로드됨

---

## 🚀 사용 방법

### 1. 문서 추가하기

Claude Desktop에서:

```
@ai-council 다음 문서를 지식 베이스에 추가해줘:

"머신러닝은 인공지능의 한 분야로, 컴퓨터가 명시적으로 프로그래밍되지 않고도
데이터로부터 학습할 수 있게 하는 기술입니다..."

메타데이터: source="ml-basics.txt", category="education"
```

MCP가 자동으로 `add_document` 도구를 사용합니다.

### 2. 지식 베이스 검색

```
@ai-council 머신러닝이 뭐야?
```

MCP가 자동으로:
1. 지식 베이스에서 관련 문서 검색 (RAG)
2. 쿼리 복잡도 분석
3. 최적 AI 모델 선택 (Claude/GPT-4/Gemini)
4. 답변 생성

### 3. 특정 모델 지정

```
@ai-council Gemini 모델을 사용해서 빠르게 답변해줘: "AI란?"
```

모델 옵션:
- `claude`: 복잡한 추론 및 코딩
- `gpt4`: 균형잡힌 성능
- `gemini`: 빠르고 저렴
- `auto`: 자동 선택 (기본값)

### 4. 여러 문서 한 번에 추가

```
@ai-council 다음 문서들을 추가해줘:

1. "딥러닝은 머신러닝의 한 종류로..."
2. "신경망은 생물학적 신경망에서 영감을 받은..."
3. "강화학습은 보상을 최대화하는..."
```

### 5. 키워드로 문서 검색

```
@ai-council "신경망"이라는 키워드로 문서를 검색해줘
```

### 6. 쿼리 복잡도 분석

```
@ai-council 이 질문의 복잡도를 분석해줘: "Implement a neural network from scratch in Python"
```

결과:
```
복잡도: complex
추천 모델: claude
이유: Complex query requiring deep analysis or coding
```

---

## 🛠️ 사용 가능한 MCP 도구

Claude Desktop에서 자동으로 사용할 수 있는 도구:

| 도구 이름 | 설명 | 사용 예시 |
|----------|------|----------|
| `query_knowledge_base` | RAG 검색 및 AI 답변 | "@ai-council 머신러닝이 뭐야?" |
| `add_document` | 단일 문서 추가 | "@ai-council 문서 추가해줘: ..." |
| `add_multiple_documents` | 다중 문서 추가 | "@ai-council 여러 문서 추가..." |
| `analyze_query_complexity` | 쿼리 분석 | "@ai-council 복잡도 분석해줘..." |
| `search_documents` | 키워드 검색 | "@ai-council '신경망' 검색..." |

---

## 💡 실전 활용 예시

### 예시 1: 회사 문서 지식 베이스

```
# 1. 회사 정책 문서 추가
@ai-council 다음 휴가 정책을 추가해줘:
"연차는 입사 1년 후 15일이 부여되며, 연차 사용 시 최소 3일 전에 신청해야 합니다..."

# 2. 직원이 질문
@ai-council 연차는 언제부터 사용할 수 있어?

# 3. AI가 문서 기반으로 답변
```

### 예시 2: 개발 문서 도우미

```
# 1. API 문서 추가
@ai-council 다음 API 문서를 추가:
"User Authentication API: POST /api/auth/login
Parameters: email (string), password (string)
Returns: { token: string, user: {...} }"

# 2. 개발자가 질문
@ai-council 로그인 API 사용법 알려줘

# 3. 코드 예제 포함 답변
```

### 예시 3: 학습 노트 정리

```
# 1. 학습 내용 저장
@ai-council 오늘 배운 내용 추가:
"REST API는 Representational State Transfer의 약자로..."

# 2. 나중에 복습
@ai-council REST API가 뭐였지?

# 3. 저장한 내용 기반으로 상기
```

---

## 🔍 트러블슈팅

### MCP 서버가 로드되지 않음

**증상**: Claude Desktop에서 @ai-council을 입력해도 아무것도 안 뜸

**해결책**:
1. Docker 컨테이너 확인
   ```bash
   wsl
   docker ps
   # ai-council-postgres, ai-council-redis 실행 중인지 확인
   ```

2. 빌드 확인
   ```bash
   cd /mnt/c/Users/sshin/Documents/ai-council-mcp
   npm run build
   ```

3. Claude Desktop 로그 확인
   - `%APPDATA%\Claude\logs\` 디렉토리의 최신 로그 파일 확인

4. MCP 서버 직접 테스트
   ```bash
   cd C:\Users\sshin\Documents\ai-council-mcp
   node dist/mcp-server.js
   # 에러 메시지 확인
   ```

### Database 연결 실패

**증상**: "Database connection failed" 에러

**해결책**:
```bash
# WSL2에서 PostgreSQL 상태 확인
wsl
docker logs ai-council-postgres

# 컨테이너 재시작
docker-compose restart postgres

# 연결 테스트
docker exec -it ai-council-postgres psql -U postgres -c "SELECT 1"
```

### API 키 에러

**증상**: "API key not found" 또는 "Unauthorized"

**해결책**:
1. Claude Desktop 설정 파일 확인:
   ```
   C:\Users\sshin\AppData\Roaming\Claude\claude_desktop_config.json
   ```

2. API 키가 올바르게 설정되었는지 확인

3. Claude Desktop 재시작

---

## 📊 성능 팁

### 1. 캐싱 활용
기본적으로 캐싱이 활성화되어 있습니다. 같은 질문을 반복하면:
- ✅ 첫 번째: 1-3초 (AI 호출)
- ✅ 두 번째: 50-100ms (캐시)
- 💰 비용 절감: 70%

### 2. 모델 선택 전략
- **빠른 답변 필요**: `@ai-council gemini 모델로 답변해줘`
- **복잡한 분석**: `@ai-council claude 모델로 분석해줘`
- **자동 선택**: 아무것도 지정 안 하면 자동 선택

### 3. 문서 청킹 최적화
문서가 너무 길면 자동으로 1000자씩 청킹됩니다.
- 최적 문서 크기: 500-2000자
- 너무 짧으면: 컨텍스트 부족
- 너무 길면: 청크가 많아져서 검색 시간 증가

---

## 🎓 고급 사용법

### 리소스 브라우징

Claude Desktop에서 최근 문서 10개를 리소스로 볼 수 있습니다:

```
Resources → AI Council → Document 1, Document 2, ...
```

각 문서를 클릭하면 전체 내용과 메타데이터를 볼 수 있습니다.

### 메타데이터 활용

문서 추가 시 메타데이터를 활용하면 나중에 검색이 쉬워집니다:

```
@ai-council 추가해줘:
"내용..."

메타데이터:
- source: "tech-blog-2025.pdf"
- author: "John Doe"
- category: "machine-learning"
- tags: ["neural-networks", "deep-learning"]
- date: "2025-11-01"
```

---

## 🚀 다음 단계

1. **초기 문서 추가**: 회사 문서, 학습 자료 등을 지식 베이스에 추가
2. **팀과 공유**: 같은 지식 베이스를 팀원들과 공유
3. **모니터링**: Grafana 대시보드로 사용량 추적
4. **최적화**: 자주 묻는 질문은 캐싱으로 빠르게 답변

---

## 📞 도움말

- **GitHub Issues**: 문제 발생 시 이슈 등록
- **문서**: README.md, DEPLOYMENT.md 참조
- **로그**: `%APPDATA%\Claude\logs\` 확인

---

**즐거운 AI Council 사용 되세요!** 🎉
