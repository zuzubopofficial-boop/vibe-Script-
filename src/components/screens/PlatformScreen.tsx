import React, { useState, useMemo } from 'react';
import { Youtube, Facebook, Instagram, Copy, Download, Check, Loader2, ArrowLeft, AlertCircle, Sparkles, Play, RefreshCw, Share2, ExternalLink } from 'lucide-react';
import { TranscriptData } from '../../types/transcript';
import { VideoPlayerEmbed } from '../VideoPlayerEmbed';
import { GoogleDriveIcon } from '../icons/GoogleDriveIcon';

interface PlatformScreenProps {
  platform: 'youtube' | 'facebook' | 'instagram';
  currentData: TranscriptData | null;
  onTranscribe: (url: string) => Promise<void>;
  isLoading: boolean;
  statusMessage?: string;
  errorMessage?: string | null;
  onBackToHome: () => void;
  onSaveToDevice: (data: TranscriptData) => void;
  onSaveToDrive?: (data: TranscriptData) => Promise<{ fileId: string; webViewLink: string; fileName: string }>;
}

export const PlatformScreen: React.FC<PlatformScreenProps> = ({
  platform,
  currentData,
  onTranscribe,
  isLoading,
  statusMessage,
  errorMessage,
  onBackToHome,
  onSaveToDevice,
  onSaveToDrive,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDriveSaving, setIsDriveSaving] = useState(false);
  const [driveSavedLink, setDriveSavedLink] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number | null>(null);

  // Platform metadata configurations
  const config = {
    youtube: {
      name: 'यूट्यूब (YouTube)',
      icon: Youtube,
      color: 'text-red-500',
      bgColor: 'bg-red-500',
      borderColor: 'border-red-500/30',
      glowColor: 'bg-red-600/10',
      placeholder: 'यूट्यूब वीडियो या शॉर्ट्स का लिंक यहाँ डालें (उदा. https://www.youtube.com/watch?v=...)',
      sampleUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      description: 'यूट्यूब वीडियो का लिंक डालें और शुद्ध देवनागरी हिंदी में ट्रांसक्रिप्ट प्राप्त करें।',
    },
    facebook: {
      name: 'फेसबुक (Facebook)',
      icon: Facebook,
      color: 'text-blue-500',
      bgColor: 'bg-blue-600',
      borderColor: 'border-blue-500/30',
      glowColor: 'bg-blue-600/10',
      placeholder: 'फेसबुक रील या वीडियो का लिंक यहाँ डालें (उदा. https://www.facebook.com/share/r/...)',
      sampleUrl: 'https://www.facebook.com/share/r/1Dq6h2gftA/',
      description: 'फेसबुक रील्स और वीडियो का संपूर्ण हिंदी ट्रांसक्रिप्ट टाइमस्टैम्प के साथ प्राप्त करें।',
    },
    instagram: {
      name: 'इंस्टाग्राम (Instagram)',
      icon: Instagram,
      color: 'text-pink-500',
      bgColor: 'bg-gradient-to-r from-pink-600 to-rose-600',
      borderColor: 'border-pink-500/30',
      glowColor: 'bg-pink-600/10',
      placeholder: 'इंस्टाग्राम रील का लिंक यहाँ डालें (उदा. https://www.instagram.com/reel/...)',
      sampleUrl: 'https://www.instagram.com/reel/C-example123/',
      description: 'इंस्टाग्राम रील्स के संवाद को शुद्ध हिंदी लिपि में प्राप्त करें।',
    },
  }[platform];

  const Icon = config.icon;

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrlInput(text.trim());
        setValidationError(null);
      }
    } catch {
      // ignore
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    const trimmed = urlInput.trim();

    if (!trimmed) {
      setValidationError(`कृपया ${config.name} का वीडियो लिंक दर्ज करें`);
      return;
    }

    if (platform === 'youtube' && !trimmed.includes('youtube') && !trimmed.includes('youtu.be')) {
      setValidationError('कृपया एक वैध यूट्यूब वीडियो या शॉर्ट्स लिंक दर्ज करें');
      return;
    }

    if (platform === 'facebook' && !trimmed.includes('facebook') && !trimmed.includes('fb.watch')) {
      setValidationError('कृपया एक वैध फेसबुक रील या वीडियो लिंक दर्ज करें');
      return;
    }

    if (platform === 'instagram' && !trimmed.includes('instagram') && !trimmed.includes('instagr.am')) {
      setValidationError('कृपया एक वैध इंस्टाग्राम रील लिंक दर्ज करें');
      return;
    }

    onTranscribe(trimmed);
  };

  // Ensure the whole script comes strictly together without line breaks (पंक्तियाँ नहीं, पूरी स्क्रिप्ट एक साथ)
  const fullScriptText = useMemo(() => {
    const raw =
      currentData?.fullScript ||
      (currentData?.segments
        ? currentData.segments.map((s) => s.text.trim()).filter(Boolean).join(' ')
        : '');
    return raw.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
  }, [currentData]);

  const handleCopyTranscript = () => {
    if (!fullScriptText) return;
    navigator.clipboard.writeText(fullScriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!currentData) return;
    onSaveToDevice(currentData);
  };

  const isCurrentPlatformData = currentData && currentData.metadata.platform === platform;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>होम (Home)</span>
        </button>

        <div className="flex items-center space-x-2">
          <div className={`p-1.5 rounded-lg bg-slate-800 border ${config.borderColor}`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
          </div>
          <h1 className="font-extrabold text-white text-base sm:text-lg">
            {config.name} हिंदी ट्रांसक्रिप्ट
          </h1>
        </div>
      </div>

      {/* Input Box Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-xl">
        <div className={`absolute -top-16 -right-16 w-48 h-48 ${config.glowColor} rounded-full blur-3xl pointer-events-none`} />

        <p className="text-xs text-slate-300 mb-3">{config.description}</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative flex items-center">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder={config.placeholder}
              disabled={isLoading}
              className="w-full bg-slate-950 border border-slate-700/80 text-slate-100 text-xs sm:text-sm rounded-xl py-3.5 pl-3.5 pr-20 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition"
            />

            <div className="absolute right-2 flex items-center space-x-1">
              {!urlInput && (
                <button
                  type="button"
                  onClick={handlePaste}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                >
                  पेस्ट करें
                </button>
              )}
              {urlInput && (
                <button
                  type="button"
                  onClick={() => setUrlInput('')}
                  className="px-2 py-1 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Validation or API Error in Hindi */}
          {(validationError || errorMessage) && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-2 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError || errorMessage}</span>
            </div>
          )}

          {/* Main Action CTA Button: Get Hindi Transcript */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                setUrlInput(config.sampleUrl);
                setValidationError(null);
              }}
              className="text-[11px] text-slate-400 hover:text-rose-400 transition underline underline-offset-2 cursor-pointer"
            >
              नमूना लिंक डालें
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className={`py-3 px-6 rounded-xl font-bold text-xs sm:text-sm text-white shadow-xl transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer ${config.bgColor}`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>हिंदी ट्रांसक्रिप्ट तैयार हो रहा है...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>हिंदी ट्रांसक्रिप्ट बनाएँ</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Loading status progress notification in Hindi */}
        {isLoading && statusMessage && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-3 text-rose-300 text-xs">
            <Loader2 className="w-4 h-4 animate-spin shrink-0 text-rose-400" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Transcript Results Display Area */}
      {isCurrentPlatformData && currentData && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Action Toolbar: Copy & Save Buttons */}
          <div className="flex items-center justify-between flex-wrap gap-2 bg-slate-900 border border-slate-800 p-3 rounded-2xl">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                {currentData.metadata.title}
              </h3>
              <p className="text-[11px] text-slate-400">
                {currentData.metadata.author} • पूरी स्क्रिप्ट एक साथ • {fullScriptText.split(/\s+/).filter(Boolean).length} शब्द
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {/* Copy Button (Hindi) */}
              <button
                onClick={handleCopyTranscript}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
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

              {/* Google Drive Save Button */}
              {onSaveToDrive && (
                driveSavedLink ? (
                  <a
                    href={driveSavedLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition flex items-center space-x-1.5 shadow-sm"
                    title="Google Drive में खोलें"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ड्राइव में देखें</span>
                  </a>
                ) : (
                  <button
                    onClick={async () => {
                      if (!currentData || isDriveSaving) return;
                      setIsDriveSaving(true);
                      try {
                        const res = await onSaveToDrive(currentData);
                        setDriveSavedLink(res.webViewLink);
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setIsDriveSaving(false);
                      }
                    }}
                    disabled={isDriveSaving}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center space-x-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                    title="सीधे Google Drive में सेव करें"
                  >
                    {isDriveSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        <span>ड्राइव...</span>
                      </>
                    ) : (
                      <>
                        <GoogleDriveIcon className="w-3.5 h-3.5" />
                        <span>Google Drive</span>
                      </>
                    )}
                  </button>
                )
              )}

              {/* Save Button (Hindi) */}
              <button
                onClick={handleSave}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md shadow-rose-500/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>सेव करें</span>
              </button>
            </div>
          </div>

          {/* Video Player Embed / Facebook Preview */}
          <VideoPlayerEmbed
            metadata={currentData.metadata}
            seekTime={null}
          />

          {/* Hindi Summary Card */}
          {currentData.summary && currentData.summary.tldr && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-transparent border border-rose-500/20 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center">
                <Sparkles className="w-3 h-3 mr-1" />
                हिंदी सारांश (Summary)
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                {currentData.summary.tldr}
              </p>
            </div>
          )}

          {/* Full Continuous Script Text Area - पूरी स्क्रिप्ट एक साथ (पंक्तियाँ नहीं) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-3.5 sm:p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm font-bold text-white flex items-center">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400 mr-1.5" />
                  संपूर्ण स्क्रिप्ट (पूरी स्क्रिप्ट एक साथ)
                </span>
                <span className="text-[10px] text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-medium">
                  एक साथ • पंक्तियाँ नहीं
                </span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-400">
                <span>{fullScriptText.split(/\s+/).filter(Boolean).length} शब्द</span>
                <span>•</span>
                <span>{fullScriptText.length} अक्षर</span>
              </div>
            </div>

            {/* Continuous Full Script Box without line breaks or separate rows */}
            <div className="p-5 sm:p-7 max-h-[520px] overflow-y-auto bg-slate-900/60">
              <p className="text-sm sm:text-base text-slate-100 font-normal leading-relaxed sm:leading-loose select-text tracking-wide break-words">
                {fullScriptText}
              </p>
            </div>

            {/* Bottom quick copy bar */}
            <div className="p-3 bg-slate-950/70 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] text-slate-400">
                पूरी स्क्रिप्ट को एक साथ कॉपी करने के लिए दाएँ बटन पर क्लिक करें
              </span>
              <button
                onClick={handleCopyTranscript}
                className="px-3.5 py-1.5 text-xs rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center space-x-1.5 cursor-pointer transition"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>कॉपी हो गया!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>पूरी स्क्रिप्ट कॉपी करें</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
