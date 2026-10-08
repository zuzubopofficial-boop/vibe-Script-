import { TranscriptData } from '../types/transcript';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
  iconLink?: string;
}

const FOLDER_NAME = 'VibeScript - हिंदी ट्रांसक्रिप्ट';

/**
 * Searches or creates the "VibeScript - हिंदी ट्रांसक्रिप्ट" folder in user's Google Drive
 */
export async function ensureVibeScriptFolder(accessToken: string): Promise<string> {
  const query = `name = '${FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`;

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!searchRes.ok) {
    const errText = await searchRes.text();
    console.error('Drive folder search failed:', errText);
    throw new Error('गूगल ड्राइव फ़ोल्डर खोजने में समस्या आई');
  }

  const data = await searchRes.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }

  // Create folder if not found
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'VibeScript ऐप द्वारा तैयार किए गए शुद्ध हिंदी वीडियो ट्रांसक्रिप्ट',
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    console.error('Drive folder creation failed:', err);
    throw new Error('गूगल ड्राइव में फ़ोल्डर बनाने में समस्या आई');
  }

  const newFolder = await createRes.json();
  return newFolder.id;
}

/**
 * Uploads a complete Hindi transcript to Google Drive in the VibeScript folder
 */
export async function saveTranscriptToDrive(
  accessToken: string,
  data: TranscriptData,
  customTitle?: string
): Promise<{ fileId: string; webViewLink: string; fileName: string }> {
  const folderId = await ensureVibeScriptFolder(accessToken);

  // Combine full script text cleanly without line breaks (पंक्तियाँ नहीं, पूरी स्क्रिप्ट एक साथ)
  const continuousScript = (
    data.fullScript ||
    data.segments.map((s) => s.text.trim()).filter(Boolean).join(' ')
  ).replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

  const title = (customTitle || data.metadata.title || 'वीडियो_ट्रांसक्रिप्ट')
    .slice(0, 50)
    .replace(/[\\/:*?"<>|]/g, '_');

  const fileName = `${title}_हिंदी_ट्रांसक्रिप्ट.txt`;

  const fileContent = [
    `============================================================`,
    `  VIBESCRIPT - हिंदी वीडियो ट्रांसक्रिप्ट (Google Drive)`,
    `============================================================`,
    ``,
    `शीर्षक: ${data.metadata.title}`,
    `प्लेटफॉर्म: ${data.metadata.platform.toUpperCase()}`,
    `रचनाकार: ${data.metadata.author}`,
    `मूल लिंक: ${data.metadata.url || 'एन/ए'}`,
    `दिनांक: ${new Date().toLocaleString('hi-IN')}`,
    `शब्द संख्या: ${continuousScript.split(/\s+/).filter(Boolean).length}`,
    ``,
    `------------------------------------------------------------`,
    `  हिंदी सारांश (Summary)`,
    `------------------------------------------------------------`,
    `${data.summary?.tldr || 'कोई सारांश उपलब्ध नहीं'}`,
    ``,
    `------------------------------------------------------------`,
    `  संपूर्ण हिंदी स्क्रिप्ट (पूरी स्क्रिप्ट एक साथ • पंक्तियाँ नहीं)`,
    `------------------------------------------------------------`,
    ``,
    continuousScript,
    ``,
    `============================================================`,
    `सहेजा गया: VibeScript AI App द्वारा`,
    `============================================================`,
  ].join('\n');

  const metadata = {
    name: fileName,
    parents: [folderId],
    description: `VibeScript द्वारा सहेजा गया ${data.metadata.platform.toUpperCase()} वीडियो का हिंदी ट्रांसक्रिप्ट`,
    properties: {
      app: 'vibescript',
      platform: data.metadata.platform,
      videoId: data.metadata.id,
      language: 'hi',
    },
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const uploadUrl =
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,createdTime';

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Google Drive upload error:', errText);
    throw new Error(`गूगल ड्राइव पर फ़ाइल सेव नहीं हो सकी (${res.status})`);
  }

  const result = await res.json();
  return {
    fileId: result.id,
    webViewLink: result.webViewLink || `https://drive.google.com/file/d/${result.id}/view`,
    fileName: result.name || fileName,
  };
}

/**
 * Lists all transcripts stored on user's Google Drive
 */
export async function listDriveTranscripts(accessToken: string): Promise<DriveFileItem[]> {
  const query = `trashed = false and (name contains 'हिंदी_ट्रांसक्रिप्ट' or description contains 'VibeScript' or properties has { key='app' and value='vibescript' })`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    query
  )}&fields=files(id,name,mimeType,webViewLink,webContentLink,createdTime,modifiedTime,size,iconLink)&orderBy=createdTime desc&pageSize=50`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Google Drive list error:', err);
    throw new Error('गूगल ड्राइव से फ़ाइलें लोड नहीं हो सकीं');
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Fetch file text content from Google Drive
 */
export async function getDriveFileContent(accessToken: string, fileId: string): Promise<string> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error('ड्राइव से फ़ाइल सामग्री डाउनलोड नहीं हो सकी');
  }

  return await res.text();
}

/**
 * Delete a file from Google Drive
 * CAUTION: MUST only be called after explicit user confirmation in UI!
 */
export async function deleteDriveFile(accessToken: string, fileId: string): Promise<boolean> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.text();
    console.error('Google Drive delete error:', err);
    throw new Error('गूगल ड्राइव से फ़ाइल नहीं हटाई जा सकी');
  }

  return true;
}
