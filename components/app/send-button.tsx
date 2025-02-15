'use client';

import { memo } from 'react';
import { ArrowUpIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SendButtonProps {
  submitForm: () => void;
  input: string;
  uploadQueue: Array<string>;
}

/**
 * A memoized send button component for submitting chat messages or form data.
 * 
 * @explanation
 * The SendButton is a performance-optimized button component that handles message submission.
 * It implements:
 * 1. Memoization for performance optimization:
 *    - Only re-renders when input text changes
 *    - Only re-renders when upload queue length changes
 * 2. Interactive states:
 *    - Disabled when input is empty
 *    - Disabled during file uploads
 *    - Visual feedback through border and hover states
 * 3. Event handling:
 *    - Prevents default form submission
 *    - Triggers custom submit handler
 * 
 * The component uses a two-layer architecture with PureSendButton for the base
 * implementation and a memoized wrapper for performance optimization. It's designed
 * to provide consistent behavior across different chat interfaces while maintaining
 * optimal rendering performance.
 * 
 * @param {SendButtonProps} props - The component props
 * @param {() => void} props.submitForm - Function to handle form submission
 * @param {string} props.input - Current input text value
 * @param {Array<string>} props.uploadQueue - List of files currently being uploaded
 * @returns {JSX.Element} The rendered send button component
 */
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
