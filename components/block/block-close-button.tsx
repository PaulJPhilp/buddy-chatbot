import { memo } from 'react';
import { CrossIcon } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { initialBlockData, useBlock } from '@/hooks/use-block';
import type { UIBlock } from './block';

function PureBlockCloseButton() {
  const { setBlock } = useBlock();

  return (
    <Button
      variant="outline"
      className="h-fit p-2 dark:hover:bg-zinc-700"
      onClick={() => {
        setBlock((currentBlock: UIBlock) =>
          currentBlock.status === 'streaming'
            ? {
                ...currentBlock,
                isVisible: false,
              }
            : { ...initialBlockData, status: 'idle' },
        );
      }}
    >
      <CrossIcon size={18} />
    </Button>
  );
}

export const BlockCloseButton = memo(PureBlockCloseButton, () => true);
