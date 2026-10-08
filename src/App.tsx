import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNavBar, ScreenTab } from './components/BottomNavBar';
import { HomeScreen } from './components/screens/HomeScreen';
import { PlatformScreen } from './components/screens/PlatformScreen';
import { GoogleDriveScreen } from './components/screens/GoogleDriveScreen';
import { AboutScreen } from './components/screens/AboutScreen';
import { ExportModal } from './components/ExportModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { AppDownloadModal } from './components/AppDownloadModal';
import { SAMPLE_VIDEOS } from './data/sampleVideos';
import { TranscriptData } from './types/transcript';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import { Check } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'vibescript_history_v1';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenTab>('home');
  const [currentData, setCurrentData] = useState<TranscriptData>(SAMPLE_VIDEOS[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<TranscriptData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Google Drive & Auth hook
  const { user, saveToDrive } = useGoogleAuth();


  // Initialize and handle Browser / Android Hardware Back Button
  useEffect(() => {
    // Initial history state
    window.history.replaceState({ screen: 'home' }, '');

    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.screen) {
        setCurrentScreen(event.state.screen);
      } else {
        setCurrentScreen('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation handler with history push for Android Back support
  const navigateTo = (screen: ScreenTab) => {
    if (screen === currentScreen) return;
    window.history.pushState({ screen }, '');
    setCurrentScreen(screen);
    setErrorMessage(null);
  };

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        setHistoryList(JSON.parse(saved));
      } else {
        setHistoryList(SAMPLE_VIDEOS);
      }
    } catch (e) {
      console.warn('LocalStorage access error:', e);
    }
  }, []);

  // Save history helper
  const saveToHistory = (item: TranscriptData) => {
    setHistoryList((prev) => {
      const filtered = prev.filter((p) => p.metadata.id !== item.metadata.id);
      const updated = [item, ...filtered].slice(0, 25);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('LocalStorage save error:', err);
      }
      return updated;
    });
  };

  // Transcribe URL via backend API
  const handleTranscribeUrl = async (url: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage('वीडियो संवाद एवं ऑडियो का विश्लेषण हो रहा है...');

    try {
      setStatusMessage('ऑडियो से संवाद पहचाना जा रहा है...');
      const res = await fetch('/api/transcribe/url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, targetLanguage: 'hi' }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `सर्वर त्रुटि: कोड ${res.status}`);
      }

      setStatusMessage('शुद्ध देवनागरी लिपि में हिंदी ट्रांसक्रिप्ट तैयार हो रहा है...');
      const result: TranscriptData = await res.json();

      setCurrentData(result);
      saveToHistory(result);
      showToast('हिंदी ट्रांसक्रिप्ट सफलतापूर्वक तैयार हो गया!');
    } catch (err: any) {
      console.error('Transcription error:', err);
      setErrorMessage(err.message || 'वीडियो प्रोसेस करने में त्रुटि हुई। कृपया लिंक की जाँच करें या पुनः प्रयास करें।');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  // Save transcript file to user device (पूरी स्क्रिप्ट एक साथ • पंक्तियाँ नहीं)
  const handleSaveToDevice = (data: TranscriptData) => {
    saveToHistory(data);
    const continuousScript = (
      data.fullScript ||
      data.segments.map((s) => s.text.trim()).filter(Boolean).join(' ')
    ).replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

    const content = `शीर्षक: ${data.metadata.title}\nप्लेटफॉर्म: ${data.metadata.platform.toUpperCase()}\nरचनाकार: ${data.metadata.author}\nदिनांक: ${new Date().toLocaleDateString('hi-IN')}\n\n--- संपूर्ण हिंदी स्क्रिप्ट (पूरी स्क्रिप्ट एक साथ) ---\n\n${continuousScript}\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanTitle = data.metadata.title.slice(0, 30).replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_');
    link.download = `${cleanTitle}_पूरी_हिंदी_स्क्रिप्ट.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('पूरी हिंदी स्क्रिप्ट डिवाइस में सेव कर ली गई!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200">
      {/* Top Header */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        onOpenDrive={() => navigateTo('drive')}
        savedCount={historyList.length}
        userPhoto={user?.photoURL}
        userName={user?.displayName}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-4 w-full">
        {/* Screen 1: Home Page */}
        {currentScreen === 'home' && (
          <HomeScreen
            onNavigate={navigateTo}
            recentTranscripts={historyList}
            onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
            onToast={showToast}
            onSelectTranscript={(item) => {
              setCurrentData(item);
              if (item.metadata.platform === 'youtube') navigateTo('youtube');
              else if (item.metadata.platform === 'facebook') navigateTo('facebook');
              else if (item.metadata.platform === 'instagram') navigateTo('instagram');
              else navigateTo('youtube');
            }}
          />
        )}

        {/* Screen 2: YouTube Page */}
        {currentScreen === 'youtube' && (
          <PlatformScreen
            platform="youtube"
            currentData={currentData}
            onTranscribe={handleTranscribeUrl}
            isLoading={isLoading}
            statusMessage={statusMessage}
            errorMessage={errorMessage}
            onBackToHome={() => navigateTo('home')}
            onSaveToDevice={handleSaveToDevice}
            onSaveToDrive={saveToDrive}
          />
        )}

        {/* Screen 3: Facebook Page */}
        {currentScreen === 'facebook' && (
          <PlatformScreen
            platform="facebook"
            currentData={currentData}
            onTranscribe={handleTranscribeUrl}
            isLoading={isLoading}
            statusMessage={statusMessage}
            errorMessage={errorMessage}
            onBackToHome={() => navigateTo('home')}
            onSaveToDevice={handleSaveToDevice}
            onSaveToDrive={saveToDrive}
          />
        )}

        {/* Screen 4: Instagram Page */}
        {currentScreen === 'instagram' && (
          <PlatformScreen
            platform="instagram"
            currentData={currentData}
            onTranscribe={handleTranscribeUrl}
            isLoading={isLoading}
            statusMessage={statusMessage}
            errorMessage={errorMessage}
            onBackToHome={() => navigateTo('home')}
            onSaveToDevice={handleSaveToDevice}
            onSaveToDrive={saveToDrive}
          />
        )}

        {/* Screen 5: Google Drive Page */}
        {currentScreen === 'drive' && (
          <GoogleDriveScreen
            currentData={currentData}
            onToast={showToast}
            onNavigateHome={() => navigateTo('home')}
          />
        )}

        {/* Screen 6: About Page */}
        {currentScreen === 'about' && (
          <AboutScreen
            onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
            onToast={showToast}
          />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNavBar
        activeTab={currentScreen}
        onSelectTab={navigateTo}
      />

      {/* App Download Modal */}
      <AppDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onToast={showToast}
      />


      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-slate-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Export Modal */}
      {isExportOpen && currentData && (
        <ExportModal
          data={currentData}
          onClose={() => setIsExportOpen(false)}
          onSaveToDrive={saveToDrive}
        />
      )}

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyList={historyList}
        onSelect={(item) => {
          setCurrentData(item);
          if (item.metadata.platform === 'youtube') navigateTo('youtube');
          else if (item.metadata.platform === 'facebook') navigateTo('facebook');
          else if (item.metadata.platform === 'instagram') navigateTo('instagram');
          setErrorMessage(null);
        }}
        onClear={() => {
          setHistoryList([]);
          try {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          } catch (e) {
            console.warn(e);
          }
        }}
        onRemove={(id) => {
          const updated = historyList.filter((item) => item.metadata.id !== id);
          setHistoryList(updated);
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
          } catch (e) {
            console.warn(e);
          }
        }}
      />
    </div>
  );
}
