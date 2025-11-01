import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import OpenAI from 'openai';
import { pool } from '../db.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 문서를 청크로 분할하고 벡터 DB에 저장
export async function upsertDocument(content: string, metadata: Record<string, any> = {}) {
  try {
    // 1. LangChain으로 문서 청킹
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', '. ', ' ', ''],
    });

    const chunks = await splitter.createDocuments([content]);

    console.error(`📝 Document split into ${chunks.length} chunks`);

    // 2. 각 청크에 대해 임베딩 생성 및 저장
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      if (!chunk) continue;

      console.error(`  → Chunk ${i + 1}/${chunks.length}: Creating embedding...`);
      const embedding = await createEmbedding(chunk.pageContent);
      console.error(`  → Chunk ${i + 1}/${chunks.length}: Embedding created (${embedding.length} dimensions)`);

      const result = await pool.query(
        `INSERT INTO documents (content, metadata, embedding)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [chunk.pageContent, JSON.stringify(metadata), `[${embedding.join(',')}]`]
      );
      console.error(`  ✅ Chunk ${i + 1}/${chunks.length}: Saved to DB with ID ${result.rows[0]?.id}`);
    }

    return {
      success: true,
      chunksCreated: chunks.length,
      message: `Successfully upserted ${chunks.length} document chunks`,
    };
  } catch (error) {
    console.error('Error upserting document:', error);
    throw error;
  }
}

// OpenAI 임베딩 생성
async function createEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    const firstEmbedding = response.data[0];
    return firstEmbedding?.embedding || [];
  } catch (error) {
    console.error('Error creating embedding:', error);
    throw error;
  }
}

// 다중 문서 일괄 업로드
export async function upsertMultipleDocuments(
  documents: Array<{ content: string; metadata?: Record<string, any> }>
) {
  const results = [];

  for (const doc of documents) {
    const result = await upsertDocument(doc.content, doc.metadata || {});
    results.push(result);
  }

  return {
    success: true,
    totalChunks: results.reduce((sum, r) => sum + r.chunksCreated, 0),
    documentsProcessed: documents.length,
  };
}
