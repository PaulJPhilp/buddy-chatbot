
import { db } from './utils';
import { OpenAI } from 'openai';
import { randomUUID } from 'node:crypto';
import { knowledgeBaseTable, type DocumentEmbedding } from './schema';

async function getEmbedding(text: string, apiKey: string): Promise<number[]> {
  const client = new OpenAI({ apiKey });

  try {
    const response = await client.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

export const saveKnowledgeBaseEmbeddings = async (
  content: string, 
  knowledgeBaseId: string
) => {
  if (!content || !process.env.OPENAI_API_KEY) return [];

  const chunks = content
    .trim()
    .split('.')
    .filter(chunk => chunk.length > 0)
    .map(chunk => chunk.trim());

  // Insert each chunk into the knowledgeBase table
  const results = await Promise.all(
    chunks.map(async (chunk) => {
      const [result] = await db
        .insert(knowledgeBaseTable)
        .values({
          id: randomUUID(),
          createdAt: new Date(),
          knowledge: chunk,
          embedding: await getEmbedding(chunk, process.env.OPENAI_API_KEY || '')
        })
        .returning();
      return result;
    }),
  );

  return results;
};

export const generateDocumentEmbeddings = async (
  content: string,
  documentId: string
) => {
  if (!content || !process.env.OPENAI_API_KEY) return [];

  const chunks = content
    .trim()
    .split('.')
    .filter(chunk => chunk.length > 0)
    .map(chunk => chunk.trim());

  const results: DocumentEmbedding[] = []
  let offset = 0;
  for (const chunk of chunks) {
    const embedChunk = await getEmbedding(chunk, process.env.OPENAI_API_KEY as string);
    const docChunk: DocumentEmbedding = {
      id: randomUUID(),
      documentId: documentId,
      offset: offset,
      chunk: chunk,
      embedding: embedChunk
    };
    results.push(docChunk);
    offset++;
  }
  return results;
};
