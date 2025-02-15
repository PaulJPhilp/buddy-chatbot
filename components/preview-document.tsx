'use client';

import { FileIcon, LoaderIcon } from './icons';

interface PreviewDocumentProps {
  name: string;
  isUploading?: boolean;
}

export const PreviewDocument = ({
  name,
  isUploading = false,
}: PreviewDocumentProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="w-20 h-16 aspect-video rounded-md relative flex flex-col items-center justify-center">
        <div className="text-zinc-500 bg-white rounded-md">
          <FileIcon size={32} />
        </div>

        {isUploading && (
          <div className="animate-spin absolute text-zinc-500">
            <LoaderIcon />
          </div>
        )}
      </div>
      <div className="text-[8px] text-zinc-500 max-w-16 line-clamp-2 min-h-[2em] leading-[1em]">{name}</div>
    </div>
  );
};