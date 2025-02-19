import { codeDocumentHandler } from '@/blocks/code/server';
import { imageDocumentHandler } from '@/blocks/image/server';
import { sheetDocumentHandler } from '@/blocks/sheet/server';
import { textDocumentHandler } from '@/blocks/text/server';
import type { BlockKind } from '@/lib/types';
import type { DataStreamWriter } from 'ai';
import type { Document } from '../db/schema';
import { saveDocument } from '../db/queries';
import type { Session } from 'next-auth';

export interface SaveDocumentProps {
  id: string;
  title: string;
  kind: BlockKind;
  content: string;
  userId: string;
}

export interface CreateDocumentCallbackProps {
  title: string;
  kind: BlockKind;
  dataStream: DataStreamWriter;
  session: Session;
}

export interface UpdateDocumentCallbackProps {
  document: Document;
  description: string;
  dataStream: DataStreamWriter;
  session: Session;
}

export interface DocumentHandler<T = BlockKind> {
  kind: T;
  onCreateDocument: (args: CreateDocumentCallbackProps) => Promise<void>;
  onUpdateDocument: (args: UpdateDocumentCallbackProps) => Promise<void>;
}

export function createDocumentHandler<T extends BlockKind>(config: {
  kind: T;
  onCreateDocument: (params: CreateDocumentCallbackProps) => Promise<string>;
  onUpdateDocument: (params: UpdateDocumentCallbackProps) => Promise<string>;
}): DocumentHandler<T> {
  
  return {
    kind: config.kind,
    onCreateDocument: async (args: CreateDocumentCallbackProps) => {
      const draftContent = await config.onCreateDocument({
        kind: args.kind,
        title: args.title,
        dataStream: args.dataStream,
        session: args.session,
      });

      let documentId: string | undefined;

      if (args.session?.user?.id) {
        const document = await saveDocument({
          title: args.title,
          content: draftContent,
          kind: config.kind,
          userId: args.session.user.id,
        });
        documentId = document.id;
      }

      console.log('createDocumentHandler - documentId:', documentId);
      args.dataStream.writeData({
        type: 'id',
        content: documentId ?? '',
      });

      return;
    },
    onUpdateDocument: async (args: UpdateDocumentCallbackProps) => {
      const draftContent = await config.onUpdateDocument({
        document: args.document,
        description: args.description,
        dataStream: args.dataStream,
        session: args.session,
      });

      if (args.session?.user?.id) {
        await saveDocument({
          title: args.document.title,
          content: draftContent,
          kind: config.kind,
          userId: args.session.user.id,
        });
      }

      return;
    },
  };
}

/*
 * Use this array to define the document handlers for each block kind.
 */
export const documentHandlersByBlockKind: Array<DocumentHandler> = [
  textDocumentHandler,
  codeDocumentHandler,
  imageDocumentHandler,
  sheetDocumentHandler
];

export const blockKinds: BlockKind[] = ['text', 'code', 'image', 'sheet', 'widget'] as const;
