import { Document, Page } from 'react-pdf';
import type { EmailAttachment } from '../types/email';

export class AttachmentManager {
  private readonly supportedPreviewTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
    'text/markdown',
  ];

  async getPreviewComponent(attachment: EmailAttachment): Promise<JSX.Element | null> {
    if (!this.supportedPreviewTypes.includes(attachment.contentType)) {
      return null;
    }

    switch (attachment.contentType) {
      case 'application/pdf':
        return (
          <Document file={attachment.url}>
            <Page pageNumber={1} />
          </Document>
        );
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
        return <img src={attachment.url} alt={attachment.filename} className="max-w-full h-auto" />;
      case 'text/plain':
      case 'text/markdown':
        const response = await fetch(attachment.url);
        const text = await response.text();
        return <pre className="whitespace-pre-wrap">{text}</pre>;
      default:
        return null;
    }
  }

  getFileIcon(contentType: string): string {
    switch (contentType) {
      case 'application/pdf':
        return '📄';
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
        return '🖼️';
      case 'text/plain':
      case 'text/markdown':
        return '📝';
      default:
        return '📎';
    }
  }

  formatFileSize(size: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = size;
    let unitIndex = 0;

    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }

    return `${value.toFixed(1)} ${units[unitIndex]}`;
  }

  isPreviewSupported(contentType: string): boolean {
    return this.supportedPreviewTypes.includes(contentType);
  }
}