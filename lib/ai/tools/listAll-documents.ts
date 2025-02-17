import { z } from 'zod';
import { listAllDocuments as dbListAllDocuments } from '@/lib/db/queries';
import { tool } from 'ai';

export const listAllDocuments = () => {
	return tool({
		description: 'List all documents',
		parameters: z.object({}),
		execute: async (): Promise<ReturnType<typeof dbListAllDocuments>> => {
			const documents = await dbListAllDocuments()
			return documents.map((document) => ({
				id: document.id,
				title: document.title,
				kind: document.kind,
				content: "",
				createdAt: document.createdAt,
				userId: document.userId,
				embedding: document.embedding
			}))
		},
	})
}