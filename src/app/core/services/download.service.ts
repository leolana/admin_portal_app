import { saveAs } from 'file-saver';

export const saveFile = (blobContent: Blob, fileName: string) => {
  saveAs(blobContent, fileName);
};

export const getFileNameFromResponseContentDisposition = res => {
  const contentDisposition = res.headers.get('content-disposition') || '';
  const matches = /filename=([^;]+)/gi.exec(contentDisposition);
  const fileName = (matches[1] || 'untitled').trim();
  return fileName;
};
