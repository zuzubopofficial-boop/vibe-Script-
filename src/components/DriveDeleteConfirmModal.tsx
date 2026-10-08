import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { DriveFileItem } from '../services/googleDriveService';

interface DriveDeleteConfirmModalProps {
  file: DriveFileItem | null;
  isOpen: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DriveDeleteConfirmModal: React.FC<DriveDeleteConfirmModalProps> = ({
  file,
  isOpen,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-red-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start space-x-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white">
              Google Drive से फ़ाइल हटाएं?
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              क्या आप वाकई इस हिंदी ट्रांसक्रिप्ट फ़ाइल को अपने Google Drive से हटाना चाहते हैं? यह क्रिया वापस नहीं ली जा सकती।
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Detail Box */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200">
          <div className="font-semibold text-rose-300 truncate">
            📄 {file.name}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
            <span>आईडी: {file.id.slice(0, 12)}...</span>
            {file.createdTime && (
              <span>दिनांक: {new Date(file.createdTime).toLocaleDateString('hi-IN')}</span>
            )}
          </div>
        </div>

        {/* Action Buttons: Explicit Confirm and Cancel */}
        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer disabled:opacity-50"
          >
            रद्द करें (Cancel)
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-lg shadow-red-600/30 disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'हटाया जा रहा है...' : 'हाँ, ड्राइव से हटाएं'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
