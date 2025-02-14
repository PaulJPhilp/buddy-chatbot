import { toast } from 'sonner';

export interface UploadResponse {
  url: string;
  pathname: string;
  contentType: string;
}

export async function uploadFile(file: File): Promise<UploadResponse | undefined> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/files/upload', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      const { url, pathname, contentType } = data;

      return {
        url,
        pathname,
        contentType,
      };
    }
    const { error } = await response.json();
    toast.error(error);
  } catch (error) {
    toast.error('Error uploading file');
  }
}
