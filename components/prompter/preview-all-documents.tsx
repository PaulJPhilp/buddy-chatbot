import { PreviewDocument } from './preview-document';

interface PreviewAllDocumentsProps {
  documentUploadQueue: string[];
}

export const PreviewAllDocuments = ({
  documentUploadQueue,
}: PreviewAllDocumentsProps) => {
  if (documentUploadQueue.length === 0) {
    return null;
  }

  return (
    <>
      {documentUploadQueue.map((filename) => (
        <PreviewDocument
          key={filename}
          name={filename}
        />
      ))}
    </>
  );
};
