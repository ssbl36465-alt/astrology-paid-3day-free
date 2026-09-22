import React from 'react';
import { Language, ChartStyle } from '../types/astrology';
import { UI_TRANSLATIONS } from '../utils/i18n';
import { Compass, Languages, Bookmark, Printer, Sun, Moon, Key, User, LogOut, Wallet } from 'lucide-react';

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
}) => {
  const t = UI_TRANSLATIONS[language];
  const isDark = theme === 'dark';

  return (
    <header className={`${isDark ? 'bg-slate-900 border-amber-900/40 text-slate-100 bg-slate-900/95' : 'bg-white border-slate-200 text-slate-900 shadow-md bg-white/95'} border-b py-4 px-4 sm:px-8 sticky top-0 z-30 shadow-xl backdrop-blur-md transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/30">
            <Compass className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className={`text-xl sm:text-2xl font-serif font-bold ${isDark ? 'text-amber-200' : 'text-amber-700'} tracking-wide flex items-center gap-2`}>
              {t.appTitle}
            </h1>
            {t.appSubtitle && (
              <p className={`text-xs ${isDark ? 'text-amber-400/80' : 'text-amber-600'} font-mono tracking-wider`}>
                {t.appSubtitle}
              </p>
            )}
          </div>
        </div>

        {/* Controls - Arranged strictly in 2 rows */}
        <div className="flex flex-col items-end gap-1.5">
          {/* Row 1: Chart Style, Theme, Language, Custom App */}
          <div className="flex items-center justify-end gap-1.5 flex-wrap md:flex-nowrap">
            {/* North vs South vs East Chart Toggle */}
            <div className={`${isDark ? 'bg-slate-800/95 border-slate-700/60 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'} p-0.5 rounded-lg border flex items-center text-xs`}>
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

            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-300' 
                  : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800'
              }`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-amber-700" />}
              <span>{isDark ? 'Light' : 'Dark'}</span>
            </button>

            {/* Language Selector */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'ne' : 'en')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                isDark 
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-300' 
                  : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
              }`}
            >
              <Languages className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
              <span>{language === 'en' ? 'नेपाली' : 'English'}</span>
            </button>

            {/* Wallet Recharge Button */}
            {onOpenWallet && (
              <button
                onClick={onOpenWallet}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all shadow-sm ${
                  isDark
                    ? 'bg-amber-950/70 hover:bg-amber-900 border-amber-600/60 text-amber-300'
                    : 'bg-amber-100 hover:bg-amber-200 border-amber-400 text-amber-900'
                }`}
                title="वालेट टपअप तथा रिचार्ज"
              >
                <Wallet className="w-3.5 h-3.5 text-amber-500" />
                <span>{language === 'ne' ? '💰 वालेट रिचार्ज' : '💰 Wallet'}</span>
              </button>
            )}
          </div>

          {/* Row 2: Saved Profiles, Admin, Print, User Profile */}
          <div className="flex items-center justify-end gap-1.5 flex-wrap md:flex-nowrap">
            {/* Saved Profiles */}
            <button
              onClick={onOpenSavedProfiles}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                isDark
                  ? 'bg-amber-950/60 hover:bg-amber-900/80 border-amber-700/50 text-amber-300'
                  : 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-amber-700'}`} />
              <span>{t.savedKundalis}</span>
            </button>

            {/* Admin Panel Button */}
            <button
              onClick={onOpenAdmin}
              className={`flex items-center space-x-1 px-2 py-1 rounded-lg border text-xs font-medium transition-colors ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                  : 'bg-slate-200 hover:bg-slate-300 border-slate-300 text-slate-800'
              }`}
              title="Admin Panel"
            >
              <Key className="w-3 h-3 text-amber-500" />
              <span>Admin</span>
            </button>

            {/* Print / Save */}
            <button
              onClick={onPrint}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors ${
                isDark
                  ? 'bg-emerald-950/60 hover:bg-emerald-900/80 border-emerald-700/50 text-emerald-300'
                  : 'bg-emerald-100 hover:bg-emerald-200 border-emerald-300 text-emerald-900'
              }`}
            >
              <Printer className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
              <span>{t.exportPDF}</span>
            </button>

            {/* User Profile & Logout */}
            {currentUser && (
              <div className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg border text-xs font-medium ${isDark ? 'bg-slate-800/80 border-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'}`}>
                <User className="w-3 h-3 text-amber-500" />
                <span className="max-w-[100px] truncate">{currentUser.name}</span>
                <button
                  onClick={onLogout}
                  className="p-0.5 hover:text-red-400 transition-colors cursor-pointer"
                  title={language === 'ne' ? 'लगआउट गर्नुहोस्' : 'Logout'}
                >
                  <LogOut className="w-3 h-3 text-red-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
