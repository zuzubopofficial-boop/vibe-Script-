import React, { useState } from 'react';
import { Share2, Youtube, Twitter, Linkedin, Facebook, BookOpen, Copy, Check, Loader2, Sparkles, Download } from 'lucide-react';

interface RepurposeStudioProps {
  transcriptText: string;
  videoTitle: string;
}

type FormatType = 'youtube_desc' | 'twitter_thread' | 'linkedin' | 'facebook_post' | 'hindi_summary';

export const RepurposeStudio: React.FC<RepurposeStudioProps> = ({
  transcriptText,
  videoTitle,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<FormatType>('youtube_desc');
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const formats: { id: FormatType; label: string; icon: any; color: string }[] = [
    { id: 'youtube_desc', label: 'YouTube SEO & Chapters', icon: Youtube, color: 'text-red-400' },
    { id: 'facebook_post', label: 'Viral Facebook Post', icon: Facebook, color: 'text-blue-400' },
    { id: 'twitter_thread', label: 'Twitter / X Thread', icon: Twitter, color: 'text-sky-400' },
    { id: 'linkedin', label: 'LinkedIn Article', icon: Linkedin, color: 'text-blue-500' },
    { id: 'hindi_summary', label: 'हिन्दी ब्लॉग पोस्ट', icon: BookOpen, color: 'text-amber-400' },
  ];

  const handleGenerate = async (format: FormatType) => {
    setSelectedFormat(format);
    if (generatedContent[format]) return; // already generated

    setIsLoading(true);
    try {
      const res = await fetch('/api/transcribe/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcriptText,
          videoTitle,
          formatType: format,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate');

      setGeneratedContent((prev) => ({
        ...prev,
        [format]: data.content || '',
      }));
    } catch (err: any) {
      setGeneratedContent((prev) => ({
        ...prev,
        [format]: `Generation error: ${err.message}`,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const currentText = generatedContent[selectedFormat];

  const handleCopy = () => {
    if (!currentText) return;
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!currentText) return;
    const blob = new Blob([currentText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${videoTitle.slice(0, 25)}-${selectedFormat}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-full backdrop-blur-xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Content Repurposer Studio</h3>
            <p className="text-[11px] text-slate-400">Turn this video into viral social posts in 1 click</p>
          </div>
        </div>
      </div>

      {/* Format Buttons Row */}
      <div className="p-3 bg-slate-950/30 border-b border-slate-800/80 flex items-center flex-wrap gap-1.5">
        {formats.map((fmt) => {
          const Icon = fmt.icon;
          const isSelected = selectedFormat === fmt.id;
          return (
            <button
              key={fmt.id}
              onClick={() => handleGenerate(fmt.id)}
              disabled={isLoading}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                isSelected
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : fmt.color}`} />
              <span>{fmt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Preview */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[260px] max-h-[380px]">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-2 py-12 text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
            <p>Creating optimized {formats.find(f => f.id === selectedFormat)?.label}...</p>
          </div>
        ) : currentText ? (
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
            {currentText}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center space-y-3 py-12 text-center">
            <Sparkles className="w-8 h-8 text-indigo-400/60" />
            <p className="text-xs text-slate-400 max-w-xs">
              Select any format above to automatically convert the video transcript into high-performing social copy!
            </p>
            <button
              onClick={() => handleGenerate(selectedFormat)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition cursor-pointer"
            >
              Generate {formats.find(f => f.id === selectedFormat)?.label}
            </button>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {currentText && !isLoading && (
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <button
            onClick={() => handleGenerate(selectedFormat)}
            className="text-xs text-slate-400 hover:text-rose-400 transition cursor-pointer"
          >
            Regenerate
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer shadow-md shadow-rose-500/20"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
