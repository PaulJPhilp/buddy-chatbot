import { memo } from 'react';

import { useBlock } from '@/hooks/use-block';
import { toast } from 'sonner';
import type {
  BlockKind,
  DocumentActionType,
  DocumentActionTense,
} from '@/lib/types';
import type { UIBlock } from '@/components/block/block';
import {
  FileIcon,
  LoaderIcon,
  MessageIcon,
  PencilEditIcon,
} from '@/components/ui/icons';

const getActionText = (
  type: DocumentActionType,
  tense: DocumentActionTense,
) => {
  switch (type) {
    case 'create':
      return tense === 'present' ? 'Creating' : 'Created';
    case 'update':
      return tense === 'present' ? 'Updating' : 'Updated';
    case 'request-suggestions':
      return tense === 'present'
        ? 'Adding suggestions'
        : 'Added suggestions to';
    default:
      return null;
  }
};

interface DocumentToolResultProps {
  type: DocumentActionType;
  result: { id: string; title: string; kind: BlockKind };
  isReadonly: boolean;
}

/**
 * A component that displays the result of a document action with interactive
 * controls.
 * 
 * @explanation
 * This component serves as a visual representation of completed document
 * operations, providing:
 * 
 * 1. Visual Feedback:
 *    - Action-specific icons (file, edit, message)
 *    - Status text with document title
 *    - Interactive button interface
 * 
 * 2. Block Management:
 *    - Precise positioning using bounding box
 *    - Document state initialization
 *    - Block visibility control
 * 
 * 3. Access Control:
 *    - Read-only state handling
 *    - Shared chat restrictions
 *    - Error notifications
 * 
 * The component maintains consistent positioning and provides clear feedback
 * about document operations while ensuring proper access control and state
 * management.
 * 
 * @param props - Configuration for the document tool result
 * @returns A button element displaying the document action result
 */
function PureDocumentToolResult({
  type,
  result,
  isReadonly,
}: DocumentToolResultProps) {
  const { setBlock } = useBlock();

  return (
    <button
      type="button"
      className="bg-background cursor-pointer border py-2 px-3 rounded-xl w-fit 
        flex flex-row gap-3 items-start"
      onClick={(event) => {
        if (isReadonly) {
          toast.error(
            'Viewing files in shared chats is currently not supported.',
          );
          return;
        }

        const rect = event.currentTarget.getBoundingClientRect();

        const boundingBox = {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        };

        setBlock({
          chatId: '',
          documentId: result.id,
          kind: result.kind,
          content: '',
          title: result.title,
          isVisible: true,
          status: 'idle',
          boundingBox,
        });
      }}
    >
      <div className="text-muted-foreground mt-1">
        {type === 'create' ? (
          <FileIcon />
        ) : type === 'update' ? (
          <PencilEditIcon />
        ) : type === 'request-suggestions' ? (
          <MessageIcon />
        ) : null}
      </div>
      <div className="text-left">
        {`${getActionText(type, 'past')} "${result.title}"`}
      </div>
    </button>
  );
}

export const DocumentToolResult = memo(PureDocumentToolResult, () => true);

interface DocumentToolCallProps {
  type: DocumentActionType;
  args: { title: string };
  isReadonly: boolean;
}


/**
 * A component that displays an in-progress document operation with loading
 * state and controls.
 * 
 * @explanation
 * This component handles active document operations, implementing:
 * 
 * 1. Progress Indication:
 *    - Animated loading spinner
 *    - Action-specific icons
 *    - Real-time status text
 * 
 * 2. State Management:
 *    - Preserves existing block state
 *    - Updates visibility dynamically
 *    - Maintains positioning context
 * 
 * 3. User Interaction:
 *    - Click handling with position tracking
 *    - Read-only mode enforcement
 *    - Error state management
 * 
 * 4. Visual Feedback:
 *    - Clear operation status
 *    - Contextual document title display
 *    - Consistent UI positioning
 * 
 * The component provides real-time feedback during document operations while
 * maintaining state consistency and proper access control. It uses animation
 * and positioning to create a smooth, intuitive user experience.
 * 
 * @param props - Properties for configuring the document operation display
 * @returns An interactive button showing the operation progress
 */
function PureDocumentToolCall({
  type,
  args,
  isReadonly,
}: DocumentToolCallProps) {
  const { setBlock } = useBlock();

  return (
    <button
      type="button"
      className="cursor pointer w-fit border py-2 px-3 rounded-xl 
        flex flex-row items-start justify-between gap-3"
      onClick={(event) => {
        if (isReadonly) {
          toast.error(
            'Viewing files in shared chats is currently not supported.',
          );
          return;
        }

        const rect = event.currentTarget.getBoundingClientRect();

        const boundingBox = {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        };

        setBlock((currentBlock: UIBlock) => ({
          ...currentBlock,
          isVisible: true,
          boundingBox,
        }));
      }}
    >
      <div className="flex flex-row gap-3 items-start">
        <div className="text-zinc-500 mt-1">
          {type === 'create' ? (
            <FileIcon />
          ) : type === 'update' ? (
            <PencilEditIcon />
          ) : type === 'request-suggestions' ? (
            <MessageIcon />
          ) : null}
        </div>

        <div className="text-left">
          {`${getActionText(type, 'present')} ${
            args.title ? `"${args.title}"` : ''
          }`}
        </div>
      </div>

      <div className="animate-spin mt-1">{<LoaderIcon />}</div>
    </button>
  );
}

export const DocumentToolCall = memo(PureDocumentToolCall, () => true);
