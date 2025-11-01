# 📦 AI Council MCP - 완벽한 설치 가이드

이 문서는 AI Council MCP 서버를 처음부터 끝까지 설치하는 상세한 가이드입니다.

---

## 📋 목차

1. [시스템 요구사항](#-시스템-요구사항)
2. [사전 준비](#-사전-준비)
3. [API 키 발급](#-api-키-발급)
4. [프로젝트 설치](#-프로젝트-설치)
5. [데이터베이스 설정](#-데이터베이스-설정)
6. [환경 변수 설정](#-환경-변수-설정)
7. [빌드 및 테스트](#-빌드-및-테스트)
8. [Claude Desktop 연동](#-claude-desktop-연동)
9. [문제 해결](#-문제-해결)
10. [다음 단계](#-다음-단계)

---

## 💻 시스템 요구사항

### 필수 요구사항

| 항목 | 최소 버전 | 권장 버전 |
|------|-----------|-----------|
| **Operating System** | Windows 10/11, macOS 12+, Linux | Latest |
| **Node.js** | 18.0.0 | 20.x LTS |
| **npm** | 9.0.0 | Latest |
| **Docker Desktop** | 4.0.0 | Latest |
| **Claude Desktop** | Latest | Latest |
| **메모리** | 4GB RAM | 8GB+ RAM |
| **디스크 공간** | 2GB | 5GB+ |

### 선택 요구사항

- Git (버전 관리)
- VS Code 또는 다른 코드 에디터
- PostgreSQL 클라이언트 (TablePlus, pgAdmin 등)

---

## 🔧 사전 준비

### 1. Node.js 설치

#### Windows
```bash
# Chocolatey 사용
choco install nodejs-lts

# 또는 공식 사이트에서 다운로드
# https://nodejs.org/
```

#### macOS
```bash
# Homebrew 사용
brew install node@20

# 또는 공식 사이트에서 다운로드
```

#### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 설치 확인
```bash
node --version  # v20.x.x 이상
npm --version   # 9.x.x 이상
```

### 2. Docker Desktop 설치

#### Windows
1. [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/) 다운로드
2. WSL 2 백엔드 활성화
3. Docker Desktop 실행 및 로그인

#### macOS
```bash
# Homebrew 사용
brew install --cask docker

# 또는 공식 사이트에서 다운로드
# https://www.docker.com/products/docker-desktop/
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker

# 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER
```

#### Docker 설치 확인
```bash
docker --version
docker-compose --version

# Docker가 실행 중인지 확인
docker ps
```

### 3. Claude Desktop 설치

1. [Claude Desktop 다운로드](https://claude.ai/download)
2. 설치 및 실행
3. Anthropic 계정으로 로그인

---

## 🔑 API 키 발급

AI Council은 다음 4가지 AI 서비스의 API 키가 필요합니다:

### 1. OpenAI API 키 (필수)

**용도**: GPT-5, O1 모델, Embeddings

1. [OpenAI Platform](https://platform.openai.com/) 접속
2. 로그인 또는 회원가입
3. 우측 상단 **API keys** 클릭
4. **+ Create new secret key** 클릭
5. 키 이름 입력 (예: "AI Council")
6. 생성된 키 복사 (형식: `sk-proj-...`)

**요금**: $5 무료 크레딧 제공, 이후 사용량에 따라 과금

### 2. Google Gemini API 키 (필수)

**용도**: Gemini 2.0 Flash 모델

1. [Google AI Studio](https://aistudio.google.com/app/apikey) 접속
2. Google 계정으로 로그인
3. **Get API Key** 또는 **Create API Key** 클릭
4. 새 프로젝트 생성 또는 기존 프로젝트 선택
5. 생성된 키 복사 (형식: `AIzaSy...`)

**중요**:
- ~~`gen-lang-client-...` 형식의 키는 작동하지 않습니다!~~
- 반드시 `AIzaSy...`로 시작하는 정식 API 키를 사용하세요

**요금**: 월 60회 무료 요청, 이후 사용량에 따라 과금

### 3. Perplexity API 키 (필수)

**용도**: Perplexity Sonar Pro (실시간 웹 검색)

1. [Perplexity Settings - API](https://www.perplexity.ai/settings/api) 접속
2. Perplexity 계정으로 로그인
3. **Generate API Key** 클릭
4. 생성된 키 복사 (형식: `pplx-...`)

**요금**: $20 무료 크레딧 제공, 이후 사용량에 따라 과금

### 4. Anthropic API 키 (선택사항)

**용도**: Claude 3.5 Sonnet 모델 (Claude Desktop 외부 사용 시)

1. [Anthropic Console](https://console.anthropic.com/) 접속
2. 로그인 또는 회원가입
3. **API Keys** 메뉴 클릭
4. **Create Key** 클릭
5. 생성된 키 복사 (형식: `sk-ant-...`)

**참고**: Claude Desktop을 사용하는 경우 이 키는 선택사항입니다.

---

## 📦 프로젝트 설치

### 1. 저장소 클론

```bash
# HTTPS
git clone https://github.com/yourusername/ai-council-mcp.git
cd ai-council-mcp

# 또는 SSH
git clone git@github.com:yourusername/ai-council-mcp.git
cd ai-council-mcp
```

### 2. 의존성 설치

```bash
npm install
```

설치되는 주요 패키지:
- `@modelcontextprotocol/sdk` - MCP 서버 SDK
- `@anthropic-ai/sdk` - Claude API
- `openai` - OpenAI API (GPT-5, O1, Embeddings)
- `@google/generative-ai` - Gemini API
- `pg` - PostgreSQL 클라이언트
- `redis` - Redis 클라이언트
- `hono` - 웹 프레임워크
- `dotenv` - 환경변수 관리

### 3. TypeScript 컴파일 확인

```bash
npm run build
```

정상 빌드되면 `dist/` 폴더에 JavaScript 파일들이 생성됩니다.

---

## 🗄️ 데이터베이스 설정

### 방법 1: Docker Compose (권장)

AI Council은 Docker Compose를 사용하여 PostgreSQL과 Redis를 간편하게 설정할 수 있습니다.

#### 1. Docker Compose 파일 확인

프로젝트에 포함된 `docker-compose.yml`에는 다음이 정의되어 있습니다:
- PostgreSQL (pgvector 포함)
- Redis
- Prometheus (모니터링)
- Grafana (대시보드)

#### 2. 데이터베이스 시작

```bash
# PostgreSQL과 Redis만 시작
docker-compose up -d postgres redis

# 모든 서비스 시작 (Prometheus, Grafana 포함)
docker-compose up -d
```

#### 3. 컨테이너 상태 확인

```bash
docker ps
```

다음과 같은 출력이 나타나야 합니다:
```
CONTAINER ID   IMAGE                    STATUS
abc123...      pgvector/pgvector:pg16   Up
def456...      redis:7-alpine           Up
```

#### 4. 데이터베이스 연결 테스트

```bash
# PostgreSQL 연결 테스트
docker exec -it ai-council-postgres psql -U postgres -d ai_council -c "SELECT version();"

# Redis 연결 테스트
docker exec -it ai-council-redis redis-cli ping
# 출력: PONG
```

### 방법 2: 로컬 설치

Docker를 사용하지 않는 경우 PostgreSQL과 Redis를 직접 설치할 수 있습니다.

#### PostgreSQL with pgvector

**Windows:**
```bash
# Chocolatey 사용
choco install postgresql

# pgvector 설치
# https://github.com/pgvector/pgvector/releases에서 Windows 바이너리 다운로드
```

**macOS:**
```bash
brew install postgresql@16
brew install pgvector

# PostgreSQL 시작
brew services start postgresql@16
```

**Linux:**
```bash
sudo apt-get install postgresql-16 postgresql-16-pgvector
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 데이터베이스 생성

```bash
# PostgreSQL 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE ai_council;
\c ai_council

# pgvector 확장 활성화
CREATE EXTENSION vector;

# 종료
\q
```

#### Redis 설치

**Windows:**
```bash
choco install redis-64
redis-server
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

---

## ⚙️ 환경 변수 설정

**⚠️ 중요: `.env` 파일을 사용하지 마세요!**

이 프로젝트는 **Claude Desktop 설정 파일에서 직접 환경 변수를 관리**합니다. `.env` 파일을 사용하면 dotenv 자동 로딩으로 인해 JSON-RPC 통신이 오염되어 오류가 발생합니다.

### .env 파일 삭제 (중요!)

기존에 `.env` 파일이 있다면 삭제하세요:

```bash
# Windows (PowerShell)
Remove-Item .env -ErrorAction SilentlyContinue

# macOS/Linux
rm -f .env
```

### Claude Desktop 설정에서 환경 변수 관리

모든 환경 변수는 다음 섹션의 "Claude Desktop 연동" 단계에서 `claude_desktop_config.json` 파일에 직접 입력합니다.

---

## 🔨 빌드 및 테스트

### 1. TypeScript 빌드

```bash
npm run build
```

빌드가 성공하면 `dist/` 폴더에 다음 파일들이 생성됩니다:
- `dist/mcp-server.js` - MCP 서버 메인 파일
- `dist/db.js` - 데이터베이스 연결
- `dist/rag/athena.js` - RAG 엔진
- `dist/router.js` - 모델 라우터
- 기타 모듈 파일들

### 2. MCP 서버 테스트

```bash
# MCP 서버 직접 실행
npm run mcp
```

정상 실행되면 다음과 같은 출력이 나타납니다:
```
🚀 AI Council MCP Server starting...
✅ Database connected
✅ AI Council MCP Server running on stdio
📚 Available tools:
   - query_knowledge_base: RAG 검색 및 AI 답변
   - add_document: 문서 추가
   - add_multiple_documents: 다중 문서 추가
   - analyze_query_complexity: 쿼리 분석
   - search_documents: 키워드 검색
```

Ctrl+C로 종료할 수 있습니다.

### 3. 데이터베이스 연결 테스트

```bash
# Node.js REPL에서 테스트
node

# 다음 코드 입력
const { pool } = await import('./dist/db.js');
const result = await pool.query('SELECT NOW()');
console.log(result.rows[0]);
// 출력: { now: 2025-01-01T12:00:00.000Z }
```

---

## 🔗 Claude Desktop 연동

### 1. Claude Desktop 설정 파일 찾기

#### Windows
```
C:\Users\[사용자명]\AppData\Roaming\Claude\claude_desktop_config.json
```

#### macOS
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

#### Linux
```
~/.config/Claude/claude_desktop_config.json
```

### 2. 설정 파일 편집

`claude_desktop_config.json` 파일을 열고 `mcpServers` 섹션에 AI Council을 추가합니다:

```json
{
  "permissions": {
    "mode": "ask"
  },
  "mcpServers": {
    "ai-4대장": {
      "command": "node",
      "args": [
        "C:\\Users\\sshin\\Documents\\ai-council-mcp\\dist\\mcp-server.js"
      ],
      "env": {
        "ANTHROPIC_API_KEY": "your_anthropic_key",
        "OPENAI_API_KEY": "sk-proj-여기에_실제_키_입력",
        "GOOGLE_API_KEY": "AIzaSy여기에_실제_키_입력",
        "PERPLEXITY_API_KEY": "pplx-여기에_실제_키_입력",
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
      "args": [
        "C:\\Users\\sshin\\Documents\\ai-council-mcp\\dist\\mcp-server.js"
      ],
      "env": {
        "ANTHROPIC_API_KEY": "your_anthropic_key",
        "OPENAI_API_KEY": "sk-proj-여기에_실제_키_입력",
        "GOOGLE_API_KEY": "AIzaSy여기에_실제_키_입력",
        "PERPLEXITY_API_KEY": "pplx-여기에_실제_키_입력",
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

**중요**:
- Windows 경로는 백슬래시를 이중으로 (`\\`) 사용
- macOS/Linux는 일반 슬래시 (`/`) 사용
- 실제 API 키 값으로 교체

### 3. Claude Desktop 재시작

1. Claude Desktop 완전 종료 (트레이 아이콘까지 종료)
2. Claude Desktop 다시 시작
3. MCP 서버 연결 상태 확인

### 4. 연결 확인

Claude Desktop에서 다음과 같이 입력하여 테스트:

```
@ai-council 안녕? 잘 작동하니?
```

정상 작동하면 AI Council이 응답합니다!

---

## 🔍 문제 해결

### 문제 1: "Cannot find module" 에러

**증상:**
```
Error: Cannot find module '@modelcontextprotocol/sdk'
```

**해결:**
```bash
# node_modules 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 문제 2: Docker 컨테이너가 시작되지 않음

**증상:**
```
Error: Cannot connect to the Docker daemon
```

**해결:**
1. Docker Desktop이 실행 중인지 확인
2. Docker가 완전히 시작될 때까지 대기 (약 30초)
3. 재시도:
```bash
docker-compose down
docker-compose up -d postgres redis
```

### 문제 3: PostgreSQL 연결 실패

**증상:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**해결:**
```bash
# 컨테이너 상태 확인
docker ps | grep postgres

# 컨테이너 재시작
docker-compose restart postgres

# 로그 확인
docker-compose logs postgres
```

### 문제 4: Redis 연결 실패

**증상:**
```
Error: Redis connection failed
```

**해결:**
```bash
# Redis 컨테이너 확인
docker ps | grep redis

# Redis 재시작
docker-compose restart redis

# Redis 연결 테스트
docker exec -it ai-council-redis redis-cli ping
```

### 문제 5: Claude Desktop에서 MCP 서버 연결 실패

**증상:**
Claude Desktop의 MCP 서버 상태가 "failed"

**해결:**

1. **경로 확인**
```bash
# dist/mcp-server.js가 존재하는지 확인
ls dist/mcp-server.js
```

2. **환경 변수 확인**
- `claude_desktop_config.json`의 API 키가 정확한지 확인
- 경로에 특수문자나 공백이 없는지 확인

3. **수동 실행 테스트**
```bash
# MCP 서버를 직접 실행해보기
cd C:\Users\sshin\Documents\ai-council-mcp
node dist/mcp-server.js
```

4. **Claude Desktop 로그 확인**
   - Windows: `%APPDATA%\Claude\logs`
   - macOS: `~/Library/Logs/Claude`

### 문제 6: API 키 관련 에러

**증상:**
```
Error: Invalid API key
```

**해결:**
1. API 키가 정확한지 확인
2. API 키에 공백이나 줄바꿈이 없는지 확인
3. 각 서비스 웹사이트에서 키가 활성화되어 있는지 확인
4. 사용량 제한에 도달하지 않았는지 확인

### 문제 7: JSON 파싱 오류 (dotenv 오염)

**증상:**
```
Unexpected token 'D', 'Document s'... is not valid JSON
[dotenv@17.2.3] injecting env (12) from .env
```

**원인:** `.env` 파일의 dotenv 자동 로딩으로 stdout 오염

**해결:**
```bash
# .env 파일 삭제
rm .env  # macOS/Linux
del .env # Windows

# Claude Desktop 재시작
```

### 문제 8: Gemini API 모델 없음

**증상:**
```
models/gemini-1.5-pro is not found for API version v1beta
```

**원인:** Gemini 1.5 Pro는 2025년 현재 deprecated됨

**해결:** 이미 수정됨 (`gemini-2.0-flash-exp` 자동 사용)

최신 코드로 업데이트:
```bash
git pull
npm run build
```

### 문제 9: TypeScript 빌드 에러

**증상:**
```
error TS2307: Cannot find module
```

**해결:**
```bash
# TypeScript 재설치
npm install -D typescript@latest

# 타입 정의 패키지 설치
npm install -D @types/node

# 빌드 재시도
npm run build
```

---

## ✅ 다음 단계

설치가 완료되었습니다! 이제 다음 단계로 진행하세요:

### 1. 기본 사용법 익히기

```
# Claude Desktop에서 시도해보기
@ai-council 머신러닝이 뭐야?
@ai-council claude 모델로 React 컴포넌트 작성해줘
@ai-council perplexity로 오늘 AI 뉴스 알려줘
```

### 2. 문서 추가하기

```
@ai-council 이 내용을 지식베이스에 추가: "TypeScript는..."
```

### 3. 고급 기능 탐색

- [README.md](./README.md) - 전체 기능 소개
- [TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md) - 기술 명세서
- [MODELS.md](./MODELS.md) - 6개 AI 모델 상세 가이드

### 4. 모니터링 대시보드 확인

Prometheus와 Grafana를 시작했다면:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (admin/admin123)

### 5. 커스터마이징

- 모델 파라미터 조정 (`src/rag/athena.ts`)
- 라우팅 로직 수정 (`src/router.ts`)
- 캐시 TTL 변경 (`src/redis.ts`)

---

## 📞 도움이 필요하신가요?

- [GitHub Issues](https://github.com/yourusername/ai-council-mcp/issues)
- [README.md](./README.md)
- [TECHNICAL_SPEC.md](./TECHNICAL_SPEC.md)

---

**설치 완료를 축하합니다! 🎉**

AI Council을 즐겁게 사용하세요!
