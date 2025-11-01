import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { pool } from '../db.js';
import { getCachedResponse, setCachedResponse } from '../redis.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const googleAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Perplexity API (OpenAI 호환)
const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY || '',
  baseURL: 'https://api.perplexity.ai',
});

interface QueryOptions {
  model?: 'claude' | 'gpt4' | 'gemini' | 'o1' | 'gemini-pro' | 'perplexity';
  topK?: number;
  useCache?: boolean;
}

// RAG 쿼리 처리 - Athena
export async function queryAthena(query: string, options: QueryOptions = {}) {
  const {
    model = 'gpt4', // GPT-5를 기본 모델로 설정 (Claude API 키 없을 경우 대비)
    topK = 5,
    useCache = true,
  } = options;

  try {
    // 1. 임시 문서(user_answers) 우선 확인 - 유사도 검색 없이 직접 가져오기
    console.error('🔍 Checking for temporary user-provided documents...');
    const tempDocsResult = await pool.query(
      `SELECT content, metadata FROM documents
       WHERE metadata->>'type' = 'user_answers'
       AND metadata->>'temporary' = 'true'
       ORDER BY created_at DESC
       LIMIT $1`,
      [topK]
    );

    if (tempDocsResult.rows.length > 0) {
      console.error(`✅ Found ${tempDocsResult.rows.length} temporary user documents - using directly without similarity search`);
      const relevantDocs = tempDocsResult.rows;

      // 컨텍스트 구성
      const context = relevantDocs
        .map((doc, idx) => `[${idx + 1}] ${doc.content}`)
        .join('\n\n');

      // AI 모델로 답변 생성
      const answer = await generateAnswer(query, context, model);

      return {
        answer,
        sources: relevantDocs.map(doc => ({
          content: doc.content.substring(0, 200) + '...',
          metadata: doc.metadata,
        })),
        fromCache: false,
      };
    }

    console.error('ℹ️ No temporary documents found, falling back to similarity search...');

    // 2. 쿼리 임베딩 생성
    const queryEmbedding = await createEmbedding(query);

    // 3. 시맨틱 캐싱 확인
    if (useCache) {
      const cached = await getCachedResponse(queryEmbedding);
      if (cached) {
        console.error('Cache hit - returning cached response');
        return {
          answer: cached,
          sources: [],
          fromCache: true,
        };
      }
    }

    // 4. 유사도 검색으로 관련 문서 검색
    console.error(`🔍 Searching for similar documents (topK=${topK})...`);
    const relevantDocs = await searchSimilarDocuments(queryEmbedding, topK);
    console.error(`🔍 Found ${relevantDocs.length} relevant documents`);

    if (relevantDocs.length === 0) {
      // 데이터베이스에 문서가 있는지 확인
      const countResult = await pool.query('SELECT COUNT(*) as total FROM documents');
      const totalDocs = parseInt(countResult.rows[0]?.total || '0');
      console.error(`⚠️ No similar documents found. Total documents in DB: ${totalDocs}`);

      return {
        answer: `No relevant documents found in the knowledge base. (Total documents in DB: ${totalDocs})`,
        sources: [],
        fromCache: false,
      };
    }

    // 4. 컨텍스트 구성
    const context = relevantDocs
      .map((doc, idx) => `[${idx + 1}] ${doc.content}`)
      .join('\n\n');

    // 5. AI 모델로 답변 생성 (실패 시 폴백)
    let answer: string;
    try {
      answer = await generateAnswer(query, context, model);
    } catch (error) {
      console.error(`Model ${model} failed, falling back to GPT-5:`, error);
      // 폴백: GPT-5로 재시도
      if (model !== 'gpt4') {
        try {
          answer = await generateAnswer(query, context, 'gpt4');
        } catch (fallbackError) {
          console.error('Fallback to GPT-5 also failed:', fallbackError);
          throw new Error('All AI models failed to generate answer');
        }
      } else {
        throw error;
      }
    }

    // 6. 캐싱
    if (useCache) {
      await setCachedResponse(queryEmbedding, answer);
    }

    return {
      answer,
      sources: relevantDocs.map(doc => ({
        content: doc.content.substring(0, 200) + '...',
        metadata: doc.metadata,
      })),
      fromCache: false,
    };
  } catch (error) {
    console.error('Athena query error:', error);
    throw error;
  }
}

// 임베딩 생성
async function createEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  const firstData = response.data[0];
  return firstData?.embedding || [];
}

// 코사인 유사도로 유사 문서 검색
async function searchSimilarDocuments(embedding: number[], topK: number) {
  const result = await pool.query(
    `SELECT content, metadata,
            1 - (embedding <=> $1::vector) as similarity
     FROM documents
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    [`[${embedding.join(',')}]`, topK]
  );

  return result.rows;
}

// AI 모델로 답변 생성
async function generateAnswer(
  query: string,
  context: string,
  model: 'claude' | 'gpt4' | 'gemini' | 'o1' | 'gemini-pro' | 'perplexity'
): Promise<string> {
  const systemPrompt = `You are Athena, an AI assistant with access to a knowledge base.
Answer the user's question based on the provided context.
If the context doesn't contain relevant information, say so clearly.

Context:
${context}`;

  switch (model) {
    case 'claude': {
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `${systemPrompt}\n\nQuestion: ${query}`,
          },
        ],
      });

      const firstContent = response.content[0];
      return firstContent && firstContent.type === 'text' ? firstContent.text : '';
    }

    case 'gpt4': {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o', // GPT-4o로 변경 (gpt-5는 아직 지원 안됨)
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
        max_completion_tokens: 8192, // max_tokens -> max_completion_tokens
        temperature: 0.7,
      });

      const firstChoice = response.choices[0];
      return firstChoice?.message?.content || '';
    }

    case 'gemini': {
      const gemini = googleAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp', // Gemini 2.0 Flash (1.5 Pro는 2025년 현재 deprecated)
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.7,
        },
      });
      const response = await gemini.generateContent(`${systemPrompt}\n\nQuestion: ${query}`);
      return response.response.text();
    }

    case 'o1': {
      // o1-preview: 최고 추론 능력
      const response = await openai.chat.completions.create({
        model: 'o1-preview',
        messages: [
          { role: 'user', content: `${systemPrompt}\n\nQuestion: ${query}` },
        ],
      });

      const firstChoice = response.choices[0];
      return firstChoice?.message?.content || '';
    }

    case 'gemini-pro': {
      // Gemini Pro: 최고 성능 모델
      const gemini = googleAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp', // Gemini 2.0 Flash (1.5 Pro는 deprecated)
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.7,
        },
      });
      const response = await gemini.generateContent(`${systemPrompt}\n\nQuestion: ${query}`);
      return response.response.text();
    }

    case 'perplexity': {
      // Perplexity Sonar Pro: 실시간 웹 검색 + 최신 정보
      const response = await perplexity.chat.completions.create({
        model: 'sonar-pro', // Perplexity Pro 모델
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
        max_tokens: 4096,
        temperature: 0.7,
      } as any); // Perplexity 특화 파라미터는 런타임에 처리

      const firstChoice = response.choices[0];
      return firstChoice?.message?.content || '';
    }

    default:
      throw new Error(`Unknown model: ${model}`);
  }
}
