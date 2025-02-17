import {
  type Message,
  createDataStreamResponse,
  smoothStream,
  streamText,
  tool,
} from 'ai';

import { auth } from '@/app/(auth)/auth';
import { myProvider } from '@/lib/ai/models';
import { systemPrompt, TherapistPrompt, MarilynMonroePrompt, DrillSergeantPrompt } from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
  saveKnowledgeBase,
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';

import { findRelevantContent } from '@/lib/ai/embeddings';

import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { z } from 'zod';
//import { listAllDocuments } from '@/lib/ai/tools/listAll-documents';

export const maxDuration = 60;

function isDoctorMessage(message: Message): boolean {
  return message.content.startsWith('Doctor');
}

function isMarilynMonroeMessage(message: Message): boolean {
  return message.content.startsWith('Marilyn');
}

function isDrillSergeantMessage(message: Message): boolean {
  return message.content.startsWith('Sergeant');
}

export async function POST(request: Request) {
  console.log('POST /api/chat');
  const {
    id,
    messages,
    selectedChatModel,
  }: { id: string; messages: Array<Message>; selectedChatModel: string } =
    await request.json();

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userMessage = getMostRecentUserMessage(messages);

  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  const chat = await getChatById({ id });

  if (!chat) {
    const title = await generateTitleFromUserMessage({ message: userMessage });
    await saveChat({ id, userId: session.user.id, title });
  }

  await saveMessages({
    messages: [{ ...userMessage, createdAt: new Date(), chatId: id }],
  });

  const prompt = isDoctorMessage(userMessage)
    ? systemPrompt({ selectedChatModel, personality: TherapistPrompt })
    : isMarilynMonroeMessage(userMessage)
      ? systemPrompt({ selectedChatModel, personality: MarilynMonroePrompt })
      : isDrillSergeantMessage(userMessage)
        ? systemPrompt({ selectedChatModel, personality: DrillSergeantPrompt })
        : systemPrompt({ selectedChatModel });

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model: myProvider.languageModel(selectedChatModel),
        system: prompt,
        messages,
        maxSteps: 5,
        experimental_activeTools:
          selectedChatModel.indexOf('reasoning') > -1
            ? []
            : [
              'getWeather',
              'createDocument',
              'updateDocument',
              'requestSuggestions',
            ],
        experimental_transform: smoothStream({ chunking: 'word' }),
        experimental_generateMessageId: generateUUID,
        tools: {
          getWeather,
          createDocument: createDocument({ session, dataStream }),
          updateDocument: updateDocument({ session, dataStream }),
          requestSuggestions: requestSuggestions({
            session,
            dataStream,
          }),
          addKnowledgeBaseEntry: tool({
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
                createdAt: new Date(),
                title: 'Knowledge Base Entry',
                embedding: null,
                knowledge
              });
            },
          }),
          getInformation: tool({
            description: `get information from your knowledge base to answer questions.`,
            parameters: z.object({
              question: z.string().describe('the users question'),
            }),
            execute: async ({ question }) => findRelevantContent(question),
          }),
        },

        onFinish: async ({ response, reasoning }) => {

          if (session.user?.id) {
            try {
              const sanitizedResponseMessages = sanitizeResponseMessages({
                messages: response.messages,
                reasoning,
              });

              await saveMessages({
                messages: sanitizedResponseMessages.map((message) => {
                  return {
                    id: message.id,
                    chatId: id,
                    role: message.role,
                    content: message.content,
                    createdAt: new Date(),
                  };
                }),
              });
            } catch (error) {
              console.error('Failed to save chat');
            }
          }
        },
        experimental_telemetry: {
          isEnabled: true,
          functionId: 'stream-text',
        },
      });

      result.mergeIntoDataStream(dataStream, {
        sendReasoning: true,
      });
    },
    onError: (error) => {
      console.error('Failed to stream text', error);
      return 'Oops, an error occured!';
    },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
function createResource(arg0: { content: string; }): any {
  throw new Error('Function not implemented.');
}
