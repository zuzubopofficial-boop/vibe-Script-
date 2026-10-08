import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Loader2, Sparkles } from 'lucide-react';

interface AudioVoiceReaderProps {
  textToRead: string;
  label?: string;
}

export const AudioVoiceReader: React.FC<AudioVoiceReaderProps> = ({
  textToRead,
  label = 'Listen to Summary',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voice, setVoice] = useState<'Kore' | 'Puck' | 'Fenrir' | 'Zephyr'>('Kore');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayToggle = async () => {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      return;
    }

    if (audioRef.current && audioRef.current.src) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    // Generate new audio via Gemini TTS
    setIsLoading(true);
    try {
      const res = await fetch('/api/transcribe/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToRead,
          voice,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to synthesize speech');

      const audioSrc = `data:audio/wav;base64,${data.audioBase64}`;
      const audio = new Audio(audioSrc);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
      };

      audio.onerror = () => {
        setIsPlaying(false);
      };

      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('TTS playback error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-xl">
      <button
        onClick={handlePlayToggle}
        disabled={isLoading || !textToRead}
        className="flex items-center space-x-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 disabled:opacity-50 transition cursor-pointer"
        title="Play AI voice narration"
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-3.5 h-3.5 fill-current" />
        ) : (
          <Volume2 className="w-3.5 h-3.5" />
        )}
        <span>{isPlaying ? 'Pause' : label}</span>
      </button>

      {/* Voice picker */}
      <select
        value={voice}
        onChange={(e) => {
          setVoice(e.target.value as any);
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
          }
          setIsPlaying(false);
        }}
        className="bg-slate-900 border border-slate-700 text-slate-300 text-[10px] rounded-md px-1.5 py-0.5 focus:outline-none cursor-pointer"
      >
        <option value="Kore">Voice: Kore</option>
        <option value="Puck">Voice: Puck</option>
        <option value="Fenrir">Voice: Fenrir</option>
        <option value="Zephyr">Voice: Zephyr</option>
      </select>
    </div>
  );
};
