import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function createEmbedding(input: string): Promise<number[] | null> {
  if (!input) return null;
  
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: input.replaceAll('\\n', ' '),
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error creating embedding:', error);
    return null;
  }
}
