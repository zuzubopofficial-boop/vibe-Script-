import React, { useState } from 'react';
import { X, Download, Copy, Check, FileText, Subtitles, Code, FileSpreadsheet, Loader2, ExternalLink } from 'lucide-react';
import { TranscriptData } from '../types/transcript';
import { GoogleDriveIcon } from './icons/GoogleDriveIcon';

interface ExportModalProps {
  data: TranscriptData;
  onClose: () => void;
  onSaveToDrive?: (data: TranscriptData) => Promise<{ fileId: string; webViewLink: string; fileName: string }>;
}

type ExportType = 'srt' | 'vtt' | 'txt' | 'md' | 'json';

export const ExportModal: React.FC<ExportModalProps> = ({ data, onClose, onSaveToDrive }) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportType>('txt');
  const [copied, setCopied] = useState(false);
  const [isDriveSaving, setIsDriveSaving] = useState(false);
  const [driveSavedLink, setDriveSavedLink] = useState<string | null>(null);

  // Time format helper for SRT: 00:01:23,456
  const formatSrtTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const millis = Math.floor((seconds % 1) * 1000);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${millis.toString().padStart(3, '0')}`;
  };

  // Time format helper for VTT: 00:01:23.456
  const formatVttTime = (seconds: number): string => {
    return formatSrtTime(seconds).replace(',', '.');
  };

  // Generate contents
  const generateExportContent = (type: ExportType): string => {
    switch (type) {
      case 'srt':
        return data.segments
          .map((seg, idx) => {
            const startStr = formatSrtTime(seg.start);
            const endStr = formatSrtTime(seg.end || seg.start + 4);
            return `${idx + 1}\n${startStr} --> ${endStr}\n${seg.speaker ? `${seg.speaker}: ` : ''}${seg.text}\n`;
          })
          .join('\n');

      case 'vtt':
        const vttBody = data.segments
          .map((seg, idx) => {
            const startStr = formatVttTime(seg.start);
            const endStr = formatVttTime(seg.end || seg.start + 4);
            return `${idx + 1}\n${startStr} --> ${endStr}\n<v ${seg.speaker}>${seg.text}</v>\n`;
          })
          .join('\n');
        return `WEBVTT - ${data.metadata.title}\n\n${vttBody}`;

      case 'txt': {
        const fullScriptContinuous = (
          data.fullScript ||
          data.segments.map((s) => s.text.trim()).filter(Boolean).join(' ')
        ).replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

        return `शीर्षक: ${data.metadata.title}\nप्लेटफॉर्म: ${data.metadata.platform.toUpperCase()}\nरचनाकार: ${data.metadata.author}\nभाषा: ${data.metadata.detectedLanguage || 'हिंदी (देवनागरी)'}\n\n--- संपूर्ण हिंदी स्क्रिप्ट (पूरी स्क्रिप्ट एक साथ • पंक्तियाँ नहीं) ---\n\n${fullScriptContinuous}\n`;
      }

      case 'md':
        return `# ${data.metadata.title}\n\n` +
          `**Platform:** ${data.metadata.platform.toUpperCase()}  \n` +
          `**Author:** ${data.metadata.author}  \n` +
          `**Language:** ${data.metadata.detectedLanguage}  \n\n` +
          `## Executive Summary\n\n${data.summary.tldr}\n\n` +
          `### Key Takeaways\n\n` +
          data.summary.keyTakeaways.map((t) => `- ${t}`).join('\n') +
          `\n\n### Chapters\n\n` +
          data.chapters.map((c) => `- **[${c.timestamp}]** ${c.title}`).join('\n') +
          `\n\n## Full Transcript\n\n` +
          data.segments.map((s) => `> **[${s.timestamp}] ${s.speaker}:** ${s.text}\n>\n> *${s.translatedText || ''}*`).join('\n\n');

      case 'json':
        return JSON.stringify(data, null, 2);

      default:
        return '';
    }
  };

  const currentContent = generateExportContent(selectedFormat);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extensions: Record<ExportType, string> = {
      srt: 'srt',
      vtt: 'vtt',
      txt: 'txt',
      md: 'md',
      json: 'json',
    };
    const mimeTypes: Record<ExportType, string> = {
      srt: 'text/plain',
      vtt: 'text/vtt',
      txt: 'text/plain',
      md: 'text/markdown',
      json: 'application/json',
    };

    const ext = extensions[selectedFormat];
    const mime = mimeTypes[selectedFormat];
    const blob = new Blob([currentContent], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.metadata.title.slice(0, 25).replace(/\s+/g, '_')}_transcript.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formats: { id: ExportType; label: string; icon: any; desc: string }[] = [
    { id: 'srt', label: 'SRT Subtitles (.srt)', icon: Subtitles, desc: 'For Premiere Pro, DaVinci, CapCut, YouTube captions' },
    { id: 'vtt', label: 'WebVTT (.vtt)', icon: Subtitles, desc: 'HTML5 web video subtitle standard' },
    { id: 'txt', label: 'Plain Text (.txt)', icon: FileText, desc: 'Clean dialogue with timestamps and speaker tags' },
    { id: 'md', label: 'Markdown (.md)', icon: FileSpreadsheet, desc: 'Includes TL;DR, chapters, takeaways, and full speech' },
    { id: 'json', label: 'Structured JSON (.json)', icon: Code, desc: 'Raw segments with millisecond timestamps for developers' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-slate-100 text-base">Export Transcript & Subtitles</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Pills */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/20">
          <p className="text-xs text-slate-400 mb-2.5 font-medium">Select output format:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {formats.map((fmt) => {
              const Icon = fmt.icon;
              const isSelected = selectedFormat === fmt.id;
              return (
                <button
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt.id)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col space-y-1 ${
                    isSelected
                      ? 'bg-rose-500/15 border-rose-500/50 text-white'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 font-semibold text-xs">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-rose-400' : 'text-slate-400'}`} />
                    <span>{fmt.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 leading-tight">
                    {fmt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview Area */}
        <div className="p-4 flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>File Preview:</span>
            <span>{currentContent.split('\n').length} lines</span>
          </div>
          <pre className="flex-1 bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 overflow-y-auto max-h-[260px] leading-relaxed whitespace-pre-wrap">
            {currentContent}
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between flex-wrap gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            बंद करें (Close)
          </button>
          <div className="flex items-center space-x-2">
            {onSaveToDrive && (
              driveSavedLink ? (
                <a
                  href={driveSavedLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition flex items-center space-x-1.5 shadow-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Google Drive में खोलें</span>
                </a>
              ) : (
                <button
                  onClick={async () => {
                    if (isDriveSaving) return;
                    setIsDriveSaving(true);
                    try {
                      const res = await onSaveToDrive(data);
                      setDriveSavedLink(res.webViewLink);
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setIsDriveSaving(false);
                    }
                  }}
                  disabled={isDriveSaving}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  title="Google Drive में सुरक्षित करें"
                >
                  {isDriveSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      <span>ड्राइव में सेव हो रहा है...</span>
                    </>
                  ) : (
                    <>
                      <GoogleDriveIcon className="w-3.5 h-3.5" />
                      <span>Google Drive में सेव करें</span>
                    </>
                  )}
                </button>
              )
            )}
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center space-x-1.5 cursor-pointer"
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
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-lg shadow-rose-500/20 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>डाउनलोड</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
