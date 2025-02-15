'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { formatDistance } from 'date-fns';
import type { Document } from '@/lib/db/schema';
import type { UIBlock } from './block';
import { BlockCloseButton } from './block-close-button';
import { BlockActions } from './block-actions';
import { Toolbar } from '@/components/app/toolbar';
import { VersionFooter } from '@/components/app/version-footer';
import type { Message, CreateMessage, ChatRequestOptions } from 'ai';
import type { Dispatch, SetStateAction } from 'react';

interface DocumentPanelProps {
  block: UIBlock;
  isMobile: boolean;
  windowWidth: number;
  windowHeight: number;
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  handleVersionChangeAction: (type: 'next' | 'prev' | 'toggle' | 'latest') => void;
  mode: 'edit' | 'diff';
  metadata: Record<string, unknown>;
  setMetadataAction: (metadata: Record<string, unknown>) => void;
  document?: Document | null;
  isContentDirty: boolean;
  blockDefinition: {
    content: React.ComponentType<any>;
  };
  getDocumentContentByIdAction: (index: number) => string;
  isDocumentsFetching: boolean;
  documents: Array<Document> | undefined;
  isToolbarVisible: boolean;
  setIsToolbarVisibleAction: Dispatch<SetStateAction<boolean>>;
  appendAction: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isLoading: boolean;
  stopAction: () => void;
  setMessagesAction: Dispatch<SetStateAction<Array<Message>>>;
  saveContentAction: (content: string, debounce: boolean) => void;
}

/**
 * A panel component for displaying and editing AI-generated documents.
 * 
 * @explanation
 * The DocumentPanel provides a specialized interface for viewing and editing
 * different types of AI-generated content. It implements:
 * 
 * 1. Document Display:
 *    - Type-specific content rendering
 *    - Version management
 *    - Real-time content updates
 * 
 * 2. UI Features:
 *    - Responsive layout
 *    - Smooth animations
 *    - Loading states
 * 
 * 3. Interaction:
 *    - Document editing
 *    - Version navigation
 *    - Toolbar controls
 * 
 * 4. Status Management:
 *    - Save state indication
 *    - Last update tracking
 *    - Loading feedback
 * 
 * The component uses spring-based animations for a natural feel and
 * adapts its layout based on the device type (mobile/desktop).
 * 
 * @param {DocumentPanelProps} props - The component props
 * @returns {JSX.Element} The rendered document panel
 */
export function DocumentPanel({
  block,
  isMobile,
  windowWidth,
  windowHeight,
  isCurrentVersion,
  currentVersionIndex,
  handleVersionChangeAction,
  mode,
  metadata,
  setMetadataAction,
  document,
  isContentDirty,
  blockDefinition,
  getDocumentContentByIdAction,
  isDocumentsFetching,
  documents,
  isToolbarVisible,
  setIsToolbarVisibleAction,
  appendAction,
  isLoading,
  stopAction,
  setMessagesAction,
  saveContentAction,
}: DocumentPanelProps) {
  return (
    <motion.div
      className="fixed dark:bg-muted bg-background h-dvh flex flex-col overflow-y-scroll md:border-l dark:border-zinc-700 border-zinc-200"
      initial={
        isMobile
          ? {
            opacity: 1,
            x: block.boundingBox.left,
            y: block.boundingBox.top,
            height: block.boundingBox.height,
            width: block.boundingBox.width,
            borderRadius: 50,
          }
          : {
            opacity: 1,
            x: block.boundingBox.left,
            y: block.boundingBox.top,
            height: block.boundingBox.height,
            width: block.boundingBox.width,
            borderRadius: 50,
          }
      }
      animate={
        isMobile
          ? {
            opacity: 1,
            x: 0,
            y: 0,
            height: windowHeight,
            width: windowWidth ? windowWidth : 'calc(100dvw)',
            borderRadius: 0,
            transition: {
              delay: 0,
              type: 'spring',
              stiffness: 200,
              damping: 30,
              duration: 5000,
            },
          }
          : {
            opacity: 1,
            x: 400,
            y: 0,
            height: windowHeight,
            width: windowWidth
              ? windowWidth - 400
              : 'calc(100dvw-400px)',
            borderRadius: 0,
            transition: {
              delay: 0,
              type: 'spring',
              stiffness: 200,
              damping: 30,
              duration: 5000,
            },
          }
      }
      exit={{
        opacity: 0,
        scale: 0.5,
        transition: {
          delay: 0.1,
          type: 'spring',
          stiffness: 600,
          damping: 30,
        },
      }}
    >
      <div className="p-2 flex flex-row justify-between items-start">
        <div className="flex flex-row gap-4 items-start">
          <BlockCloseButton />

          <div className="flex flex-col">
            <div className="font-medium">{block.title}</div>

            {isContentDirty ? (
              <div className="text-sm text-muted-foreground">
                Saving changes...
              </div>
            ) : document ? (
              <div className="text-sm text-muted-foreground">
                {`Updated ${formatDistance(
                  new Date(document.createdAt),
                  new Date(),
                  {
                    addSuffix: true,
                  },
                )}`}
              </div>
            ) : (
              <div className="w-32 h-3 mt-2 bg-muted-foreground/20 rounded-md animate-pulse" />
            )}
          </div>
        </div>

        <BlockActions
          block={block}
          currentVersionIndex={currentVersionIndex}
          handleVersionChange={handleVersionChangeAction}
          isCurrentVersion={isCurrentVersion}
          mode={mode}
          metadata={metadata}
          setMetadata={setMetadataAction}
        />
      </div>

      <div className="dark:bg-muted bg-background h-full overflow-y-scroll !max-w-full items-center">
        <blockDefinition.content
          title={block.title}
          content={
            isCurrentVersion
              ? block.content
              : getDocumentContentByIdAction(currentVersionIndex)
          }
          mode={mode}
          status={block.status}
          currentVersionIndex={currentVersionIndex}
          suggestions={[]}
          onsaveContentAction={saveContentAction}
          isInline={false}
          isCurrentVersion={isCurrentVersion}
          getDocumentContentByIdAction={getDocumentContentByIdAction}
          isLoading={isDocumentsFetching && !block.content}
          metadata={metadata}
          setMetadataAction={setMetadataAction}
        />

        <AnimatePresence>
          {isCurrentVersion && (
            <Toolbar
              isToolbarVisible={isToolbarVisible}
              setIsToolbarVisibleAction={setIsToolbarVisibleAction}
              appendAction={appendAction}
              isLoading={isLoading}
              stop={stopAction}
              setMessages={setMessagesAction}
              blockKind={block.kind}
            />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {!isCurrentVersion && (
          <VersionFooter
            currentVersionIndex={currentVersionIndex}
            documents={documents}
            handleVersionChangeAction={handleVersionChangeAction}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
