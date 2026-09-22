import React, { useState, useMemo } from 'react';
import { BirthDetails, Language, ChartStyle, KundaliCalculationOutput } from './types/astrology';
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
import { DigitalVisitingCard } from './components/DigitalVisitingCard';
import { GurusDirectory } from './components/GurusDirectory';
import { VastuView } from './components/VastuView';
import { AppServiceCard } from './components/AppServiceCard';
import { BirthSummaryCard } from './components/BirthSummaryCard';
import { WalletRechargeView } from './components/WalletRechargeView';
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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<string>('gurus');
  const [isSavedProfilesOpen, setIsSavedProfilesOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<{ name: string; identifier: string; provider: string } | null>(() => {
    const saved = localStorage.getItem('vaidik_jyotish_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLoginSuccess = (user: { name: string; identifier: string; provider: string }) => {
    setCurrentUser(user);
    localStorage.setItem('vaidik_jyotish_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('vaidik_jyotish_user');
  };

  const [subData, setSubData] = useState(() => getSubscription());
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  const [isMobileCardOpen, setIsMobileCardOpen] = useState(false);

  const [birthDetails, setBirthDetails] = useState<BirthDetails>({
    name: 'राम',
    dob: '1995-10-24',
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
    { id: 'gurus', label: isNe ? 'गुरुहरू' : 'Gurus', icon: <UserCheck className="w-4 h-4 text-amber-400" /> },
    { id: 'summary', label: t.tabSummary, icon: <Compass className="w-4 h-4" /> },
    { id: 'dasha', label: t.tabDasha, icon: <Clock className="w-4 h-4" /> },
    { id: 'traditionalPatrika', label: t.tabTraditionalPatrika, icon: <Scroll className="w-4 h-4 text-amber-400" /> },
    { id: 'panchanga', label: t.tabPanchanga, icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'interpretations', label: t.tabInterpretations, icon: <BookOpen className="w-4 h-4" /> },
    { id: 'appService', label: isNe ? 'विशेष एप / ३००+ पेज' : 'Custom App & 300+', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
  ];

  const handlePrint = () => {
    window.print();
  };

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-amber-900/40 overflow-x-auto print:hidden">
          <nav className="flex space-x-2 sm:space-x-4 min-w-max pb-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-600 text-slate-950 shadow-lg shadow-amber-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

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
          {activeTab === 'gurus' && (
            <div className="space-y-6">
              <GurusDirectory language={language} onOpenWallet={() => setActiveTab('wallet')} />
            </div>
          )}


          {activeTab === 'summary' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Input Form & Digital Visiting Card (5 cols) - Desktop Only */}
              <div className="hidden lg:block lg:col-span-5 space-y-6 print:hidden">
                <BirthForm
                  language={language}
                  onSubmit={(details) => setBirthDetails(details)}
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

            {/* Planetary Table (Graha Spasta) below Kundali */}
            <PlanetaryTable data={kundaliData} language={language} theme={theme} />

            {/* Yogas (Yoga) below Kundali */}
            <YogaView data={kundaliData} language={language} />
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
    </div>
  );
}
