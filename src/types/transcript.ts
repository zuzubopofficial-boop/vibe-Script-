export interface TranscriptSegment {
  id: string;
  start: number; // in seconds
  end: number; // in seconds
  timestamp: string; // e.g. "01:24"
  speaker: string;
  text: string;
  translatedText?: string;
  confidence?: number;
}

export interface VideoChapter {
  id: string;
  timestamp: string;
  timeInSeconds: number;
  title: string;
  summary: string;
}

export interface VideoMetadata {
  id: string;
  url: string;
  platform: 'youtube' | 'facebook' | 'instagram' | 'upload';
  title: string;
  author: string;
  thumbnailUrl: string;
  durationFormatted?: string;
  durationSeconds?: number;
  detectedLanguage?: string;
  description?: string;
}

export interface TranscriptData {
  metadata: VideoMetadata;
  fullScript?: string;
  segments: TranscriptSegment[];
  summary: {
    tldr: string;
    keyTakeaways: string[];
    actionItems: string[];
    memorableQuotes: string[];
  };
  chapters: VideoChapter[];
  sentiment: {
    overall: 'positive' | 'neutral' | 'inspirational' | 'critical' | 'informative';
    tone: string;
    pace: string;
  };
  stats: {
    wordCount: number;
    readingTimeMinutes: number;
    speakingTimeMinutes: number;
    speakerCount: number;
  };
  language: {
    original: string;
    translated?: string;
  };
}

export interface RepurposeFormat {
  type: 'youtube_desc' | 'twitter_thread' | 'linkedin' | 'facebook_post' | 'hindi_summary';
  title: string;
  content: string;
}
