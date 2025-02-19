import {
  type Message,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from 'ai';

import { auth } from '@/app/(auth)/auth';
import { myProvider } from '@/lib/ai/models';
import { systemPrompt, TherapistPrompt, MarilynMonroePrompt, DrillSergeantPrompt } from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages
} from '@/lib/db/queries';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';

import { generateTitleFromUserMessage } from '../../actions';
import { createDocument } from '@/lib/ai/tools/create-document';
import { updateDocument } from '@/lib/ai/tools/update-document';
import { requestSuggestions } from '@/lib/ai/tools/request-suggestions';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { addKnowledgeBaseEntry, getKnowledgeBaseEntry, listAllKnowledgeBaseEntries } from '@/lib/ai/tools/knowldgeBaseEntry';
import { listAllDocuments } from '@/lib/ai/tools/listAll-documents';

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

  const title = await generateTitleFromUserMessage({ message: userMessage });
  if (!chat) {
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
      dataStream.writeData('initialized call');

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
              'listAllDocuments',
              'listAllKnowledgeBaseEntries',
              'addKnowledgeBaseEntry',
              'getKnowledgeBaseEntry',
            ],
        experimental_transform: smoothStream({ chunking: 'word' }),
        experimental_generateMessageId: generateUUID,
        tools: {
          getWeather,
          createDocument: createDocument({ session, dataStream }),
          updateDocument: updateDocument({ session, dataStream }),
          requestSuggestions: requestSuggestions({ session, dataStream }),
          addKnowledgeBaseEntry: addKnowledgeBaseEntry({ title: title }),
          getKnowledgeBaseEntry: getKnowledgeBaseEntry({ query: userMessage.content }),
          listAllKnowledgeBaseEntries: listAllKnowledgeBaseEntries({ query: userMessage.content }),  
          listAllDocuments: listAllDocuments(),
        },

        onFinish: async ({ response, reasoning }) => {
          if (session.user?.id) {
            try {
              const sanitizedResponseMessages = sanitizeResponseMessages({
                messages: response.messages,
                reasoning,
              });

              if (!sanitizedResponseMessages.length) {
                console.log('No sanitized response messages');
                return
              }
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
