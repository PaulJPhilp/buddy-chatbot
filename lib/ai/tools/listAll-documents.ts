import { z } from 'zod';
import { listAllDocuments as dbListAllDocuments } from '@/lib/db/queries';
import { tool } from 'ai';
import type { DocumentListItem } from '@/lib/types';

export const listAllDocuments = () => {
	return tool({
		description: 'List all documents',
		parameters: z.object({}),
		execute: async (): Promise<DocumentListItem[]> => {
			const documents = await dbListAllDocuments()
			return documents.map((document) => ({
				title: document.title,
				kind: document.kind,
				createdAt: document.createdAt,
			})).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 5);
		},
	})
}