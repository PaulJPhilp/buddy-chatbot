'use client';

import { isAfter } from 'date-fns';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { useWindowSize } from 'usehooks-ts';

import type { Document } from '@/lib/db/schema';
import { getDocumentTimestampByIndex } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { LoaderIcon } from '@/components/ui/icons';
import { useBlock } from '@/hooks/use-block';

/**
 * Props interface for the VersionFooter component.
 * 
 * @explanation
 * This interface defines the contract for version control functionality,
 * including navigation between versions, document state management, and
 * current version tracking. Each prop serves a specific purpose in the
 * version control workflow.
 */
interface VersionFooterProps {
  handleVersionChangeAction: (type: 'next' | 'prev' | 'toggle' | 'latest') => void;
  documents: Array<Document> | undefined;
  currentVersionIndex: number;
}

/**
 * A responsive footer component for document version control and management.
 * 
 * @explanation
 * The VersionFooter provides version control functionality with a user-friendly
 * interface. It implements:
 * 
 * 1. Version Navigation:
 *    - Actions for next, previous, and latest versions
 *    - Visual indication of current version state
 *    - Optimistic updates during version changes
 * 
 * 2. Responsive Design:
 *    - Adapts layout for mobile and desktop views
 *    - Smooth animations for visibility transitions
 *    - Spring-based motion for natural feel
 * 
 * 3. State Management:
 *    - SWR integration for data synchronization
 *    - Mutation handling with loading states
 *    - Optimistic data updates for better UX
 * 
 * 4. User Feedback:
 *    - Loading indicators during mutations
 *    - Clear version status information
 *    - Disabled states during operations
 * 
 * The component uses Framer Motion for animations and implements optimistic
 * updates through SWR to provide immediate feedback while maintaining data
 * consistency.
 * 
 * @param {VersionFooterProps} props - The component props
 * @param {(type: 'next' | 'prev' | 'toggle' | 'latest') => void} props.handleVersionChangeAction
 *        - Callback for version navigation actions
 * @param {Array<Document> | undefined} props.documents - Available document versions
 * @param {number} props.currentVersionIndex - Index of currently displayed version
 * @returns {JSX.Element | undefined} The rendered footer or undefined if no documents
 */
export const VersionFooter = ({
  handleVersionChangeAction,
  documents,
  currentVersionIndex,
}: VersionFooterProps) => {
  const { block } = useBlock();

  const { width } = useWindowSize();
  const isMobile = width < 768;

  const { mutate } = useSWRConfig();
  const [isMutating, setIsMutating] = useState(false);

  if (!documents) return;
  if (!block.documentId) return;

  return (
    <motion.div
      className="absolute flex flex-col gap-4 lg:flex-row bottom-0 bg-background p-4 w-full border-t z-50 justify-between"
      initial={{ y: isMobile ? 200 : 77 }}
      animate={{ y: 0 }}
      exit={{ y: isMobile ? 200 : 77 }}
      transition={{ type: 'spring', stiffness: 140, damping: 20 }}
    >
      <div>
        <div>You are viewing a previous version</div>
        <div className="text-muted-foreground text-sm">
          Restore this version to make edits
        </div>
      </div>

      <div className="flex flex-row gap-4">
        <Button
          disabled={isMutating}
          onClick={async () => {
            setIsMutating(true);

            mutate(
              `/api/document?id=${block.documentId}`,
              await fetch(`/api/document?id=${block.documentId}`, {
                method: 'PATCH',
                body: JSON.stringify({
                  timestamp: getDocumentTimestampByIndex(
                    documents,
                    currentVersionIndex,
                  ),
                }),
              }),
              {
                optimisticData: documents
                  ? [
                    ...documents.filter((document) =>
                      isAfter(
                        new Date(document.createdAt),
                        new Date(
                          getDocumentTimestampByIndex(
                            documents,
                            currentVersionIndex,
                          ),
                        ),
                      ),
                    ),
                  ]
                  : [],
              },
            );
          }}
        >
          <div>Restore this version</div>
          {isMutating && (
            <div className="animate-spin">
              <LoaderIcon />
            </div>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            handleVersionChangeAction('latest');
          }}
        >
          Back to latest version
        </Button>
      </div>
    </motion.div>
  );
};
