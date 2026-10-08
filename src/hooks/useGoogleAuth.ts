import { useState, useEffect, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  getAccessToken,
  logout,
} from '../services/firebaseAuth';
import {
  saveTranscriptToDrive,
  listDriveTranscripts,
  deleteDriveFile,
  getDriveFileContent,
  DriveFileItem,
} from '../services/googleDriveService';
import { TranscriptData } from '../types/transcript';

export function useGoogleAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setTokenState(token);
        setIsLoading(false);
      },
      () => {
        setUser(null);
        setTokenState(null);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setTokenState(res.accessToken);
        return res;
      }
      return null;
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      const msg =
        err.code === 'auth/popup-closed-by-user'
          ? 'गूगल साइन-इन विंडो बंद कर दी गई।'
          : err.message || 'गूगल साइन-इन विफल रहा। कृपया पुनः प्रयास करें।';
      setAuthError(msg);
      throw err;
    } finally {
      setIsSigningIn(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
      setUser(null);
      setTokenState(null);
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  }, []);

  const saveToDrive = useCallback(
    async (data: TranscriptData) => {
      let token = accessToken || (await getAccessToken());
      if (!token || !user) {
        // Trigger sign in first if not authenticated
        const signResult = await signIn();
        if (!signResult?.accessToken) {
          throw new Error('गूगल ड्राइव से कनेक्ट करने के लिए साइन इन आवश्यक है');
        }
        token = signResult.accessToken;
      }

      return await saveTranscriptToDrive(token, data);
    },
    [accessToken, user, signIn]
  );

  return {
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    isSigningIn,
    authError,
    signIn,
    signOut: handleSignOut,
    saveToDrive,
    listTranscripts: useCallback(async () => {
      const token = accessToken || (await getAccessToken());
      if (!token) throw new Error('कृपया पहले गूगल ड्राइव से कनेक्ट करें');
      return await listDriveTranscripts(token);
    }, [accessToken]),
    deleteFile: useCallback(
      async (fileId: string) => {
        const token = accessToken || (await getAccessToken());
        if (!token) throw new Error('अनधिकृत');
        return await deleteDriveFile(token, fileId);
      },
      [accessToken]
    ),
    getFileContent: useCallback(
      async (fileId: string) => {
        const token = accessToken || (await getAccessToken());
        if (!token) throw new Error('अनधिकृत');
        return await getDriveFileContent(token, fileId);
      },
      [accessToken]
    ),
  };
}
