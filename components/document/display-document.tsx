'use client';

import type { BlockKind } from '@/lib/types';
import type { UIBlock } from '@/components/block/block';
import { ImageEditor } from '@/components/editors/image-editor';
import { SpreadsheetEditor } from '@/components/editors/sheet-editor';
import equal from 'fast-deep-equal';
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type MouseEvent,
} from 'react';
import useSWR from 'swr';
import { useBlock } from '@/hooks/use-block';
import type { Document } from '@/lib/db/schema';
import { cn, fetcher } from '@/lib/utils';
import { CodeEditor } from '@/components/editors/code-editor';
import { Editor } from '@/components/editors/editor';
import { FileIcon, FullscreenIcon, ImageIcon, LoaderIcon } from '@/components/ui/icons';
import { DocumentToolCall, DocumentToolResult } from '@/components/document/document-tool';
import { InlineDocumentSkeleton } from './document-skeleton';

interface DisplayDocumentProps {
  isReadonly: boolean;
  result?: { id: string; title: string; kind: BlockKind };
  args?: any;
}

/**
 * A versatile component for rendering document states and operations in the UI.
 * 
 * @explanation
 * This component acts as a smart wrapper for document-related displays,
 * providing:
 * 
 * 1. Conditional Rendering:
 *    - Handles both completed results and in-progress operations
 *    - Switches between DocumentToolResult and DocumentToolCall
 *    - Manages empty/loading states gracefully
 * 
 * 2. State Coordination:
 *    - Synchronizes document action types
 *    - Manages result data presentation
 *    - Handles readonly mode consistently
 * 
 * 3. Accessibility Features:
 *    - Clear visual hierarchy
 *    - Consistent interaction patterns
 *    - State-appropriate feedback
 * 
 * 4. Error Handling:
 *    - Graceful fallbacks for missing data
 *    - Type-safe property usage
 *    - Proper null state management
 * 
 * The component intelligently chooses between different display modes based on
 * the current document state, ensuring a seamless transition between
 * in-progress and completed operations while maintaining proper access
 * control.
 * 
 * @param props - Configuration options for document display
 * @returns An appropriate document tool component based on current state
 */
export function DisplayDocument({
  isReadonly,
  result,
  args,
}: DisplayDocumentProps) {
  const { block, setBlock } = useBlock();

  const { data: documents, isLoading: isDocumentsFetching } = useSWR<
    Array<Document>
  >(result ? `/api/document?id=${result.id}` : null, fetcher);

  const previewDocument = useMemo(() => documents?.[0], [documents]);
  const hitboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const boundingBox = hitboxRef.current?.getBoundingClientRect();

    if (block.documentId && boundingBox) {
      setBlock((block: any) => ({
        ...block,
        boundingBox: {
          left: boundingBox.x,
          top: boundingBox.y,
          width: boundingBox.width,
          height: boundingBox.height,
        },
      }));
    }
  }, [block.documentId, setBlock]);

  if (block.isVisible) {
    if (result) {
      return (
        <DocumentToolResult
          type="create"
          result={{ id: result.id, title: result.title, kind: result.kind }}
          isReadonly={isReadonly}
        />
      );
    }

    if (args) {
      return (
        <DocumentToolCall
          type="create"
          args={{ title: args.title }}
          isReadonly={isReadonly}
        />
      );
    }
  }

  if (isDocumentsFetching) {
    return <LoadingSkeleton blockKind={result?.kind ?? args.kind} />;
  }

  const document: Document = previewDocument ?? (
    block.status === 'streaming'
      ? {
          title: block.title,
          kind: block.kind,
          content: block.content,
          id: block.documentId,
          createdAt: new Date(),
          userId: 'noop',
          embedding: null,
        }
      : documents?.find((doc) => doc.id === block.documentId) ?? {
          title: '',
          kind: args.kind,
          content: null,
          id: block.documentId || '',
          createdAt: new Date(),
          userId: 'noop',
          embedding: null,
        }
  );

  if (!document) return <LoadingSkeleton blockKind={block.kind} />;

  return (
    <div className="relative w-full cursor-pointer">
      <HitboxLayer hitboxRef={hitboxRef} result={result} setBlock={setBlock} />
      <DocumentHeader
        title={document.title}
        kind={document.kind}
        isStreaming={block.status === 'streaming'}
      />
      <DocumentContent document={document} />
    </div>
  );
}

const LoadingSkeleton = ({ blockKind }: { blockKind: BlockKind }) => (
  <div className="w-full">
    <div className="p-4 border rounded-t-2xl flex flex-row gap-2 items-center justify-between dark:bg-muted border-b-0 dark:border-zinc-700">
      <div className="flex flex-row items-center gap-3">
        <div className="text-muted-foreground">
          <div className="animate-pulse rounded-md size-4 bg-muted-foreground/20" />
        </div>
        <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-24" />
      </div>
      <div>
        <FullscreenIcon />
      </div>
    </div>
    {blockKind === 'image' ? (
      <div className="overflow-y-scroll border rounded-b-2xl bg-muted border-t-0 dark:border-zinc-700">
        <div className="animate-pulse h-[257px] bg-muted-foreground/20 w-full" />
      </div>
    ) : (
      <div className="overflow-y-scroll border rounded-b-2xl p-8 pt-4 bg-muted border-t-0 dark:border-zinc-700">
        <InlineDocumentSkeleton />
      </div>
    )}
  </div>
);

const PureHitboxLayer = ({
  hitboxRef,
  result,
  setBlock,
}: {
  hitboxRef: React.RefObject<HTMLDivElement>;
  result: any;
  setBlock: (updaterFn: UIBlock | ((currentBlock: UIBlock) => UIBlock)) => void;
}) => {
  const handleClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const boundingBox = event.currentTarget.getBoundingClientRect();

      setBlock((block) =>
        block.status === 'streaming'
          ? { ...block, isVisible: true }
          : {
            ...block,
            title: result.title,
            documentId: result.id,
            kind: result.kind,
            isVisible: true,
            boundingBox: {
              left: boundingBox.x,
              top: boundingBox.y,
              width: boundingBox.width,
              height: boundingBox.height,
            },
          },
      );
    },
    [setBlock, result],
  );

  return (
    <div
      className="size-full absolute top-0 left-0 rounded-xl z-10"
      ref={hitboxRef}
      onClick={handleClick}
      role="presentation"
      aria-hidden="true"
    >
      <div className="w-full p-4 flex justify-end items-center">
        <div className="absolute right-[9px] top-[13px] p-2 hover:dark:bg-zinc-700 rounded-md hover:bg-zinc-100">
          <FullscreenIcon />
        </div>
      </div>
    </div>
  );
};

const HitboxLayer = memo(PureHitboxLayer, (prevProps, nextProps) => {
  if (!equal(prevProps.result, nextProps.result)) return false;
  return true;
});

const PureDocumentHeader = ({
  title,
  kind,
  isStreaming,
}: {
  title: string;
  kind: BlockKind;
  isStreaming: boolean;
}) => (
  <div className="p-4 border rounded-t-2xl flex flex-row gap-2 items-start sm:items-center justify-between dark:bg-muted border-b-0 dark:border-zinc-700">
    <div className="flex flex-row items-start sm:items-center gap-3">
      <div className="text-muted-foreground">
        {isStreaming ? (
          <div className="animate-spin">
            <LoaderIcon />
          </div>
        ) : kind === 'image' ? (
          <ImageIcon />
        ) : (
          <FileIcon />
        )}
      </div>
      <div className="-translate-y-1 sm:translate-y-0 font-medium">{title}</div>
    </div>
    <div className="w-8" />
  </div>
);

const DocumentHeader = memo(PureDocumentHeader, (prevProps, nextProps) => {
  if (prevProps.title !== nextProps.title) return false;
  if (prevProps.isStreaming !== nextProps.isStreaming) return false;

  return true;
});

const DocumentContent = ({ document }: { document: Document }) => {
  const { block } = useBlock();

  const containerClassName = cn(
    'h-[257px] overflow-y-scroll border rounded-b-2xl dark:bg-muted border-t-0 dark:border-zinc-700',
    {
      'p-4 sm:px-14 sm:py-16': document.kind === 'text',
      'p-0': document.kind === 'code',
    },
  );

  const commonProps = {
    content: document.content ?? '',
    isCurrentVersion: true,
    currentVersionIndex: 0,
    status: block.status,
    saveContent: () => { },
    suggestions: [],
  };

  return (
    <div className={containerClassName}>
      {document.kind === 'text' ? (
        <Editor {...commonProps} onSaveContent={() => { }} />
      ) : document.kind === 'code' ? (
        <div className="flex flex-1 relative w-full">
          <div className="absolute inset-0">
            <CodeEditor {...commonProps} onSaveContent={() => { }} />
          </div>
        </div>
      ) : document.kind === 'sheet' ? (
        <div className="flex flex-1 relative size-full p-4">
          <div className="absolute inset-0">
            <SpreadsheetEditor {...commonProps} />
          </div>
        </div>
      ) : document.kind === 'image' ? (
        <ImageEditor
          title={document.title}
          content={document.content ?? ''}
          isCurrentVersion={true}
          currentVersionIndex={0}
          status={block.status}
          isInline={true}
        />
      ) : null}
    </div>
  );
};
