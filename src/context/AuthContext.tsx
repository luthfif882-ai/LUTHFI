import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  signInAnonymously
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, testConnection } from '../firebase/config';
import { UserProfile, UserRole, SyncStatus } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  syncStatus: SyncStatus;
  setSyncStatus: (status: SyncStatus) => void;
  loginWithGoogle: () => Promise<void>;
  loginQuickDemo: (role: UserRole, customName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateMyProfile: (data: Partial<UserProfile>) => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isOnline: boolean;
}

const BOOTSTRAPPED_ADMIN_EMAIL = 'luthfif882@gmail.com';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  
  // Theme state with localStorage preference
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('spi_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('spi_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Online / Offline tracking
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('synced');
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial connection test
    testConnection();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync profile from Firestore or create initial user document
  const syncOrCreateUserProfile = async (user: User, forceRole?: UserRole, customName?: string) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      const isDefaultAdmin = user.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();
      const determinedRole: UserRole = forceRole || (isDefaultAdmin ? 'admin' : 'member');

      if (userSnap.exists()) {
        const data = userSnap.data() as UserProfile;
        // Check if admin doc exists
        const adminSnap = await getDoc(doc(db, 'admins', user.uid));
        const effectiveRole: UserRole = (isDefaultAdmin || adminSnap.exists() || data.role === 'admin') ? 'admin' : 'member';
        
        const profile: UserProfile = {
          ...data,
          role: effectiveRole,
          name: customName || data.name || user.displayName || 'Mahasiswa SPI 1A',
          email: user.email || data.email || 'mahasiswa@uin-suka.ac.id'
        };
        setUserProfile(profile);
      } else {
        const newProfile: UserProfile = {
          uid: user.uid,
          name: customName || user.displayName || 'Mahasiswa SPI 1A',
          email: user.email || `${user.uid.slice(0, 8)}@uin-suka.ac.id`,
          role: determinedRole,
          photoUrl: user.photoURL || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userRef, newProfile);
        
        if (determinedRole === 'admin') {
          await setDoc(doc(db, 'admins', user.uid), {
            email: newProfile.email,
            role: 'admin',
            createdAt: new Date().toISOString()
          });
        }
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.warn('Could not sync profile with Firestore, using fallback local profile:', err);
      // Fallback in-memory profile so user is not blocked
      const isDefaultAdmin = user.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase() || forceRole === 'admin';
      setUserProfile({
        uid: user.uid,
        name: customName || user.displayName || (isDefaultAdmin ? 'Admin SPI 1A' : 'Mahasiswa SPI 1A'),
        email: user.email || 'mahasiswa@uin-suka.ac.id',
        role: isDefaultAdmin ? 'admin' : 'member',
        photoUrl: user.photoURL || undefined
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await syncOrCreateUserProfile(user);
      } else {
        // If not logged in, check if there is an active local demo session stored
        const demoSession = localStorage.getItem('spi_demo_session');
        if (demoSession) {
          try {
            const parsed = JSON.parse(demoSession);
            setUserProfile(parsed);
          } catch {
            setUserProfile(null);
          }
        } else {
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setSyncStatus('saving');
      const result = await signInWithPopup(auth, googleProvider);
      localStorage.removeItem('spi_demo_session');
      await syncOrCreateUserProfile(result.user);
      setSyncStatus('synced');
    } catch (error) {
      setSyncStatus('offline');
      handleFirestoreError(error, OperationType.GET, 'auth/google');
    }
  };

  const loginQuickDemo = async (role: UserRole, customName?: string) => {
    setSyncStatus('saving');
    try {
      // First try Firebase anonymous authentication so currentUser is genuine
      let user = auth.currentUser;
      if (!user) {
        const cred = await signInAnonymously(auth);
        user = cred.user;
      }
      const displayName = customName || (role === 'admin' ? 'Luthfi Fadhil (Admin)' : 'Shafi Hanifah (Mahasiswa)');
      const email = role === 'admin' ? BOOTSTRAPPED_ADMIN_EMAIL : 'shafi.hanifah@uin-suka.ac.id';
      
      const profile: UserProfile = {
        uid: user.uid,
        name: displayName,
        email: email,
        role: role,
        nim: role === 'admin' ? '2661310004' : '2661310016',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'users', user.uid), profile);
        if (role === 'admin') {
          await setDoc(doc(db, 'admins', user.uid), {
            email: email,
            role: 'admin',
            createdAt: new Date().toISOString()
          });
        }
      } catch (e) {
        console.warn('Direct doc write restricted in demo mode:', e);
      }

      setUserProfile(profile);
      localStorage.setItem('spi_demo_session', JSON.stringify(profile));
      setSyncStatus('synced');
    } catch (err) {
      console.warn('Anonymous auth fallback:', err);
      // Fallback simulated session
      const fallbackUid = 'user_demo_' + (role === 'admin' ? 'admin' : 'member');
      const profile: UserProfile = {
        uid: fallbackUid,
        name: customName || (role === 'admin' ? 'Luthfi Fadhil (Admin)' : 'Shafi Hanifah (Mahasiswa)'),
        email: role === 'admin' ? BOOTSTRAPPED_ADMIN_EMAIL : 'shafi.hanifah@uin-suka.ac.id',
        role: role,
        nim: role === 'admin' ? '2661310004' : '2661310016'
      };
      setUserProfile(profile);
      localStorage.setItem('spi_demo_session', JSON.stringify(profile));
      setSyncStatus('synced');
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('spi_demo_session');
      await fbSignOut(auth);
      setUserProfile(null);
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateMyProfile = async (data: Partial<UserProfile>) => {
    if (!userProfile) return;
    setSyncStatus('saving');
    const updated = { ...userProfile, ...data, updatedAt: new Date().toISOString() };
    setUserProfile(updated);
    localStorage.setItem('spi_demo_session', JSON.stringify(updated));

    if (currentUser) {
      try {
        await updateDoc(doc(db, 'users', currentUser.uid), data);
      } catch (err) {
        console.warn('Profile sync update:', err);
      }
    }
    setSyncStatus('synced');
  };

  const isAdmin = userProfile?.role === 'admin' || currentUser?.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        loading,
        syncStatus,
        setSyncStatus,
        loginWithGoogle,
        loginQuickDemo,
        logout,
        updateMyProfile,
        theme,
        toggleTheme,
        isOnline,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
