import type { Attachment } from 'ai';

import { LoaderIcon, PaperclipIcon } from '../ui/icons';

const stripFileExtension = (filename: string) => {
  return filename.replace(/\.[^/.]+$/, '');
};

export const PreviewAttachment = ({
  attachment,
  isUploading = false,
}: {
  attachment: Attachment;
  isUploading?: boolean;
}) => {
  const { name, url, contentType } = attachment;
  const displayName = name ? stripFileExtension(name) : '';

  return (
    <div className="flex flex-col gap-2">
      <div className="w-20 h-16 aspect-video rounded-md relative flex flex-col items-center justify-center">
        {contentType ? (
          contentType.startsWith('image') ? (
            // NOTE: it is recommended to use next/image for images
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt={name ?? 'An image attachment'}
              className="rounded-md size-full object-cover"
            />
          ) : (
            <div className="text-zinc-500 bg-white rounded-md">
              <PaperclipIcon size={32} />
            </div>
          )
        ) : (
          <div className="text-zinc-500 bg-white rounded-md">
            <PaperclipIcon size={32} />
          </div>
        )}

        {isUploading && (
          <div className="animate-spin absolute text-zinc-500">
            <LoaderIcon />
          </div>
        )}
      </div>
      <div className="text-[8px] text-zinc-500 max-w-16 line-clamp-2 min-h-[2em] leading-[1em]">{displayName}</div>
    </div>
  );
};