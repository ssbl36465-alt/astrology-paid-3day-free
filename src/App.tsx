import React, { useState, useMemo, useEffect } from 'react';
import { BirthDetails, Language, ChartStyle, KundaliCalculationOutput } from './types/astrology';
import { auth, signOut, onAuthStateChanged, syncUserProfile } from './firebase';
import { UI_TRANSLATIONS, GRAHA_MAP, RASHI_LIST } from './utils/i18n';
import { calculateKundali } from './engine/kundaliEngine';
import { Header } from './components/Header';
import { BirthForm } from './components/BirthForm';
import { NorthIndianChart } from './components/NorthIndianChart';
import { SouthIndianChart } from './components/SouthIndianChart';
import { EastIndianChart } from './components/EastIndianChart';
import { PlanetaryTable } from './components/PlanetaryTable';
import { HouseTable } from './components/HouseTable';
import { PanchangaView } from './components/PanchangaView';
import { DashaView } from './components/DashaView';
import { DivisionalChartsView } from './components/DivisionalChartsView';
import { YogaView } from './components/YogaView';
import { ShadbalaAshtakavargaView } from './components/ShadbalaAshtakavargaView';
import { InterpretationView } from './components/InterpretationView';
import { CurrentDashaAndTransitView } from './components/CurrentDashaAndTransitView';
import { TraditionalPatrikaView } from './components/TraditionalPatrikaView';
import { SavedProfilesModal } from './components/SavedProfilesModal';
import { SubscriptionModal } from './components/SubscriptionModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AuthModal } from './components/AuthModal';
import { getSubscription } from './utils/subscriptionEngine';
import { convertBSToAD, formatADDateString } from './utils/nepaliCalendar';
import { DigitalVisitingCard } from './components/DigitalVisitingCard';
import { GurusDirectory } from './components/GurusDirectory';
import { VastuView } from './components/VastuView';
import { AppServiceCard } from './components/AppServiceCard';
import { BirthSummaryCard } from './components/BirthSummaryCard';
import { WalletRechargeView } from './components/WalletRechargeView';
import { DateConverterView } from './components/DateConverterView';
import { DashboardGrid } from './components/DashboardGrid';
import { ErrorBoundary } from './components/ErrorBoundary';
import { convertADToBS, calculateExactAge, getNakshatraNamakshara, getNakshatraGana } from './utils/nepaliCalendar';
import {
  Sparkles,
  Compass,
  Home,
  CalendarDays,
  Clock,
  Layers,
  Award,
  Activity,
  BookOpen,
  Zap,
  MapPin,
  Calendar,
  User,
  Scroll,
  CreditCard,
  Lock,
  ShieldCheck,
  Key,
  ArrowLeft,
  UserCheck,
  Wallet,
} from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('ne'); // Default to Nepali
  const [chartStyle, setChartStyle] = useState<ChartStyle>('north'); // Default to North Indian
  const [theme, setTheme] = useState<'dark' | 'light'>('light'); // Default to Lite mode
  const [chartDisplayTab, setChartDisplayTab] = useState<'d1' | 'd9' | 'both'>('d1'); // Default to large D1 view
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSavedProfilesOpen, setIsSavedProfilesOpen] = useState(false);

  // Strictly enforce genuine Firebase Authentication:
  // Never restore unverified sessions from localStorage!
  // Initialize to null and verify strictly through Firebase Auth.
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    identifier: string;
    provider: string;
    uid?: string;
    photoURL?: string;
    role?: string;
  } | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Listen strictly to genuine Firebase Auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await syncUserProfile(firebaseUser);
          const userData = {
            name: profile.displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            identifier: profile.email || firebaseUser.email || firebaseUser.uid,
            provider: 'google',
            uid: firebaseUser.uid,
            photoURL: profile.photoURL || firebaseUser.photoURL || '',
            role: profile.role,
          };
          setCurrentUser(userData);
          localStorage.setItem('vaidik_jyotish_user', JSON.stringify(userData));
        } catch (e) {
          console.warn('Error syncing auth profile:', e);
          setCurrentUser(null);
          localStorage.removeItem('vaidik_jyotish_user');
        }
      } else {
        // No verified Firebase session: user must log in
        setCurrentUser(null);
        localStorage.removeItem('vaidik_jyotish_user');
      }
      setIsAuthChecking(false);
    });

    return () => unsub();
  }, []);

  const handleLoginSuccess = (user: {
    name: string;
    identifier: string;
    provider: string;
    uid?: string;
    photoURL?: string;
    role?: string;
  }) => {
    setCurrentUser(user);
    localStorage.setItem('vaidik_jyotish_user', JSON.stringify(user));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('SignOut error:', e);
    }
    setCurrentUser(null);
    localStorage.removeItem('vaidik_jyotish_user');
  };

  const [subData, setSubData] = useState(() => getSubscription());
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  const [isMobileCardOpen, setIsMobileCardOpen] = useState(false);
  const [isKundaliGenerated, setIsKundaliGenerated] = useState<boolean>(false);

  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    name: '',
    dob: formatADDateString(convertBSToAD(2052, 7, 7)),
    tob: '10:30:00',
    birthPlace: 'Kathmandu, Nepal',
    latitude: 27.7172,
    longitude: 85.324,
    timezoneOffsetMinutes: 345, // +5:45
    timezoneName: 'Asia/Kathmandu (+5:45)',
    isDst: false,
  });

  // Perform full high-precision astronomical calculations
  const kundaliData: KundaliCalculationOutput = useMemo(() => {
    return calculateKundali(birthDetails);
  }, [birthDetails]);

  const t = UI_TRANSLATIONS[language];
  const isNe = language === 'ne';
  const isDark = theme === 'dark';

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: <Home className="w-4 h-4 text-amber-400" /> },
    { id: 'gurus', label: isNe ? 'गुरुहरू' : 'Gurus', icon: <UserCheck className="w-4 h-4 text-amber-400" /> },
    { id: 'summary', label: isNe ? 'कुण्डली' : 'Kundali', icon: <Compass className="w-4 h-4" /> },
    { id: 'dasha', label: isNe ? 'दशा' : 'Dasha', icon: <Clock className="w-4 h-4" /> },
    { id: 'traditionalPatrika', label: isNe ? 'चिना' : 'China', icon: <Scroll className="w-4 h-4 text-amber-400" /> },
    { id: 'interpretations', label: isNe ? 'फलित' : 'Falit', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'panchanga', label: isNe ? 'पञ्चाङ्ग' : 'Panchanga', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'appService', label: isNe ? 'विशेष एप (300+)' : '300+ Apps', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
    { id: 'wallet', label: isNe ? 'वालेट' : 'Wallet', icon: <Wallet className="w-4 h-4 text-amber-400" /> },
  ];

  const handlePrint = () => {
    window.print();
  };

  if (isAuthChecking) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-amber-200' : 'bg-slate-900 text-amber-100'} flex flex-col items-center justify-center gap-3 font-serif`}>
        <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm tracking-wide">
          {isNe ? 'Google प्रमाणीकरण जाँच गर्दै...' : 'Verifying Google authentication...'}
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'} font-sans selection:bg-amber-500 selection:text-slate-950 transition-colors duration-200`}>
      {!currentUser && (
        <AuthModal language={language} onLoginSuccess={handleLoginSuccess} />
      )}

      {/* Top Header */}
      <Header
        language={language}
        setLanguage={setLanguage}
        chartStyle={chartStyle}
        setChartStyle={setChartStyle}
        theme={theme}
        setTheme={setTheme}
        onOpenSavedProfiles={() => setIsSavedProfilesOpen(true)}
        onPrint={handlePrint}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenWallet={() => setActiveTab('wallet')}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-4 pb-24">
        {/* Mobile Quick Action Buttons (Visible only on mobile/tablet) */}
        <div className="flex lg:hidden items-center gap-2 print:hidden">
          <button
            type="button"
            onClick={() => setIsMobileFormOpen(true)}
            className="flex-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-lg text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <User className="w-4 h-4" /> ✏️ जन्म विवरण बदल्नुहोस्
          </button>
          <button
            type="button"
            onClick={() => setIsMobileCardOpen(true)}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-500/40 font-bold px-4 py-3 rounded-2xl shadow-lg text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" /> 📱 डिजिटल कार्ड & बुकिङ
          </button>
        </div>

        {/* Main Tab Content Display */}
        <div className="space-y-6">
          <ErrorBoundary key={activeTab}>
          {activeTab === 'dashboard' && (
            <DashboardGrid
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              language={language}
              theme={theme}
              onOpenEditForm={() => setIsMobileFormOpen(true)}
              onOpenDigitalCard={() => setIsMobileCardOpen(true)}
              onPrint={handlePrint}
            />
          )}

          {activeTab === 'gurus' && (
            <div className="space-y-6">
              <GurusDirectory language={language} onOpenWallet={() => setActiveTab('wallet')} />
            </div>
          )}


          {activeTab === 'summary' && !isKundaliGenerated && (
            <div className="max-w-xl mx-auto space-y-6 py-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-serif font-bold text-amber-200">
                  {isNe ? 'कुण्डली बनाउनको लागि जन्म विवरण भर्नुहोस्' : 'Enter Birth Details to Generate Kundali'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isNe ? 'तपाईंको सही जन्म मिति, समय र स्थान भरेर कुण्डली उत्पन्न गर्नुहोस्।' : 'Please enter accurate birth date, time and location to generate your personalized Kundali.'}
                </p>
              </div>
              <BirthForm
                language={language}
                onSubmit={(details) => {
                  setBirthDetails(details);
                  setIsKundaliGenerated(true);
                }}
                initialValues={birthDetails}
              />
            </div>
          )}

          {activeTab === 'summary' && isKundaliGenerated && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-slate-900 border border-amber-900/50 p-4 rounded-2xl shadow-xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-200 font-serif font-bold">
                    {isNe ? `${birthDetails.name || 'तपाईंको'} कुण्डली तयार गरिएको छ` : `${birthDetails.name || 'Your'} Kundali Generated`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsKundaliGenerated(false)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>✏️ {isNe ? 'जन्म विवरण सच्याउनुहोस्' : 'Edit Birth Details'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Input Form & Digital Visiting Card (5 cols) - Desktop Only */}
                <div className="hidden lg:block lg:col-span-5 space-y-6 print:hidden">
                  <BirthForm
                    language={language}
                    onSubmit={(details) => {
                      setBirthDetails(details);
                      setIsKundaliGenerated(true);
                    }}
                    initialValues={birthDetails}
                  />
                  <div className="bg-slate-900 border border-amber-600/30 rounded-3xl p-4 shadow-xl">
                    <DigitalVisitingCard />
                  </div>
                </div>

                {/* Right: Summary Card & Charts (7 cols) */}
                <div className="col-span-1 lg:col-span-7 space-y-6">
                  <BirthSummaryCard
                    birthDetails={birthDetails}
                    kundaliData={kundaliData}
                    language={language}
                    theme={theme}
                    onUpdateDetails={(details) => setBirthDetails(details)}
                  />
                  {/* Detailed Birth Summary & Exact Age Card above Kundali Charts */}
                  {(() => {
                    const birthAd = new Date(birthDetails.dob);
                    const bsInfo = convertADToBS(birthAd);
                    const exactAge = calculateExactAge(birthAd);
                    const moonGraha = kundaliData?.grahas?.find((g) => g.name === 'Moon') || kundaliData?.grahas?.[0];
                    const namakshara = moonGraha ? getNakshatraNamakshara(moonGraha.nakshatraIndex, moonGraha.pada) : '-';
                    const gana = moonGraha ? getNakshatraGana(moonGraha.nakshatraIndex, isNe) : '-';

                    return (
                      <div className={`${isDark ? 'bg-slate-900 border-amber-600/40 text-slate-100' : 'bg-white border-amber-300 text-slate-800 shadow-lg'} border rounded-2xl p-5 shadow-xl space-y-4 relative overflow-hidden transition-colors`}>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className={`flex flex-wrap items-center justify-between gap-3 pb-3 border-b ${isDark ? 'border-amber-900/40' : 'border-amber-200'}`}>
                          <div className="flex items-center space-x-2">
                            <Scroll className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                            <h3 className={`text-lg font-serif font-bold ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
                              {isNe ? 'कुण्डली तथा जन्म विवरण सारणी' : 'Kundali & Birth Detailed Summary'} — {birthDetails.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs ${isDark ? 'bg-amber-950/80 text-amber-300 border-amber-700/60' : 'bg-amber-100 text-amber-900 border-amber-300'} border px-3 py-1 rounded-full font-mono font-semibold`}>
                              {isNe ? 'उमेर (Exact Age):' : 'Exact Age:'} {isNe ? exactAge.bsAgeFormatted : exactAge.adAgeFormatted}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                          {/* Birth Date BS & AD */}
                          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-slate-50 border-slate-200'} p-3 rounded-xl border space-y-1 transition-colors`}>
                            <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'} font-medium flex items-center gap-1`}>
                              <Calendar className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} /> जन्म मिति (Birth Date)
                            </span>
                            <p className={`font-mono font-bold ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
                              BS: {bsInfo.formatted}
                            </p>
                            <p className={`font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                              AD: {birthDetails.dob}
                            </p>
                          </div>

                          {/* Time & Exact Age */}
                          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-slate-50 border-slate-200'} p-3 rounded-xl border space-y-1 transition-colors`}>
                            <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'} font-medium flex items-center gap-1`}>
                              <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} /> जन्म समय र उमेर
                            </span>
                            <p className={`font-mono font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                              {birthDetails.tob} (Time)
                            </p>
                            <p className={`font-mono ${isDark ? 'text-amber-300' : 'text-amber-700'} font-semibold text-[11px]`}>
                              {exactAge.bsAgeFormatted}
                            </p>
                          </div>

                          {/* Namakshara, Rashi & Gana */}
                          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-slate-50 border-slate-200'} p-3 rounded-xl border space-y-1 transition-colors`}>
                            <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'} font-medium flex items-center gap-1`}>
                              <Sparkles className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} /> नामाक्षर, राशी र गण
                            </span>
                            <p className={`font-semibold ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
                              नामाक्षर: <span className={`${isDark ? 'text-amber-400' : 'text-amber-600'} font-bold text-sm`}>[{namakshara}]</span> ({moonGraha?.nakshatraNameNe || ''} पाद {moonGraha?.pada || 1})
                            </p>
                            <p className={`${isDark ? 'text-slate-200' : 'text-slate-700'} font-medium`}>
                              राशी: {isNe ? moonGraha?.signNameNe : moonGraha?.signNameEn} | गण: {gana}
                            </p>
                          </div>

                          {/* Panchanga Highlights */}
                          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-slate-50 border-slate-200'} p-3 rounded-xl border space-y-1 transition-colors`}>
                            <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'} font-medium flex items-center gap-1`}>
                              <Compass className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} /> पञ्चाङ्ग गणना (Panchanga)
                            </span>
                            <p className={`${isDark ? 'text-slate-200' : 'text-slate-700'} font-medium truncate`}>
                              तिथि: {kundaliData.panchanga.tithi.nameNe} ({kundaliData.panchanga.tithi.pakshaNe})
                            </p>
                            <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'} text-[11px]`}>
                              वार: {kundaliData.panchanga.vara.nameNe} | योग: {kundaliData.panchanga.yoga.nameNe}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Kundali View Controls (Large View & Tab Switcher) */}
                  <div className={`p-3 sm:p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
                    isDark ? 'bg-slate-900/90 border-amber-900/40 text-slate-100' : 'bg-amber-50/90 border-amber-200 text-slate-900'
                  }`}>
                    {/* Large View Selection Tabs */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 mr-1">
                        {isNe ? 'कुण्डली दृश्य:' : 'Chart View:'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setChartDisplayTab('d1')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          chartDisplayTab === 'd1'
                            ? 'bg-amber-600 text-white shadow-md'
                            : isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
                        }`}
                      >
                        ☀️ {isNe ? 'D1 जन्म कुण्डली (ठूलो स्पष्ट)' : 'D1 Birth Chart (Large)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartDisplayTab('d9')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          chartDisplayTab === 'd9'
                            ? 'bg-amber-600 text-white shadow-md'
                            : isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
                        }`}
                      >
                        ☸️ {isNe ? 'D9 नवांश कुण्डली (ठूलो)' : 'D9 Navamsa (Large)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartDisplayTab('both')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          chartDisplayTab === 'both'
                            ? 'bg-amber-600 text-white shadow-md'
                            : isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
                        }`}
                      >
                        📑 {isNe ? 'दुवै कुण्डली (D1 + D9)' : 'Both Side-by-Side'}
                      </button>
                    </div>

                    {/* Chart Style Switcher (North / South / East) */}
                    <div className="flex items-center gap-1 bg-amber-100/60 dark:bg-slate-800 p-1 rounded-xl border border-amber-300/60 dark:border-slate-700 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setChartStyle('north')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          chartStyle === 'north'
                            ? 'bg-amber-600 text-white shadow'
                            : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-amber-900'
                        }`}
                      >
                        {isNe ? 'उत्तरी' : 'North'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartStyle('south')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          chartStyle === 'south'
                            ? 'bg-amber-600 text-white shadow'
                            : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-amber-900'
                        }`}
                      >
                        {isNe ? 'दक्षिणी' : 'South'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setChartStyle('east')}
                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                          chartStyle === 'east'
                            ? 'bg-amber-600 text-white shadow'
                            : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-amber-900'
                        }`}
                      >
                        {isNe ? 'पूर्वीय' : 'East'}
                      </button>
                    </div>
                  </div>

                  {/* Kundali Render Section */}
                  {chartDisplayTab === 'd1' ? (
                    <div className="w-full max-w-[620px] mx-auto">
                      {chartStyle === 'north' ? (
                        <NorthIndianChart
                          data={kundaliData}
                          language={language}
                          title={isNe ? 'D1 जन्म कुण्डली (ठूलो स्पष्ट दृश्य)' : 'D1 Birth Kundali (Large View)'}
                          theme={theme}
                        />
                      ) : chartStyle === 'south' ? (
                        <SouthIndianChart
                          data={kundaliData}
                          language={language}
                          title={isNe ? 'D1 जन्म कुण्डली (दक्षिणी भारतीय)' : 'D1 Birth Kundali (South Indian)'}
                          theme={theme}
                        />
                      ) : (
                        <EastIndianChart
                          data={kundaliData}
                          language={language}
                          title={isNe ? 'D1 जन्म कुण्डली (पूर्वीय भारतीय)' : 'D1 Birth Kundali (East Indian)'}
                          theme={theme}
                        />
                      )}
                    </div>
                  ) : chartDisplayTab === 'd9' ? (
                    <div className="w-full max-w-[620px] mx-auto">
                      {chartStyle === 'north' ? (
                        <NorthIndianChart
                          data={{
                            ...kundaliData,
                            ascendant: {
                              ...kundaliData.ascendant,
                              signIndex: kundaliData.divisionalCharts?.[1]?.ascendantSignIndex ?? kundaliData.ascendant.signIndex,
                            },
                            grahas: kundaliData.grahas.map((g) => {
                              const p = kundaliData.divisionalCharts?.[1]?.positions?.find((pos) => pos.graha === g.name);
                              return { ...g, signIndex: p ? p.signIndex : g.signIndex, house: p ? p.house : g.house };
                            }),
                          }}
                          language={language}
                          title={isNe ? 'D9 नवांश कुण्डली (ठूलो स्पष्ट दृश्य)' : 'D9 Navamsa Chart (Large View)'}
                          theme={theme}
                        />
                      ) : chartStyle === 'south' ? (
                        <SouthIndianChart
                          data={{
                            ...kundaliData,
                            ascendant: {
                              ...kundaliData.ascendant,
                              signIndex: kundaliData.divisionalCharts?.[1]?.ascendantSignIndex ?? kundaliData.ascendant.signIndex,
                            },
                            grahas: kundaliData.grahas.map((g) => {
                              const p = kundaliData.divisionalCharts?.[1]?.positions?.find((pos) => pos.graha === g.name);
                              return { ...g, signIndex: p ? p.signIndex : g.signIndex, house: p ? p.house : g.house };
                            }),
                          }}
                          language={language}
                          title={isNe ? 'D9 नवांश कुण्डली (दक्षिणी भारतीय)' : 'D9 Navamsa Chart (South Indian)'}
                          theme={theme}
                        />
                      ) : (
                        <EastIndianChart
                          data={{
                            ...kundaliData,
                            ascendant: {
                              ...kundaliData.ascendant,
                              signIndex: kundaliData.divisionalCharts?.[1]?.ascendantSignIndex ?? kundaliData.ascendant.signIndex,
                            },
                            grahas: kundaliData.grahas.map((g) => {
                              const p = kundaliData.divisionalCharts?.[1]?.positions?.find((pos) => pos.graha === g.name);
                              return { ...g, signIndex: p ? p.signIndex : g.signIndex, house: p ? p.house : g.house };
                            }),
                          }}
                          language={language}
                          title={isNe ? 'D9 नवांश कुण्डली (पूर्वीय भारतीय)' : 'D9 Navamsa Chart (East Indian)'}
                          theme={theme}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                      {/* Primary Kundali Chart */}
                      <div className="space-y-4">
                        {chartStyle === 'north' ? (
                          <NorthIndianChart
                            data={kundaliData}
                            language={language}
                            title={isNe ? 'D1 जन्म कुण्डली (उत्तरी भारतीय)' : 'D1 Birth Kundali (North Indian)'}
                            theme={theme}
                          />
                        ) : chartStyle === 'south' ? (
                          <SouthIndianChart
                            data={kundaliData}
                            language={language}
                            title={isNe ? 'D1 जन्म कुण्डली (दक्षिणी भारतीय)' : 'D1 Birth Kundali (South Indian)'}
                            theme={theme}
                          />
                        ) : (
                          <EastIndianChart
                            data={kundaliData}
                            language={language}
                            title={isNe ? 'D1 जन्म कुण्डली (पूर्वीय भारतीय)' : 'D1 Birth Kundali (East Indian)'}
                            theme={theme}
                          />
                        )}
                      </div>

                      {/* D9 Navamsa Chart Preview */}
                      <div className="space-y-4">
                        {chartStyle === 'north' ? (
                          <NorthIndianChart
                            data={{
                              ...kundaliData,
                              ascendant: {
                                ...kundaliData.ascendant,
                                signIndex: kundaliData.divisionalCharts?.[1]?.ascendantSignIndex ?? kundaliData.ascendant.signIndex,
                              },
                              grahas: kundaliData.grahas.map((g) => {
                                const p = kundaliData.divisionalCharts?.[1]?.positions?.find((pos) => pos.graha === g.name);
                                return { ...g, signIndex: p ? p.signIndex : g.signIndex, house: p ? p.house : g.house };
                              }),
                            }}
                            language={language}
                            title={isNe ? 'D9 नवांश कुण्डली (उत्तरी भारतीय)' : 'D9 Navamsa Chart (North Indian)'}
                            theme={theme}
                          />
                        ) : chartStyle === 'south' ? (
                          <SouthIndianChart
                            data={{
                              ...kundaliData,
                              ascendant: {
                                ...kundaliData.ascendant,
                                signIndex: kundaliData.divisionalCharts?.[1]?.ascendantSignIndex ?? kundaliData.ascendant.signIndex,
                              },
                              grahas: kundaliData.grahas.map((g) => {
                                const p = kundaliData.divisionalCharts?.[1]?.positions?.find((pos) => pos.graha === g.name);
                                return { ...g, signIndex: p ? p.signIndex : g.signIndex, house: p ? p.house : g.house };
                              }),
                            }}
                            language={language}
                            title={isNe ? 'D9 नवांश कुण्डली (दक्षिणी भारतीय)' : 'D9 Navamsa Chart (South Indian)'}
                            theme={theme}
                          />
                        ) : (
                          <EastIndianChart
                            data={{
                              ...kundaliData,
                              ascendant: {
                                ...kundaliData.ascendant,
                                signIndex: kundaliData.divisionalCharts?.[1]?.ascendantSignIndex ?? kundaliData.ascendant.signIndex,
                              },
                              grahas: kundaliData.grahas.map((g) => {
                                const p = kundaliData.divisionalCharts?.[1]?.positions?.find((pos) => pos.graha === g.name);
                                return { ...g, signIndex: p ? p.signIndex : g.signIndex, house: p ? p.house : g.house };
                              }),
                            }}
                            language={language}
                            title={isNe ? 'D9 नवांश कुण्डली (पूर्वीय भारतीय)' : 'D9 Navamsa Chart (East Indian)'}
                            theme={theme}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Planetary Table (Graha Spasta) below Kundali */}
                  <PlanetaryTable data={kundaliData} language={language} theme={theme} />

                  {/* Yogas (Yoga) below Kundali */}
                  <YogaView data={kundaliData} language={language} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'traditionalPatrika' && (
            <div className="space-y-6">
              <BirthSummaryCard
                birthDetails={birthDetails}
                kundaliData={kundaliData}
                language={language}
                theme={theme}
                onUpdateDetails={(details) => setBirthDetails(details)}
              />
              <TraditionalPatrikaView data={kundaliData} language={language} chartStyle={chartStyle} onBack={() => setActiveTab('summary')} />
            </div>
          )}

          {activeTab === 'panchanga' && (
            <PanchangaView data={kundaliData} language={language} theme={theme} />
          )}

          {activeTab === 'calendarConverter' && (
            <DateConverterView language={language} theme={theme} />
          )}

          {activeTab === 'dasha' && (
            <DashaView data={kundaliData} language={language} />
          )}

          {activeTab === 'interpretations' && (
            <InterpretationView data={kundaliData} language={language} />
          )}

          {activeTab === 'appService' && (
            <AppServiceCard language={language} />
          )}

          {activeTab === 'wallet' && (
            <WalletRechargeView language={language} theme={theme} />
          )}
          </ErrorBoundary>
        </div>
      </main>

      {/* Saved Profiles Modal */}
      <SavedProfilesModal
        isOpen={isSavedProfilesOpen}
        onClose={() => setIsSavedProfilesOpen(false)}
        onSelectProfile={(details) => setBirthDetails(details)}
        currentDetails={birthDetails}
        language={language}
      />

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        onSuccess={() => setSubData(getSubscription())}
        subscription={subData}
      />

      {/* Admin Panel Modal */}
      <AdminPanelModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />

      {/* Mobile Birth Form Modal */}
      {isMobileFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-amber-600/50 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-amber-900/40 mb-4">
              <h3 className="text-lg font-serif font-bold text-amber-200">जन्म विवरण परिवर्तन गर्नुहोस्</h3>
              <button
                type="button"
                onClick={() => setIsMobileFormOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <BirthForm
              language={language}
              onSubmit={(details) => {
                setBirthDetails(details);
                setIsMobileFormOpen(false);
              }}
              initialValues={birthDetails}
            />
          </div>
        </div>
      )}

      {/* Mobile Digital Visiting Card Modal */}
      {isMobileCardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-amber-600/50 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-amber-900/40 mb-4">
              <h3 className="text-lg font-serif font-bold text-amber-200">डिजिटल कार्ड & बुकिङ</h3>
              <button
                type="button"
                onClick={() => setIsMobileCardOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <DigitalVisitingCard />
          </div>
        </div>
      )}
      {/* Fixed Bottom Navigation Bar for easy mobile access */}
      <nav className={`fixed bottom-0 left-0 right-0 z-40 ${isDark ? 'bg-slate-900/95 border-amber-500/40 text-slate-200' : 'bg-white/95 border-amber-300 text-slate-800'} border-t backdrop-blur-md py-2 px-3 flex items-center justify-around overflow-x-auto shadow-2xl print:hidden`}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[52px] py-1 px-1.5 rounded-xl text-[10px] font-medium transition-all cursor-pointer ${
                isActive
                  ? 'text-amber-400 font-bold scale-105 bg-amber-500/15 border border-amber-500/40 shadow-sm'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="mb-0.5">{tab.icon}</div>
              <span className="truncate max-w-[65px]">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
