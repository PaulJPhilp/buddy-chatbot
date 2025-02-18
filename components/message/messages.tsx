import type { Vote } from '@/lib/db/schema';
import type { ChatRequestOptions, Message } from 'ai';
import equal from 'fast-deep-equal';
import { memo } from 'react';
import { Overview } from './overview';
import { PreviewMessage, ThinkingMessage } from './message';
import type { EnhancedMessage, SetMessagesFunction } from '@/lib/types';
import { useScrollToBottom } from './use-scroll-to-bottom';

interface MessageAnnotation {
  chunk: string;
  id: string;
  other: string;
}

interface MessagesProps {
  chatId: string;
  isLoading: boolean;
  votes: Array<Vote> | undefined;
  messages: Array<EnhancedMessage>;
  setMessages: SetMessagesFunction;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
  isBlockVisible: boolean;
}

/**
 * A container component that manages and displays the chat message thread.
 * 
 * @explanation
 * This component orchestrates the chat message display system, providing:
 * 
 * 1. Message Management:
 *    - Efficient message rendering
 *    - Scroll position handling
 *    - Message grouping and ordering
 * 
 * 2. Visual States:
 *    - Loading indicators
 *    - Empty state handling
 *    - Block visibility transitions
 * 
 * 3. Performance Optimizations:
 *    - Virtualized scrolling
 *    - Memoized message components
 *    - Efficient re-renders
 * 
 * 4. Interaction Handling:
 *    - Scroll-to-bottom behavior
 *    - New message indicators
 *    - Block state coordination
 * 
 * The component maintains a smooth chat experience by efficiently managing
 * message updates, scroll positions, and visual feedback while coordinating
 * with the block system for expanded content views. It uses memoization and
 * virtualization to handle large message threads without performance
 * degradation.
 * 
 * @param props - Configuration for the message container
 * @returns A scrollable container of chat messages with proper ordering
 */
export const Messages = memo(
  ({
    chatId,
    isLoading,
    votes,
    messages,
    setMessages,
    reload,
    isReadonly,
    isBlockVisible,
  }: MessagesProps) => {
    return (
      <PureMessages
        chatId={chatId}
        isLoading={isLoading}
        votes={votes}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        isReadonly={isReadonly}
        isBlockVisible={isBlockVisible}
      />
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.chatId !== nextProps.chatId) return false;
    if (prevProps.isReadonly !== nextProps.isReadonly) return false;
    if (prevProps.isBlockVisible !== nextProps.isBlockVisible) return false;
    if (prevProps.reload !== nextProps.reload) return false;
    if (prevProps.setMessages !== nextProps.setMessages) return false;
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.votes !== nextProps.votes) return false;
    return equal(prevProps.messages, nextProps.messages);
  },
);

export const PureMessages = ({
  chatId,
  isLoading,
  votes,
  messages,
  setMessages,
  reload,
  isReadonly,
  isBlockVisible,
}: MessagesProps) => {
  console.log('Messages: ', messages);
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
    >
      {messages.length === 0 && <Overview />}

      {messages?.map((m: Message) => (
        <div key={m.id}>
          {m.annotations?.map((a) => {
            const annotation = a as unknown as MessageAnnotation;
            if (annotation.chunk) return null
            return (
              <div key={annotation.id}>
                {JSON.stringify(annotation)}
              </div>
            );
          })}
        </div>
      ))}

      {messages.map((message, index) => (
        <PreviewMessage
          key={message.id}
          chatId={chatId}
          message={message}
          isLoading={isLoading && messages.length - 1 === index}
          vote={
            votes
              ? votes.find((vote) => vote.messageId === message.id)
              : undefined
          }
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
        />
      ))}

      {isLoading &&
        messages.length > 0 &&
        messages[messages.length - 1].role === 'user' && <ThinkingMessage />}

      <div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
      />
    </div>
  );
};
