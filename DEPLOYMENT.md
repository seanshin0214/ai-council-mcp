# AI Council MCP - 배포 가이드

## 🚀 빠른 시작

### 1. 환경 준비

```bash
# 1.1 프로젝트 클론
cd C:\Users\sshin\Documents\ai-council-mcp

# 1.2 의존성 설치
npm install

# 1.3 환경 변수 설정
# .env 파일을 열고 API 키 입력:
# - ANTHROPIC_API_KEY
# - OPENAI_API_KEY
# - GOOGLE_API_KEY
```

### 2. 인프라 시작

```bash
# WSL2에서 Docker 컨테이너 시작
docker-compose up -d

# 또는 WSL2 Docker 사용:
wsl
cd /mnt/c/Users/sshin/Documents/ai-council-mcp
docker-compose up -d
```

실행되는 서비스:
- PostgreSQL + pgvector (포트 5432)
- Redis (포트 6379)
- Prometheus (포트 9090)
- Grafana (포트 3001)

### 3. 빌드 및 실행

```bash
# TypeScript 컴파일
npm run build

# 개발 모드 (hot reload)
npm run dev

# 프로덕션 모드
node dist/index.js
```

### 4. 초기 사용자 생성

```bash
# WSL2에서 PostgreSQL 접속
wsl
docker exec -it ai-council-postgres psql -U postgres -d ai_council

# Admin 사용자 생성
INSERT INTO users (username, api_key, role)
VALUES ('admin', 'ak_admin_your_secure_key_here', 'admin');

# 확인
SELECT * FROM users;
\q
```

### 5. 테스트

```bash
# Health check
curl http://localhost:3000/health

# Writer 사용자 생성 (Admin API 키 사용)
curl -X POST http://localhost:3000/admin/users \
  -H "X-API-Key: ak_admin_your_secure_key_here" \
  -H "Content-Type: application/json" \
  -d '{"username": "writer1", "role": "writer"}'

# 문서 업로드
curl -X POST http://localhost:3000/documents \
  -H "X-API-Key: [새로_받은_API_키]" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Machine learning is...",
    "metadata": {"source": "test.txt"}
  }'

# 쿼리 테스트
curl -X POST http://localhost:3000/query \
  -H "X-API-Key: [API_키]" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is machine learning?"
  }'
```

---

## 📊 모니터링 대시보드

### Grafana
- URL: http://localhost:3001
- Username: `admin`
- Password: `admin123`
- 데이터소스: Prometheus (자동 설정됨)

### Prometheus
- URL: http://localhost:9090
- 쿼리 예시:
  - `ai_council_requests_total` - 총 요청 수
  - `ai_council_response_time_seconds` - 응답 시간
  - `ai_council_model_usage_total` - AI 모델 사용량
  - `ai_council_cache_hits_total` - 캐시 히트율

---

## 🔒 보안 체크리스트

배포 전 필수 확인사항:

- [ ] `.env` 파일에 실제 API 키 설정
- [ ] Admin API 키를 강력한 값으로 변경
- [ ] PostgreSQL 비밀번호 변경 (기본값 `postgres` 사용 금지)
- [ ] Rate limiting 설정 확인 (현재: 100 req/15min)
- [ ] HTTPS 설정 (프로덕션 환경)
- [ ] 방화벽 규칙 설정
- [ ] `.gitignore`에 `.env` 포함 확인

---

## 📈 성능 최적화

### 1. 캐싱 최적화
Redis TTL 조정 (`src/redis.ts`):
```typescript
// 기본: 1시간
await redisClient.setEx(key, 3600, response);

// 빈번한 쿼리: 6시간
await redisClient.setEx(key, 21600, response);
```

### 2. 벡터 인덱스 튜닝
문서 수에 따라 IVFFlat lists 조정 (`src/db.ts`):
```sql
-- 10K 문서: lists = 100
-- 100K 문서: lists = 1000
-- 1M 문서: lists = 10000

CREATE INDEX documents_embedding_idx
ON documents
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### 3. 모델 선택 전략
비용과 성능 밸런스 (`src/router.ts`):
- **Simple 쿼리**: Gemini (빠름, 저렴)
- **Moderate 쿼리**: GPT-4 (균형)
- **Complex 쿼리**: Claude (최고 품질)

---

## 🚨 트러블슈팅

### Docker 컨테이너 미작동
```bash
# 컨테이너 상태 확인
docker ps -a

# 로그 확인
docker logs ai-council-postgres
docker logs ai-council-redis

# 재시작
docker-compose restart
```

### Database 연결 실패
```bash
# PostgreSQL 연결 테스트
docker exec -it ai-council-postgres psql -U postgres -d ai_council -c "SELECT NOW();"

# pgvector 확장 확인
docker exec -it ai-council-postgres psql -U postgres -d ai_council -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

### 빌드 에러
```bash
# 캐시 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# TypeScript 재컴파일
npm run build
```

---

## 📦 프로덕션 배포

### Systemd 서비스 (Linux)
```ini
# /etc/systemd/system/ai-council.service
[Unit]
Description=AI Council MCP Server
After=network.target docker.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/ai-council-mcp
Environment="NODE_ENV=production"
ExecStart=/usr/bin/node dist/index.js
Restart=always

[Install]
WantedBy=multi-user.target
```

활성화:
```bash
sudo systemctl enable ai-council
sudo systemctl start ai-council
sudo systemctl status ai-council
```

### Nginx 리버스 프록시
```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # SSL 설정 (Let's Encrypt)
    # listen 443 ssl;
    # ssl_certificate /etc/letsencrypt/live/api.your-domain.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/api.your-domain.com/privkey.pem;
}
```

---

## 🔄 업데이트 및 유지보수

### 정기 업데이트
```bash
# 의존성 업데이트
npm update

# 보안 취약점 스캔
npm audit
npm audit fix

# Docker 이미지 업데이트
docker-compose pull
docker-compose up -d
```

### 데이터 백업
```bash
# PostgreSQL 덤프
docker exec ai-council-postgres pg_dump -U postgres ai_council > backup_$(date +%Y%m%d).sql

# Redis 백업
docker exec ai-council-redis redis-cli SAVE
docker cp ai-council-redis:/data/dump.rdb ./redis_backup_$(date +%Y%m%d).rdb
```

---

## 📞 지원

문제 발생 시:
1. GitHub Issues 생성
2. 로그 파일 첨부
3. 환경 정보 제공 (Node 버전, OS 등)

---

**배포 성공을 기원합니다!** 🚀
