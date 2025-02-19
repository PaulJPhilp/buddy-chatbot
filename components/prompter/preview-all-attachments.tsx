import { PreviewAttachment } from './preview-attachment';
import type { Attachment } from 'ai';

interface PreviewAllAttachmentsProps {
  attachments: Attachment[];
  uploadQueue: string[];
}

export function PreviewAllAttachments({
  attachments,
  uploadQueue
}: PreviewAllAttachmentsProps) {
  if (attachments.length === 0 && uploadQueue.length === 0) {
    return null;
  }

  return (
    <>
      {attachments.map((attachment) => (
        <PreviewAttachment key={attachment.url} attachment={attachment} />
      ))}

      {uploadQueue.map((filename) => (
        <PreviewAttachment
          key={filename}
          attachment={{
            url: '',
            name: filename,
            contentType: '',
          }}
        />
      ))}
    </>
  );
}