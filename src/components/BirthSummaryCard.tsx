import React, { useState } from 'react';
import { BirthDetails, Language, KundaliCalculationOutput } from '../types/astrology';
import { UI_TRANSLATIONS, GRAHA_MAP } from '../utils/i18n';
import { User, Calendar, MapPin, Sparkles, Clock, Edit3, Save, X } from 'lucide-react';

interface BirthSummaryCardProps {
  birthDetails: BirthDetails;
  kundaliData: KundaliCalculationOutput;
  language: Language;
  theme: 'dark' | 'light';
  onUpdateDetails?: (details: BirthDetails) => void;
}

export const BirthSummaryCard: React.FC<BirthSummaryCardProps> = ({
  birthDetails,
  kundaliData,
  language,
  theme,
  onUpdateDetails,
}) => {
  const t = UI_TRANSLATIONS[language];
  const isNe = language === 'ne';
  const isDark = theme === 'dark';

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(birthDetails.name);
  const [dob, setDob] = useState(birthDetails.dob);
  const [tob, setTob] = useState(birthDetails.tob);
  const [birthPlace, setBirthPlace] = useState(birthDetails.birthPlace);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateDetails) {
      onUpdateDetails({
        ...birthDetails,
        name,
        dob,
        tob,
        birthPlace,
      });
    }
    setIsEditing(false);
  };

  const moonGraha = kundaliData?.grahas?.find((g) => g.name === 'Moon') || kundaliData?.grahas?.[0];

  return (
    <div className={`${isDark ? 'bg-slate-900 border-amber-900/50 text-slate-100' : 'bg-white border-amber-300 text-slate-900 shadow-xl'} border rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden transition-colors`}>
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className={`flex flex-wrap items-center justify-between pb-3 border-b ${isDark ? 'border-amber-900/30' : 'border-amber-200'} gap-2`}>
        <div className="flex items-center space-x-2">
          <User className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
          {!isEditing ? (
            <h2 className={`text-xl font-serif font-bold ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
              {birthDetails.name}
            </h2>
          ) : (
            <span className="text-sm font-semibold">नाम (Name):</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs ${isDark ? 'bg-amber-950 text-amber-300 border-amber-700/60' : 'bg-amber-100 text-amber-900 border-amber-300'} border px-3 py-1 rounded-full font-mono font-semibold`}>
            {t.lagna}: {isNe ? kundaliData.ascendant.signNameNe : kundaliData.ascendant.signNameEn} ({kundaliData.ascendant.degreeFormatted})
          </span>
          {onUpdateDetails && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border font-medium transition-colors ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-300' : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900'
              }`}
              title="विवरण सच्याउनुहोस् / Edit Details"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isNe ? 'विवरण परिवर्तन' : 'Edit Details'}</span>
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-3 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-medium mb-1 opacity-80">नाम (Name):</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-xs ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-black'}`}
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-1 opacity-80">जन्म मिति (DOB):</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-xs ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-black'}`}
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-1 opacity-80">जन्म समय (Time):</label>
              <input
                type="text"
                value={tob}
                onChange={(e) => setTob(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-xs ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-black'}`}
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-1 opacity-80">जन्म स्थान (Place):</label>
              <input
                type="text"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-xs ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-black'}`}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'}`}
            >
              <X className="w-3.5 h-3.5 inline mr-1" /> क्यान्सिल
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center gap-1 shadow-md"
            >
              <Save className="w-3.5 h-3.5" /> सुरक्षित गर्नुहोस् (Save)
            </button>
          </div>
        </form>
      ) : (
        /* Grid Metrics */
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-slate-50 border-slate-200'} p-3 rounded-xl border transition-colors`}>
            <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'} block text-[11px] font-medium flex items-center gap-1 mb-1`}>
              <Calendar className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} /> Date & Time
            </span>
            <span className={`font-mono font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {birthDetails.dob}
            </span>
            <span className={`font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'} block text-[11px]`}>
              {birthDetails.tob} Local
            </span>
          </div>

          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-slate-50 border-slate-200'} p-3 rounded-xl border transition-colors`}>
            <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'} block text-[11px] font-medium flex items-center gap-1 mb-1`}>
              <MapPin className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} /> Location
            </span>
            <span className={`font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'} truncate block`}>
              {birthDetails.birthPlace}
            </span>
            <span className={`font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'} block text-[10px]`}>
              {birthDetails.latitude.toFixed(2)}°N, {birthDetails.longitude.toFixed(2)}°E
            </span>
          </div>

          <div className={`${isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-slate-50 border-slate-200'} p-3 rounded-xl border transition-colors`}>
            <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'} block text-[11px] font-medium flex items-center gap-1 mb-1`}>
              <Sparkles className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} /> Moon Sign & Nakshatra
            </span>
            <span className="font-semibold text-amber-500">
              {isNe ? (moonGraha?.signNameNe || 'तुला') : (moonGraha?.signNameEn || 'Libra')}
            </span>
            <span className={`${isDark ? 'text-slate-300' : 'text-slate-700'} block text-[11px]`}>
              {isNe ? (moonGraha?.nakshatraNameNe || 'चित्रा') : (moonGraha?.nakshatraNameEn || 'Chitra')} (Pada {moonGraha?.pada || 4})
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
