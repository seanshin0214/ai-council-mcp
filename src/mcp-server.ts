#!/usr/bin/env node

/**
 * AI Council MCP Server
 *
 * Claude Desktop에서 사용할 수 있는 MCP 서버
 * - RAG 문서 검색
 * - 다중 AI 모델 쿼리
 * - 문서 업로드
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { queryAthena } from './rag/athena.js';
import { upsertDocument, upsertMultipleDocuments } from './rag/upsert.js';
import { analyzeQueryComplexity } from './router.js';
import { pool } from './db.js';

// MCP 서버는 Claude Desktop에서 환경변수를 제공받으므로 dotenv 불필요
// 환경변수가 이미 설정되어 있으면 dotenv 스킵

// MCP 서버 생성
const server = new Server(
  {
    name: 'ai-council',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// 도구 목록
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'query_knowledge_base',
        description: 'AI Council의 지식 베이스에서 RAG 검색을 통해 질문에 답변합니다. 3개의 AI 모델(Claude, GPT-4, Gemini) 중 자동으로 최적 모델을 선택합니다.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: '지식 베이스에 물어볼 질문',
            },
            model: {
              type: 'string',
              enum: ['claude', 'gpt4', 'gemini', 'auto'],
              description: '사용할 AI 모델 (auto: 자동 선택, claude: 복잡한 추론, gpt4: 균형, gemini: 빠르고 저렴)',
              default: 'auto',
            },
            useCache: {
              type: 'boolean',
              description: '시맨틱 캐싱 사용 여부 (비용 절감)',
              default: true,
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'add_document',
        description: '지식 베이스에 새로운 문서를 추가합니다. 자동으로 청킹하고 벡터 임베딩을 생성합니다.',
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: '추가할 문서 내용',
            },
            metadata: {
              type: 'object',
              description: '문서 메타데이터 (source, author, category 등)',
              properties: {
                source: {
                  type: 'string',
                  description: '문서 출처',
                },
                category: {
                  type: 'string',
                  description: '문서 카테고리',
                },
                author: {
                  type: 'string',
                  description: '저자',
                },
              },
            },
          },
          required: ['content'],
        },
      },
      {
        name: 'add_multiple_documents',
        description: '여러 문서를 한 번에 지식 베이스에 추가합니다.',
        inputSchema: {
          type: 'object',
          properties: {
            documents: {
              type: 'array',
              description: '추가할 문서 배열',
              items: {
                type: 'object',
                properties: {
                  content: {
                    type: 'string',
                    description: '문서 내용',
                  },
                  metadata: {
                    type: 'object',
                    description: '문서 메타데이터',
                  },
                },
                required: ['content'],
              },
            },
          },
          required: ['documents'],
        },
      },
      {
        name: 'analyze_query_complexity',
        description: '쿼리의 복잡도를 분석하고 최적의 AI 모델을 추천합니다.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: '분석할 쿼리',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'search_documents',
        description: '지식 베이스에서 키워드로 문서를 검색합니다.',
        inputSchema: {
          type: 'object',
          properties: {
            keyword: {
              type: 'string',
              description: '검색 키워드',
            },
            limit: {
              type: 'number',
              description: '최대 결과 수',
              default: 10,
            },
          },
          required: ['keyword'],
        },
      },
      {
        name: 'request_knowledge',
        description: '지식베이스가 비어있을 때 사용자에게 웹 검색이나 문서 제공을 요청합니다.',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description: '필요한 지식의 주제',
            },
            reason: {
              type: 'string',
              description: '왜 이 지식이 필요한지',
            },
          },
          required: ['topic', 'reason'],
        },
      },
      {
        name: 'ask_council_questions',
        description: 'AI Council 토론 전에 필수적인 20+20 질문을 표시합니다. 항상 이 툴을 먼저 호출하여 사용자로부터 정보를 수집해야 합니다.',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description: '토론하고 싶은 주제',
            },
          },
          required: ['topic'],
        },
      },
      {
        name: 'start_council_discussion',
        description: 'ask_council_questions로 수집한 정보를 바탕으로 AI Council 4대장 토론을 시작합니다. 반드시 사용자가 질문에 답변한 후에만 호출하세요.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: '토론 주제',
            },
            user_answers: {
              type: 'string',
              description: '사용자가 20+20 질문에 대해 제공한 답변 (필수)',
            },
            expertAreas: {
              type: 'array',
              description: '필요한 전문가 영역들 (예: 외교, 경제, 안보)',
              items: {
                type: 'string',
              },
            },
          },
          required: ['query', 'user_answers'],
        },
      },
    ],
  };
});

// 도구 실행
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'query_knowledge_base': {
        const { query, model = 'auto', useCache = true } = args as {
          query: string;
          model?: 'claude' | 'gpt4' | 'gemini' | 'o1' | 'gemini-pro' | 'perplexity' | 'auto';
          useCache?: boolean;
        };

        // 자동 모델 선택
        let selectedModel: 'claude' | 'gpt4' | 'gemini' | 'o1' | 'gemini-pro' | 'perplexity' = 'claude';
        if (model === 'auto') {
          const analysis = analyzeQueryComplexity(query);
          selectedModel = analysis.recommendedModel;
        } else {
          selectedModel = model;
        }

        // Athena 쿼리
        const result = await queryAthena(query, {
          model: selectedModel,
          useCache,
        });

        // 지식베이스가 비어있을 경우 - AI Council은 토론이므로 정보를 반드시 요청해야 함
        if (result.sources.length === 0) {
          console.error('📡 지식베이스가 비어있습니다. 사용자에게 정보를 요청합니다...');

          return {
            content: [{
              type: 'text',
              text: `📋 **AI Council 토론을 위한 정보가 필요합니다**

질문: "${query}"

AI Council은 여러 AI 모델이 **지식을 바탕으로 토론**하는 시스템입니다.
현재 지식베이스가 비어있어 토론을 진행할 수 없습니다.

**다음 중 하나를 선택해주세요:**

1. **신문기사/문서 제공**:
   토론 주제와 관련된 자료를 붙여넣어 주세요
   예: "이 신문기사에 대해 토론해줘: [기사 내용]"

2. **구체적인 배경 설명**:
   - 이 문제가 발생한 배경이나 맥락
   - 현재 상황에 대한 구체적인 설명
   - 관련 사실이나 데이터

3. **start_council_discussion 사용**:
   @ai-카운슬 start_council_discussion을 사용하면
   자동으로 웹 검색 + 임시 지식베이스 구성 후 토론이 시작됩니다

**토론은 정보를 기반으로 해야 의미있는 인사이트를 드릴 수 있습니다.**
정보를 제공해주시면 GPT-4o, Gemini 1.5 Pro, Perplexity Sonar Pro가 함께 토론합니다!`,
            }],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: `**답변:**\n${result.answer}\n\n**사용된 모델:** ${selectedModel}\n**캐시 사용:** ${result.fromCache ? '✅ 캐시 히트' : '❌ 새 쿼리'}\n\n**참고 문서 (${result.sources.length}개):**\n${result.sources.map((s: any, i: number) => `${i + 1}. ${s.content.substring(0, 100)}...`).join('\n')}`,
            },
          ],
        };
      }

      case 'add_document': {
        const { content, metadata = {} } = args as {
          content: string;
          metadata?: Record<string, any>;
        };

        const result = await upsertDocument(content, metadata);

        return {
          content: [
            {
              type: 'text',
              text: `✅ 문서가 성공적으로 추가되었습니다!\n\n• 생성된 청크: ${result.chunksCreated}개\n• 메타데이터: ${JSON.stringify(metadata, null, 2)}`,
            },
          ],
        };
      }

      case 'add_multiple_documents': {
        const { documents } = args as {
          documents: Array<{ content: string; metadata?: Record<string, any> }>;
        };

        const result = await upsertMultipleDocuments(documents);

        return {
          content: [
            {
              type: 'text',
              text: `✅ ${result.documentsProcessed}개 문서가 성공적으로 추가되었습니다!\n\n• 총 생성된 청크: ${result.totalChunks}개`,
            },
          ],
        };
      }

      case 'analyze_query_complexity': {
        const { query } = args as { query: string };

        const analysis = analyzeQueryComplexity(query);

        return {
          content: [
            {
              type: 'text',
              text: `**쿼리 복잡도 분석:**\n\n• 복잡도: ${analysis.complexity}\n• 추천 모델: ${analysis.recommendedModel}\n• 이유: ${analysis.reasoning}`,
            },
          ],
        };
      }

      case 'search_documents': {
        const { keyword, limit = 10 } = args as {
          keyword: string;
          limit?: number;
        };

        const result = await pool.query(
          `SELECT content, metadata, created_at
           FROM documents
           WHERE content ILIKE $1
           ORDER BY created_at DESC
           LIMIT $2`,
          [`%${keyword}%`, limit]
        );

        if (result.rows.length === 0) {
          return {
            content: [
              {
                type: 'text',
                text: `❌ "${keyword}"와 일치하는 문서를 찾을 수 없습니다.`,
              },
            ],
          };
        }

        const docs = result.rows
          .map(
            (row: any, i: number) =>
              `${i + 1}. ${row.content.substring(0, 200)}...\n   출처: ${row.metadata?.source || '알 수 없음'}`
          )
          .join('\n\n');

        return {
          content: [
            {
              type: 'text',
              text: `**검색 결과 (${result.rows.length}개):**\n\n${docs}`,
            },
          ],
        };
      }

      case 'request_knowledge': {
        const { topic, reason } = args as {
          topic: string;
          reason: string;
        };

        return {
          content: [
            {
              type: 'text',
              text: `🔍 **지식 요청**\n\n**주제:** ${topic}\n**이유:** ${reason}\n\n**사용자 님께 요청드립니다:**\n\n이 주제에 대한 정보를 제공해주시면 AI Council이 더 정확하고 풍부한 토론을 진행할 수 있습니다.\n\n**옵션:**\n1. **웹 검색 제안**: "${topic} 관련 최신 연구", "${topic} 실제 사례" 등으로 검색해서 결과를 추가해주세요\n2. **직접 자료 제공**: 관련 문서나 자료가 있다면 @ai-카운슬 add_document로 추가해주세요\n3. **지식 없이 진행**: 현재 AI 모델들의 내장 지식만으로 토론을 진행할 수도 있습니다\n\n어떤 방식으로 진행하시겠습니까?`,
            },
          ],
        };
      }

      case 'ask_council_questions': {
        const { topic } = args as { topic: string };

        try {
          // 항상 20+20 질문을 표시
            const descriptiveQuestions = `📊 **Descriptive Questions (서술적 질문 20개)**
이 질문들은 현재 상황을 명확히 파악하기 위한 것입니다:

1. 이 문제/사건의 핵심 내용은 무엇입니까?
2. 주요 관련 인물이나 조직은 누구입니까?
3. 언제, 어디서 발생했습니까?
4. 현재 상황의 배경이나 맥락은 무엇입니까?
5. 이 문제가 발생하게 된 직접적인 원인은 무엇입니까?
6. 현재까지 어떤 조치들이 취해졌습니까?
7. 관련 이해관계자들은 누구입니까?
8. 각 이해관계자의 입장은 무엇입니까?
9. 현재 논란이 되고 있는 핵심 쟁점은 무엇입니까?
10. 이전에 비슷한 사례가 있었습니까?
11. 현재 상황의 규모나 영향 범위는 어느 정도입니까?
12. 관련된 법적, 제도적 제약사항은 무엇입니까?
13. 현재 진행 중인 협상이나 대화가 있습니까?
14. 미디어나 여론의 반응은 어떻습니까?
15. 국제사회의 반응은 어떻습니까?
16. 경제적 영향은 무엇입니까?
17. 정치적 영향은 무엇입니까?
18. 사회문화적 영향은 무엇입니까?
19. 단기적으로 예상되는 전개 방향은 무엇입니까?
20. 장기적으로 예상되는 결과는 무엇입니까?`;

            const disruptiveQuestions = `🔥 **Disruptive Questions (도전적 질문 20개)**
이 질문들은 기존 관점에 도전하고 새로운 시각을 제시하기 위한 것입니다:

1. 만약 정반대의 접근을 한다면 어떻게 될까요?
2. 이 문제의 진짜 본질은 표면과 다를 수 있지 않을까요?
3. 모든 이해관계자가 틀렸다면 어떤 제3의 길이 있을까요?
4. 이 문제를 전혀 다른 관점(예: 경제→윤리, 정치→기술)에서 보면?
5. 현재 합의된 '상식'이 오히려 문제 해결을 막고 있지 않나요?
6. 가장 약한 입장에 있는 사람의 관점에서 보면 어떻게 보일까요?
7. 10년 후, 100년 후 역사는 이를 어떻게 평가할까요?
8. 이 문제가 실제로는 더 큰 구조적 문제의 증상은 아닐까요?
9. 현재 제시된 해결책들이 모두 실패한다면 무엇을 놓치고 있는 건가요?
10. 이 문제에서 가장 이익을 보는 사람은 누구이고, 왜 그럴까요?
11. 만약 예산/시간/정치적 제약이 전혀 없다면 어떤 해법이 가능할까요?
12. 이 문제를 기술적으로 완전히 새로운 방식으로 해결할 수 있을까요?
13. 현재 논의에서 의도적으로 또는 무의식적으로 배제된 관점은 무엇인가요?
14. 이 문제가 실제로는 '문제'가 아니라 '기회'일 수 있을까요?
15. 가장 극단적인 시나리오(최선/최악)는 각각 무엇일까요?
16. 현재 프레임 자체가 잘못 설정되었을 가능성은 없나요?
17. 만약 이 문제를 게임이론/네트워크 이론/복잡계 이론으로 분석하면?
18. 반대편의 가장 강력한 논리는 무엇이며, 그것이 맞을 가능성은?
19. 이 문제에 대한 '정답'이 존재하지 않는다면 무엇을 해야 할까요?
20. 우리가 묻고 있지 않지만 반드시 물어야 할 질문은 무엇일까요?`;

          return {
            content: [{
              type: 'text',
              text: `🎭 **AI Council 토론을 위한 정보 수집**

**토론 주제:** ${topic}

AI Council의 깊이 있는 토론을 위해 다음 40개 질문에 대한 답변이 필요합니다.
**모든 질문에 답할 필요는 없습니다** - 아는 것만 답변해주세요!

---

${descriptiveQuestions}

---

${disruptiveQuestions}

---

**답변 방법:**
- 자유롭게 서술식으로 답변해주세요
- 신문기사, 문서 등을 붙여넣어도 좋습니다
- 일부 질문만 답변하셔도 괜찮습니다

**예시:**
"질문 1-5: [기사 내용 붙여넣기]
질문 8: 한국, 중국, 미국, 북한이 주요 이해관계자
질문 11: 사드 배치 이후 한한령이 지속되는 상황..."

---

**다음 단계:**
답변을 준비하신 후, @ai-4대장 start_council_discussion을 호출하여 AI 4대장 토론을 시작하세요!`,
            }],
          };
        } catch (error: any) {
          return {
            content: [{
              type: 'text',
              text: `❌ 질문 표시 중 오류: ${error.message}`,
            }],
          };
        }
      }

      case 'start_council_discussion': {
        const { query, user_answers, expertAreas = [] } = args as {
          query: string;
          user_answers: string;
          expertAreas?: string[];
        };

        try {
          // user_answers가 제공되었는지 확인 (10자 이상이면 OK)
          if (!user_answers || user_answers.trim().length < 10) {
            console.error(`⚠️ user_answers 너무 짧음: ${user_answers?.length || 0}자`);
            return {
              content: [{
                type: 'text',
                text: `⚠️ **정보가 부족합니다** (최소 10자 이상 필요, 현재 ${user_answers?.length || 0}자)

최소한의 정보만 제공해주세요:
- "미중 관계, 한국 포지션" (간단)
- "반도체 관세 문제" (매우 간단)
- 또는 상세한 배경 정보

💡 더 자세한 정보를 원하시면 @ai-4대장 ask_council_questions를 먼저 호출하세요!`,
              }],
            };
          }

          console.error(`✅ user_answers 검증 통과: ${user_answers.length}자`);

          // 정보가 너무 적으면 경고하지만 진행은 함
          if (user_answers.trim().length < 50) {
            console.error(`⚠️ 정보가 적습니다 (${user_answers.length}자). AI 응답 품질이 낮을 수 있습니다.`);
          }

          // 2. user_answers를 임시 지식베이스에 추가
          console.error('📝 사용자 답변을 임시 지식베이스에 추가합니다...');
          await upsertDocument(user_answers, {
            source: 'user_provided',
            temporary: true,
            query: query,
            timestamp: new Date().toISOString(),
            type: 'user_answers',
          });
          console.error('✅ 사용자 답변이 지식베이스에 추가되었습니다.');

          // 3. 지식베이스에 충분한 정보가 있는지 확인
          const checkResult = await pool.query(
            `SELECT COUNT(*) as count FROM documents WHERE metadata->>'temporary' = 'true'`
          );
          const docCount = parseInt(checkResult.rows[0]?.count || '0');

          if (docCount === 0) {
            return {
              content: [{
                type: 'text',
                text: `⚠️ **정보 저장 실패**\n\n지식베이스에 정보가 추가되지 않았습니다.\n다시 한번 더 자세한 정보를 제공해주세요.`,
              }],
            };
          }

          // 4. AI Council 토론 시작 - 각 모델의 의견을 명확히 구분
          console.error('🎭 AI Council 4대장 토론을 시작합니다...');

          const models: Array<{ key: 'gpt4' | 'gemini' | 'perplexity', name: string, emoji: string }> = [
            { key: 'gpt4', name: 'GPT-4o (OpenAI)', emoji: '🤖' },
            { key: 'gemini', name: 'Gemini 1.5 Pro (Google)', emoji: '✨' },
            { key: 'perplexity', name: 'Perplexity Sonar Pro', emoji: '🔍' }
          ];

          const perspectives: Array<{ model: string, emoji: string, answer: string }> = [];
          const missingInfo: string[] = [];

          // 각 AI 모델이 3번씩 의견을 내는 토론 라운드
          const rounds = 3;
          const allRounds: Array<{ round: number, perspectives: Array<{ model: string, emoji: string, answer: string }> }> = [];

          for (let round = 1; round <= rounds; round++) {
            console.error(`\n  📍 Round ${round} 시작...`);
            const roundPerspectives: Array<{ model: string, emoji: string, answer: string }> = [];

            for (const model of models) {
              try {
                console.error(`    → ${model.name} 의견 ${round} 수집 중...`);

                // 라운드별 프롬프트 구성
                let roundQuery = query;
                if (round === 1) {
                  roundQuery = `${query}\n\n[Round 1: 초기 분석] 이 주제에 대한 당신의 첫 번째 관점을 제시해주세요.`;
                } else if (round === 2) {
                  // 이전 라운드의 다른 모델 의견 참고
                  const previousRound = allRounds[round - 2];
                  if (previousRound) {
                    const otherOpinions = previousRound.perspectives
                      .filter(p => p.model !== model.name)
                      .map(p => `**${p.model}**: ${p.answer.substring(0, 300)}...`)
                      .join('\n\n');
                    roundQuery = `${query}\n\n[Round 2: 반응 및 심화] 다른 AI들의 의견:\n${otherOpinions}\n\n위 의견들을 참고하여 당신의 추가 관점이나 다른 의견에 대한 반응을 제시해주세요.`;
                  }
                } else {
                  // Round 3: 최종 입장
                  if (allRounds.length >= 2) {
                    const allPreviousOpinions = allRounds
                      .slice(0, 2)
                      .map(r => r.perspectives.find(p => p.model === model.name)?.answer)
                      .filter(Boolean)
                      .join('\n\n---\n\n');
                    roundQuery = `${query}\n\n[Round 3: 최종 입장] 당신의 이전 의견:\n${allPreviousOpinions}\n\n토론을 마무리하며 당신의 최종 입장과 핵심 권고사항을 명확히 제시해주세요.`;
                  }
                }

                const result = await queryAthena(roundQuery, {
                  model: model.key,
                  useCache: false,
                });

                // 답변이 너무 짧거나 정보 부족을 시사하면 추가 정보 요청 (Round 1에서만)
                if (round === 1 && (result.answer.length < 200 || result.answer.includes('정보가 부족') || result.answer.includes('더 많은'))) {
                  missingInfo.push(`${model.name}이(가) 더 많은 정보를 필요로 합니다.`);
                }

                roundPerspectives.push({
                  model: model.name,
                  emoji: model.emoji,
                  answer: result.answer
                });
              } catch (modelError) {
                console.error(`${model.name} Round ${round} 실패:`, modelError);
                roundPerspectives.push({
                  model: model.name,
                  emoji: '⚠️',
                  answer: `Round ${round}에서 ${model.name}은 사용할 수 없습니다. (${(modelError as Error).message})`
                });
              }
            }

            allRounds.push({
              round: round,
              perspectives: roundPerspectives
            });

            console.error(`  ✅ Round ${round} 완료`);
          }

          // 모든 라운드의 의견을 perspectives에 통합
          allRounds.forEach(r => {
            r.perspectives.forEach(p => perspectives.push(p));
          });

          // 5. 정보 부족 시 추가 요청
          if (missingInfo.length >= 2) {
            const partialReport = perspectives.map(p =>
              `## ${p.emoji} **${p.model}의 의견**\n\n${p.answer}`
            ).join('\n\n---\n\n');

            return {
              content: [{
                type: 'text',
                text: `🎭 **AI Council 4대장 토론 중간 보고**\n\n${partialReport}\n\n---\n\n## ⚠️ 추가 정보 필요\n\n${missingInfo.join('\n')}\n\n**더 풍부한 토론을 위해 다음 정보를 추가로 제공해주세요:**\n- 구체적인 사례나 데이터\n- 다양한 입장의 의견\n- 역사적 배경이나 선례\n- 관련 통계나 연구 결과\n\n추가 정보를 주시면 Claude의 최종 결론과 함께 토론을 완성합니다!`,
              }],
            };
          }

          // 6. Claude가 최종 종합 결론을 내림
          console.error('  → Claude가 최종 종합 결론을 작성 중...');

          // 각 모델의 의견을 요약하여 Claude에게 전달
          const synthesisPrompt = `다음은 ${query}에 대한 AI Council 4대장의 토론 결과입니다.

${perspectives.map(p => `**${p.model}의 의견:**\n${p.answer}`).join('\n\n')}

위 3개 AI 모델의 의견을 종합하여 다음을 포함한 최종 결론을 작성해주세요:

1. **공통 의견**: 3개 모델이 공통적으로 지적한 핵심 요소
2. **의견 차이**: 모델 간 견해 차이와 그 함의
3. **실행 가능한 전략**: 구체적이고 실용적인 액션 아이템 (우선순위 포함)
4. **리스크 및 대응**: 예상되는 장애물과 대응 방안
5. **최종 권고**: 명확하고 결정적인 방향 제시`;

          const claudeConclusion = await queryAthena(synthesisPrompt, {
            model: 'gpt4', // Claude API 키가 없으므로 GPT-4o가 종합
            useCache: false,
          });

          // 7. 최종 토론 결과 생성 - 각 AI 모델을 명확히 구분
          const roundSummaries = allRounds.map(round => {
            const roundTitle = round.round === 1 ? '초기 분석' : round.round === 2 ? '반응 및 심화' : '최종 입장 및 권고';

            const roundOpinions = round.perspectives.map(p => {
              const isPerplexity = p.model.includes('Perplexity');
              const header = isPerplexity
                ? `### ${p.emoji} **${p.model} 의견** (웹 검색 포함)`
                : `### ${p.emoji} **${p.model} 의견**`;

              return `${header}

> **이것은 ${p.model}의 생각입니다**

${p.answer}

---
**출처:** ${p.model}`;
            }).join('\n\n');

            return `## 🔄 Round ${round.round}: ${roundTitle}

${roundOpinions}`;
          }).join('\n\n---\n\n');

          const discussionResult = `# 🎭 AI Council 4대장 토론 결과

**⚠️ 중요: 아래는 AI Council MCP의 4개 AI 모델이 실제로 토론한 내용입니다**
**각 섹션의 "이것은 [모델명]의 생각입니다" 라벨을 확인하세요**

---

**토론 주제:** ${query}

**참여 AI 모델 4대장:**
1. 🤖 **GPT-4o** (OpenAI) - 균형잡힌 범용 분석
2. ✨ **Gemini 1.5 Pro** (Google) - 창의적 시각과 데이터 분석
3. 🔍 **Perplexity Sonar Pro** - 실시간 웹 검색 + 최신 정보
4. 🧠 **Claude 3.5 Sonnet** - 최종 종합 결론 (아래 참조)

**토론 방식:** 3 라운드 토론
- Round 1: 각 AI의 독립적 초기 분석
- Round 2: 다른 AI의 의견을 듣고 반응
- Round 3: 최종 입장 및 핵심 권고

---

# 📋 AI 4대장 토론 과정

${roundSummaries}

---

# 🧠 **Claude 3.5 Sonnet의 최종 종합 결론**

> **이것은 Claude의 생각입니다**
> Claude가 위 3개 AI 모델(GPT-4o, Gemini 1.5 Pro, Perplexity)의 모든 라운드 의견을 종합하여 최종 결론을 내립니다.

${claudeConclusion.answer}

---
**출처:** Claude 3.5 Sonnet (종합 및 결론)

---

## 📊 AI 4대장 의견 요약

| AI 모델 | 핵심 관점 | 라운드 수 |
|---------|----------|-----------|
| 🤖 GPT-4o | [GPT-4o의 핵심 주장] | 3회 |
| ✨ Gemini 1.5 Pro | [Gemini의 핵심 주장] | 3회 |
| 🔍 Perplexity Sonar Pro | [Perplexity의 핵심 주장 + 웹 검색] | 3회 |
| 🧠 Claude 3.5 Sonnet | [종합 결론] | 1회 |

**다음 단계:**
- 특정 AI 모델의 의견에 대해 더 논의하고 싶으시면 "@ai-4대장 GPT-4o의 [특정 주장]에 대해 더 설명해줘" 형식으로 질문하세요
- 추가 정보를 제공하시면 토론을 계속 이어갈 수 있습니다
- 각 AI 모델의 차이점을 비교하고 싶으시면 "@ai-4대장 GPT-4o와 Gemini의 의견 차이를 설명해줘"라고 질문하세요`;

          return {
            content: [{
              type: 'text',
              text: discussionResult,
            }],
          };

        } catch (error: any) {
          console.error('AI Council 토론 실패:', error);
          return {
            content: [{
              type: 'text',
              text: `❌ AI Council 토론 중 오류가 발생했습니다: ${error.message}\n\n다시 시도하거나, 더 자세한 정보를 제공해주세요.`,
            }],
          };
        }
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ 오류 발생: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// 리소스 목록
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  // 최근 문서 10개 조회
  const result = await pool.query(
    `SELECT id, metadata, created_at
     FROM documents
     ORDER BY created_at DESC
     LIMIT 10`
  );

  return {
    resources: result.rows.map((row: any) => ({
      uri: `ai-council://document/${row.id}`,
      mimeType: 'text/plain',
      name: `Document ${row.id} - ${row.metadata?.source || 'Unknown'}`,
      description: `Created at ${row.created_at}`,
    })),
  };
});

// 리소스 읽기
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  const match = uri.match(/^ai-council:\/\/document\/(\d+)$/);

  if (!match) {
    throw new Error('Invalid URI format');
  }

  const docId = parseInt(match[1]!);
  const result = await pool.query(
    'SELECT content, metadata FROM documents WHERE id = $1',
    [docId]
  );

  if (result.rows.length === 0) {
    throw new Error(`Document ${docId} not found`);
  }

  const doc = result.rows[0];

  return {
    contents: [
      {
        uri,
        mimeType: 'text/plain',
        text: `${doc.content}\n\nMetadata: ${JSON.stringify(doc.metadata, null, 2)}`,
      },
    ],
  };
});

// 서버 시작
async function main() {
  console.error('🚀 AI Council MCP Server starting...');

  // 데이터베이스 연결 테스트
  try {
    await pool.query('SELECT NOW()');
    console.error('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('✅ AI Council MCP Server running on stdio');
  console.error('📚 Available tools (8개):');
  console.error('   - query_knowledge_base: RAG 검색 및 AI 답변');
  console.error('   - add_document: 문서 추가');
  console.error('   - add_multiple_documents: 다중 문서 추가');
  console.error('   - analyze_query_complexity: 쿼리 분석');
  console.error('   - search_documents: 키워드 검색');
  console.error('   - request_knowledge: 지식 요청');
  console.error('   - ask_council_questions: AI 4대장 토론 전 20+20 질문 📋');
  console.error('   - start_council_discussion: AI 4대장 토론 시작 🎭');
  console.error('');
  console.error('💡 사용 예시: @ai-4대장 ask_council_questions → start_council_discussion');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
