import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Download } from 'lucide-react';
import { DriveFileItem } from '../services/googleDriveService';

interface DriveFileViewerModalProps {
  file: DriveFileItem | null;
  content: string;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
}

export const DriveFileViewerModal: React.FC<DriveFileViewerModalProps> = ({
  file,
  content,
  isOpen,
  isLoading,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !file) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="min-w-0 pr-4">
            <h3 className="font-bold text-white text-sm sm:text-base truncate">
              {file.name}
            </h3>
            <p className="text-[11px] text-slate-400">
              Google Drive से डाउनलोड की गई हिंदी स्क्रिप्ट
            </p>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            {file.webViewLink && (
              <a
                href={file.webViewLink}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1 border border-slate-700 transition"
                title="Google Drive में खोलें"
              >
                <ExternalLink className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">ड्राइव में खोलें</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-950/50 font-normal text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed select-text">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400">
              सामग्री लोड हो रही है...
            </div>
          ) : (
            content || 'सामग्री खाली है'
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            संपूर्ण स्क्रिप्ट एक साथ
          </span>
          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>कॉपी हो गया!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>कॉपी करें</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
