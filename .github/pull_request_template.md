# Pull Request - AI Council MCP

## 📋 체크리스트

### 보안 (Security)
- [ ] 프롬프트 인젝션 방어 테스트 통과
- [ ] PII 탐지 로직 검증
- [ ] API 키가 코드에 하드코딩되지 않음
- [ ] 새로운 엔드포인트에 인증/인가 적용
- [ ] OWASP LLM Top 10 고려

### 안정성 (Reliability)
- [ ] 단위 테스트 작성 및 통과 (`npm test`)
- [ ] 에러 핸들링 구현 (try-catch, 적절한 HTTP 상태 코드)
- [ ] Rate limiting 영향 평가
- [ ] Database migration 필요 시 스크립트 포함
- [ ] Rollback 전략 문서화

### 관측성 (Observability)
- [ ] Prometheus 메트릭 추가 (해당 시)
- [ ] 로그 레벨 적절히 설정 (console.log/warn/error)
- [ ] 중요 작업에 timing metric 추가
- [ ] Grafana 대시보드 업데이트 필요 여부 확인

### 사용성 (Usability)
- [ ] API 변경 시 README 업데이트
- [ ] Breaking change인 경우 마이그레이션 가이드 작성
- [ ] 새로운 환경변수는 `.env.example` 추가
- [ ] Quick-start 예제 업데이트 (필요시)

### 자동화 (Automation)
- [ ] CI 체크 통과 (lint, build, test)
- [ ] TypeScript 컴파일 에러 없음
- [ ] 코드 포맷팅 적용 (prettier/eslint)

### 문서화 (Documentation)
- [ ] 코드 주석 추가 (복잡한 로직)
- [ ] JSDoc/TSDoc 작성 (public API)
- [ ] CHANGELOG.md 업데이트 (해당 시)

---

## 📝 변경 사항 설명

### 변경 이유 (Why)
<!-- 왜 이 변경이 필요한가요? 어떤 문제를 해결하나요? -->

### 변경 내용 (What)
<!-- 무엇을 변경했나요? -->

### 구현 방법 (How)
<!-- 어떻게 구현했나요? 대안은 고려했나요? -->

---

## 🧪 테스트 방법

<!-- 이 변경사항을 어떻게 테스트할 수 있나요? -->

```bash
# 예시:
# 1. 서버 시작
npm run dev

# 2. 테스트 요청
curl -X POST http://localhost:3000/query \
  -H "X-API-Key: test_key" \
  -d '{"query": "test"}'
```

---

## 🔗 관련 이슈

Closes #<!-- 이슈 번호 -->

---

## 📸 스크린샷 (해당 시)

<!-- Grafana 대시보드, API 응답 등 -->

---

## ⚠️ Breaking Changes

- [ ] 이 PR은 Breaking Change를 포함합니다

<!-- Breaking change가 있다면 마이그레이션 가이드를 작성하세요 -->

---

## 🚀 배포 전 확인사항

- [ ] 환경변수 추가/변경 사항을 DevOps 팀에 공유
- [ ] Database migration 스크립트 실행 계획 수립
- [ ] Rollback 절차 확인
- [ ] 모니터링 알람 설정 확인

---

**Reviewer를 위한 팁:**
- 변경된 파일 수: <!-- X files -->
- 예상 리뷰 시간: <!-- ~10분 / ~30분 / ~1시간 -->
- 집중 리뷰 포인트: <!-- 보안, 성능, 로직 등 -->
