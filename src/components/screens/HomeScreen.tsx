import React, { useState } from 'react';
import { Youtube, Facebook, Instagram, Sparkles, ArrowRight, Clock, ShieldCheck, Zap, Download, Smartphone, Copy, Check, CloudUpload } from 'lucide-react';
import { ScreenTab } from '../BottomNavBar';
import { TranscriptData } from '../../types/transcript';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { GoogleDriveIcon } from '../icons/GoogleDriveIcon';

interface HomeScreenProps {
  onNavigate: (tab: ScreenTab) => void;
  recentTranscripts: TranscriptData[];
  onSelectTranscript: (item: TranscriptData) => void;
  onOpenDownloadModal?: () => void;
  onToast?: (msg: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  recentTranscripts,
  onSelectTranscript,
  onOpenDownloadModal,
  onToast,
}) => {
  const { appUrl } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    if (onToast) onToast('ऐप डाउनलोड लिंक कॉपी कर लिया गया!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* App Branding Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-rose-950/40 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-12 -top-12 w-60 h-60 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center space-x-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center shadow-xl shadow-rose-500/30 text-white font-extrabold text-2xl">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                VibeScript
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                v2.0
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              Hindi Video & Reel Transcript Generator
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl mb-6">
          YouTube, Facebook aur Instagram ke kisi bhi video ya reel ka Hindi transcript, timestamps aur summary nikaalein sirf ek click mein!
        </p>

        {/* Feature badges in Hindi */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>शुद्ध हिंदी लिपि</span>
          </div>
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-300">
            <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>सटीक टाइमस्टैम्प</span>
          </div>
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>सुरक्षित एवं निःशुल्क</span>
          </div>
        </div>
      </div>

      {/* App Download Banner / Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/30 border border-rose-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30 shrink-0">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                VibeScript ऐप डाउनलोड करें
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Android & Web
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              अपने मोबाइल पर 1-क्लिक में इंस्टॉल करें या दोस्तों के साथ ऐप लिंक शेयर करें।
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
          <button
            onClick={handleCopy}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer"
            title="ऐप डाउनलोड लिंक कॉपी करें"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'लिंक कॉपी हुआ' : 'लिंक कॉपी करें'}</span>
          </button>

          <button
            onClick={onOpenDownloadModal}
            className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-xs font-bold text-white shadow-lg shadow-rose-600/25 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>डाउनलोड पेज</span>
          </button>
        </div>
      </div>

      {/* Google Drive Integration Banner */}
      <div
        onClick={() => onNavigate('drive')}
        className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30 border border-slate-800 hover:border-emerald-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:scale-[1.01] cursor-pointer group"
      >
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-center shadow-lg group-hover:scale-105 transition shrink-0">
            <GoogleDriveIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                Google Drive क्लाउड सिंक
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                नया फ़ीचर
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              सभी हिंदी ट्रांसक्रिप्ट सीधे अपने Google Drive में सेव करें और किसी भी डिवाइस से खोलें।
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
          <div className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 transition">
            <span>Google Drive खोलें</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>


      {/* 3 Platform Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider px-1">
          वीडियो प्लेटफॉर्म चुनें
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* YouTube Card */}
          <div
            onClick={() => onNavigate('youtube')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-red-950/20 border border-slate-800 hover:border-red-500/50 p-5 shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center border border-red-500/30 group-hover:bg-red-600 group-hover:text-white transition">
                <Youtube className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                वीडियो और शॉर्ट्स
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-400 transition">
              यूट्यूब (YouTube)
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              किसी भी यूट्यूब वीडियो या शॉर्ट्स का लिंक डालकर संपूर्ण हिंदी ट्रांसक्रिप्ट प्राप्त करें।
            </p>

            <button
              type="button"
              className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs shadow-lg shadow-red-600/30 transition cursor-pointer"
            >
              <span>यूट्यूब पेज खोलें</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Facebook Card */}
          <div
            onClick={() => onNavigate('facebook')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950/20 border border-slate-800 hover:border-blue-500/50 p-5 shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-500 flex items-center justify-center border border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white transition">
                <Facebook className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                रील्स और वीडियो
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition">
              फेसबुक (Facebook)
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              फेसबुक रील्स और वॉच वीडियो का लिंक डालकर एक क्लिक में हिंदी संवाद तैयार करें।
            </p>

            <button
              type="button"
              className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition cursor-pointer"
            >
              <span>फेसबुक पेज खोलें</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Instagram Card */}
          <div
            onClick={() => onNavigate('instagram')}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-pink-950/20 border border-slate-800 hover:border-pink-500/50 p-5 shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition">
                <Instagram className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                रील्स और क्लिप्स
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-pink-400 transition">
              इंस्टाग्राम (Instagram)
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              इंस्टाग्राम रील्स के बोले गए शब्दों को शुद्ध हिंदी देवनागरी लिपि में अनुवादित करें।
            </p>

            <button
              type="button"
              className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-semibold text-xs shadow-lg shadow-pink-600/30 transition cursor-pointer"
            >
              <span>इंस्टाग्राम पेज खोलें</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transcripts Section */}
      {recentTranscripts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
              हाल के ट्रांसक्रिप्ट ({recentTranscripts.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentTranscripts.slice(0, 4).map((item) => (
              <div
                key={item.metadata.id}
                onClick={() => onSelectTranscript(item)}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition flex items-center space-x-3 cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden shrink-0 relative">
                  {item.metadata.thumbnailUrl ? (
                    <img
                      src={item.metadata.thumbnailUrl}
                      alt={item.metadata.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">
                      <Sparkles className="w-5 h-5" />
                    </div>
                  )}
                  <div className="absolute top-1 left-1 p-0.5 rounded bg-black/60">
                    {item.metadata.platform === 'youtube' ? (
                      <Youtube className="w-3 h-3 text-red-500" />
                    ) : item.metadata.platform === 'facebook' ? (
                      <Facebook className="w-3 h-3 text-blue-400" />
                    ) : (
                      <Instagram className="w-3 h-3 text-pink-400" />
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-rose-400 transition">
                    {item.metadata.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {item.metadata.author} • पूरी स्क्रिप्ट एक साथ
                  </p>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
