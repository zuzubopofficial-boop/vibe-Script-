import React from 'react';
import { Youtube, Facebook, Sparkles, History, Download, Smartphone } from 'lucide-react';
import { GoogleDriveIcon } from './icons/GoogleDriveIcon';

interface HeaderProps {
  onOpenHistory: () => void;
  onOpenDownloadModal: () => void;
  onOpenDrive: () => void;
  savedCount: number;
  userPhoto?: string | null;
  userName?: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHistory,
  onOpenDownloadModal,
  onOpenDrive,
  savedCount,
  userPhoto,
  userName,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20 text-white font-bold">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                VibeScript
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                AI Studio
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              यूट्यूब, फेसबुक एवं इंस्टाग्राम • शुद्ध हिंदी ट्रांसक्रिप्ट स्टूडियो
            </p>
          </div>
        </div>

        {/* Platform support badges & actions */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {/* Google Drive Button */}
          <button
            onClick={onOpenDrive}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/90 border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
            title="Google Drive क्लाउड सिंक"
          >
            {userPhoto ? (
              <img
                src={userPhoto}
                alt={userName || 'Drive'}
                className="w-4 h-4 rounded-full object-cover"
              />
            ) : (
              <GoogleDriveIcon className="w-4 h-4" />
            )}
            <span className="hidden xs:inline sm:inline">Google Drive</span>
          </button>

          {/* App Download Button */}
          <button
            onClick={onOpenDownloadModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold transition shadow-md shadow-rose-600/20 cursor-pointer"
            title="VibeScript ऐप डाउनलोड व इंस्टॉल करें"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">ऐप डाउनलोड</span>
          </button>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition cursor-pointer"
            title="सहेजे गए ट्रांसक्रिप्ट"
          >
            <History className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline">इतिहास</span>
            {savedCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

