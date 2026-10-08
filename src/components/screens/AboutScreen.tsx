import React, { useState } from 'react';
import { Info, Sparkles, ShieldCheck, HelpCircle, CheckCircle2, Youtube, Facebook, Instagram, Heart, Code2, Download, Smartphone, Copy, Check, Share2 } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface AboutScreenProps {
  onOpenDownloadModal?: () => void;
  onToast?: (msg: string) => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ onOpenDownloadModal, onToast }) => {
  const { appUrl, isInstallable, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    if (onToast) onToast('ऐप डाउनलोड लिंक कॉपी कर लिया गया!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300 max-w-2xl mx-auto">
      {/* Header Card */}
      <div className="text-center p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center shadow-xl shadow-rose-500/30 text-white font-extrabold text-3xl mb-3">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white">VibeScript</h1>
        <p className="text-xs text-rose-400 font-semibold uppercase tracking-wider mt-0.5">
          Hindi Video & Reel Transcript Studio
        </p>
        <div className="inline-block px-3 py-1 mt-2.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300">
          Version 2.0.0 (Production)
        </div>
      </div>

      {/* App Download Link Section */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-amber-950/30 border border-rose-500/30 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-rose-400" />
            <h2 className="text-sm sm:text-base font-bold text-white">
              ऐप डाउनलोड व इंस्टॉल करें (App Download Link)
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
            PWA Android & iOS
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          VibeScript को बिना Play Store पर जाए अपने एंड्रॉइड फोन या कंप्यूटर की होम स्क्रीन पर सीधे 1-क्लिक में इंस्टॉल करें।
        </p>

        {/* Link Bar */}
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            शेयरेबल ऐप डाउनलोड लिंक
          </p>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={appUrl}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none select-all"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center space-x-1 shrink-0 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'कॉपी हुआ' : 'कॉपी करें'}</span>
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-3 pt-1">
          <button
            onClick={onOpenDownloadModal}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-rose-600/20 transition cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>डाउनलोड व इंस्टॉल गाइड खोलें</span>
          </button>
        </div>
      </div>


      {/* About App */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center space-x-2">
          <Info className="w-4 h-4 text-rose-400" />
          <span>App Ke Baare Mein (About This App)</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          <strong>VibeScript</strong> ek specialized AI video transcriber hai jo YouTube videos/Shorts, Facebook Reels aur Instagram Reels ke spoken audio ko accurate <strong>Hindi (हिन्दी)</strong> text aur timestamps mein convert karta hai.
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Yeh app creators, students, researchers aur editors ke liye banayi gayi hai jo lambe videos dekhne ke bajaye turant unka saransh aur exact dialogue padhna, copy karna ya save karna chahte hain.
        </p>
      </div>

      {/* How to use */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>App Kaise Use Karein? (How To Use)</span>
        </h2>

        <div className="space-y-3 pt-1">
          <div className="flex items-start space-x-3 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <p className="font-bold text-white mb-0.5">Link Copy Karein</p>
              <p className="text-slate-400">
                YouTube, Facebook ya Instagram app mein jaakar video ya reel ka Share link copy karein.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <p className="font-bold text-white mb-0.5">Platform Tab Select Karein</p>
              <p className="text-slate-400">
                Bottom navigation bar se YouTube, Facebook ya Instagram tab par tap karein.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <p className="font-bold text-white mb-0.5">“Get Hindi Transcript” Par Tap Karein</p>
              <p className="text-slate-400">
                Link paste karke button dabayein. AI speech recognize karke Hindi transcript bana dega.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center shrink-0">
              4
            </span>
            <div>
              <p className="font-bold text-white mb-0.5">Copy Ya Save Karein</p>
              <p className="text-slate-400">
                <strong>Copy</strong> button se clipboard par copy karein ya <strong>Save</strong> button se apne device mein text file download karein.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
            <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0">
              5
            </span>
            <div>
              <p className="font-bold text-white mb-0.5">Google Drive में क्लाउड बैकअप</p>
              <p className="text-slate-400">
                <strong>Google Drive</strong> बटन पर टैप करके अपनी ट्रांसक्रिप्ट को सीधे अपने Google Drive के "VibeScript - हिंदी ट्रांसक्रिप्ट" फ़ोल्डर में सुरक्षित करें।
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy & Safety */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Privacy & Data Security</span>
        </h2>
        <ul className="space-y-2 text-xs text-slate-300">
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Hum aapka koi bhi private data ya video store nahi karte.</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Aapke saved transcripts sirf aapke local device storage mein rehte hain.</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Gemini AI API industry-grade encryption ke saath safe aur private hai.</span>
          </li>
        </ul>
      </div>

      {/* Supported Platforms */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <h2 className="text-sm font-bold text-white flex items-center space-x-2">
          <Code2 className="w-4 h-4 text-blue-400" />
          <span>Supported Video Platforms</span>
        </h2>
        <div className="flex items-center justify-around pt-2">
          <div className="flex flex-col items-center space-y-1 text-xs text-slate-300">
            <Youtube className="w-6 h-6 text-red-500" />
            <span>YouTube Videos/Shorts</span>
          </div>
          <div className="flex flex-col items-center space-y-1 text-xs text-slate-300">
            <Facebook className="w-6 h-6 text-blue-500" />
            <span>Facebook Reels & Watch</span>
          </div>
          <div className="flex flex-col items-center space-y-1 text-xs text-slate-300">
            <Instagram className="w-6 h-6 text-pink-500" />
            <span>Instagram Reels</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-slate-500 space-y-1">
        <p className="flex items-center justify-center space-x-1">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
          <span>for Indian creators & learners</span>
        </p>
        <p>© 2026 VibeScript • All rights reserved.</p>
      </div>
    </div>
  );
};
