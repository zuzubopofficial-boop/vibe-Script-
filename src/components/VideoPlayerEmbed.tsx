import React, { useState, useEffect } from 'react';
import { Youtube, Facebook, FileAudio, ExternalLink, Clock, User, Volume2, Globe } from 'lucide-react';
import { VideoMetadata } from '../types/transcript';

interface VideoPlayerEmbedProps {
  metadata: VideoMetadata;
  seekTime: number | null;
  onTimeUpdate?: (seconds: number) => void;
}

export const VideoPlayerEmbed: React.FC<VideoPlayerEmbedProps> = ({ metadata, seekTime }) => {
  const [currentStart, setCurrentStart] = useState<number>(0);

  useEffect(() => {
    if (seekTime !== null) {
      setCurrentStart(seekTime);
    }
  }, [seekTime]);

  const isYouTube = metadata.platform === 'youtube';
  const isFacebook = metadata.platform === 'facebook';
  const isUpload = metadata.platform === 'upload';

  // Construct YouTube embed URL with timestamp
  const ytVideoId = metadata.id.startsWith('vid-') ? null : metadata.id;
  const ytEmbedUrl = ytVideoId
    ? `https://www.youtube.com/embed/${ytVideoId}?start=${Math.floor(currentStart)}&rel=0&modestbranding=1`
    : null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl">
      {/* Player Frame or Visual Card */}
      <div className="relative aspect-video bg-black w-full overflow-hidden flex items-center justify-center">
        {isYouTube && ytEmbedUrl ? (
          <iframe
            key={`yt-${ytVideoId}-${currentStart}`}
            src={ytEmbedUrl}
            title={metadata.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : isFacebook ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
            {metadata.thumbnailUrl && (
              <img
                src={metadata.thumbnailUrl}
                alt={metadata.title}
                className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-xs"
              />
            )}
            <div className="relative z-10 max-w-md space-y-3">
              <div className="inline-flex p-3 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <Facebook className="w-8 h-8" />
              </div>
              <h4 className="text-white font-bold text-base sm:text-lg line-clamp-2">
                {metadata.title}
              </h4>
              <p className="text-xs text-slate-300">
                Facebook Reel & Video Transcribed by VibeScript
              </p>
              {metadata.url && (
                <a
                  href={metadata.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition cursor-pointer"
                >
                  <span>Watch on Facebook</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
            <div className="p-4 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 mb-2">
              <FileAudio className="w-8 h-8" />
            </div>
            <h4 className="text-white font-bold text-sm sm:text-base line-clamp-2">
              {metadata.title}
            </h4>
            <p className="text-xs text-slate-400 mt-1">Uploaded Media File Transcript</p>
          </div>
        )}
      </div>

      {/* Video Details Card */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              {isYouTube ? (
                <span className="flex items-center text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full font-medium">
                  <Youtube className="w-3 h-3 mr-1" /> YouTube
                </span>
              ) : isFacebook ? (
                <span className="flex items-center text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full font-medium">
                  <Facebook className="w-3 h-3 mr-1" /> Facebook
                </span>
              ) : (
                <span className="flex items-center text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full font-medium">
                  <FileAudio className="w-3 h-3 mr-1" /> Uploaded File
                </span>
              )}
              {metadata.detectedLanguage && (
                <span className="flex items-center text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">
                  <Globe className="w-3 h-3 mr-1" /> {metadata.detectedLanguage}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-100 line-clamp-2">
              {metadata.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-4 text-xs text-slate-400 border-t border-slate-800 pt-3">
          <div className="flex items-center space-x-1">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-300 font-medium">{metadata.author}</span>
          </div>
          {metadata.durationFormatted && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>{metadata.durationFormatted}</span>
            </div>
          )}
          {metadata.url && (
            <a
              href={metadata.url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center space-x-1 text-rose-400 hover:text-rose-300 transition"
            >
              <span>Source link</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
