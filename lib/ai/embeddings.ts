import { knowledgeBaseTable } from '@/lib/db/schema';
import { db } from '@/lib/db/utils';
import { cosineDistance, desc, gt, sql } from 'drizzle-orm';

export const findRelevantContent = async (input: string) => {
	if (!input) return null;

	const similarity = sql<number>`(1 - ${cosineDistance(
		knowledgeBaseTable.embedding,
		input
	)})`;

	const similarGuides = await db
		.select({
			name: knowledgeBaseTable.knowledge,
			similarity,
		})
		.from(knowledgeBaseTable)
		.where(gt(similarity, 0.5))
		.orderBy(desc(similarity))
		.limit(4);

	return similarGuides[0];
};