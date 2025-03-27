import React, { useState, useEffect } from 'react';
import { Download, Eye, X } from 'lucide-react';
import { AttachmentManager } from '../lib/attachmentManager';
import type { EmailAttachment } from '../types/email';

interface AttachmentPreviewProps {
  attachment: EmailAttachment;
  onClose: () => void;
}

export function AttachmentPreview({ attachment, onClose }: AttachmentPreviewProps) {
  const [preview, setPreview] = useState<JSX.Element | null>(null);
  const [error, setError] = useState<string | null>(null);
  const attachmentManager = new AttachmentManager();

  useEffect(() => {
    const loadPreview = async () => {
      try {
        const previewComponent = await attachmentManager.getPreviewComponent(attachment);
        setPreview(previewComponent);
      } catch (err) {
        setError('Failed to load preview');
        console.error('Preview error:', err);
      }
    };

    loadPreview();
  }, [attachment]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">
              {attachmentManager.getFileIcon(attachment.contentType)}
            </span>
            <div>
              <h3 className="text-lg font-semibold">{attachment.filename}</h3>
              <p className="text-sm text-gray-500">
                {attachmentManager.formatFileSize(attachment.size)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <a
              href={attachment.url}
              download={attachment.filename}
              className="p-2 hover:bg-gray-100 rounded-full"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </a>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          {error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : preview ? (
            <div className="max-h-[70vh] overflow-auto">{preview}</div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <Eye className="w-8 h-8 mx-auto mb-2" />
              Preview not available for this file type
            </div>
          )}
        </div>
      </div>
    </div>
  );
}