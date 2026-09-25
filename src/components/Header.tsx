import React, { useState, useRef, useEffect } from 'react';
import { Language, ChartStyle } from '../types/astrology';
import { UI_TRANSLATIONS } from '../utils/i18n';
import { Compass, Languages, Bookmark, Printer, Sun, Moon, Key, User, LogOut, Wallet, Settings, ChevronDown, Edit3, Sparkles } from 'lucide-react';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  chartStyle: ChartStyle;
  setChartStyle: (style: ChartStyle) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  onOpenSavedProfiles: () => void;
  onPrint: () => void;
  onOpenAdmin: () => void;
  currentUser: { name: string; identifier: string; provider: string } | null;
  onLogout: () => void;
  onOpenWallet?: () => void;
  onOpenEditForm?: () => void;
  onOpenDigitalCard?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  setLanguage,
  chartStyle,
  setChartStyle,
  theme,
  setTheme,
  onOpenSavedProfiles,
  onPrint,
  onOpenAdmin,
  currentUser,
  onLogout,
  onOpenWallet,
  onOpenEditForm,
  onOpenDigitalCard,
}) => {
  const t = UI_TRANSLATIONS[language];
  const isDark = theme === 'dark';
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`${isDark ? 'bg-slate-900 border-amber-900/40 text-slate-100 bg-slate-900/95' : 'bg-white border-slate-200 text-slate-900 shadow-md bg-white/95'} border-b py-3 px-4 sm:px-8 sticky top-0 z-40 shadow-xl backdrop-blur-md transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/30">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className={`text-lg sm:text-xl font-serif font-bold ${isDark ? 'text-amber-200' : 'text-amber-700'} tracking-wide flex items-center gap-2`}>
              {t.appTitle}
            </h1>
            {t.appSubtitle && (
              <p className={`text-[11px] ${isDark ? 'text-amber-400/80' : 'text-amber-600'} font-mono tracking-wider`}>
                {t.appSubtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Controls: Chart Style Toggle & Settings Menu */}
        <div className="flex items-center gap-2">
          {/* North vs South vs East Chart Toggle */}
          <div className={`${isDark ? 'bg-slate-800/95 border-slate-700/60 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'} p-0.5 rounded-lg border hidden sm:flex items-center text-xs`}>
            <button
              onClick={() => setChartStyle('north')}
              className={`px-2 py-1 rounded-md font-medium transition-all ${
                chartStyle === 'north'
                  ? 'bg-amber-600 text-white font-semibold shadow-md'
                  : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-black'
              }`}
            >
              {t.northChart}
            </button>
            <button
              onClick={() => setChartStyle('south')}
              className={`px-2 py-1 rounded-md font-medium transition-all ${
                chartStyle === 'south'
                  ? 'bg-amber-600 text-white font-semibold shadow-md'
                  : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-black'
              }`}
            >
              {t.southChart}
            </button>
            <button
              onClick={() => setChartStyle('east')}
              className={`px-2 py-1 rounded-md font-medium transition-all ${
                chartStyle === 'east'
                  ? 'bg-amber-600 text-white font-semibold shadow-md'
                  : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-black'
              }`}
            >
              {t.eastChart}
            </button>
          </div>

          {/* Settings & Account Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-amber-600/50 text-amber-300 shadow-md'
                  : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-900 shadow-sm'
              }`}
            >
              <Settings className="w-4 h-4 text-amber-500 animate-spin-slow" />
              <span>{language === 'ne' ? 'सेटिङ्स (Settings)' : 'Settings'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Popup */}
            {isSettingsOpen && (
              <div className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-2xl py-2 z-50 animate-fadeIn ${
                isDark ? 'bg-slate-900 border-amber-500/40 text-slate-100' : 'bg-white border-amber-200 text-slate-900'
              }`}>
                {currentUser && (
                  <div className={`px-4 py-3 border-b ${isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'} flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold truncate">{currentUser.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{currentUser.identifier}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-1.5 space-y-1">
                  {/* Light / Dark Mode Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setTheme(isDark ? 'light' : 'dark');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isDark ? 'hover:bg-slate-800 text-amber-300' : 'hover:bg-amber-50 text-amber-900'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-amber-700" />}
                      <span>{isDark ? 'Light Mode (उज्यालो)' : 'Dark Mode (अध्यारो)'}</span>
                    </span>
                    <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                      {isDark ? 'Dark' : 'Light'}
                    </span>
                  </button>

                  {/* English / Nepali Language Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage(language === 'en' ? 'ne' : 'en');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isDark ? 'hover:bg-slate-800 text-amber-300' : 'hover:bg-amber-50 text-amber-900'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Languages className="w-4 h-4 text-amber-500" />
                      <span>{language === 'en' ? 'नेपाली भाषा (Nepali)' : 'English Language'}</span>
                    </span>
                    <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">
                      {language === 'en' ? 'EN' : 'NE'}
                    </span>
                  </button>

                  {/* Wallet Recharge */}
                  {onOpenWallet && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSettingsOpen(false);
                        onOpenWallet();
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                        isDark ? 'hover:bg-slate-800 text-amber-300' : 'hover:bg-amber-50 text-amber-900'
                      }`}
                    >
                      <Wallet className="w-4 h-4 text-amber-500" />
                      <span>💰 वालेट रिचार्ज (Wallet Recharge)</span>
                    </button>
                  )}

                  {/* Saved Profiles */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      onOpenSavedProfiles();
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isDark ? 'hover:bg-slate-800 text-amber-300' : 'hover:bg-amber-50 text-amber-900'
                    }`}
                  >
                    <Bookmark className="w-4 h-4 text-amber-400" />
                    <span>🔖 संरक्षित कुण्डलीहरू (Saved Profiles)</span>
                  </button>

                  {/* Admin Panel */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      onOpenAdmin();
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                      isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <Key className="w-4 h-4 text-amber-500" />
                    <span>🛡️ Admin Panel</span>
                  </button>
                </div>

                {/* Login / Logout Section */}
                <div className={`p-1.5 mt-1 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                  {currentUser ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSettingsOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>🚪 लगआउट गर्नुहोस् (Logout)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSettingsOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4 text-emerald-500" />
                      <span>🔐 लगइन गर्नुहोस् (Login)</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
