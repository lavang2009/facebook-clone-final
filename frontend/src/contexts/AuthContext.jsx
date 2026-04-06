import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';
import { auth } from '../firebase';
import { ensureUserProfile, getProfile, saveProfile, getSettings, saveSettings, useAppState } from '../lib/db';
import { uploadMedia } from '../lib/upload';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const state = useAppState();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(() => {});
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const stored = ensureUserProfile({
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split('@')?.[0] || 'Người dùng',
          photoURL: fbUser.photoURL || ''
        });
        setUser(fbUser);
        setProfile(stored);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async ({ name, email, password }) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await firebaseUpdateProfile(credential.user, { displayName: name });
    const stored = ensureUserProfile({
      uid: credential.user.uid,
      email,
      displayName: name,
      photoURL: ''
    });
    setUser({ ...credential.user, displayName: name });
    setProfile(stored);
    return credential.user;
  };

  const login = async ({ email, password }) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = credential.user;
    const stored = ensureUserProfile({
      uid: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName || fbUser.email?.split('@')?.[0] || 'Người dùng',
      photoURL: fbUser.photoURL || ''
    });
    setUser(fbUser);
    setProfile(stored);
    return fbUser;
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setProfile(null);
  };

  const updateMyProfile = async (patch = {}) => {
    if (!user) throw new Error('Bạn chưa đăng nhập.');
    const next = saveProfile(user.uid, patch);
    if (typeof patch.displayName === 'string' || typeof patch.photoURL === 'string') {
      await firebaseUpdateProfile(auth.currentUser, {
        displayName: patch.displayName ?? auth.currentUser.displayName,
        photoURL: patch.photoURL ?? auth.currentUser.photoURL
      }).catch(() => {});
    }
    setProfile(next);
    return next;
  };

  const uploadProfileMedia = async (file, kind = 'avatar') => {
    if (!user) throw new Error('Bạn chưa đăng nhập.');
    const result = await uploadMedia(file, { uid: user.uid, kind });
    return result;
  };

  const changeTheme = async (theme) => {
    if (!user) return null;
    const next = saveSettings(user.uid, { theme });
    return next;
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      register,
      login,
      logout,
      updateMyProfile,
      uploadProfileMedia,
      settings: user ? (state.settings?.[user.uid] || getSettings(user.uid)) : null,
      changeTheme,
      refreshProfile: () => {
        if (!user) return null;
        const fresh = getProfile(user.uid);
        setProfile(fresh);
        return fresh;
      }
    }),
    [user, profile, loading, state.settings]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng bên trong AuthProvider.');
  return ctx;
}
