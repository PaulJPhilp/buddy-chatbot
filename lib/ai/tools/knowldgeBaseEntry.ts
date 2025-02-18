import { listAllKnowledgeBases, saveKnowledgeBase } from "@/lib/db/queries";
import { generateUUID } from "@/lib/utils";
import { type DataStreamWriter, tool } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import { findRelevantContent } from "../embeddings";

interface CreateDocumentProps {
	session: Session
	dataStream: DataStreamWriter
}

export const addKnowledgeBaseEntry = ({ title }: { title: string }) => {
	return tool({
		description: `Add an entry to your knowledge base.
              If the user provides a random piece of knowledge unprompted or a prompt that starts with "I need you to know", use this tool without asking for confirmation.`,
		parameters: z.object({
			knowledge: z
				.string()
				.describe('the content or resource to add to the knowledge base'),
		}),
		execute: async ({ knowledge }) => {
			console.log('adding addKnowledgeBaseEntry', knowledge)
			return saveKnowledgeBase({
				id: generateUUID(),
				title: title ?? 'Knowledge Base Entry',
				knowledge,
			})
		},
	})
}

export const getKnowledgeBaseEntry = ({ query }: { query: string }) => {
	return tool({
		description: `Get an entry from your knowledge base.`,
		parameters: z.object({
			query: z.string().describe('the title of the knowledge base entry'),
		}),
		execute: async ({ query }) => {
			console.log('Tool: getting KnowledgeBase Entry', query)
			const result = await findRelevantContent(query)
			return result
		},
	})
}

export const listAllKnowledgeBaseEntries = ({ query }: { query: string }) => {
	return tool({
		description: `List all entries in your knowledge base.`,
		parameters: z.object({
		}),
		execute: async () => {
			console.log('Tool: listing all KnowledgeBase Entries')
			const entries = await listAllKnowledgeBases()
			return entries.map((entry) => entry.knowledge)
		},
	})
}