'use client'

import type { Attachment, ChatRequestOptions, CreateMessage, Message } from 'ai'

import type { DocumentAttachment } from '@/lib/types'

import {
  useCallback,
  useEffect,
  useRef,
  type Dispatch,
  type SetStateAction,
} from 'react'

import { useLocalStorage, useWindowSize } from 'usehooks-ts'
import { AttachmentsInput } from './attachments-input'
import { DocumentsInput } from './documents-input'
import { PreviewAllAttachments } from './preview-all-attachments'
import { PreviewAllDocuments } from './preview-all-documents'
import { PromptInput } from './prompt-input'
import { SuggestedActions } from './suggested-actions'

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
  documents,
  setDocuments,
  append,
  handleSubmit,
  className,
  uploadQueue,
  setUploadQueue,
  documentUploadQueue,
  setDocumentUploadQueue,
}: {
  chatId: string
  input: string
  setInput: (value: string) => void
  isLoading: boolean
  stop: () => void
  attachments: Array<Attachment>
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>
  messages: Array<Message>
  setMessages: Dispatch<SetStateAction<Array<Message>>>
  documents: Array<DocumentAttachment>
  setDocuments: Dispatch<SetStateAction<Array<DocumentAttachment>>>
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>
  handleSubmit: (
    event?: {
      preventDefault?: () => void
    },
    chatRequestOptions?: ChatRequestOptions,
  ) => void
  className?: string
  uploadQueue: Array<string>
  setUploadQueue: Dispatch<SetStateAction<Array<string>>>
  documentUploadQueue: Array<string>
  setDocumentUploadQueue: Dispatch<SetStateAction<Array<string>>>
}) {
  const { height } = useWindowSize()
  const [storedHeight, setStoredHeight] = useLocalStorage('input-height', 100)

  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const submitForm = useCallback(() => {
    if (textAreaRef.current) {
      textAreaRef.current.focus()
    }
    handleSubmit()
  }, [handleSubmit])

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = `${storedHeight}px`
    }
  }, [storedHeight])

  return (
    <div className="relative w-full flex flex-col gap-4">
      {messages.length === 0 &&
        attachments.length === 0 &&
        uploadQueue.length === 0 &&
        documentUploadQueue.length === 0 && (
          <div className="flex flex-row gap-2 items-end">
            <SuggestedActions append={append} chatId={chatId} />
          </div>
        )}

      {(attachments.length > 0 || uploadQueue.length > 0 || documentUploadQueue.length > 0) && (
        <div className="flex flex-row gap-2 items-end">
          {(attachments.length > 0 || uploadQueue.length > 0) && (
            <PreviewAllAttachments
              attachments={attachments}
              uploadQueue={uploadQueue}
            />
          )}

          {documentUploadQueue.length > 0 && (
            <PreviewAllDocuments documentUploadQueue={documentUploadQueue} />
          )}
        </div>
      )}

      <div className="relative">
        <div className="absolute left-2 bottom-2 z-10 flex flex-row gap-2">
          <AttachmentsInput
            attachments={attachments}
            setAttachmentsAction={setAttachments}
            uploadQueue={uploadQueue}
            setUploadQueueAction={setUploadQueue}
            isLoading={isLoading}
            className={className}
          />

          <DocumentsInput
            documents={documents}
            setDocumentsAction={setDocuments}
            setUploadQueueAction={setDocumentUploadQueue}
            isLoading={isLoading}
            className={className}
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
  )
}

export const MultimodalInput = PureMultimodalInput
