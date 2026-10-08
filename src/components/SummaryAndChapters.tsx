import React, { useState } from 'react';
import { Sparkles, Bookmark, CheckSquare, Quote, Layers, BarChart2, Play, Smile, Activity, Clock } from 'lucide-react';
import { VideoChapter, TranscriptData } from '../types/transcript';

interface SummaryAndChaptersProps {
  summary: TranscriptData['summary'];
  chapters: VideoChapter[];
  sentiment: TranscriptData['sentiment'];
  stats: TranscriptData['stats'];
  onSeek: (seconds: number) => void;
}

export const SummaryAndChapters: React.FC<SummaryAndChaptersProps> = ({
  summary,
  chapters,
  sentiment,
  stats,
  onSeek,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'chapters' | 'analytics'>('summary');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-full backdrop-blur-xl">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 p-1.5 gap-1.5">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
            activeTab === 'summary'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Summary & Takeaways</span>
        </button>

        <button
          onClick={() => setActiveTab('chapters')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
            activeTab === 'chapters'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Chapters ({chapters?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Analytics & Tone</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 overflow-y-auto max-h-[580px] space-y-5 flex-1">
        {/* TAB 1: SUMMARY */}
        {activeTab === 'summary' && (
          <div className="space-y-5">
            {/* TL;DR card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-transparent border border-rose-500/20 space-y-1.5">
              <div className="flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Executive Summary (TL;DR)</span>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed font-normal">
                {summary.tldr}
              </p>
            </div>

            {/* Key Takeaways */}
            {summary.keyTakeaways?.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                  <span>Key Insights & Takeaways</span>
                </h4>
                <ul className="space-y-2">
                  {summary.keyTakeaways.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start space-x-2.5 text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/70"
                    >
                      <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Items */}
            {summary.actionItems?.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Action Items & Next Steps</span>
                </h4>
                <ul className="space-y-2">
                  {summary.actionItems.map((action, idx) => (
                    <li
                      key={idx}
                      className="flex items-start space-x-2.5 text-xs text-slate-300 leading-relaxed bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/20"
                    >
                      <span className="text-emerald-400 shrink-0 font-bold">✓</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Memorable Quotes */}
            {summary.memorableQuotes?.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <Quote className="w-3.5 h-3.5 text-blue-400" />
                  <span>Notable Quotes</span>
                </h4>
                <div className="space-y-2">
                  {summary.memorableQuotes.map((quote, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-950/60 border-l-2 border-blue-500 text-xs italic text-slate-200"
                    >
                      {quote}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CHAPTERS */}
        {activeTab === 'chapters' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Click any timestamp to seek the video player to that chapter marker:
            </p>
            <div className="space-y-2.5">
              {chapters.map((chap, idx) => (
                <div
                  key={chap.id || idx}
                  className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onSeek(chap.timeInSeconds)}
                        className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-mono font-bold flex items-center space-x-1 transition cursor-pointer"
                        title="Jump to this chapter"
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        <span>{chap.timestamp}</span>
                      </button>
                      <h4 className="text-xs font-bold text-slate-200">
                        {chap.title}
                      </h4>
                    </div>
                    {chap.summary && (
                      <p className="text-xs text-slate-400 leading-relaxed pl-1">
                        {chap.summary}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: ANALYTICS & STATS */}
        {activeTab === 'analytics' && (
          <div className="space-y-4">
            {/* Sentiment card */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium flex items-center">
                  <Smile className="w-3.5 h-3.5 mr-1 text-amber-400" /> Overall Sentiment
                </span>
                <span className="capitalize text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {sentiment?.overall || 'Informative'}
                </span>
              </div>
              <div className="text-xs text-slate-300">
                <span className="text-slate-500">Tone: </span>
                {sentiment?.tone || 'Natural & educational'}
              </div>
              <div className="text-xs text-slate-300">
                <span className="text-slate-500">Speaking Pace: </span>
                {sentiment?.pace || 'Moderate'}
              </div>
            </div>

            {/* Numbers grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-center space-y-1">
                <p className="text-xs text-slate-400">Total Words</p>
                <p className="text-lg font-extrabold text-white">{stats?.wordCount || 0}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-center space-y-1">
                <p className="text-xs text-slate-400">Reading Time</p>
                <p className="text-lg font-extrabold text-rose-400">
                  ~{stats?.readingTimeMinutes || 2} min
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-center space-y-1">
                <p className="text-xs text-slate-400">Speakers</p>
                <p className="text-lg font-extrabold text-blue-400">
                  {stats?.speakerCount || 1}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-center space-y-1">
                <p className="text-xs text-slate-400">Pacing Speed</p>
                <p className="text-lg font-extrabold text-emerald-400">
                  {sentiment?.pace?.includes('WPM') ? sentiment.pace.split(' ')[1] : '140'} WPM
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
