import { auth } from '@/app/(auth)/auth';
import {
	saveKnowledgeBase
} from '@/lib/db/queries';

import type { KnowledgeBase } from '@/lib/db/schema';

export async function POST(request: Request) {
	const { searchParams } = new URL(request.url);
	const id = searchParams.get('id');

	if (!id) {
		return new Response('Missing id', { status: 400 });
	}

	const session = await auth();

	if (!session) {
		return new Response('Unauthorized', { status: 401 });
	}

	const {
		knowledge,
		title,
		createdAt,
	}: KnowledgeBase = await request.json();

	if (session.user?.id) {
		const document = await saveKnowledgeBase({
			id,
			knowledge,
			title,
			createdAt,
			embedding: null,
		});

		return Response.json(document, { status: 200 });
	}
	return new Response('Unauthorized', { status: 401 });
}