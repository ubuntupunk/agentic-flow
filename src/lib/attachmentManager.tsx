import React from 'react'; // Import React for JSX
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
    if (!this.supportedPreviewTypes.includes(attachment.mimeType) || !attachment.url) {
      // Cannot preview if type not supported or URL is missing
      return null;
    }

    const url = attachment.url; // URL is guaranteed to exist here

    switch (attachment.mimeType) {
      case 'application/pdf':
        return (
          <Document file={url}>
            <Page pageNumber={1} />
          </Document>
        );
      case 'image/jpeg':
      case 'image/png':
      case 'image/gif':
        return <img src={url} alt={attachment.filename} className="max-w-full h-auto" />;
      case 'text/plain':
      case 'text/markdown':
        const response = await fetch(url);
        if (!response.ok) {
          console.error(`Failed to fetch text preview from ${url}: ${response.statusText}`);
          return <div>Error loading text preview.</div>; // Or some other fallback
        }
        const text = await response.text();
        return <pre className="whitespace-pre-wrap">{text}</pre>;
      default:
        return null;
    }
  }

  getFileIcon(mimeType: string): string {
    switch (mimeType) {
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

  isPreviewSupported(mimeType: string): boolean {
    return this.supportedPreviewTypes.includes(mimeType);
  }
}
