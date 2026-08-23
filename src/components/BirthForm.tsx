import React, { useState } from 'react';
import { BirthDetails, Language } from '../types/astrology';
import { UI_TRANSLATIONS } from '../utils/i18n';
import { CITY_PRESETS } from '../data/cities';
import { convertADToBS, convertBSToAD, getDaysInBSMonth, NEPALI_MONTHS_NP, NEPALI_MONTHS_EN, formatADDateString } from '../utils/nepaliCalendar';
import { Calendar, Clock, MapPin, Globe, Sparkles, AlertTriangle } from 'lucide-react';

interface BirthFormProps {
  language: Language;
  onSubmit: (details: BirthDetails) => void;
  initialValues?: BirthDetails;
}

export const BirthForm: React.FC<BirthFormProps> = ({ language, onSubmit, initialValues }) => {
  const t = UI_TRANSLATIONS[language];

  const defaultDetails: BirthDetails = initialValues || {
    name: 'Shree Ram',
    dob: '1995-10-24',
    tob: '10:30:00',
    birthPlace: 'Kathmandu, Nepal',
    latitude: 27.7172,
    longitude: 85.324,
    timezoneOffsetMinutes: 345, // Nepal (+5:45)
    timezoneName: 'Asia/Kathmandu (+5:45)',
    isDst: false,
  };

  const [formData, setFormData] = useState<BirthDetails>(defaultDetails);
  const parseLocalDate = (dateStr: string) => {
    const parts = (dateStr || '1995-10-24').split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return new Date(1995, 9, 24);
  };

  const [dateSystem, setDateSystem] = useState<'ad' | 'bs'>('ad');

  // Initial BS date calculation
  const initialAdDate = parseLocalDate(formData.dob);
  const initialBs = convertADToBS(isNaN(initialAdDate.getTime()) ? new Date() : initialAdDate);

  const [bsYear, setBsYear] = useState<number>(initialBs.year);
  const [bsMonth, setBsMonth] = useState<number>(initialBs.month);
  const [bsDay, setBsDay] = useState<number>(initialBs.day);

  const [searchQuery, setSearchQuery] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const filteredCities = CITY_PRESETS.filter(
    (c) =>
      c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCitySelect = (cityObj: (typeof CITY_PRESETS)[0]) => {
    setFormData((prev) => ({
      ...prev,
      birthPlace: `${cityObj.city}, ${cityObj.country}`,
      latitude: cityObj.latitude,
      longitude: cityObj.longitude,
      timezoneOffsetMinutes: cityObj.timezoneOffsetMinutes,
      timezoneName: cityObj.timezoneName,
    }));
    setSearchQuery(`${cityObj.city}, ${cityObj.country}`);
    setShowCityDropdown(false);
  };

  const handleAdChange = (adStr: string) => {
    setFormData((prev) => ({ ...prev, dob: adStr }));
    const d = parseLocalDate(adStr);
    if (!isNaN(d.getTime())) {
      const bs = convertADToBS(d);
      setBsYear(bs.year);
      setBsMonth(bs.month);
      setBsDay(bs.day);
    }
  };

  const handleBsChange = (y: number, m: number, d: number) => {
    setBsYear(y);
    setBsMonth(m);
    setBsDay(d);
    const adDate = convertBSToAD(y, m, d);
    const adString = formatADDateString(adDate);
    setFormData((prev) => ({ ...prev, dob: adString }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-slate-900 border border-amber-900/50 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-amber-900/30">
        <h2 className="text-lg sm:text-xl font-serif font-bold text-amber-200 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          {t.birthDetailsForm}
        </h2>
        <span className="text-xs bg-amber-950/80 text-amber-300 border border-amber-800/60 px-2.5 py-1 rounded-full font-mono shrink-0">
          {formData.calculationMethod === 'surya_siddhanta' ? 'सौर्य सिद्धान्त System' : 'दृक् सिद्धान्त DE441'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Calculation Method Selection Toggle */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300/90 mb-2 flex items-center justify-between">
            <span>{language === 'ne' ? 'गणना पद्धति (Calculation System)' : 'Calculation Method'}</span>
            <span className="text-[11px] text-amber-400 font-normal lowercase">
              ({formData.calculationMethod === 'surya_siddhanta' ? 'Surya Siddhanta' : 'Drik Siddhanta'})
            </span>
          </label>
          <div className="grid grid-cols-2 gap-2 bg-slate-950/90 p-1.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, calculationMethod: 'drik' })}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                (formData.calculationMethod || 'drik') === 'drik'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 shadow-md ring-1 ring-amber-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>[ दृक् सिद्धान्त ]</span>
              <span className="text-[10px] opacity-80 font-mono">Modern Ephemeris</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, calculationMethod: 'surya_siddhanta' })}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                formData.calculationMethod === 'surya_siddhanta'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 shadow-md ring-1 ring-amber-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span>[ सौर्य सिद्धान्त ]</span>
              <span className="text-[10px] opacity-80 font-mono">Canonical Surya Siddhanta</span>
            </button>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300/90 mb-1.5">
            {t.name}
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter full name..."
            className="w-full bg-slate-800/80 border border-slate-700 focus:border-amber-500 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-1 focus:ring-amber-500/50"
          />
        </div>

        {/* DOB & TOB Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-amber-300/90 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                {t.dob} ({dateSystem === 'ad' ? 'AD / इस्वी' : 'BS / विक्रम'})
              </label>
              <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-[10px]">
                <button
                  type="button"
                  onClick={() => setDateSystem('ad')}
                  className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                    dateSystem === 'ad' ? 'bg-amber-600 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  AD
                </button>
                <button
                  type="button"
                  onClick={() => setDateSystem('bs')}
                  className={`px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                    dateSystem === 'bs' ? 'bg-amber-600 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  BS (विक्रम संवत्)
                </button>
              </div>
            </div>

            {dateSystem === 'ad' ? (
              <input
                type="date"
                required
                value={formData.dob}
                onChange={(e) => handleAdChange(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 focus:border-amber-500 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-1 focus:ring-amber-500/50"
              />
            ) : (
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="Year (e.g. 2052)"
                  min="1970"
                  max="2100"
                  value={bsYear}
                  onChange={(e) => handleBsChange(parseInt(e.target.value) || 2080, bsMonth, bsDay)}
                  className="bg-slate-800/80 border border-slate-700 focus:border-amber-500 text-slate-100 rounded-xl px-2.5 py-2.5 text-xs outline-none"
                />
                <select
                  value={bsMonth}
                  onChange={(e) => handleBsChange(bsYear, parseInt(e.target.value) || 1, bsDay)}
                  className="bg-slate-800/80 border border-slate-700 focus:border-amber-500 text-slate-100 rounded-xl px-2 py-2.5 text-xs outline-none"
                >
                  {NEPALI_MONTHS_EN.map((mName, idx) => (
                    <option key={idx} value={idx + 1}>
                      {idx + 1}. {mName} ({NEPALI_MONTHS_NP[idx]})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Day"
                  min="1"
                  max={getDaysInBSMonth(bsYear, bsMonth - 1)}
                  value={bsDay}
                  onChange={(e) => handleBsChange(bsYear, bsMonth, parseInt(e.target.value) || 1)}
                  className="bg-slate-800/80 border border-slate-700 focus:border-amber-500 text-slate-100 rounded-xl px-2.5 py-2.5 text-xs outline-none"
                />
              </div>
            )}
            <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950/80 p-2 rounded-xl border border-slate-800">
              <div className="text-amber-300">
                <span className="text-slate-400 text-[10px] block">AD (इस्वी):</span>
                {formData.dob}
              </div>
              <div className="text-amber-300">
                <span className="text-slate-400 text-[10px] block">BS (विक्रम):</span>
                {convertADToBS(parseLocalDate(formData.dob)).formatted}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300/90 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {t.tob}
            </label>
            <input
              type="time"
              step="1"
              required
              value={formData.tob}
              onChange={(e) => setFormData({ ...formData, tob: e.target.value })}
              className="w-full bg-slate-800/80 border border-slate-700 focus:border-amber-500 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-1 focus:ring-amber-500/50"
            />
          </div>
        </div>

        {/* City Search / Preset */}
        <div className="relative">
          <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300/90 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            {t.birthPlace}
          </label>
          <input
            type="text"
            value={searchQuery || formData.birthPlace}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setFormData({ ...formData, birthPlace: e.target.value });
              setShowCityDropdown(true);
            }}
            onFocus={() => setShowCityDropdown(true)}
            placeholder={t.searchCityPlaceholder}
            className="w-full bg-slate-800/80 border border-slate-700 focus:border-amber-500 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all focus:ring-1 focus:ring-amber-500/50"
          />

          {showCityDropdown && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto divide-y divide-slate-700/50">
              {filteredCities.length > 0 ? (
                filteredCities.map((c, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => handleCitySelect(c)}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-200 hover:bg-amber-600/20 hover:text-amber-200 transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium">{c.city}, {c.country}</span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {c.latitude.toFixed(2)}°, {c.longitude.toFixed(2)}°
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-xs text-slate-400">
                  Custom location (Ensure accurate Lat / Long below)
                </div>
              )}
            </div>
          )}
        </div>

        {/* Latitude, Longitude, Timezone Offset Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              {t.latitude}
            </label>
            <input
              type="number"
              step="0.0001"
              required
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-xs font-mono focus:border-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              {t.longitude}
            </label>
            <input
              type="number"
              step="0.0001"
              required
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-xs font-mono focus:border-amber-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1">
              <Globe className="w-3 h-3 text-amber-400" />
              Offset (Mins)
            </label>
            <input
              type="number"
              step="1"
              required
              value={formData.timezoneOffsetMinutes}
              onChange={(e) => setFormData({ ...formData, timezoneOffsetMinutes: parseInt(e.target.value, 10) || 0 })}
              className="w-full bg-slate-800/80 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 text-xs font-mono focus:border-amber-500 outline-none"
            />
          </div>
        </div>

        {/* DST Checkbox */}
        <div className="flex items-center space-x-2 pt-1">
          <input
            type="checkbox"
            id="dstCheck"
            checked={formData.isDst}
            onChange={(e) => setFormData({ ...formData, isDst: e.target.checked })}
            className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-700 bg-slate-800"
          />
          <label htmlFor="dstCheck" className="text-xs text-slate-300 cursor-pointer">
            {t.dst}
          </label>
        </div>

        {/* Accuracy Warning Note */}
        <div className="p-3 bg-amber-950/40 border border-amber-800/40 rounded-xl text-xs text-amber-300/90 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-200">{t.warningTitle}</p>
            <p className="text-[11px] text-amber-300/80 mt-0.5">{t.warningMsg}</p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-600/25 transition-all text-sm tracking-wide cursor-pointer flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          {t.generateButton}
        </button>
      </form>
    </div>
  );
};
