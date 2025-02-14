'use client';

import type { ChatRequestOptions, Message } from 'ai';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState } from 'react';

import type { Vote } from '@/lib/db/schema';

import { DocumentToolCall, DocumentToolResult } from './document';
import {
  PencilEditIcon,
  SparklesIcon,
} from './icons';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';
import { PreviewAttachment } from './preview-attachment';
import { ExtendableWeather } from './weather';
import equal from 'fast-deep-equal';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { MessageEditor } from './message-editor';
import { DocumentPreview } from './document-preview';
import { MessageReasoning } from './message-reasoning';

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  reload,
  isReadonly,
}: {
  chatId: string;
  message: Message;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
}) => {
  console.log('PreviewMessage render with message', message)

  const [mode, setMode] = useState<'view' | 'edit'>('view');

  const ReasoningSection = ({
    reasoning,
    isLoading,
  }: {
    reasoning?: string;
    isLoading: boolean;
  }) => {
    if (!reasoning) return null;
    
    return (
      <MessageReasoning
        isLoading={isLoading}
        reasoning={reasoning}
      />
    );
  };

  const AttachmentsSection = ({
    attachments,
  }: {
    attachments?: Array<{ url: string }>;
  }) => {
    if (!attachments?.length) return null;
    
    return (
      <div className="flex flex-row justify-end gap-2">
        {attachments.map((attachment) => (
          <PreviewAttachment
            key={attachment.url}
            attachment={attachment}
          />
        ))}
      </div>
    );
  };

  const AssistantAvatar = ({ role }: { role: string }) => {
    if (role !== 'assistant') return null;
    
    return (
      <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
        <div className="translate-y-px">
          <SparklesIcon size={14} />
        </div>
      </div>
    );
  };

  const EditMessageButton = ({
    role,
    isReadonly,
    hasContent,
    mode,
    onEdit,
  }: {
    role: string;
    isReadonly: boolean;
    hasContent: boolean;
    mode: 'view' | 'edit';
    onEdit: () => void;
  }) => {
    if (!hasContent || mode !== 'view') return null;
    
    return (
      <div className="flex flex-row gap-2 items-start">
        {role === 'user' && !isReadonly && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                onClick={onEdit}
              >
                <PencilEditIcon />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit message</TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  };

  const MessageContent = ({
    content,
    role,
  }: {
    content?: string;
    role: string;
  }) => {
    if (!content) return null;
    
    return (
      <div
        className={cn('flex flex-col gap-4', {
          'bg-primary text-primary-foreground px-3 py-2 rounded-xl':
            role === 'user',
        })}
      >
        <Markdown>{content}</Markdown>
      </div>
    );
  };

  const ToolResult = ({
    toolName,
    result,
    isReadonly,
  }: {
    toolName: string;
    result: any;
    isReadonly: boolean;
  }) => {
    switch (toolName) {
      case 'getWeather':
        return <ExtendableWeather weatherAtLocation={result} />;
      case 'createDocument':
        return (
          <DocumentPreview
            isReadonly={isReadonly}
            result={result}
          />
        );
      case 'updateDocument':
        return (
          <DocumentToolResult
            type="update"
            result={result}
            isReadonly={isReadonly}
          />
        );
      case 'requestSuggestions':
        return (
          <DocumentToolResult
            type="request-suggestions"
            result={result}
            isReadonly={isReadonly}
          />
        );
      default:
        return <pre>{JSON.stringify(result, null, 2)}</pre>;
    }
  };

  const ToolInProgress = ({
    toolName,
    args,
    isReadonly,
  }: {
    toolName: string;
    args: any;
    isReadonly: boolean;
  }) => {
    switch (toolName) {
      case 'getWeather':
        return <ExtendableWeather />;
      case 'createDocument':
        return (
          <DocumentPreview
            isReadonly={isReadonly}
            args={args}
          />
        );
      case 'updateDocument':
        return (
          <DocumentToolCall
            type="update"
            args={args}
            isReadonly={isReadonly}
          />
        );
      case 'requestSuggestions':
        return (
          <DocumentToolCall
            type="request-suggestions"
            args={args}
            isReadonly={isReadonly}
          />
        );
      default:
        return null;
    }
  };

  const ToolInvocations = ({
    toolInvocations,
    isReadonly,
  }: {
    toolInvocations?: Array<{
      toolName: string;
      toolCallId: string;
      state: string;
      args: any;
      result?: any;
    }>;
    isReadonly: boolean;
  }) => {
    if (!toolInvocations?.length) return null;

    return (
      <div className="flex flex-col gap-4">
        {toolInvocations.map((toolInvocation) => {
          const { toolName, toolCallId, state, args, result } = toolInvocation;

          if (state === 'result') {
            return (
              <div key={toolCallId}>
                <ToolResult
                  toolName={toolName}
                  result={result}
                  isReadonly={isReadonly}
                />
              </div>
            );
          }

          return (
            <div
              key={toolCallId}
              className={cx({
                skeleton: ['getWeather'].includes(toolName),
              })}
            >
              <ToolInProgress
                toolName={toolName}
                args={args}
                isReadonly={isReadonly}
              />
            </div>
          );
        })}
      </div>
    );
  };

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
                <MessageContent
                  content={message.content as string}
                  role={message.role}
                />
              </div>
            )}

            {message.content && mode === 'edit' && (
              <div className="flex flex-row gap-2 items-start">
                <div className="size-8" />

                <MessageEditor
                  key={message.id}
                  message={message}
                  setMode={setMode}
                  setMessages={setMessages}
                  reload={reload}
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
  );
};

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
  console.log('Thinking Message')

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
          <SparklesIcon size={14} />
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
