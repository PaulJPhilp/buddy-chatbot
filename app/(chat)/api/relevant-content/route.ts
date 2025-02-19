import { NextResponse } from 'next/server';
import { findRelevantContent } from '@/lib/ai/embeddings';

export async function POST(req: Request) {
  try {
    const { input } = await req.json();
    const relevantContent = await findRelevantContent(input);
    return NextResponse.json({ content: relevantContent });
  } catch (error) {
    console.error('Error finding relevant content:', error);
    return NextResponse.json(
      { error: 'Failed to find relevant content' },
      { status: 500 }
    );
  }
}
