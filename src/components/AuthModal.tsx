import React, { useState } from 'react';
import { Language } from '../types/astrology';
import { Compass, Phone, Lock, User, LogIn, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  language: Language;
  onLoginSuccess: (user: { name: string; identifier: string; provider: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ language, onLoginSuccess }) => {
  const isNe = language === 'ne';
  const [isSignUp, setIsSignUp] = useState(false);
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Social Auth Access Flow (No OTP)
  const [authMode, setAuthMode] = useState<'initial' | 'google_access' | 'facebook_access'>('initial');
  const [socialEmail, setSocialEmail] = useState('');
  const [error, setError] = useState('');

  const handleGoogleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialEmail || !socialEmail.toLowerCase().includes('@gmail.com')) {
      setError(isNe ? 'कृपया मान्य Gmail ठेगाना (@gmail.com) राख्नुहोस्।' : 'Please enter a valid Gmail address (@gmail.com).');
      return;
    }
    setError('');
    const userName = socialEmail.split('@')[0];
    onLoginSuccess({
      name: userName.charAt(0).toUpperCase() + userName.slice(1) + ' (Google)',
      identifier: socialEmail,
      provider: 'google',
    });
  };

  const handleFacebookAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialEmail) {
      setError(isNe ? 'कृपया Facebook इमेल वा फोन नम्बर राख्नुहोस्।' : 'Please enter your Facebook email or phone.');
      return;
    }
    setError('');
    const userName = socialEmail.includes('@') ? socialEmail.split('@')[0] : 'FB User ' + socialEmail.slice(-4);
    onLoginSuccess({
      name: userName.charAt(0).toUpperCase() + userName.slice(1) + ' (Facebook)',
      identifier: socialEmail,
      provider: 'facebook',
    });
  };

  const handlePhoneAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOrEmail || !password || (isSignUp && !name)) {
      setError(isNe ? 'सबै विवरणहरू भरिदिनुहोस्।' : 'Please fill in all required fields.');
      return;
    }
    setError('');
    onLoginSuccess({
      name: isSignUp ? name : (phoneOrEmail.includes('@') ? phoneOrEmail.split('@')[0] : 'User ' + phoneOrEmail.slice(-4)),
      identifier: phoneOrEmail,
      provider: 'phone',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-600/50 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 ring-4 ring-amber-400/20">
            <Compass className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-amber-200">
            {isNe ? 'वैदिक ज्योतिष लगइन' : 'Vedic Jyotish Portal'}
          </h2>
          <p className="text-xs text-slate-400">
            {authMode === 'google_access'
              ? (isNe ? 'Google खाता पहुँच (Google Account Access)' : 'Google Account Access Authorization')
              : authMode === 'facebook_access'
              ? (isNe ? 'Facebook खाता पहुँच (Facebook Account Access)' : 'Facebook Account Access Authorization')
              : (isNe 
                ? (isSignUp ? 'नयाँ खाता सिर्जना गर्नुहोस्' : 'तपाईंको खातामा लगइन गर्नुहोस्')
                : (isSignUp ? 'Create a new account' : 'Sign in to your account'))}
          </p>
        </div>

        {error && (
          <div className="bg-red-950/80 border border-red-700/60 text-red-200 text-xs p-3 rounded-xl text-center font-medium">
            {error}
          </div>
        )}

        {/* STEP 1: Initial Choose Method */}
        {authMode === 'initial' && (
          <>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => { setAuthMode('google_access'); setSocialEmail(''); setError(''); }}
                className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium py-3 px-4 rounded-2xl transition-all shadow-md text-sm cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.1 8.9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                  <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.3-1.5-.3-2.3s.1-1.6.3-2.3L1.6 7.2C.6 9.2 0 11.5 0 14s.6 4.8 1.6 6.8l3.7-2.9c-.3-.9-.5-1.9-.5-3.2z"/>
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.1-6.7-5.3L1.6 15.8C3.5 19.6 7.4 23 12 23z"/>
                </svg>
                <span>{isNe ? 'Google बाट लगइन गर्नुहोस् (Google Access)' : 'Continue with Google Access'}</span>
              </button>

              <button
                type="button"
                onClick={() => { setAuthMode('facebook_access'); setSocialEmail(''); setError(''); }}
                className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-2xl transition-all shadow-md text-sm cursor-pointer"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>{isNe ? 'Facebook बाट लगइन गर्नुहोस् (FB Access)' : 'Continue with Facebook Access'}</span>
              </button>
            </div>

            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-slate-700"></div>
              <span className="px-3 text-xs text-slate-500 font-mono">OR PHONE / EMAIL</span>
              <div className="flex-grow border-t border-slate-700"></div>
            </div>

            {/* Phone / Email Form */}
            <form onSubmit={handlePhoneAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    {isNe ? 'पूरा नाम (Full Name)' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-amber-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isNe ? 'तपाईंको नाम लेख्नुहोस्' : 'Enter your name'}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  {isNe ? 'मोबाइल नम्बर वा इमेल (Phone / Email)' : 'Phone Number or Email'}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-amber-500" />
                  <input
                    type="text"
                    value={phoneOrEmail}
                    onChange={(e) => setPhoneOrEmail(e.target.value)}
                    placeholder={isNe ? '९८XXXXXXXX वा email@domain.com' : '98XXXXXXXX or email@domain.com'}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  {isNe ? 'पासवर्ड (Password)' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-amber-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-xl transition-all text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{isSignUp ? (isNe ? 'खाता सिर्जना गर्नुहोस् (Sign Up)' : 'Create Account') : (isNe ? 'लगइन गर्नुहोस् (Sign In)' : 'Sign In')}</span>
              </button>
            </form>

            {/* Toggle Sign Up / Sign In */}
            <div className="text-center pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
              >
                {isSignUp 
                  ? (isNe ? 'पहिले नै खाता छ? लगइन गर्नुहोस्' : 'Already have an account? Sign In')
                  : (isNe ? 'खाता छैन? नयाँ साइन अप गर्नुहोस्' : "Don't have an account? Sign Up")}
              </button>
            </div>
          </>
        )}

        {/* STEP 2: Google Access Authorization */}
        {authMode === 'google_access' && (
          <form onSubmit={handleGoogleAuthSubmit} className="space-y-4">
            <div className="bg-slate-800/80 border border-amber-600/30 p-4 rounded-2xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">{isNe ? 'Google खाता अनुमति' : 'Google Account Access'}</h4>
                  <p className="text-xs text-slate-400">{isNe ? 'वैदिक ज्योतिषले तपाईंको Gmail प्रोफाइल र नाम प्रयोग गर्न अनुमति मागिरहेको छ।' : 'Vedic Jyotish is requesting access to your Google profile and email.'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                {isNe ? 'तपाईंको Gmail ठेगाना छान्नुहोस्/लेख्नुहोस्' : 'Enter your Gmail address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-amber-500" />
                <input
                  type="email"
                  value={socialEmail}
                  onChange={(e) => setSocialEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAuthMode('initial')}
                className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 px-4 rounded-xl text-sm transition-all cursor-pointer"
              >
                {isNe ? 'रद्द गर्नुहोस्' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="w-2/3 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold py-3 px-4 rounded-xl shadow-xl transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isNe ? 'अनुमति दिनुहोस् (Allow)' : 'Allow & Continue'}</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Facebook Access Authorization */}
        {authMode === 'facebook_access' && (
          <form onSubmit={handleFacebookAuthSubmit} className="space-y-4">
            <div className="bg-slate-800/80 border border-blue-600/30 p-4 rounded-2xl space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">{isNe ? 'Facebook खाता अनुमति' : 'Facebook Account Access'}</h4>
                  <p className="text-xs text-slate-400">{isNe ? 'वैदिक ज्योतिषले तपाईंको Facebook प्रोफाइल प्रयोग गर्न अनुमति मागिरहेको छ।' : 'Vedic Jyotish is requesting access to your Facebook profile.'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                {isNe ? 'Facebook इमेल वा फोन नम्बर' : 'Facebook Email or Phone'}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-blue-500" />
                <input
                  type="text"
                  value={socialEmail}
                  onChange={(e) => setSocialEmail(e.target.value)}
                  placeholder="name@facebook.com or 98XXXXXXXX"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAuthMode('initial')}
                className="w-1/3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-3 px-4 rounded-xl text-sm transition-all cursor-pointer"
              >
                {isNe ? 'रद्द गर्नुहोस्' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="w-2/3 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-xl transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isNe ? 'अनुमति दिनुहोस् (Continue)' : 'Continue Access'}</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
