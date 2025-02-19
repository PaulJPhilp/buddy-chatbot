'use client';

import type { Message } from 'ai';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState } from 'react';
import { MessageActions } from '@/components/message/message-actions';
import { MessageEditor } from '@/components/message/message-editor';
import { ReasoningSection } from '@/components/message/message-reasoning';
import { ToolInvocations } from '@/components/message/tool-display';
import type { Vote } from '@/lib/db/schema';
import { cn } from '@/lib/utils';
import type { MessageMode, SetMessagesFunction } from '@/lib/types';
import equal from 'fast-deep-equal';
import { AttachmentsSection } from './attachment-section';
import { EditMessageButton } from './edit-message-button';
import { AssistantAvatar } from './assistant-avatar';
import { MessageContent } from './message-content';

interface PreviewMessageProps {
  chatId: string;
  message: Message;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: SetMessagesFunction;
  reload: () => void;
  isReadonly: boolean;
}

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  reload,
  isReadonly,
}: PreviewMessageProps) => {
  const [mode, setMode] = useState<MessageMode>('view')

  return (
    <AnimatePresence>
      <motion.div
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            'flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
            {
              'w-full': mode === 'edit',
              'group-data-[role=user]/message:w-fit': mode !== 'edit',
            },
          )}
        >
          <AssistantAvatar role={message.role} />

          <div className="flex flex-col gap-4 w-full">
            <AttachmentsSection
              attachments={message.experimental_attachments}
            />

            <ReasoningSection
              reasoning={message.reasoning}
              isLoading={isLoading}
              mode={mode}
            />

            {(message.content || message.reasoning) && (
              <div className="flex flex-row gap-2 items-start">
                <EditMessageButton
                  role={message.role}
                  isReadonly={isReadonly}
                  hasContent={Boolean(message.content || message.reasoning)}
                  mode={mode}
                  onEdit={() => setMode('edit')}
                />

                {message.content.length > 0 ? (
                  <MessageContent
                    content={message.content as string}
                    role={message.role}
                  />
                ) : (
                  <span className="italic font-light">
                    {`calling tool: ${message?.toolInvocations?.[0].toolName}`}
                  </span>
                )}
              </div>
            )}

            {message.content && mode === 'edit' && (
              <div className="flex flex-row gap-2 items-start">
                <div className="size-8" />

                <MessageEditor
                  key={message.id}
                  message={message}
                  setModeAction={setMode}
                  setMessagesAction={setMessages}
                  reloadAction={reload}
                />
              </div>
            )}

            <ToolInvocations
              toolInvocations={message.toolInvocations}
              isReadonly={isReadonly}
            />

            {!isReadonly && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message}
                vote={vote}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.reasoning !== nextProps.message.reasoning)
      return false;
      if (prevProps.message.content !== nextProps.message.content) return false;
      if (
        !equal(
          prevProps.message.toolInvocations,
          nextProps.message.toolInvocations,
        )
      )
        return false;
      if (!equal(prevProps.vote, nextProps.vote)) return false;

      return true;
    },
  );

  export const ThinkingMessage = () => {
    const role = 'assistant';

    return (
      <motion.div
        className="w-full mx-auto max-w-3xl px-4 group/message "
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
        data-role={role}
      >
        <div
          className={cx(
            'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl',
            {
              'group-data-[role=user]/message:bg-muted': true,
            },
          )}
        >
          <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
            {/* <SparklesIcon size={14} /> */}
          </div>

          <div className="flex flex-col gap-2 w-full">
            <div className="flex flex-col gap-4 text-muted-foreground">
              Thinking...
            </div>
          </div>
        </div>
      </motion.div>
    );
  };