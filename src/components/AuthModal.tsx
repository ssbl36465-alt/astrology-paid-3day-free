import React, { useState } from 'react';
import { Language } from '../types/astrology';
import { Compass, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { auth, signOut, authenticateGoogleWithPopup } from '../firebase';

interface AuthModalProps {
  language: Language;
  onLoginSuccess: (user: {
    name: string;
    identifier: string;
    provider: string;
    uid?: string;
    photoURL?: string;
    role?: string;
  }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ language, onLoginSuccess }) => {
  const isNe = language === 'ne';
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // STRICT GOOGLE POP-UP AUTHENTICATION
  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);

    try {
      // Execute strict Google account picker popup
      const verifiedProfile = await authenticateGoogleWithPopup();

      if (!verifiedProfile || !verifiedProfile.uid) {
        throw new Error('Google Authentication failed. Please select a valid Google Account.');
      }

      // Successfully authenticated with verified profile
      onLoginSuccess({
        name: verifiedProfile.displayName || 'User',
        identifier: verifiedProfile.email || verifiedProfile.uid,
        provider: 'google',
        uid: verifiedProfile.uid,
        photoURL: verifiedProfile.photoURL || '',
        role: verifiedProfile.role,
      });
    } catch (err: any) {
      console.error('Firebase Google Authentication Error:', err);

      // STRICT ENFORCEMENT: Never allow bypass, fallback or mock logins on failure/cancellation!
      try {
        await signOut(auth);
      } catch (e) {}
      localStorage.removeItem('vaidik_jyotish_user');

      const errorMsg = 'Google Authentication failed. Please select a valid Google Account.';
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-600/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 ring-4 ring-amber-400/20">
            <Compass className="w-9 h-9 animate-pulse" />
          </div>
          <h2 className="text-2xl font-serif font-black text-amber-200">
            {isNe ? 'वैदिक ज्योतिष लगइन' : 'Vedic Jyotish Portal'}
          </h2>
          <p className="text-xs text-slate-400">
            {isNe 
              ? 'सुरक्षित पहुँचका लागि आफ्नो Google खाताबाट लगइन गर्नुहोस्' 
              : 'Sign in securely with your Google Account'}
          </p>
        </div>

        {/* Explicit Error Alert */}
        {error && (
          <div className="bg-red-950/90 border border-red-700/80 text-red-200 text-xs p-3.5 rounded-2xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Google OAuth Pop-up Trigger Button */}
        <div className="space-y-4 pt-2">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-bold py-3.5 px-5 rounded-2xl transition-all shadow-xl hover:shadow-2xl text-sm border border-slate-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                <span>{isNe ? 'Google प्रमाणीकरण हुँदैछ...' : 'Connecting to Google...'}</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.1 8.9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                  <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.3-1.5-.3-2.3s.1-1.6.3-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9c-.3-.9-.5-1.9-.5-3.2z"/>
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.3L1.6 15.8C3.5 19.6 7.4 23 12 23z"/>
                </svg>
                <span>{isNe ? 'Google खाताबाट लगइन गर्नुहोस्' : 'Sign in with Google'}</span>
              </>
            )}
          </button>
        </div>

        {/* Security & Verification Banner */}
        <div className="bg-slate-800/80 border border-amber-600/30 p-3.5 rounded-2xl flex items-center gap-3 text-left">
          <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {isNe 
              ? '१००% आधिकारिक Google OAuth प्रमाणीकरण। कुनै पनि नक्कली सत्र वा बाइपास मान्य हुँदैन।'
              : 'Strict Firebase Google OAuth authentication. Verified account access required.'}
          </p>
        </div>
      </div>
    </div>
  );
};
