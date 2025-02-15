import type {
  Attachment,
  ChatRequestOptions,
  CreateMessage,
  Message,
} from 'ai';

import { AnimatePresence, motion } from 'framer-motion';
import {
  type Dispatch,
  memo,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useDebounceCallback, useWindowSize } from 'usehooks-ts';
import type { Document, Vote } from '@/lib/db/schema';
import { fetcher } from '@/lib/utils';
import { BlockMessages } from './block-messages';
import { useSidebar } from '@/components/ui/sidebar';
import { useBlock } from '@/hooks/use-block';
import { imageBlock } from '@/blocks/image/client';
import { codeBlock } from '@/blocks/code/client';
import { sheetBlock } from '@/blocks/sheet/client';
import { textBlock } from '@/blocks/text/client';
import { widgetBlock } from '@/blocks/widget/client';
import equal from 'fast-deep-equal';
import type { DocumentAttachment, BlockKind } from '@/lib/types';
import { DocumentPanel } from './document-panel';
import { MultimodalInput } from '../prompter/multimodal-input';

export const blockDefinitions = [textBlock, codeBlock, imageBlock, sheetBlock, widgetBlock];

export interface UIBlock {
  title: string;
  documentId: string;
  chatId: string;
  kind: BlockKind;
  content: string;
  isVisible: boolean;
  status: 'streaming' | 'idle';
  boundingBox: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

interface UIBlockProps {
  block: UIBlock;
  id: string;
}

export const WidgetBlock = function WidgetBlock(props: UIBlockProps) {
  const {
    data: documents,
    isLoading: isDocumentsFetching,
    mutate: mutateDocuments,
  } = useSWR<Array<Document>>(null, fetcher)

  const { open: isSidebarOpen } = useSidebar()
  const { block, setBlock, metadata, setMetadata } = useBlock()

  useEffect(() => {
    if (props.block.kind === 'widget') {
      const list: Document[] = []
      let text = ''
      for (const document of documents ?? []) {
        text += document.title
        list.push(document)
      }
      setBlock((currentBlock: any) => ({
        ...currentBlock,
        content: text,
      }))
    }
  }, [documents, setBlock])


  return (
    <>
      <div>
        <h1>{props.block.title}</h1>
        <p>{props.block.content}</p>
      </div>
    </>
  )
}

/**
 * Props interface for the Block component.
 * 
 * @explanation
 * This comprehensive interface defines the contract for a Block component,
 * which serves as a container for chat interactions, document handling,
 * and message management. Each prop group serves a specific purpose:
 * 
 * 1. Chat State:
 *    - chatId: Unique identifier for the chat session
 *    - input/setInput: Current input text and its setter
 *    - isLoading: Loading state indicator
 *    - isReadonly: Read-only mode flag
 * 
 * 2. Message Management:
 *    - messages/setMessages: Chat message array and setter
 *    - append: Function to add new messages
 *    - reload: Function to refresh messages
 *    - votes: User feedback on messages
 * 
 * 3. Attachment Handling:
 *    - attachments/setAttachments: File attachments and setter
 *    - uploadQueue/setUploadQueue: Pending upload management
 *    - documentUploadQueue/setDocumentUploadQueue: Document queue management
 * 
 * 4. Interaction Control:
 *    - handleSubmit: Form submission handler
 *    - stop: Cancel ongoing operations
 *    - setDocuments: Document state management
 */
interface BlockProps {
  chatId: string
  input: string
  setInput: (input: string) => void
  isLoading: boolean
  stop: () => void
  attachments: Array<Attachment>
  setAttachments: Dispatch<SetStateAction<Array<Attachment>>>
  messages: Array<Message>
  setMessages: Dispatch<SetStateAction<Array<Message>>>
  votes: Array<Vote> | undefined
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
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>
  isReadonly: boolean
  setDocuments: Dispatch<SetStateAction<Array<DocumentAttachment>>>
  uploadQueue: Array<string>
  setUploadQueue: Dispatch<SetStateAction<Array<string>>>
  documentUploadQueue: Array<string>
  setDocumentUploadQueue: Dispatch<SetStateAction<Array<string>>>
}

/**
 * A complex chat block component that manages messages, attachments, and interactions.
 * 
 * @explanation
 * The Block component serves as a container for chat-based interactions,
 * providing rich functionality for message handling, file attachments,
 * and user interactions. It implements:
 * 
 * 1. Message Management:
 *    - Real-time message streaming
 *    - Message history display
 *    - Vote and feedback handling
 *    - Message reload capabilities
 * 
 * 2. File Handling:
 *    - Multiple attachment types
 *    - Upload queue management
 *    - Document processing
 *    - Progress tracking
 * 
 * 3. UI/UX Features:
 *    - Loading states
 *    - Read-only mode
 *    - Input control
 *    - Responsive layout
 * 
 * 4. Performance Optimization:
 *    - Memoized rendering
 *    - Efficient prop comparison
 *    - Controlled re-renders
 * 
 * The component uses advanced patterns like memo and custom equality
 * checks to maintain performance while handling complex state and
 * interactions.
 * 
 * @param {BlockProps} props - The component props
 * @returns {JSX.Element} The rendered block component
 */
function PureBlock({
  chatId,
  input,
  setInput,
  handleSubmit,
  isLoading,
  stop,
  attachments,
  setAttachments,
  append,
  messages,
  setMessages,
  reload,
  votes,
  isReadonly,
  setDocuments,
  uploadQueue,
  setUploadQueue,
  documentUploadQueue,
  setDocumentUploadQueue,
}: BlockProps) {
  const { block, setBlock, metadata, setMetadata } = useBlock()

  const {
    data: documents,
    isLoading: isDocumentsFetching,
    mutate: mutateDocuments,
  } = useSWR<Array<Document>>(
    block.documentId !== 'init' && block.status !== 'streaming'
      ? `/api/document?id=${block.documentId}`
      : null,
    fetcher,
  )

  const [mode, setMode] = useState<'edit' | 'diff'>('edit') // widget
  const [document, setDocument] = useState<Document | null>(null)
  const [currentVersionIndex, setCurrentVersionIndex] = useState(-1)

  const { open: isSidebarOpen } = useSidebar()

  useEffect(() => {
    if (block.kind === 'widget') {
      setDocument(null)
      setCurrentVersionIndex(-1)
      const list: Document[] = []
      let text = ''
      for (const document of documents ?? []) {
        text += document.title
        list.push(document)
      }
      setBlock((currentBlock: any) => ({
        ...currentBlock,
        content: text,
      }))
    } else if (documents && documents.length > 0) {
      const mostRecentDocument = documents.at(-1)

      if (mostRecentDocument) {
        setDocument(mostRecentDocument)
        setCurrentVersionIndex(documents.length - 1)
        setBlock((currentBlock: any) => ({
          ...currentBlock,
          content: mostRecentDocument.content ?? '',
        }))
      }
    }
  }, [documents, setBlock])

  useEffect(() => {
    mutateDocuments()
  }, [block.status, mutateDocuments])

  const { mutate } = useSWRConfig()
  const [isContentDirty, setIsContentDirty] = useState(false)

  const handleContentChange = useCallback(
    (updatedContent: string) => {
      if (!block) return

      mutate<Array<Document>>(
        `/api/document?id=${block.documentId}`,
        async (currentDocuments) => {
          if (!currentDocuments) return undefined

          const currentDocument = currentDocuments.at(-1)

          if (!currentDocument || !currentDocument.content) {
            setIsContentDirty(false)
            return currentDocuments
          }

          if (currentDocument.content !== updatedContent) {
            await fetch(`/api/document?id=${block.documentId}`, {
              method: 'POST',
              body: JSON.stringify({
                title: block.title,
                content: updatedContent,
                kind: block.kind,
              }),
            })

            setIsContentDirty(false)

            const newDocument = {
              ...currentDocument,
              content: updatedContent,
              createdAt: new Date(),
            }

            return [...currentDocuments, newDocument]
          }
          return currentDocuments
        },
        { revalidate: false },
      )
    },
    [block, mutate],
  )

  const debouncedHandleContentChange = useDebounceCallback(
    handleContentChange,
    2000,
  )

  const saveContent = useCallback(
    (updatedContent: string, debounce: boolean) => {
      if (document && updatedContent !== document.content) {
        setIsContentDirty(true)

        if (debounce) {
          debouncedHandleContentChange(updatedContent)
        } else {
          handleContentChange(updatedContent)
        }
      }
    },
    [document, debouncedHandleContentChange, handleContentChange],
  )

  function getDocumentContentById(index: number) {
    if (!documents) return ''
    if (!documents[index]) return ''
    return documents[index].content ?? ''
  }

  const handleVersionChange = (
    type: 'next' | 'prev' | 'toggle' | 'latest',
  ) => {
    if (!documents) return

    if (type === 'latest') {
      setCurrentVersionIndex(documents.length - 1)
      setMode('edit')
    }

    if (type === 'toggle') {
      setMode((mode) => (mode === 'edit' ? 'diff' : 'edit'))
    }

    if (type === 'prev') {
      if (currentVersionIndex > 0) {
        setCurrentVersionIndex((index) => index - 1)
      }
    } else if (type === 'next') {
      if (currentVersionIndex < documents.length - 1) {
        setCurrentVersionIndex((index) => index + 1)
      }
    }
  }

  const [isToolbarVisible, setIsToolbarVisible] = useState(false)

  /*
   * NOTE: if there are no documents, or if
   * the documents are being fetched, then
   * we mark it as the current version.
   */

  const isCurrentVersion =
    documents && documents.length > 0
      ? currentVersionIndex === documents.length - 1
      : true

  const { width: windowWidth, height: windowHeight } = useWindowSize()
  const isMobile = windowWidth ? windowWidth < 768 : false

  const blockDefinition = blockDefinitions.find(
    (definition) => definition.kind === block.kind,
  )

  if (!blockDefinition) {
    throw new Error('Block definition not found!')
  }

  useEffect(() => {
    if (block.documentId !== 'init') {
      if (blockDefinition.initialize) {
        blockDefinition.initialize({
          documentId: block.documentId ?? '',
          setMetadata,
        })
      }
    }
  }, [block.documentId, blockDefinition, setMetadata])

  return (
    <>
      {/* Animated block container with smooth mount/unmount transitions
        Uses framer-motion for spring-based animations and drag interactions */}
      <AnimatePresence>
        {block.isVisible && (
          <motion.div
            className="flex flex-row h-dvh w-dvw fixed top-0 left-0 z-50 bg-transparent"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { delay: 0.4 } }}
          >
            {!isMobile && (
              <motion.div
                className="fixed bg-background h-dvh"
                initial={{
                  width: isSidebarOpen ? windowWidth - 256 : windowWidth,
                  right: 0,
                }}
                animate={{ width: windowWidth, right: 0 }}
                exit={{
                  width: isSidebarOpen ? windowWidth - 256 : windowWidth,
                  right: 0,
                }}
              />
            )}

            {!isMobile && (
              <motion.div
                className="relative w-[400px] bg-muted dark:bg-background h-dvh shrink-0"
                initial={{ opacity: 0, x: 10, scale: 1 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  transition: {
                    delay: 0.2,
                    type: 'spring',
                    stiffness: 200,
                    damping: 30,
                  },
                }}
                exit={{
                  opacity: 0,
                  x: 0,
                  scale: 1,
                  transition: { duration: 0 },
                }}
              >
                <AnimatePresence>
                  {/* Animated semi-transparent overlay that appears when viewing a previous version
                  Uses framer-motion for smooth fade in/out transitions */}
                  {!isCurrentVersion && (
                    <motion.div
                      className="left-0 absolute h-dvh w-[400px] top-0 bg-zinc-900/50 z-50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    />
                  )}
                </AnimatePresence>

                <div className="flex flex-col h-full justify-between items-center gap-4 border-2 border-blue-500 dark:border-zinc-700">
                  {/* Main message display component that renders the chat history
                    Handles message streaming, voting, and reload functionality */}
                  <BlockMessages
                    chatId={chatId}
                    isLoading={isLoading}
                    votes={votes}
                    messages={messages}
                    setMessages={setMessages}
                    reload={reload}
                    isReadonly={isReadonly}
                    blockStatus={block.status}
                  />


                  {/* Input form with multimodal capabilities for text, documents, and attachments
                    Provides a flexible interface for user interactions and file uploads */}
                  <form className="flex flex-row gap-2 relative items-end w-full px-4 pb-4">
                    <MultimodalInput
                      chatId={chatId}
                      input={input}
                      setInput={setInput}
                      handleSubmit={handleSubmit}
                      isLoading={isLoading}
                      stop={stop}
                      attachments={attachments}
                      setAttachments={setAttachments}
                      messages={messages}
                      setMessages={setMessages}
                      documents={documents ?? []}
                      setDocuments={setDocuments}
                      uploadQueue={uploadQueue}
                      setUploadQueue={setUploadQueue}
                      documentUploadQueue={documentUploadQueue}
                      setDocumentUploadQueue={setDocumentUploadQueue}
                      append={append}
                      className="bg-background dark:bg-muted"
                    />
                  </form>
                </div>
              </motion.div>
            )}

            <DocumentPanel
              block={block}
              isMobile={isMobile}
              windowWidth={windowWidth}
              windowHeight={windowHeight}
              isCurrentVersion={isCurrentVersion}
              currentVersionIndex={currentVersionIndex}
              handleVersionChangeAction={handleVersionChange}
              mode={mode}
              metadata={metadata}
              setMetadataAction={setMetadata}
              document={document}
              isContentDirty={isContentDirty}
              blockDefinition={blockDefinition}
              getDocumentContentByIdAction={getDocumentContentById}
              isDocumentsFetching={isDocumentsFetching}
              documents={documents}
              isToolbarVisible={isToolbarVisible}
              setIsToolbarVisibleAction={setIsToolbarVisible}
              appendAction={append}
              isLoading={isLoading}
              stopAction={stop}
              setMessagesAction={setMessages}
              saveContentAction={saveContent}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export const Block = memo(PureBlock, (prevProps, nextProps) => {
  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;
  if (prevProps.input !== nextProps.input) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;

  return true;
});
