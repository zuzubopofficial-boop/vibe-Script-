import React, { useState, useMemo } from 'react';
import { Search, Copy, Check, Play, Globe, User, Clock, Filter, Eye } from 'lucide-react';
import { TranscriptSegment } from '../types/transcript';

interface TranscriptViewerProps {
  segments: TranscriptSegment[];
  originalLanguageName: string;
  translatedLanguageName?: string;
  activeSegmentId?: string | null;
  onSeek: (seconds: number) => void;
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({
  segments,
  originalLanguageName,
  translatedLanguageName = 'English',
  activeSegmentId,
  onSeek,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('all');
  const [displayMode, setDisplayMode] = useState<'bilingual' | 'original' | 'translated'>('bilingual');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract unique speakers
  const speakers = useMemo(() => {
    const set = new Set<string>();
    segments.forEach((s) => {
      if (s.speaker) set.add(s.speaker);
    });
    return Array.from(set);
  }, [segments]);

  // Filter segments
  const filteredSegments = useMemo(() => {
    return segments.filter((seg) => {
      // Speaker filter
      if (selectedSpeaker !== 'all' && seg.speaker !== selectedSpeaker) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const textMatch = seg.text.toLowerCase().includes(query);
        const transMatch = seg.translatedText?.toLowerCase().includes(query);
        const speakerMatch = seg.speaker.toLowerCase().includes(query);
        return textMatch || transMatch || speakerMatch;
      }
      return true;
    });
  }, [segments, selectedSpeaker, searchQuery]);

  const handleCopySegment = (seg: TranscriptSegment) => {
    const textToCopy = `[${seg.timestamp}] ${seg.speaker}: ${seg.text}${seg.translatedText ? `\nTranslation: ${seg.translatedText}` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(seg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-amber-400 text-slate-950 font-semibold px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-full backdrop-blur-xl">
      {/* Top Controls Bar */}
      <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900/95 sticky top-0 z-20">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-slate-100 text-base flex items-center">
              <span>Interactive Transcript</span>
              <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                {filteredSegments.length} segments
              </span>
            </h3>
          </div>

          {/* Display Mode Switcher (Bilingual vs Original vs Translated) */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/60 text-xs font-medium">
            <button
              onClick={() => setDisplayMode('bilingual')}
              className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer flex items-center space-x-1 ${
                displayMode === 'bilingual'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Show both spoken and translated text stacked"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Bilingual</span>
            </button>
            <button
              onClick={() => setDisplayMode('original')}
              className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                displayMode === 'original'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{originalLanguageName || 'Original'}</span>
            </button>
            <button
              onClick={() => setDisplayMode('translated')}
              className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${
                displayMode === 'translated'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{translatedLanguageName || 'English'}</span>
            </button>
          </div>
        </div>

        {/* Search & Speaker Filter row */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search words, topics, or speaker dialogue..."
              className="w-full bg-slate-950/70 border border-slate-800 text-slate-200 text-xs rounded-xl py-2 pl-9 pr-8 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Speaker Filter */}
          {speakers.length > 1 && (
            <select
              value={selectedSpeaker}
              onChange={(e) => setSelectedSpeaker(e.target.value)}
              className="bg-slate-950/70 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-rose-500 shrink-0"
            >
              <option value="all">All Speakers ({speakers.length})</option>
              {speakers.map((spk) => (
                <option key={spk} value={spk}>
                  {spk}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Segments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-800/40 max-h-[620px]">
        {filteredSegments.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            <p>No segments found matching "{searchQuery}"</p>
          </div>
        ) : (
          filteredSegments.map((segment) => {
            const isActive = activeSegmentId === segment.id;
            return (
              <div
                key={segment.id}
                className={`pt-3 first:pt-0 group rounded-xl p-3 transition-colors ${
                  isActive ? 'bg-rose-500/10 border border-rose-500/30' : 'hover:bg-slate-800/40'
                }`}
              >
                {/* Segment Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    {/* Clickable timestamp */}
                    <button
                      onClick={() => onSeek(segment.start)}
                      className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-mono font-semibold transition cursor-pointer"
                      title="Jump video to this timestamp"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>{segment.timestamp}</span>
                    </button>

                    {/* Speaker name */}
                    <span className="text-xs font-semibold text-slate-300 flex items-center">
                      <User className="w-3 h-3 mr-1 text-slate-500" />
                      {segment.speaker}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {segment.confidence && (
                      <span className="text-[10px] text-emerald-400/80 font-mono">
                        {Math.round(segment.confidence * 100)}% acc
                      </span>
                    )}
                    <button
                      onClick={() => handleCopySegment(segment)}
                      className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                      title="Copy segment text"
                    >
                      {copiedId === segment.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Spoken Text Display */}
                <div className="space-y-1.5 text-sm pl-0.5">
                  {(displayMode === 'original' || displayMode === 'bilingual') && (
                    <p className="text-slate-100 font-normal leading-relaxed">
                      {highlightMatch(segment.text, searchQuery)}
                    </p>
                  )}

                  {(displayMode === 'translated' || displayMode === 'bilingual') && segment.translatedText && (
                    <p className={`text-xs leading-relaxed ${
                      displayMode === 'bilingual'
                        ? 'text-slate-400 border-l-2 border-slate-700 pl-2.5 mt-1 italic'
                        : 'text-slate-200'
                    }`}>
                      {highlightMatch(segment.translatedText, searchQuery)}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
