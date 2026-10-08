import React, { useState, useEffect } from 'react';
import {
  FolderPlus,
  RefreshCw,
  Search,
  ExternalLink,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  CloudUpload,
  HardDrive,
  LogOut,
  Sparkles,
  ArrowRight,
  Loader2,
  FileText,
} from 'lucide-react';
import { GoogleDriveIcon } from '../icons/GoogleDriveIcon';
import { DriveDeleteConfirmModal } from '../DriveDeleteConfirmModal';
import { DriveFileViewerModal } from '../DriveFileViewerModal';
import { DriveFileItem } from '../../services/googleDriveService';
import { TranscriptData } from '../../types/transcript';
import { useGoogleAuth } from '../../hooks/useGoogleAuth';

interface GoogleDriveScreenProps {
  currentData: TranscriptData | null;
  onToast: (msg: string) => void;
  onNavigateHome: () => void;
}

export const GoogleDriveScreen: React.FC<GoogleDriveScreenProps> = ({
  currentData,
  onToast,
  onNavigateHome,
}) => {
  const {
    user,
    isAuthenticated,
    isSigningIn,
    authError,
    signIn,
    signOut,
    saveToDrive,
    listTranscripts,
    deleteFile,
    getFileContent,
  } = useGoogleAuth();

  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSavingCurrent, setIsSavingCurrent] = useState(false);
  const [saveSuccessLink, setSaveSuccessLink] = useState<string | null>(null);

  // Modals state
  const [deleteModalFile, setDeleteModalFile] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [previewFile, setPreviewFile] = useState<DriveFileItem | null>(null);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  // Load files when authenticated
  const loadFiles = async () => {
    if (!isAuthenticated) return;
    setIsLoadingFiles(true);
    try {
      const driveFiles = await listTranscripts();
      setFiles(driveFiles);
    } catch (err: any) {
      console.error('Failed to load drive files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadFiles();
    } else {
      setFiles([]);
    }
  }, [isAuthenticated]);

  // Save current transcript to Google Drive
  const handleSaveCurrent = async () => {
    if (!currentData) return;
    setIsSavingCurrent(true);
    setSaveSuccessLink(null);

    try {
      const res = await saveToDrive(currentData);
      setSaveSuccessLink(res.webViewLink);
      onToast('हिंदी ट्रांसक्रिप्ट Google Drive में सफलतापूर्वक सेव हो गया!');
      await loadFiles();
    } catch (err: any) {
      console.error('Save to Drive error:', err);
      onToast(err.message || 'ड्राइव में सेव करने में त्रुटि हुई');
    } finally {
      setIsSavingCurrent(false);
    }
  };

  // Preview file content
  const handleOpenPreview = async (file: DriveFileItem) => {
    setPreviewFile(file);
    setIsLoadingPreview(true);
    try {
      const text = await getFileContent(file.id);
      setPreviewContent(text);
    } catch (err: any) {
      setPreviewContent('सामग्री लोड करने में विफल: ' + (err.message || 'त्रुटि'));
    } finally {
      setIsLoadingPreview(false);
    }
  };

  // Confirm delete handler (Explicit user confirmation required by SKILL.md)
  const handleConfirmDelete = async () => {
    if (!deleteModalFile) return;
    setIsDeleting(true);
    try {
      await deleteFile(deleteModalFile.id);
      setFiles((prev) => prev.filter((f) => f.id !== deleteModalFile.id));
      onToast(`फ़ाइल "${deleteModalFile.name}" Google Drive से हटा दी गई`);
      setDeleteModalFile(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      onToast('फ़ाइल हटाने में विफलता: ' + (err.message || 'त्रुटि'));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      {/* Top Title Banner */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
            <GoogleDriveIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-white flex items-center space-x-2">
              <span>Google Drive क्लाउड सिंक</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                सुरक्षित बैकअप
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              यूट्यूब, फेसबुक और इंस्टाग्राम के हिंदी ट्रांसक्रिप्ट सीधे अपने Google Drive में सेव करें
            </p>
          </div>
        </div>

        {isAuthenticated && (
          <button
            onClick={loadFiles}
            disabled={isLoadingFiles}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 transition cursor-pointer"
            title="रिफ्रेश करें"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin text-rose-400' : ''}`} />
            <span>रिफ्रेश</span>
          </button>
        )}
      </div>

      {/* Auth Banner: Signed In vs Not Signed In */}
      {!isAuthenticated ? (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs">
              <GoogleDriveIcon className="w-3.5 h-3.5" />
              <span>Google Workspace इंटीग्रेशन</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              अपने Google Drive खाते से कनेक्ट करें
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              वीडियो ट्रांसक्रिप्ट को सीधे अपने पर्सनल Google Drive के <span className="font-semibold text-rose-300">"VibeScript - हिंदी ट्रांसक्रिप्ट"</span> फ़ोल्डर में सहेजें। कंप्यूटर, फोन या टैबलेट—कहीं से भी आसानी से एक्सेस करें।
            </p>

            {/* Feature Points */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-xs font-bold text-white block">☁️ स्वचालित बैकअप</span>
                <span className="text-[11px] text-slate-400">हर हिंदी स्क्रिप्ट क्लाउड पर सुरक्षित</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-xs font-bold text-white block">📝 Google Docs सपोर्ट</span>
                <span className="text-[11px] text-slate-400">ड्राइव और डॉक्स में आसानी से खोलें</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span className="text-xs font-bold text-white block">🔒 100% सुरक्षित</span>
                <span className="text-[11px] text-slate-400">आपकी फ़ाइलें केवल आपके पास</span>
              </div>
            </div>

            {/* Official Google Sign In Button */}
            <div className="pt-3">
              <button
                type="button"
                onClick={signIn}
                disabled={isSigningIn}
                className="gsi-material-button"
                style={{ width: '100%', maxWidth: '280px' }}
              >
                <div className="gsi-material-button-state"></div>
                <div className="gsi-material-button-content-wrapper">
                  <div className="gsi-material-button-icon">
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      style={{ display: 'block' }}
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      ></path>
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      ></path>
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      ></path>
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      ></path>
                      <path fill="none" d="M0 0h48v48H0z"></path>
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents">
                    {isSigningIn ? 'कनेक्ट हो रहा है...' : 'Sign in with Google'}
                  </span>
                </div>
              </button>
            </div>

            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-2 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Authenticated User Status Card */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-3">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-12 h-12 rounded-2xl border-2 border-emerald-500/40 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-lg">
                  {user?.displayName ? user.displayName[0] : 'G'}
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-white text-sm sm:text-base">
                    {user?.displayName || 'Google Drive उपयोगकर्ता'}
                  </h3>
                  <span className="flex items-center space-x-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>कनेक्टेड</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={signOut}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span>साइन आउट</span>
            </button>
          </div>

          {/* Quick Save Current Transcript Banner if transcript is active */}
          {currentData && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-500/15 via-amber-500/10 to-emerald-500/10 border border-rose-500/20 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="min-w-0 pr-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
                    वर्तमान सक्रिय ट्रांसक्रिप्ट
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-sm sm:max-w-md">
                    {currentData.metadata.title}
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    {currentData.metadata.platform.toUpperCase()} • पूरी स्क्रिप्ट एक साथ (हिंदी)
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {saveSuccessLink ? (
                    <a
                      href={saveSuccessLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-lg shadow-emerald-600/20"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Google Drive में खोलें</span>
                    </a>
                  ) : (
                    <button
                      onClick={handleSaveCurrent}
                      disabled={isSavingCurrent}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white text-xs font-bold flex items-center space-x-1.5 transition shadow-lg shadow-rose-500/30 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingCurrent ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>ड्राइव में सेव हो रहा है...</span>
                        </>
                      ) : (
                        <>
                          <CloudUpload className="w-3.5 h-3.5" />
                          <span>Google Drive में सेव करें</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Drive Files List Area */}
      {isAuthenticated && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Google Drive में सहेजे गए ट्रांसक्रिप्ट</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  {files.length}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                फ़ोल्डर: "VibeScript - हिंदी ट्रांसक्रिप्ट"
              </p>
            </div>

            {/* Search filter */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="फ़ाइल नाम से खोजें..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Files List */}
          {isLoadingFiles ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
              <span className="text-xs">Google Drive से फ़ाइलें लोड हो रही हैं...</span>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="py-12 text-center rounded-2xl bg-slate-950/50 border border-dashed border-slate-800 space-y-2">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">
                {searchQuery
                  ? 'खोज के अनुसार कोई फ़ाइल नहीं मिली।'
                  : 'Google Drive में अभी कोई ट्रांसक्रिप्ट सेव नहीं है। ऊपर दिए गए बटन से पहला ट्रांसक्रिप्ट सेव करें!'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition flex items-center justify-between flex-wrap gap-2 group"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/80 shrink-0">
                      <GoogleDriveIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                        {file.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                        <span>
                          {file.createdTime
                            ? new Date(file.createdTime).toLocaleString('hi-IN')
                            : 'हाल ही में'}
                        </span>
                        {file.size && <span>• {(Number(file.size) / 1024).toFixed(1)} KB</span>}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-1.5 shrink-0">
                    {/* View Preview Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenPreview(file)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1 border border-slate-700 transition cursor-pointer"
                      title="सामग्री देखें"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">देखें</span>
                    </button>

                    {/* Open in Google Drive Link */}
                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs flex items-center space-x-1 border border-slate-700 transition"
                        title="Google Drive में खोलें"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">ड्राइव में</span>
                      </a>
                    )}

                    {/* Delete File Button (With Mandatory Confirmation Modal) */}
                    <button
                      type="button"
                      onClick={() => setDeleteModalFile(file)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                      title="Google Drive से हटाएं"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal (MANDATORY User Confirmation as per SKILL.md) */}
      <DriveDeleteConfirmModal
        file={deleteModalFile}
        isOpen={!!deleteModalFile}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalFile(null)}
      />

      {/* File Preview Modal */}
      <DriveFileViewerModal
        file={previewFile}
        content={previewContent}
        isOpen={!!previewFile}
        isLoading={isLoadingPreview}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
};
