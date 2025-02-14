'use client';

import type {
  Attachment,
  ChatRequestOptions,
  CreateMessage,
  Message,
} from 'ai';

import type { 
  DocumentAttachment
} from '@/lib/types';

import type React from 'react';
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
  memo,
} from 'react';
import { useLocalStorage, useWindowSize } from 'usehooks-ts';

import { PreviewAttachment } from './preview-attachment';
import { SuggestedActions } from './suggested-actions';
import equal from 'fast-deep-equal';
import { AttachmentsInput } from './attachments-input';
import { DocumentsInput } from './documents-input';
import { cx } from 'class-variance-authority';
import { PromptInput } from './prompt-input';

function PureMultimodalInput({
  chatId,
  input,
  setInput,
  isLoading,
  stop,
  attachments,
  setAttachments,
  messages,
  setMessages,
  append,
  handleSubmit,
  className,
}: {
  chatId: string;
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  stop: () => void;
  attachments: Array<Attachment>;
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>;
  messages: Array<Message>;
  setMessages: Dispatch<SetStateAction<Array<Message>>>;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions,
  ) => void;
  className?: string;
}) {
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { height } = useWindowSize();
  const [storedHeight, setStoredHeight] = useLocalStorage('input-height', 100);
  const [documents, setDocuments] = useState<Array<DocumentAttachment>>([]);
  const [documentUploadQueue, setDocumentUploadQueue] = useState<Array<string>>([]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = `${storedHeight}px`;
    }
  }, [storedHeight]);

  const submitForm = useCallback(() => {
    handleSubmit();
  }, [handleSubmit]);

  return (
    <div className="relative w-full flex flex-col gap-4">
      {messages.length === 0 &&
        attachments.length === 0 &&
        uploadQueue.length === 0 &&
        documentUploadQueue.length === 0 && (
          <SuggestedActions append={append} chatId={chatId} />
        )}

      {(attachments.length > 0 || uploadQueue.length > 0 || documentUploadQueue.length > 0) && (
        <div className="flex flex-row gap-2 overflow-x-scroll items-end">
          {attachments.map((attachment) => (
            <PreviewAttachment key={attachment.url} attachment={attachment} />
          ))}

          {uploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: '',
                name: filename,
                contentType: '',
              }}
            />
          ))}

          {documentUploadQueue.map((filename) => (
            <PreviewAttachment
              key={filename}
              attachment={{
                url: '',
                name: filename,
                contentType: '',
              }}
            />
          ))}
        </div>
      )}

      <div className="relative flex flex-row items-start gap-2">


        <div className="relative flex-grow">

          <div className="absolute left-2 bottom-[10px] z-10 flex flex-row gap-1">
            <AttachmentsInput
              attachments={attachments}
              setAttachmentsAction={setAttachments}
              uploadQueue={uploadQueue}
              setUploadQueueAction={setUploadQueue}
              isLoading={isLoading}
              className={cx('flex-shrink-0', className)}
            />
            <DocumentsInput
              setDocumentsAction={setDocuments}
              setUploadQueueAction={setDocumentUploadQueue}
              isLoading={isLoading}
              className={cx('flex-shrink-0', className)}
            />
          </div>

          <PromptInput
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            submitFormAction={handleSubmit}
            stopAction={stop}
            setMessages={setMessages}
            attachments={attachments}
            documents={documents}
            className={className}
            textAreaRef={textAreaRef}
          />

        </div>
      </div>
    </div>
  );
}

export const MultimodalInput = memo(PureMultimodalInput, (prevProps, nextProps) => {
  return equal(prevProps, nextProps);
});
