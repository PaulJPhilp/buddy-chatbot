'use client';
import React from 'react';

import type { BlockKind } from '@/lib/types';

interface DocumentSkeletonProps {
  blockKind: BlockKind;
}

/**
 * A loading placeholder component that mimics the structure of a document
 * block while content is being fetched.
 * 
 * @explanation
 * This skeleton loader provides visual feedback during document loading,
 * implementing:
 * 
 * 1. Visual Elements:
 *    - Animated pulse effects
 *    - Block-specific layouts
 *    - Placeholder content areas
 * 
 * 2. Accessibility:
 *    - Maintains UI structure during loading
 *    - Prevents layout shifts
 *    - Provides visual loading indicators
 * 
 * 3. Block Type Handling:
 *    - Adapts layout based on blockKind
 *    - Preserves consistent spacing
 *    - Matches final content dimensions
 * 
 * The component ensures a smooth loading experience by maintaining the same
 * dimensions and structure as the actual content, preventing jarring
 * transitions when the real content loads. It uses subtle animations to
 * indicate the loading state while keeping the interface stable.
 * 
 * @param props - Configuration for the skeleton loader
 * @returns A placeholder component matching the document's structure
 */
export const DocumentSkeleton: React.FC<DocumentSkeletonProps> = ({
  blockKind,
}: DocumentSkeletonProps) => {
  return blockKind === 'image' ? (
    <div className="flex flex-col gap-4 w-full justify-center items-center h-[calc(100dvh-60px)]">
      <div className="animate-pulse rounded-lg bg-muted-foreground/20 size-96" />
    </div>
  ) : (
    <div className="flex flex-col gap-4 w-full">
      <div className="animate-pulse rounded-lg h-12 bg-muted-foreground/20 w-1/2" />
      <div className="animate-pulse rounded-lg h-5 bg-muted-foreground/20 w-full" />
      <div className="animate-pulse rounded-lg h-5 bg-muted-foreground/20 w-full" />
      <div className="animate-pulse rounded-lg h-5 bg-muted-foreground/20 w-full" />
    </div>
  );
};

export const InlineDocumentSkeleton = () => {
  return (
    <>
    <div className="flex flex-col gap-4 w-full">
      <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-48" />
      <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-3/4" />
      <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-1/2" />
      <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-64" />
      <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-40" />
      <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-36" />
      <div className="animate-pulse rounded-lg h-4 bg-muted-foreground/20 w-64" />
    </div>
    </>
  );
};
