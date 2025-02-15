'use client';

import type { Attachment, Message } from 'ai';
import { useChat } from 'ai/react';
import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';

import { ChatHeader } from '@/components/chat/chat-header';
import type { Vote } from '@/lib/db/schema';
import type { DocumentAttachment } from '@/lib/types';
import { fetcher, generateUUID } from '@/lib/utils';

import type { VisibilityType } from '@/components/app/visibility-selector';
import { Block } from '@/components/block/block';
import { Messages } from '@/components/message/messages';
import { MultimodalInput } from '@/components/prompter/multimodal-input';
import { useBlockSelector } from '@/hooks/use-block';
import { toast } from 'sonner';

import Image from 'next/image';

export function Chat({
  id,
  initialMessages,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedChatModel: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  let usingImageModel = false;
  initialMessages.forEach((message) => {
    if (message.toolInvocations) {
      message.toolInvocations.forEach((toolInvocation) => {
        if (toolInvocation.toolName === 'generateImage') {
          usingImageModel = true;
        }
      });
    }
  });

  if (usingImageModel) {
    return <ChatImage />;
  }

  return <ChatText id={id} initialMessages={initialMessages} selectedChatModel={selectedChatModel} selectedVisibilityType={selectedVisibilityType} isReadonly={isReadonly} />;
}

export function ChatImage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <>
      <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
        <div className="space-y-4">
          {messages.map(m => (
            <div key={m.id} className="whitespace-pre-wrap">
              <div key={m.id}>
                <div className="font-bold">{m.role}</div>
                {m.toolInvocations ? (
                  m.toolInvocations.map(ti =>
                    ti.toolName === 'generateImage' ? (
                      ti.state === 'result' ? (
                        <Image
                          key={ti.toolCallId}
                          src={`data:image/png;base64,${ti.result.image}`}
                          alt={ti.result.prompt}
                          height={400}
                          width={400}
                        />
                      ) : (
                        <div key={ti.toolCallId} className="animate-pulse">
                          Generating image...
                        </div>
                      )
                    ) : null,
                  )
                ) : (
                  <p>{m.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <input
            className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
            value={input}
            placeholder="Say something..."
            onChange={handleInputChange}
          />
        </form>
      </div>
    </>
  );
}

export function ChatText({
  id,
  initialMessages,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedChatModel: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {

  const { mutate } = useSWRConfig();

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    reload,
  } = useChat({
    id,
    body: { id, selectedChatModel: selectedChatModel },
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    onFinish: () => {
      mutate('/api/history');
    },
    onError: (error) => {
      toast.error(`An error occured, please try again!: ${error ? error.message : error}`);
    },
  });

  const { data: votes } = useSWR<Array<Vote>>(
    `/api/vote?chatId=${id}`,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const [documents, setDocuments] = useState<Array<DocumentAttachment>>([]);
  const [uploadQueue, setUploadQueue] = useState<Array<string>>([]);
  const [documentUploadQueue, setDocumentUploadQueue] = useState<Array<string>>([]);
  const isBlockVisible = useBlockSelector((state) => state.isVisible);

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={selectedChatModel}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />

        <Messages
          chatId={id}
          isLoading={isLoading}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isBlockVisible={isBlockVisible}
        />


        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              documents={documents}
              setDocuments={setDocuments}
              uploadQueue={uploadQueue}
              setUploadQueue={setUploadQueue}
              documentUploadQueue={documentUploadQueue}
              setDocumentUploadQueue={setDocumentUploadQueue}
              append={append}
            />
          )}
        </form>
      </div>

      <div className="background-blue-500">
        <Block
          chatId={id}
          input={input}
          setInput={setInput}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          stop={stop}
          attachments={attachments}
          setAttachments={setAttachments}
          append={append}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          votes={votes}
          isReadonly={isReadonly}
          setDocuments={setDocuments}
          uploadQueue={uploadQueue}
          setUploadQueue={setUploadQueue}
          documentUploadQueue={documentUploadQueue}
          setDocumentUploadQueue={setDocumentUploadQueue}
        />
      </div>
    </>
  );
}
