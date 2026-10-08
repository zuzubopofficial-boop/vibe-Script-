import React, { useState } from 'react';
import { Youtube, Facebook, Upload, Link2, Sparkles, ArrowRight, Loader2, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { SAMPLE_VIDEOS } from '../data/sampleVideos';
import { TranscriptData } from '../types/transcript';

interface UrlInputBarProps {
  onTranscribeUrl: (url: string, targetLanguage: string) => Promise<void>;
  onTranscribeFile: (file: File, targetLanguage: string) => Promise<void>;
  onLoadSample: (sample: TranscriptData) => void;
  isLoading: boolean;
  statusMessage?: string;
}

const LANGUAGES = [
  { code: 'hi', label: 'Hindi (हिन्दी)' },
  { code: 'en', label: 'English (US/UK)' },
  { code: 'hinglish', label: 'Hinglish (Hindi in English Script)' },
  { code: 'bn', label: 'Bengali (বাংলা)' },
  { code: 'ta', label: 'Tamil (தமிழ்)' },
  { code: 'te', label: 'Telugu (తెలుగు)' },
  { code: 'mr', label: 'Marathi (मराठी)' },
  { code: 'es', label: 'Spanish (Español)' },
  { code: 'fr', label: 'French (Français)' },
  { code: 'de', label: 'German (Deutsch)' },
  { code: 'ar', label: 'Arabic (العربية)' },
];

export const UrlInputBar: React.FC<UrlInputBarProps> = ({
  onTranscribeUrl,
  onTranscribeFile,
  onLoadSample,
  isLoading,
  statusMessage,
}) => {
  const [activeTab, setActiveTab] = useState<'link' | 'upload'>('link');
  const [urlInput, setUrlInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('hi');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);

  // Platform detection
  const isYouTube = urlInput.includes('youtube.com') || urlInput.includes('youtu.be');
  const isFacebook = urlInput.includes('facebook.com') || urlInput.includes('fb.watch');

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrlInput(text.trim());
        setInputError(null);
      }
    } catch {
      // clipboard access not granted or unavailable
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);

    const trimmed = urlInput.trim();
    if (!trimmed) {
      setInputError('Please enter a YouTube or Facebook video URL');
      return;
    }

    if (!trimmed.includes('youtube') && !trimmed.includes('youtu.be') && !trimmed.includes('facebook') && !trimmed.includes('fb.watch')) {
      setInputError('Please provide a valid YouTube or Facebook link (or use file upload)');
      return;
    }

    onTranscribeUrl(trimmed, selectedLanguage);
  };

  const handleFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setInputError('Please select an audio or video file');
      return;
    }
    onTranscribeFile(selectedFile, selectedLanguage);
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Background glow highlights */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            type="button"
            onClick={() => { setActiveTab('link'); setInputError(null); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
              activeTab === 'link'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>YouTube / Facebook Link</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('upload'); setInputError(null); }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Audio / Video</span>
          </button>
        </div>

        {/* Target Translation Language Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-medium">Translate to:</span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-500 cursor-pointer"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LINK INPUT FORM */}
      {activeTab === 'link' && (
        <form onSubmit={handleUrlSubmit} className="space-y-3">
          <div className="relative flex items-center">
            {/* Platform Icon on the left */}
            <div className="absolute left-3.5 flex items-center space-x-1.5 pointer-events-none">
              {isYouTube ? (
                <span className="flex items-center text-red-500 bg-red-500/10 px-2 py-0.5 rounded text-xs font-bold border border-red-500/20">
                  <Youtube className="w-4 h-4 mr-1 inline" /> YouTube
                </span>
              ) : isFacebook ? (
                <span className="flex items-center text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded text-xs font-bold border border-blue-500/20">
                  <Facebook className="w-4 h-4 mr-1 inline" /> Facebook
                </span>
              ) : (
                <div className="flex items-center space-x-1 text-slate-400">
                  <Youtube className="w-4 h-4 text-red-400 opacity-60" />
                  <Facebook className="w-4 h-4 text-blue-400 opacity-60" />
                </div>
              )}
            </div>

            <input
              type="text"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value);
                if (inputError) setInputError(null);
              }}
              placeholder="Paste YouTube video/Shorts URL or Facebook Reel/Watch link..."
              disabled={isLoading}
              className={`w-full bg-slate-950/80 border text-slate-100 text-sm rounded-xl py-3.5 pr-28 sm:pr-32 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition pl-24 sm:pl-28 ${
                inputError ? 'border-red-500' : 'border-slate-700/80'
              }`}
            />

            {/* Quick action buttons on right */}
            <div className="absolute right-2 flex items-center space-x-1.5">
              {!urlInput && (
                <button
                  type="button"
                  onClick={handlePaste}
                  className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
                >
                  Paste
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-xs sm:text-sm rounded-lg font-semibold bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-md shadow-rose-500/20 transition flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Transcribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* UPLOAD FILE FORM */}
      {activeTab === 'upload' && (
        <form onSubmit={handleFileSubmit} className="space-y-3">
          <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-slate-500 transition bg-slate-950/40 relative">
            <input
              type="file"
              accept="audio/*,video/*,.mp3,.wav,.m4a,.mp4,.webm"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedFile(e.target.files[0]);
                  setInputError(null);
                }
              }}
              disabled={isLoading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                <Upload className="w-6 h-6" />
              </div>
              {selectedFile ? (
                <div>
                  <p className="text-sm font-semibold text-slate-200">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for AI Transcription
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Drop your downloaded Facebook/YouTube video or audio here
                  </p>
                  <p className="text-xs text-slate-400">
                    Supports MP3, MP4, WAV, M4A, WEBM (up to 45MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !selectedFile}
              className="px-5 py-2.5 text-xs sm:text-sm rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Transcribing Audio...</span>
                </>
              ) : (
                <>
                  <span>Transcribe Uploaded File</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Error Message */}
      {inputError && (
        <div className="mt-3 flex items-center space-x-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{inputError}</span>
        </div>
      )}

      {/* Loading status notification */}
      {isLoading && statusMessage && (
        <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-3 text-rose-300 text-xs">
          <Loader2 className="w-4 h-4 animate-spin shrink-0 text-rose-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Quick Demo Pre-sets */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center flex-wrap gap-2">
        <span className="text-[11px] text-slate-400 font-medium flex items-center mr-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 mr-1 inline" />
          Try instant sample:
        </span>
        {SAMPLE_VIDEOS.map((sample) => (
          <button
            key={sample.metadata.id}
            onClick={() => onLoadSample(sample)}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-300 hover:text-white transition cursor-pointer"
          >
            {sample.metadata.platform === 'youtube' ? (
              <Youtube className="w-3 h-3 text-red-400" />
            ) : (
              <Facebook className="w-3 h-3 text-blue-400" />
            )}
            <span className="truncate max-w-[170px]">{sample.metadata.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
