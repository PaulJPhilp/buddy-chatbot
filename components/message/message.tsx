'use client';

import type { Message } from 'ai';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState } from 'react';
import { Markdown } from '@/components/message/markdown';
import { MessageActions } from '@/components/message/message-actions';
import { MessageEditor } from '@/components/message/message-editor';
import { MessageReasoning } from '@/components/message/message-reasoning';
import { DocumentToolCall } from '@/components/document/document-tool';
import { DocumentToolResult } from '@/components/document/document-tool';
import { ExtendableWeather } from '@/components/tools/weather/weather';
import { Button } from '@/components/ui/button';
import { PencilEditIcon } from '@/components/ui/icons';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Vote } from '@/lib/db/schema';
import { cn } from '@/lib/utils';
import type { MessageMode, SetMessagesFunction } from '@/lib/types';
import equal from 'fast-deep-equal';
import { DisplayDocument } from '../document/display-document';

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

  const [mode, setMode] = useState<MessageMode>('view');
  const ReasoningSection = ({
    reasoning,
    isLoading,
    mode,
  }: {
    reasoning?: string;
    isLoading: boolean;
    mode: MessageMode;
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
          <div key={attachment.url}>
            {/* <PreviewAttachment
              key={attachment.url}
              attachment={attachment}
            /> */}
          </div>
        ))}
      </div>
    );
  };

  const AssistantAvatar = ({ role }: { role: string }) => {
    if (role !== 'assistant') return null;

    return (
      <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
        <div className="translate-y-px">
          {/* <SparklesIcon size={14} /> */}
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
    mode: MessageMode;
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
                className="px-2 h-fit rounded-full text-muted-foreground 
                  opacity-0 group-hover/message:opacity-100"
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
    result: any; // Tool results are dynamically typed based on the tool
    isReadonly: boolean;
  }) => {
    switch (toolName) {
      case 'getWeather':
        return <ExtendableWeather weatherAtLocation={result} />;
      case 'createDocument':
        return (
          <DisplayDocument
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
        return (
          <ExtendableWeather />
        );
      case 'createDocument':
        return (
          <DisplayDocument
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
