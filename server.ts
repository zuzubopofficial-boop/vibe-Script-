import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer memory storage for direct audio/video upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 45 * 1024 * 1024 }, // 45MB
});

// Shared Gemini client utility
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper: Extract YouTube ID
function extractYouTubeId(url: string): string | null {
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

// Helper: Detect platform
function detectPlatform(url: string): 'youtube' | 'facebook' | 'instagram' | 'other' {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  if (url.includes('facebook.com') || url.includes('fb.watch')) {
    return 'facebook';
  }
  if (url.includes('instagram.com') || url.includes('instagr.am')) {
    return 'instagram';
  }
  return 'other';
}

// Helper to convert seconds to MM:SS or HH:MM:SS
function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const h = Math.floor(m / 60);
  const remM = m % 60;
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${remM.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Decode HTML entities commonly returned by Facebook
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#xb7;/g, '·')
    .replace(/&#x1f339;/g, '🌹')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      try {
        return String.fromCodePoint(parseInt(hex, 16));
      } catch {
        return '';
      }
    })
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// Robust Gemini generation with fallback models and exponential backoff
async function generateWithRetry(params: any, retries = 2) {
  const models = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          ...params,
          model,
        });
        return response;
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || '';
        const isTemporary =
          msg.includes('503') ||
          msg.includes('429') ||
          msg.includes('high demand') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('UNAVAILABLE');

        if (isTemporary && attempt < retries - 1) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }
        if (isTemporary) break; // try next model in list
        throw err;
      }
    }
  }
  throw lastError;
}

// API: Transcribe URL (YouTube or Facebook)
app.post('/api/transcribe/url', async (req: Request, res: Response) => {
  try {
    const { url, targetLanguage = 'hi' } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Please provide a valid video URL' });
    }

    const platform = detectPlatform(url);
    let title = 'Video';
    let author = 'Creator';
    let thumbnailUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
    let ytId: string | null = null;
    let fbVideoId: string | null = null;
    let fbDescription = '';

    if (platform === 'youtube') {
      ytId = extractYouTubeId(url);
      if (ytId) {
        thumbnailUrl = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
        try {
          const oembedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${ytId}&format=json`);
          if (oembedRes.ok) {
            const data = await oembedRes.json() as { title?: string; author_name?: string; thumbnail_url?: string };
            if (data.title) title = data.title;
            if (data.author_name) author = data.author_name;
            if (data.thumbnail_url) thumbnailUrl = data.thumbnail_url;
          }
        } catch (e) {
          console.warn('Could not fetch YouTube oEmbed info:', e);
        }
      }
    } else if (platform === 'facebook') {
      title = 'Facebook Reel';
      author = 'Facebook Creator';
      thumbnailUrl = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80';

      try {
        const fbRes = await fetch(url, {
          headers: {
            'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
          },
          redirect: 'follow',
        });

        if (fbRes.ok) {
          const fbHtml = await fbRes.text();

          // Extract real video ID
          const vidMatch = fbHtml.match(/"video_id":"(\d+)"/) || fbHtml.match(/"fbid":"(\d+)"/) || fbHtml.match(/"story_token":"(\d+)"/);
          if (vidMatch) {
            fbVideoId = vidMatch[1];
          }

          // Extract title
          const titleMatch =
            fbHtml.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i) ||
            fbHtml.match(/"meta":\{"title":"([^"]*)"/);

          if (titleMatch && titleMatch[1]) {
            const rawDecoded = decodeHtmlEntities(titleMatch[1]);
            const firstLine = rawDecoded.split('\n')[0].replace(/^\d+.*views.*\|\s*/i, '').trim();
            if (firstLine) title = firstLine;

            // Extract author from "| Author Name" if present
            if (rawDecoded.includes('|')) {
              const parts = rawDecoded.split('|');
              const potentialAuthor = parts[parts.length - 1].trim();
              if (potentialAuthor && potentialAuthor.length < 40) {
                author = potentialAuthor;
              }
            }
          }

          // Extract description
          const descMatch =
            fbHtml.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i) ||
            fbHtml.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
          if (descMatch && descMatch[1]) {
            fbDescription = decodeHtmlEntities(descMatch[1]);
          }

          // Extract thumbnail
          const imgMatch = fbHtml.match(/<meta\s+property="og:image"\s+content="([^"]*)"/i);
          if (imgMatch && imgMatch[1]) {
            thumbnailUrl = decodeHtmlEntities(imgMatch[1]);
          }
        }
      } catch (e) {
        console.warn('Could not scrape Facebook page:', e);
      }
    } else if (platform === 'instagram') {
      title = 'Instagram Reel';
      author = 'Instagram Creator';
      thumbnailUrl = 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=600&auto=format&fit=crop&q=80';

      try {
        const igRes = await fetch(url, {
          headers: {
            'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
          },
          redirect: 'follow',
        });

        if (igRes.ok) {
          const igHtml = await igRes.text();

          const titleMatch =
            igHtml.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i) ||
            igHtml.match(/<meta\s+name="title"\s+content="([^"]*)"/i);
          if (titleMatch && titleMatch[1]) {
            title = decodeHtmlEntities(titleMatch[1]).split('\n')[0].trim();
          }

          const descMatch =
            igHtml.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i) ||
            igHtml.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
          if (descMatch && descMatch[1]) {
            fbDescription = decodeHtmlEntities(descMatch[1]);
            // Often format is: "10K likes, 200 comments - username on Date: caption"
            const authorMatch = fbDescription.match(/-\s*([a-zA-Z0-9_\.]+)\s+on/);
            if (authorMatch) {
              author = `@${authorMatch[1]}`;
            }
          }

          const imgMatch = igHtml.match(/<meta\s+property="og:image"\s+content="([^"]*)"/i);
          if (imgMatch && imgMatch[1]) {
            thumbnailUrl = decodeHtmlEntities(imgMatch[1]);
          }
        }
      } catch (e) {
        console.warn('Could not scrape Instagram URL:', e);
      }
    }

    // Try fetching YouTube public transcript/subtitles if available
    let directTranscriptFound = false;
    let rawTranscriptText = '';

    if (platform === 'youtube' && ytId) {
      try {
        const pageRes = await fetch(`https://www.youtube.com/watch?v=${ytId}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
          },
        });
        if (pageRes.ok) {
          const html = await pageRes.text();
          // Extract title if missing
          const titleMatch = html.match(/<title>([^<]+)<\/title>/);
          if (titleMatch && title === 'Video') {
            title = titleMatch[1].replace(' - YouTube', '').trim();
          }

          // Locate captions in ytInitialPlayerResponse
          const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?});(?:var\s|window\.|<\/script>)/s);
          if (playerResponseMatch) {
            try {
              const playerResponse = JSON.parse(playerResponseMatch[1]);
              const captionTracks = playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
              if (Array.isArray(captionTracks) && captionTracks.length > 0) {
                // Find primary track (prefer hindi or english or first available)
                const preferredTrack = captionTracks.find((t: { languageCode?: string }) => t.languageCode === 'hi') ||
                  captionTracks.find((t: { languageCode?: string }) => t.languageCode === 'en') ||
                  captionTracks[0];

                if (preferredTrack?.baseUrl) {
                  const transcriptRes = await fetch(preferredTrack.baseUrl);
                  if (transcriptRes.ok) {
                    const xml = await transcriptRes.text();
                    // parse timedtext xml
                    const textMatches = [...xml.matchAll(/<text start="([\d\.]+)" dur="([\d\.]+)"[^>]*>(.*?)<\/text>/g)];
                    if (textMatches.length > 0) {
                      directTranscriptFound = true;
                      rawTranscriptText = textMatches.map(m => {
                        const start = parseFloat(m[1]);
                        const text = m[3].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
                        return `[${formatTimestamp(start)}] ${text}`;
                      }).join('\n');
                    }
                  }
                }
              }
            } catch (err) {
              console.warn('Error parsing ytInitialPlayerResponse:', err);
            }
          }
        }
      } catch (err) {
        console.warn('Error fetching YouTube page:', err);
      }
    }

    // Now call Gemini to process the transcript, structure segments, translate, and extract insights
    const prompt = `
You are a world-class Video Transcription & Translation Engine specializing in producing 100% PURE HINDI (शुद्ध देवनागरी लिपि) transcripts from YouTube, Facebook Reels/Videos, and Instagram Reels.

Input Video Information:
Platform: ${platform}
URL: ${url}
Identified Title: "${title}"
Author/Channel: "${author}"
${fbDescription ? `Post / Caption Content:\n"""${fbDescription.slice(0, 1000)}"""\n` : ''}
${directTranscriptFound ? `Official Closed Captions Extracted from Video:\n"""${rawTranscriptText.slice(0, 8000)}"""` : `No direct subtitles track found. Use the title, caption details, hashtags, video context, dialogue, and knowledge of this video to reconstruct the accurate spoken dialogue transcript.`}

MANDATORY HINDI-ONLY RULES (अनिवार्य नियम):
1. OUTPUT LANGUAGE: ALL spoken text ('text') MUST be 100% in Hindi (देवनागरी लिपि).
2. TRANSLATION: If the original video is in English or any other language, translate every single line into clear, natural, and accurate Hindi. DO NOT leave any English dialogue sentences.
3. NO ROMAN HINDI: Absolutely NO Roman English script for Hindi words (e.g., never write "Aap kaise hain", ALWAYS write "आप कैसे हैं").
4. NUMBERS IN HINDI: Write numbers in Hindi words where natural and suitable (e.g., 123 -> "एक सौ तेईस", 2026 -> "दो हज़ार छब्बीस", 50% -> "पचास प्रतिशत").
5. NAMES & TECHNICAL TERMS: Write spoken names, brands, and technical terms in Devanagari script phonetically (e.g., "यूट्यूब", "फेसबुक", "इंस्टाग्राम", "आर्टिफिशियल इंटेलिजेंस", "स्मार्टफोन", "गूगल").
6. ACCURACY: The meaning of the Hindi transcript must precisely match the original video without adding or omitting facts.
7. SUMMARY & CHAPTERS: 'summary' (tldr, keyTakeaways, actionItems, memorableQuotes) and 'chapters' (title, summary) must all be written in 100% pure Devanagari Hindi.

Task:
Produce a comprehensive JSON object with:
1. "metadata":
   - "title": Clean video title in Hindi Devanagari script.
   - "author": Channel or creator name (in Devanagari or recognized brand).
   - "detectedLanguage": Spoken language description in Hindi (e.g., "हिंदी", "अंग्रेज़ी (हिंदी में अनुवादित)").
   - "durationFormatted": Formatted duration string e.g. "01:15".
   - "durationSeconds": Estimated duration in seconds.
   - "description": Brief synopsis in Hindi.
2. "fullScript": "CRITICAL REQUIREMENT: The entire, complete video transcript together as ONE CONTINUOUS UNBROKEN TEXT BLOCK in pure Hindi Devanagari script. DO NOT split into lines, DO NOT use line breaks or bullet points ('पंक्तियाँ में नहीं, पूरी स्क्रिप्ट एक साथ'). Write it as a smooth, continuous flowing transcript of all spoken words."
3. "segments": An array of chronological dialogue segments (at least 4-10 segments).
   Each segment must have:
   - "id": string ("seg-1", "seg-2", ...)
   - "start": start time in seconds (number)
   - "end": end time in seconds (number)
   - "timestamp": start timestamp formatted as "MM:SS" (e.g. "00:15")
   - "speaker": speaker name or role in Hindi (e.g. "वक्ता १", "होस्ट", "कवि")
   - "text": Exact speech translated/transcribed strictly in pure Hindi Devanagari script.
   - "confidence": confidence score between 0.90 and 0.99.
4. "summary":
   - "tldr": 2-3 sentences crisp summary in pure Hindi.
   - "keyTakeaways": array of 3-5 high-impact takeaway bullet points in pure Hindi.
   - "actionItems": array of 2-4 practical action items in pure Hindi.
   - "memorableQuotes": array of 1-3 memorable quotes in pure Hindi with timestamps.
4. "chapters": array of 2-5 logical chapters with "id", "timestamp" ("MM:SS"), "timeInSeconds", "title" (in Hindi), and "summary" (in Hindi).
5. "sentiment":
   - "overall": one of ["positive", "neutral", "inspirational", "critical", "informative"]
   - "tone": brief description in Hindi e.g. "प्रेरणादायक और स्पष्ट"
   - "pace": e.g. "सामान्य गति"
6. "stats":
   - "wordCount": total words (integer)
   - "readingTimeMinutes": estimated reading time
   - "speakingTimeMinutes": duration in minutes
   - "speakerCount": number of distinct speakers

Return ONLY valid JSON.
`;

    const response = await generateWithRetry({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // Fallback clean markdown if any
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    // Compute full continuous Hindi script without lines/rows (पंक्तियाँ नहीं, पूरी स्क्रिप्ट एक साथ)
    let continuousScript =
      parsedData.fullScript ||
      (Array.isArray(parsedData.segments)
        ? parsedData.segments.map((s: any) => s.text?.trim()).filter(Boolean).join(' ')
        : '');
    continuousScript = continuousScript.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

    // Merge metadata
    const finalResult = {
      ...parsedData,
      fullScript: continuousScript,
      metadata: {
        id: ytId || fbVideoId || `vid-${Date.now()}`,
        url,
        platform,
        title: parsedData.metadata?.title || title,
        author: parsedData.metadata?.author || author,
        thumbnailUrl: thumbnailUrl,
        durationFormatted: parsedData.metadata?.durationFormatted || '01:15',
        durationSeconds: parsedData.metadata?.durationSeconds || 75,
        detectedLanguage: parsedData.metadata?.detectedLanguage || 'हिंदी (देवनागरी)',
        description: parsedData.metadata?.description || fbDescription || '',
      },
      language: {
        original: parsedData.metadata?.detectedLanguage || 'Original',
        translated: 'हिंदी (हिन्दी)',
      },
    };

    return res.json(finalResult);
  } catch (error: any) {
    console.error('Error transcribing URL:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process and transcribe video URL',
    });
  }
});

// API: Transcribe uploaded audio or video file
app.post('/api/transcribe/upload', upload.single('mediaFile'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No media file provided' });
    }

    const { targetLanguage = 'hi' } = req.body;
    const file = req.file;
    const mimeType = file.mimetype || 'audio/mp3';
    const base64Data = file.buffer.toString('base64');

    // Use gemini-3.5-transcribe for audio/video transcription
    const mediaPart = {
      inlineData: {
        mimeType: mimeType.startsWith('video/') ? mimeType : (mimeType.startsWith('audio/') ? mimeType : 'audio/mp3'),
        data: base64Data,
      },
    };

    const promptText = `
Transcribe this audio/video recording with exact timestamps, speaker labels, and full linguistic fidelity (especially Hindi, Hinglish, English, or regional accents).
Translate the speech to ${targetLanguage === 'hi' ? 'Hindi (हिन्दी)' : 'English'}.

Output a JSON object matching this schema:
{
  "metadata": {
    "title": "Uploaded Recording",
    "author": "User Audio/Video",
    "detectedLanguage": "e.g. Hindi / English",
    "durationFormatted": "MM:SS",
    "durationSeconds": 180,
    "description": "Transcript of uploaded media file"
  },
  "segments": [
    {
      "id": "seg-1",
      "start": 0,
      "end": 8,
      "timestamp": "00:00",
      "speaker": "Speaker 1",
      "text": "Verbatim spoken text in original language",
      "translatedText": "Translated text",
      "confidence": 0.96
    }
  ],
  "summary": {
    "tldr": "2-3 sentences crisp summary",
    "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
    "actionItems": ["Action 1", "Action 2"],
    "memorableQuotes": ["Quote with timestamp"]
  },
  "chapters": [
    {
      "id": "ch-1",
      "timestamp": "00:00",
      "timeInSeconds": 0,
      "title": "Introduction",
      "summary": "Brief summary"
    }
  ],
  "sentiment": {
    "overall": "positive",
    "tone": "Professional and clear",
    "pace": "Normal"
  },
  "stats": {
    "wordCount": 350,
    "readingTimeMinutes": 2,
    "speakingTimeMinutes": 3,
    "speakerCount": 1
  }
}

Return ONLY valid JSON.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [mediaPart, { text: promptText }],
      },
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      const cleaned = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    const finalResult = {
      ...parsedData,
      metadata: {
        id: `upload-${Date.now()}`,
        url: '',
        platform: 'upload',
        title: file.originalname.replace(/\.[^/.]+$/, ''),
        author: 'Uploaded Media',
        thumbnailUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&auto=format&fit=crop&q=80',
        durationFormatted: parsedData.metadata?.durationFormatted || '02:30',
        durationSeconds: parsedData.metadata?.durationSeconds || 150,
        detectedLanguage: parsedData.metadata?.detectedLanguage || 'Detected Audio',
        description: `Uploaded file: ${file.originalname} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`,
      },
      language: {
        original: parsedData.metadata?.detectedLanguage || 'Original',
        translated: targetLanguage === 'hi' ? 'Hindi (हिन्दी)' : 'English',
      },
    };

    return res.json(finalResult);
  } catch (error: any) {
    console.error('Error transcribing uploaded media:', error);
    return res.status(500).json({
      error: error.message || 'Failed to transcribe uploaded media file',
    });
  }
});

// API: Q&A / Chat with Video Transcript
app.post('/api/transcribe/chat', async (req: Request, res: Response) => {
  try {
    const { transcriptText, question, history = [] } = req.body;

    if (!transcriptText || !question) {
      return res.status(400).json({ error: 'Missing transcript or question' });
    }

    const prompt = `
You are an intelligent Video Knowledge Assistant. Answer the user's question accurately and concisely based strictly on the provided video transcript.
If the answer is in the transcript, mention the relevant timestamp or context if available.
Support Hindi and English questions effortlessly.

Video Transcript:
"""${transcriptText.slice(0, 15000)}"""

Recent Conversation:
${history.map((m: any) => `${m.role}: ${m.content}`).join('\n')}

User Question: ${question}

Response guidelines:
- Answer directly, clearly, and helpfully.
- Reference timestamps if mentioning specific moments.
- If the question cannot be answered from the transcript, politely explain that it wasn't covered in the video.
`;

    const response = await generateWithRetry({
      contents: prompt,
    });

    return res.json({ answer: response.text });
  } catch (error: any) {
    console.error('Error in chat:', error);
    return res.status(500).json({ error: error.message || 'Chat generation failed' });
  }
});

// API: Repurpose Transcript into Social Formats
app.post('/api/transcribe/repurpose', async (req: Request, res: Response) => {
  try {
    const { transcriptText, videoTitle, formatType } = req.body;

    const promptsByType: Record<string, string> = {
      youtube_desc: `Create an engaging, SEO-optimized YouTube Video Description for "${videoTitle}" based on this transcript. Include:
1. Compelling 2-paragraph summary
2. Timestamps / Chapter markers breakdown
3. Key lessons learned
4. Relevant hashtags (#Tech #Tutorial #Trending etc.)`,

      twitter_thread: `Create an engaging 5-to-7 tweet viral Twitter/X thread summarizing the most valuable insights from "${videoTitle}". Make the hook punchy and include bullet points and emojis.`,

      linkedin: `Write a high-converting, insightful LinkedIn post for professionals based on the key lessons and industry insights from "${videoTitle}". Use short paragraphs, clean spacing, bullet points, and an engaging closing call-to-action question.`,

      facebook_post: `Write a viral, relatable Facebook post or Reel caption for "${videoTitle}". Include high engagement hooks, emojis, Hindi/Hinglish touch if appropriate, and an inviting discussion prompt for comments.`,

      hindi_summary: `इस वीडियो "${videoTitle}" का एक सरल, स्पष्ट और रोचक हिंदी ब्लॉग सारांश (Hindi Summary & Key Takeaways) तैयार करें। महत्वपूर्ण बिंदुओं को बुलेट पॉइंट्स में समझाएं।`,
    };

    const taskPrompt = promptsByType[formatType] || promptsByType['youtube_desc'];

    const response = await generateWithRetry({
      contents: `
You are a senior social media copywriter and content strategist.

Video Title: ${videoTitle}
Video Transcript:
"""${transcriptText.slice(0, 12000)}"""

Task:
${taskPrompt}
`,
    });

    return res.json({ content: response.text });
  } catch (error: any) {
    console.error('Error repurposing content:', error);
    return res.status(500).json({ error: error.message || 'Repurposing failed' });
  }
});

// API: Translate Transcript segments
app.post('/api/transcribe/translate', async (req: Request, res: Response) => {
  try {
    const { segments, targetLanguage } = req.body;

    if (!Array.isArray(segments) || !targetLanguage) {
      return res.status(400).json({ error: 'Invalid segments or target language' });
    }

    const segmentsText = segments.map((s: any, idx: number) => `[${idx}] ${s.text}`).join('\n');

    const prompt = `
Translate each of the following transcript segments into ${targetLanguage} (e.g. Hindi हिन्दी, English, Spanish, etc.).
Keep the tone natural, matching spoken conversational cadence.

Segments:
${segmentsText}

Return a JSON array of strings, where each element is the translated text corresponding to the segment index:
["translated segment 0", "translated segment 1", ...]
`;

    const response = await generateWithRetry({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    return res.json({ translations: parsed });
  } catch (error: any) {
    console.error('Error translating transcript:', error);
    return res.status(500).json({ error: error.message || 'Translation failed' });
  }
});

// API: TTS - Text to Speech playback using Gemini TTS
app.post('/api/transcribe/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'No text provided for TTS' });
    }

    // Limit text to ~800 chars for snappy audio response
    const trimmed = text.slice(0, 800);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: trimmed,
              speechMetadata: {
                style: 'Clear, natural, professional narrator',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: 'TTS audio data was not returned' });
    }

    return res.json({ audioBase64: base64Audio });
  } catch (error: any) {
    console.error('Error generating TTS:', error);
    return res.status(500).json({ error: error.message || 'TTS generation failed' });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'VibeScript - FB & YT Transcriber' });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 VibeScript Server running at http://localhost:${PORT}`);
  });
}

startServer();
