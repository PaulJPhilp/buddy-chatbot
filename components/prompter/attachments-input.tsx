'use client';

import type { Attachment } from 'ai';
import { useRef, type Dispatch, type SetStateAction } from 'react';
import { toast } from 'sonner';

import { uploadFile, type UploadResponse } from '@/lib/upload';
import { PaperclipIcon } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';

interface AttachmentsInputProps {
  attachments: Array<Attachment>;
  setAttachmentsAction: Dispatch<SetStateAction<Array<Attachment>>>;
  uploadQueue: Array<string>;
  setUploadQueueAction: Dispatch<SetStateAction<Array<string>>>;
  isLoading: boolean;
  className?: string;
}

export function PureAttachmentsInput({
  attachments,
  setAttachmentsAction,
  uploadQueue,
  setUploadQueueAction,
  isLoading,
  className,
}: AttachmentsInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const newFiles = Array.from(files);
    const newUploadQueue = newFiles.map((file) => file.name);
    setUploadQueueAction((prev) => [...prev, ...newUploadQueue]);

    try {
      const uploadPromises = newFiles.map(async (file) => uploadFile(file));
      const uploadedFiles = await Promise.all(uploadPromises);

      const validAttachments = uploadedFiles
        .filter((file): file is UploadResponse => 
          file !== undefined && 'url' in file && 'contentType' in file && 'pathname' in file
        )
        .map((file) => ({
          url: file.url,
          name: file.pathname.split('/').pop() || 'file',
          contentType: file.contentType
        }));

      if (validAttachments.length > 0) {
        setAttachmentsAction((prev) => [...prev, ...validAttachments]);
      }
    } catch (error) {
      toast.error('Error uploading files');
    } finally {
      setUploadQueueAction((prev) =>
        prev.filter((name) => !newFiles.find((file) => file.name === name))
      );
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading) {
      toast.error('Please wait for the model to finish its response!');
      return;
    }

    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        multiple
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
      />
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-accent hover:text-accent-foreground h-8 w-8"
        onClick={handleClick}
        disabled={false}
        data-state="closed"
      >
        <PaperclipIcon size={16} />
      </Button>
    </div>
  );
}

export const AttachmentsInput = PureAttachmentsInput;
