'use client';

import { memo } from 'react';
import { ArrowUpIcon } from 'lucide-react';
import { Button } from './ui/button';

interface SendButtonProps {
  submitForm: () => void;
  input: string;
  uploadQueue: Array<string>;
}

function PureSendButton({ submitForm, input, uploadQueue }: SendButtonProps) {
  return (
    <Button
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        submitForm();
      }}
      disabled={input.length === 0 || uploadQueue.length > 0}
    >
      <ArrowUpIcon size={14} />
    </Button>
  );
}

export const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.uploadQueue.length !== nextProps.uploadQueue.length)
    return false;
  if (prevProps.input !== nextProps.input) return false;
  return true;
});
