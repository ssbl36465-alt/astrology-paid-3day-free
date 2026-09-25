import React from 'react';
import { 
  UserCheck, 
  Compass, 
  Clock, 
  Scroll, 
  CalendarDays, 
  BookOpen, 
  Sparkles, 
  Wallet, 
  Star,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Award,
  Edit3,
  Printer
} from 'lucide-react';

interface DashboardGridProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  language: string;
  theme: string;
  onOpenEditForm?: () => void;
  onOpenDigitalCard?: () => void;
  onPrint?: () => void;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  activeTab,
  setActiveTab,
  language,
  theme,
  onOpenEditForm,
  onOpenDigitalCard,
  onPrint,
}) => {
  const isNe = language === 'ne';
  const isDark = theme === 'dark';

  const menuItems = [
    {
      id: 'gurus',
      nameNe: 'लाइभ गुरुहरू',
      nameEn: 'Live Gurus',
      descNe: 'अडियो, भिडियो र च्याट कल',
      descEn: 'Audio, Video & Chat',
      icon: <UserCheck className="w-6 h-6 text-amber-500" />,
      bg: 'bg-amber-500/10 border-amber-500/30',
      badge: 'Online'
    },
    {
      id: 'summary',
      nameNe: 'जन्म कुण्डली',
      nameEn: 'Birth Kundali',
      descNe: 'D1, D9 चार्ट र ग्रह स्पष्ट',
      descEn: 'D1, D9 Charts & Grahas',
      icon: <Compass className="w-6 h-6 text-blue-500" />,
      bg: 'bg-blue-500/10 border-blue-500/30',
      badge: 'Essential'
    },
    {
      id: 'dasha',
      nameNe: 'दशा विश्लेषण',
      nameEn: 'Vimshottari Dasha',
      descNe: 'महादशा र अन्तरदशा फल',
      descEn: 'Mahadasha & Antardasha',
      icon: <Clock className="w-6 h-6 text-amber-500" />,
      bg: 'bg-amber-500/10 border-amber-500/30',
      badge: 'Predictive'
    },
    {
      id: 'traditionalPatrika',
      nameNe: 'चिनारु पत्रिका',
      nameEn: 'Traditional Patrika',
      descNe: 'विस्तृत चिनारु पत्रिका',
      descEn: 'Detailed Patrika View',
      icon: <Scroll className="w-6 h-6 text-purple-500" />,
      bg: 'bg-purple-500/10 border-purple-500/30',
      badge: 'Popular'
    },
    {
      id: 'interpretations',
      nameNe: 'ग्रह फल व्याख्या',
      nameEn: 'Interpretations',
      descNe: 'भाव अनुसार ग्रह फल',
      descEn: 'House & Planet Results',
      icon: <BookOpen className="w-6 h-6 text-indigo-500" />,
      bg: 'bg-indigo-500/10 border-indigo-500/30',
      badge: 'Detailed'
    },
    {
      id: 'panchanga',
      nameNe: 'दैनिक पञ्चाङ्ग',
      nameEn: 'Daily Panchanga',
      descNe: 'तिथि, वार, नक्षत्र, योग',
      descEn: 'Tithi, Vara, Nakshatra',
      icon: <CalendarDays className="w-6 h-6 text-rose-500" />,
      bg: 'bg-rose-500/10 border-rose-500/30',
      badge: 'Daily'
    },
    {
      id: 'wallet',
      nameNe: 'वालेट रिचार्ज',
      nameEn: 'Wallet Recharge',
      descNe: 'ब्यालेन्स थप्नुहोस्',
      descEn: 'Top-up Balance',
      icon: <Wallet className="w-6 h-6 text-emerald-500" />,
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      badge: 'Secure'
    },
    {
      id: 'appService',
      nameNe: '३००+ पेज रिपोर्ट',
      nameEn: '300+ Page Reports',
      descNe: 'कम्प्लीट वैदिक रिपोर्ट',
      descEn: 'Comprehensive Report',
      icon: <Sparkles className="w-6 h-6 text-amber-400" />,
      bg: 'bg-amber-400/10 border-amber-400/30',
      badge: 'VIP'
    }
  ];

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Quick Actions Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Edit Birth Details */}
        <button
          type="button"
          onClick={() => {
            if (onOpenEditForm) onOpenEditForm();
          }}
          className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer shadow group ${
            isDark 
              ? 'bg-slate-900 border-amber-500/40 hover:border-amber-500 text-slate-100 hover:bg-slate-800' 
              : 'bg-white border-amber-300 hover:border-amber-400 text-slate-900 hover:bg-amber-50/50'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform shrink-0">
            <Edit3 className="w-4 h-4" />
          </div>
          <div className="text-left overflow-hidden">
            <h4 className="font-serif font-bold text-xs sm:text-sm text-amber-200 truncate">
              ✏️ जन्म विवरण बदल्नुहोस्
            </h4>
            <p className="text-[10px] text-slate-400 truncate">Edit Birth Details</p>
          </div>
        </button>

        {/* Digital Visiting Card & Booking */}
        <button
          type="button"
          onClick={() => {
            if (onOpenDigitalCard) onOpenDigitalCard();
          }}
          className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer shadow group ${
            isDark 
              ? 'bg-slate-900 border-amber-500/40 hover:border-amber-500 text-slate-100 hover:bg-slate-800' 
              : 'bg-white border-amber-300 hover:border-amber-400 text-slate-900 hover:bg-amber-50/50'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-left overflow-hidden">
            <h4 className="font-serif font-bold text-xs sm:text-sm text-amber-200 truncate">
              📱 डिजिटल कार्ड & booking
            </h4>
            <p className="text-[10px] text-slate-400 truncate">Digital Card & Booking</p>
          </div>
        </button>

        {/* Print / Save Report */}
        <button
          type="button"
          onClick={() => {
            if (onPrint) onPrint();
          }}
          className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer shadow group ${
            isDark 
              ? 'bg-slate-900 border-emerald-500/40 hover:border-emerald-500 text-slate-100 hover:bg-slate-800' 
              : 'bg-white border-emerald-300 hover:border-emerald-400 text-slate-900 hover:bg-emerald-50/50'
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shrink-0">
            <Printer className="w-4 h-4" />
          </div>
          <div className="text-left overflow-hidden">
            <h4 className="font-serif font-bold text-xs sm:text-sm text-emerald-200 truncate">
              🖨️ रिपोर्ट प्रिन्ट / सेभ गर्नुहोस्
            </h4>
            <p className="text-[10px] text-slate-400 truncate">Print / Save Report</p>
          </div>
        </button>
      </div>

      {/* Main Unified 4-Column Grid (No wasted space) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`group relative text-left p-4 rounded-3xl border transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                isActive
                  ? isDark 
                    ? 'bg-amber-950/40 border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/50' 
                    : 'bg-amber-50 border-amber-400 shadow-xl ring-2 ring-amber-400/40'
                  : isDark
                    ? 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-amber-500/50 hover:shadow-lg'
                    : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-amber-300 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Top Badge */}
              <div className="flex items-center justify-between w-full mb-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-110 ${item.bg}`}>
                  {item.icon}
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950/60 text-amber-300 border border-amber-500/20">
                  {item.badge}
                </span>
              </div>

              {/* Bottom Text */}
              <div className="space-y-1">
                <h4 className={`font-serif font-bold text-xs sm:text-sm group-hover:text-amber-400 transition-colors ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  {isNe ? item.nameNe : item.nameEn}
                </h4>
                <p className={`text-[11px] line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {isNe ? item.descNe : item.descEn}
                </p>
              </div>

              {/* Active Indicator Glow */}
              {isActive && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-400 animate-ping"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
