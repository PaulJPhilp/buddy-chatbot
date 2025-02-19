import { type DataStreamWriter, tool } from 'ai';
import { z } from 'zod';
import type { Session } from 'next-auth';
import { documentHandlersByBlockKind } from '@/lib/blocks/server';
import { blockDefinitions } from '@/lib/types';

interface CreateDocumentProps {
  session: Session;
  dataStream: DataStreamWriter;
}

export const createDocument = ({ session, dataStream }: CreateDocumentProps) => {
  console.log('createDocument')
  return tool({
    description:
      'Create a document for a writing or content creation activities. This tool will call other functions that will generate the contents of the document based on the title and kind.',
    parameters: z.object({
      title: z.string(),
      kind: z.enum(blockDefinitions),
    }),
    execute: async ({ title, kind }) => {
      console.log('execute createDocument', { title, kind })

      dataStream.writeData({
        type: 'kind',
        content: kind,
      })

      dataStream.writeData({
        type: 'title',
        content: title,
      })

      dataStream.writeData({
        type: 'clear',
        content: '',
      })

      const documentHandler = documentHandlersByBlockKind.find(
        (documentHandlerByBlockKind) =>
          documentHandlerByBlockKind.kind === kind,
      )

      if (!documentHandler) {
        throw new Error(`No document handler found for kind: ${kind}`)
      }

      await documentHandler.onCreateDocument({
        kind,
        title,
        dataStream,
        session,
      })

      dataStream.writeData({ type: 'finish', content: '' })

      return {
        id: '',  // This will be updated by the dataStream
        title,
        kind,
        content: 'A document was created and is now visible to the user.',
      }
    },
  })
}