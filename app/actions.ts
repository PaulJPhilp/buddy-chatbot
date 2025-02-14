'use server';

import { document } from '@/lib/db/schema';
import { asc } from 'drizzle-orm';
import type { DocumentAttachment } from '@/lib/types';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
// biome-ignore lint/style/noNonNullAssertion: <explanation>
const client = postgres(process.env.POSTGRES_URL!);
const db = drizzle(client);

export async function listAllDocuments(): Promise<DocumentAttachment[]> {
  console.log('listAllDocuments Actions');
  try {
    return await db
      .select()
      .from(document)
      .orderBy(asc(document.createdAt));
  } catch (error) {
    console.error('Failed to list all documents from database', error);
    throw error;
  }
}
