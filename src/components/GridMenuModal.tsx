import React from 'react';
import { 
  Home,
  UserCheck, 
  Compass, 
  Clock, 
  Scroll, 
  CalendarDays, 
  BookOpen, 
  Sparkles, 
  Wallet,
  X
} from 'lucide-react';

interface GridMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  language: string;
  theme: string;
}

export const GridMenuModal: React.FC<GridMenuModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  language,
  theme,
}) => {
  if (!isOpen) return null;

  const isNe = language === 'ne';
  const isDark = theme === 'dark';

  const menuItems = [
    {
      id: 'dashboard',
      nameNe: 'ड्यासबोर्ड',
      nameEn: 'Dashboard',
      icon: <Home className="w-6 h-6 text-amber-400" />,
      bg: 'bg-amber-500/10 border-amber-500/30',
    },
    {
      id: 'gurus',
      nameNe: 'लाइभ गुरुहरू',
      nameEn: 'Live Gurus',
      icon: <UserCheck className="w-6 h-6 text-emerald-400" />,
      bg: 'bg-emerald-500/10 border-emerald-500/30',
    },
    {
      id: 'summary',
      nameNe: 'जन्म कुण्डली',
      nameEn: 'Birth Kundali',
      icon: <Compass className="w-6 h-6 text-blue-400" />,
      bg: 'bg-blue-500/10 border-blue-500/30',
    },
    {
      id: 'dasha',
      nameNe: 'दशा विश्लेषण',
      nameEn: 'Vimshottari Dasha',
      icon: <Clock className="w-6 h-6 text-amber-500" />,
      bg: 'bg-amber-500/10 border-amber-500/30',
    },
    {
      id: 'traditionalPatrika',
      nameNe: 'पारम्परिक पत्रिका',
      nameEn: 'Traditional Patrika',
      icon: <Scroll className="w-6 h-6 text-purple-400" />,
      bg: 'bg-purple-500/10 border-purple-500/30',
    },
    {
      id: 'panchanga',
      nameNe: 'दैनिक पञ्चाङ्ग',
      nameEn: 'Daily Panchanga',
      icon: <CalendarDays className="w-6 h-6 text-rose-400" />,
      bg: 'bg-rose-500/10 border-rose-500/30',
    },
    {
      id: 'interpretations',
      nameNe: 'ग्रह फल तथा व्याख्या',
      nameEn: 'Interpretations',
      icon: <BookOpen className="w-6 h-6 text-indigo-400" />,
      bg: 'bg-indigo-500/10 border-indigo-500/30',
    },
    {
      id: 'appService',
      nameNe: '३००+ पेज रिपोर्ट',
      nameEn: '300+ Reports',
      icon: <Sparkles className="w-6 h-6 text-amber-300" />,
      bg: 'bg-amber-400/10 border-amber-400/30',
    },
    {
      id: 'wallet',
      nameNe: 'वालेट रिचार्ज',
      nameEn: 'Wallet',
      icon: <Wallet className="w-6 h-6 text-emerald-300" />,
      bg: 'bg-emerald-400/10 border-emerald-400/30',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className={`bg-slate-900 border border-amber-600/50 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between pb-4 border-b border-amber-900/40 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
            <h3 className="text-lg font-serif font-bold text-amber-200">
              {isNe ? '🎛️ ग्रिड मेनु (Grid Menu)' : '🎛️ App Grid Menu'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Column Grid Menu */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`group flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-amber-600/20 border-amber-500 text-amber-200 ring-2 ring-amber-500/50 shadow-lg'
                    : 'bg-slate-950/60 hover:bg-slate-800/80 border-slate-800 hover:border-amber-500/40 text-slate-300'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner mb-2.5 transition-transform group-hover:scale-110 ${item.bg}`}>
                  {item.icon}
                </div>
                <span className="font-serif font-bold text-xs sm:text-sm text-center line-clamp-1">
                  {isNe ? item.nameNe : item.nameEn}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            {isNe ? 'कुनै पनि मेनुमा क्लिक गरेर सिधै जान सक्नुहुन्छ।' : 'Click any menu item to navigate instantly.'}
          </p>
        </div>
      </div>
    </div>
  );
};
