import React from 'react';
import { X, Youtube, Facebook, Trash2, Clock, Play, FileAudio } from 'lucide-react';
import { TranscriptData } from '../types/transcript';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  historyList: TranscriptData[];
  onSelect: (item: TranscriptData) => void;
  onClear: () => void;
  onRemove: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  historyList,
  onSelect,
  onClear,
  onRemove,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
            <div>
              <h3 className="font-bold text-slate-100 text-base">Saved Transcripts</h3>
              <p className="text-xs text-slate-400">{historyList.length} video(s) cached locally</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {historyList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <Clock className="w-10 h-10 mb-2 opacity-40" />
                <p className="text-sm font-semibold">No saved transcripts yet</p>
                <p className="text-xs mt-1">
                  Transcribe any YouTube or Facebook video to save it here for fast access.
                </p>
              </div>
            ) : (
              historyList.map((item) => {
                const isYt = item.metadata.platform === 'youtube';
                const isFb = item.metadata.platform === 'facebook';
                return (
                  <div
                    key={item.metadata.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition flex items-start gap-3 group relative cursor-pointer"
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                  >
                    <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-slate-800 shrink-0">
                      {item.metadata.thumbnailUrl ? (
                        <img
                          src={item.metadata.thumbnailUrl}
                          alt={item.metadata.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <FileAudio className="w-6 h-6" />
                        </div>
                      )}
                      <div className="absolute top-1 left-1 p-0.5 rounded bg-black/60">
                        {isYt ? (
                          <Youtube className="w-3 h-3 text-red-500" />
                        ) : isFb ? (
                          <Facebook className="w-3 h-3 text-blue-400" />
                        ) : (
                          <FileAudio className="w-3 h-3 text-indigo-400" />
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <h4 className="text-xs font-bold text-slate-200 line-clamp-2 group-hover:text-rose-400 transition">
                        {item.metadata.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 truncate">
                        {item.metadata.author} • {item.metadata.durationFormatted || '03:00'}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove(item.metadata.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-3 right-3 p-1 rounded hover:bg-red-500/20 text-slate-400 hover:text-red-400 cursor-pointer"
                      title="Remove from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {historyList.length > 0 && (
            <div className="p-3 border-t border-slate-800 bg-slate-950/50 flex justify-between items-center">
              <button
                onClick={onClear}
                className="text-xs text-red-400 hover:text-red-300 font-medium transition cursor-pointer"
              >
                Clear all history
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition cursor-pointer"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
