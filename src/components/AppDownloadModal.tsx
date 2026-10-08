import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Share2,
  Smartphone,
  QrCode,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  Apple,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast?: (msg: string) => void;
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({
  isOpen,
  onClose,
  onToast,
}) => {
  const { isInstallable, isInstalled, isIOS, install, appUrl } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'install' | 'android' | 'ios' | 'qr'>('install');

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    if (onToast) onToast('ऐप डाउनलोड लिंक कॉपी कर लिया गया!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'VibeScript - हिंदी वीडियो ट्रांसक्रिप्ट ऐप',
          text: 'यूट्यूब, फेसबुक एवं इंस्टाग्राम वीडियो का शुद्ध हिंदी ट्रांसक्रिप्ट निकालने के लिए VibeScript ऐप डाउनलोड करें:',
          url: appUrl,
        });
      } catch (e) {
        console.warn(e);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleTriggerInstall = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok && onToast) {
        onToast('ऐप सफलतापूर्क इंस्टॉल हो रहा है!');
      }
    } else {
      setActiveTab('android');
    }
  };

  // Generate simple QR Code SVG URL via high-reliability API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    appUrl
  )}&bgcolor=0f172a&color=ffffff&margin=10`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-rose-950/40 via-slate-900 to-amber-950/30 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/30 text-white shrink-0">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-white">VibeScript ऐप डाउनलोड</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  v2.0 PWA
                </span>
              </div>
              <p className="text-xs text-slate-400">
                एंड्रॉइड, आईफोन और कंप्यूटर के लिए उपलब्ध
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Main App Link Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-rose-500/30 shadow-inner">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                ऑफिशियल ऐप डाउनलोड लिंक (App Link)
              </span>
              <span className="text-[10px] text-slate-400">100% सुरक्षित • कोई विज्ञापन नहीं</span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-rose-500 select-all"
              />
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1.5 shrink-0 shadow-lg shadow-rose-600/30 transition cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'कॉपी हुआ!' : 'कॉपी करें'}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons: 1-Click Install & Share */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={handleTriggerInstall}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-sm font-bold flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/25 transition cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>{isInstalled ? 'ऐप पहले से इंस्टॉल है' : 'अभी इंस्टॉल करें'}</span>
            </button>

            <button
              onClick={handleShare}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-semibold flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-slate-400" />
              <span>दोस्तों को शेयर करें</span>
            </button>
          </div>

          {/* Platform Tab Navigation */}
          <div className="flex items-center justify-around border-b border-slate-800 pt-2">
            <button
              onClick={() => setActiveTab('install')}
              className={`pb-2.5 text-xs font-bold transition border-b-2 cursor-pointer ${
                activeTab === 'install'
                  ? 'border-rose-500 text-rose-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              एंड्रॉइड (Android)
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`pb-2.5 text-xs font-bold transition border-b-2 cursor-pointer ${
                activeTab === 'ios'
                  ? 'border-rose-500 text-rose-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              आईफोन (iOS / Safari)
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`pb-2.5 text-xs font-bold transition border-b-2 cursor-pointer ${
                activeTab === 'qr'
                  ? 'border-rose-500 text-rose-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              QR कोड स्कैन
            </button>
          </div>

          {/* Android Guide */}
          {(activeTab === 'install' || activeTab === 'android') && (
            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>एंड्रॉइड मोबाइल में ऐप कैसे इंस्टॉल करें?</span>
              </h4>
              <ol className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start space-x-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <span>
                    ऊपर दिए गए <strong>कॉपी करें</strong> बटन से लिंक कॉपी करें और अपने फोन के <strong>Google Chrome</strong> ब्राउज़र में खोलें।
                  </span>
                </li>
                <li className="flex items-start space-x-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <span>
                    Chrome में ऊपर दाहिने कोने में <strong>3 डॉट्स (⋮)</strong> मेनू पर टैप करें।
                  </span>
                </li>
                <li className="flex items-start space-x-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <span>
                    <strong>“Install app”</strong> या <strong>“Add to Home screen” (होम स्क्रीन पर जोड़ें)</strong> चुनें।
                  </span>
                </li>
                <li className="flex items-start space-x-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    4
                  </span>
                  <span>
                    VibeScript सीधे आपके फोन के होम स्क्रीन पर एक नेटिव एंड्रॉइड ऐप आइकन के रूप में जुड़ जाएगा!
                  </span>
                </li>
              </ol>
            </div>
          )}

          {/* iOS Guide */}
          {activeTab === 'ios' && (
            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Apple className="w-4 h-4 text-slate-300" />
                <span>आईफोन / आईपैड (Safari) में इंस्टॉल करें</span>
              </h4>
              <ol className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start space-x-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <span>इस लिंक को अपने iPhone के <strong>Safari ब्राउज़र</strong> में खोलें।</span>
                </li>
                <li className="flex items-start space-x-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <span>नीचे बार में मौजूद <strong>Share (शेयर) बटन</strong> पर टैप करें।</span>
                </li>
                <li className="flex items-start space-x-2 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <span>सूची में नीचे स्क्रॉल करके <strong>“Add to Home Screen”</strong> चुनें और <strong>Add</strong> पर टैप करें।</span>
                </li>
              </ol>
            </div>
          )}

          {/* QR Code Tab */}
          {activeTab === 'qr' && (
            <div className="text-center space-y-3 pt-1">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 inline-block mx-auto shadow-xl">
                <img
                  src={qrCodeUrl}
                  alt="VibeScript App QR Code"
                  className="w-48 h-48 mx-auto rounded-xl"
                />
              </div>
              <p className="text-xs text-slate-300 font-medium">
                अपने मोबाइल के कैमरा से स्कैन करें और ऐप तुरंत खोलें
              </p>
            </div>
          )}

          {/* Security & Benefits */}
          <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>फुल स्क्रीन मोड • ऑफलाइन सपोर्ट • ऑटो-अपडेट</span>
            </span>
            <span className="text-slate-500 font-mono">PWA Native</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium">
            VibeScript v2.0 Production
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};
