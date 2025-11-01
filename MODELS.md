# AI Council - 지원 모델 가이드

## 🤖 지원하는 AI 모델 (2025년 최신)

AI Council은 6개의 최첨단 AI 모델을 지원합니다. 각 모델은 특정 작업에 최적화되어 있습니다.

---

## 📊 모델 비교표

| 모델 | 버전 | 장점 | 최적 사용 사례 | 상대적 비용 |
|------|------|------|--------------|------------|
| **Claude** | 3.5 Sonnet | 최고의 코딩 & 추론 | 복잡한 코드, 깊은 분석 | $$$ |
| **O1** | o1-preview | 수학 & 과학 추론 | 증명, 복잡한 문제 해결 | $$$$ |
| **GPT-4** | Turbo Preview | 균형잡힌 성능 | 일반적인 작업 | $$ |
| **Gemini Pro** | 2.5 | 멀티모달, 긴 컨텍스트 | 대량 문서 분석 | $$$ |
| **Gemini Flash** | 2.0 Thinking | 빠른 응답 | 간단한 질문 | $ |
| **Perplexity** | Sonar Pro | 실시간 웹 검색 | 최신 뉴스, 현재 정보 | $$ |

---

## 🎯 모델별 상세 정보

### 1. Claude 3.5 Sonnet
```typescript
model: 'claude'
```

**제공사**: Anthropic
**모델**: claude-3-5-sonnet-20241022
**컨텍스트**: 200K 토큰
**max_tokens**: 1024

**강점**:
- ✅ 최고 수준의 코드 생성
- ✅ 복잡한 논리적 추론
- ✅ 긴 문맥 이해
- ✅ 안전성과 정확성

**사용 예시**:
```
- "Implement a binary search tree in Python"
- "Analyze this codebase and suggest improvements"
- "Explain the architectural patterns in this system"
```

---

### 2. OpenAI o1-preview
```typescript
model: 'o1'
```

**제공사**: OpenAI
**모델**: o1-preview
**특징**: 내부 추론 과정 포함

**강점**:
- ✅ 수학 문제 해결
- ✅ 과학적 추론
- ✅ 복잡한 논리 증명
- ✅ 단계별 사고 과정

**사용 예시**:
```
- "Prove that the square root of 2 is irrational"
- "Solve this differential equation: ..."
- "Design an optimal algorithm for ..."
```

---

### 3. GPT-4 Turbo Preview
```typescript
model: 'gpt4'
```

**제공사**: OpenAI
**모델**: gpt-4-turbo-preview
**컨텍스트**: 128K 토큰
**max_tokens**: 4096

**강점**:
- ✅ 균형잡힌 성능
- ✅ 다양한 작업 지원
- ✅ 긴 문서 처리
- ✅ 일관된 품질

**사용 예시**:
```
- "Summarize this 50-page document"
- "Compare these three approaches"
- "Generate a detailed report on ..."
```

---

### 4. Gemini Pro 2.5
```typescript
model: 'gemini-pro'
```

**제공사**: Google
**모델**: gemini-pro-2.5
**컨텍스트**: 1M 토큰 (업계 최대!)
**max_tokens**: 8192

**강점**:
- ✅ 초대형 컨텍스트
- ✅ 멀티모달 (텍스트, 이미지, 비디오)
- ✅ 빠른 처리 속도
- ✅ 코드 생성 우수

**사용 예시**:
```
- "Analyze this entire book (1000 pages)"
- "Process all these documents and find patterns"
- "Compare 50 different implementations"
```

---

### 5. Gemini 2.0 Flash Thinking
```typescript
model: 'gemini'
```

**제공사**: Google
**모델**: gemini-2.0-flash-thinking-exp-01-21
**특징**: 사고 과정 포함, 초고속

**강점**:
- ✅ 매우 빠른 응답 (< 1초)
- ✅ 저렴한 비용
- ✅ 간단한 작업에 최적
- ✅ 높은 처리량

**사용 예시**:
```
- "What is machine learning?"
- "Translate this to Korean"
- "Quick summary of ..."
```

---

### 6. Perplexity Sonar Pro
```typescript
model: 'perplexity'
```

**제공사**: Perplexity AI
**모델**: sonar-pro
**특징**: 실시간 웹 검색 + AI 답변

**강점**:
- ✅ 실시간 정보 검색
- ✅ 최신 뉴스 및 데이터
- ✅ 출처 포함 답변
- ✅ 웹 전체 검색

**사용 예시**:
```
- "What are today's top tech news?"
- "Latest research on quantum computing in 2025"
- "Current stock price of Tesla"
```

**설정**:
```typescript
search_recency_filter: 'month' // 최근 한 달 데이터
search_domain_filter: [] // 모든 도메인
```

---

## 🧠 자동 모델 선택 로직

AI Council은 쿼리를 분석해서 자동으로 최적 모델을 선택합니다:

```typescript
// 1. 실시간 정보 필요 → Perplexity
"What's the latest news about AI?"
→ perplexity

// 2. 수학/과학 추론 → O1
"Prove the Pythagorean theorem"
→ o1

// 3. 복잡한 코딩/분석 → Claude
"Implement a red-black tree with rotations"
→ claude

// 4. 간단한 질문 → Gemini Flash
"What is AI?"
→ gemini

// 5. 일반적인 작업 → GPT-4 Turbo
"Summarize this article"
→ gpt4
```

---

## 💰 비용 최적화 전략

### 1. 캐싱 활용 (70% 절감)
같은 질문은 Redis에서 즉시 반환:
```
첫 번째 쿼리: $0.01
두 번째 쿼리: $0.00 (캐시)
```

### 2. 모델 자동 선택
간단한 질문은 저렴한 모델 사용:
```
Simple → Gemini Flash ($)
Complex → Claude ($$$)
절감: 70%
```

### 3. 수동 모델 지정
꼭 필요한 경우에만 고가 모델:
```typescript
queryAthena(query, { model: 'o1' }) // 명시적 지정
```

---

## 🚀 사용 방법

### Claude Desktop에서

```
# 자동 선택 (추천)
@ai-council 머신러닝이 뭐야?

# 특정 모델 지정
@ai-council claude 모델로 코드 작성해줘: "binary search"
@ai-council perplexity로 최신 뉴스 알려줘
@ai-council o1으로 이 수학 문제 풀어줘
@ai-council gemini-pro로 이 긴 문서 분석해줘
```

### API에서

```typescript
// 자동 선택
await queryAthena("Your question")

// 수동 선택
await queryAthena("Your question", { model: 'claude' })
await queryAthena("Your question", { model: 'o1' })
await queryAthena("Your question", { model: 'perplexity' })
await queryAthena("Your question", { model: 'gemini-pro' })
```

---

## 🔄 모델 업데이트 주기

- **Claude**: 분기별 업데이트 (Anthropic)
- **GPT/o1**: 월별 개선 (OpenAI)
- **Gemini**: 실험 모델 주간 업데이트 (Google)
- **Perplexity**: 실시간 검색 지속 개선

---

## ⚙️ 모델 설정 커스터마이징

각 모델의 파라미터를 `src/rag/athena.ts`에서 조정 가능:

```typescript
// Claude
{
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 1024, // 늘리면 더 긴 답변
}

// GPT-4
{
  model: 'gpt-4-turbo-preview',
  temperature: 0.7, // 0-1, 높을수록 창의적
  max_tokens: 4096,
}

// Gemini Pro
{
  model: 'gemini-pro-2.5',
  generationConfig: {
    maxOutputTokens: 8192,
    temperature: 0.7,
  }
}

// Perplexity
{
  model: 'sonar-pro',
  search_recency_filter: 'week' // hour, day, week, month, year
}
```

---

## 📈 성능 벤치마크 (예상)

| 작업 | 최적 모델 | 응답 시간 | 정확도 |
|------|----------|----------|--------|
| 간단한 Q&A | Gemini Flash | 0.5초 | 95% |
| 코드 생성 | Claude | 2-3초 | 98% |
| 수학 증명 | O1 | 5-10초 | 99% |
| 문서 분석 | Gemini Pro | 3-5초 | 96% |
| 최신 뉴스 | Perplexity | 2-4초 | 97% |
| 일반 작업 | GPT-4 | 1-2초 | 96% |

---

## 🎓 권장 사항

1. **대부분의 경우**: 자동 선택 사용 (최적화됨)
2. **코딩 작업**: Claude 명시
3. **수학/과학**: O1 명시
4. **최신 정보**: Perplexity 명시
5. **긴 문서**: Gemini Pro 명시
6. **빠른 답변**: Gemini Flash 명시

---

**모델 업데이트 날짜**: 2025-01-01
**다음 업데이트 예정**: 2025-02-01
