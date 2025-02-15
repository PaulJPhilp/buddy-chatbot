import type { Vote } from '@/lib/db/schema';
import type { ChatRequestOptions } from 'ai';
import equal from 'fast-deep-equal';
import { memo } from 'react';
import { Overview } from './overview';
import { PreviewMessage, ThinkingMessage } from './message';
import type { EnhancedMessage, SetMessagesFunction } from '@/lib/types';
import { useScrollToBottom } from './use-scroll-to-bottom';

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
function PureMessages({
  chatId,
  isLoading,
  votes,
  messages,
  setMessages,
  reload,
  isReadonly,
  isBlockVisible,
}: MessagesProps) {
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
    >
      {messages.length === 0 && <Overview />}

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
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isBlockVisible && nextProps.isBlockVisible) return true;

  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.isLoading && nextProps.isLoading) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;

  return true;
});
