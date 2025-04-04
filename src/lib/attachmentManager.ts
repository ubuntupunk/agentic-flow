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

  // getPreviewComponent removed - exists in attachmentManager.tsx

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
