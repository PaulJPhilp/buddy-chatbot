import { type DataStreamWriter, tool } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';
import { listAllDocuments as dbListAllDocuments } from '@/lib/db/queries';

interface ListAllDocumentsProps {
	session: Session;
	dataStream: DataStreamWriter;
}

export const listAllDocuments = ({ session, dataStream }: ListAllDocumentsProps) => {
	console.log('listAllDocuments')
	return tool({
		description: 'List all documents',
		parameters: z.object({}),
		execute: async (): Promise<ReturnType<typeof dbListAllDocuments>> => {
			console.log('executing listAllDocuments')
			const documents = await dbListAllDocuments()
			return documents.map((document) => ({
				id: document.id,
				title: document.title,
				kind: document.kind,
				content: "",
				createdAt: document.createdAt,
				userId: document.userId
			}))
		},
	})
}