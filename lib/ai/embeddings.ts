import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';
import { embeddings } from '@/lib/db/embeddings';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const embeddingModel = openai.embedding('text-embedding-ada-002');
// biome-ignore lint/style/noNonNullAssertion: <explanation>
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

const generateChunks = (input: string): string[] => {
	return input
		.trim()
		.split('.')
		.filter(i => i !== '');
};

export const generateEmbeddings = async (
	value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
	const chunks = generateChunks(value);
	const { embeddings } = await embedMany({
		model: embeddingModel,
		values: chunks,
	});
	return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
	const input = value.replaceAll('\\n', ' ');
	const { embedding } = await embed({
		model: embeddingModel,
		value: input,
	});
	return embedding;
};

export const findRelevantContent = async (userQuery: string) => {
	console.log('Finding relevant content', userQuery);

	const userQueryEmbeddings = await generateEmbeddings(userQuery);
	const userQueryEmbedding = userQueryEmbeddings[0].embedding;

	const similarity = sql<number>`(1 - ${cosineDistance(
		embeddings.embedding,
		userQueryEmbedding
	)})`;

	const similarGuides = await db
		.select({ name: embeddings.content, similarity })
		.from(embeddings)
		.where(gt(similarity, 0.5))
		.orderBy(t => desc(t.similarity))
		.limit(4);
	return similarGuides;
};