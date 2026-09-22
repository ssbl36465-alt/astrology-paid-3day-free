import React, { useState } from 'react';
import { Language } from '../types/astrology';
import { Compass, Home, CheckCircle2, AlertTriangle, Shield, Sparkles, MapPin, Sun, Moon, Info, ArrowRight, RefreshCw } from 'lucide-react';

interface VastuViewProps {
  language: Language;
  theme: 'dark' | 'light';
}

export const VastuView: React.FC<VastuViewProps> = ({ language, theme }) => {
  const isNe = language === 'ne';
  const isDark = theme === 'dark';

  const [selectedZone, setSelectedZone] = useState<string>('north-east');
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    pujaRoomNE: true,
    kitchenSE: true,
    masterBedSW: true,
    toiletNE: false,
    mainDoorEast: true,
    waterTankUndergroundNE: true,
    heavyStorageNW: false,
  });

  const toggleCheck = (key: string) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const zones = [
    {
      id: 'north-east',
      nameNe: 'ईशानी कोण (उत्तर-पूर्व / North-East)',
      nameEn: 'Ishanya (North-East - Water Element)',
      deityNe: 'भगवान शिव / ईश्वर',
      deityEn: 'Lord Shiva / Jupiter',
      bestForNe: 'पूजा कोठा, भूमिगत पानी ट्यांकी, ध्यान कक्ष, अध्ययन कक्ष',
      bestForEn: 'Prayer Room, Underground Water Tank, Meditation Room, Study',
      avoidNe: 'शौचालय, भान्सा कोठा, भारी सामान, सेप्टिक ट्यांकी',
      avoidEn: 'Toilet, Kitchen, Heavy Storage, Septic Tank',
      colorNe: 'सेतो, हल्का पँहेलो, हल्का नीलो',
      colorEn: 'White, Light Yellow, Light Blue',
    },
    {
      id: 'south-east',
      nameNe: 'आग्नेय कोण (दक्षिण-पूर्व / South-East)',
      nameEn: 'Agneya (South-East - Fire Element)',
      deityNe: 'अग्निदेव / शुक्र',
      deityEn: 'Agni / Venus',
      bestForNe: 'भान्सा कोठा (Kitchen), विद्युतीय उपकरण, बोइलर',
      bestForEn: 'Kitchen, Electrical Switchboards, Inverter/Generator',
      avoidNe: 'पानीको ट्यांकी, बेडरूम, शौचालय',
      avoidEn: 'Water Tank, Master Bedroom, Toilet',
      colorNe: 'सुन्तला, गुलाबी, रातो',
      colorEn: 'Orange, Pink, Light Red',
    },
    {
      id: 'south-west',
      nameNe: 'नैऋत्य कोण (दक्षिण-पश्चिम / South-West)',
      nameEn: 'Nairutya (South-West - Earth Element)',
      deityNe: 'ऋतु / पितृ / राहु-केतु नियन्त्रक',
      deityEn: 'Nairuti / Earth / Rahu-Ketu',
      bestForNe: 'घरमूलीको मुख्य शयनकक्ष (Master Bedroom), भारी सामान',
      bestForEn: 'Master Bedroom, Heavy Safe/Locker, Heavy Furniture',
      avoidNe: 'पूजा कोठा, मुख्य प्रवेशद्वार, शौचालय, भूमिगत ट्यांकी',
      avoidEn: 'Prayer Room, Main Entrance, Toilet, Underground Tank',
      colorNe: 'पँहेलो, माटोको रङ्ग (Earth tones), खैरो',
      colorEn: 'Yellow, Earth Tones, Brown',
    },
    {
      id: 'north-west',
      nameNe: 'वायव्य कोण (उत्तर-पश्चिम / North-West)',
      nameEn: 'Vayavya (North-West - Air Element)',
      deityNe: 'पवनदेव / चन्द्रमा',
      deityEn: 'Vayu / Moon',
      bestForNe: 'गेस्ट रूम (Guest Room), अन्न भण्डार, ड्राइङ रुम, ग्यारेज',
      bestForEn: 'Guest Room, Grain Storage, Drawing Room, Garage',
      avoidNe: 'घरमूलीको कक्ष, भूमिगत पानीको मूल ट्यांकी',
      avoidEn: 'Master Bedroom, Main Underground Water Tank',
      colorNe: 'सेतो, सिल्भर, हल्का खैरो',
      colorEn: 'White, Silver, Light Grey',
    },
    {
      id: 'centre',
      nameNe: 'ब्रह्मस्थान (केन्द्र / Center)',
      nameEn: 'Brahmasthan (Center - Space Element)',
      deityNe: 'ब्रह्माजी / आकाश',
      deityEn: 'Lord Brahma / Ether',
      bestForNe: 'खुला हल, आँगन, प्रार्थना कक्ष (सफा र खुला रहनुपर्ने)',
      bestForEn: 'Open Hall, Courtyard (Must be kept clean & clutter-free)',
      avoidNe: 'भैर्य पर्खाल, पिलर, शौचालय, भान्सा वा भारी भँडार',
      avoidEn: 'Heavy Walls, Pillars, Toilet, Kitchen, Storage',
      colorNe: 'हल्का रङ्ग, खुला सेतो',
      colorEn: 'Light Tones, Open White',
    },
  ];

  const currentZoneData = zones.find(z => z.id === selectedZone) || zones[0];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className={`${isDark ? 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-amber-950/40 border-amber-800/40' : 'bg-gradient-to-r from-amber-100 via-white to-amber-50 border-amber-300'} border rounded-3xl p-6 shadow-xl relative overflow-hidden`}>
        <div className="absolute right-0 top-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="p-2.5 rounded-2xl bg-amber-600 text-slate-950 shadow-lg shadow-amber-600/30">
                <Compass className="w-6 h-6 animate-spin-slow" />
              </div>
              <h1 className={`text-2xl sm:text-3xl font-serif font-bold ${isDark ? 'text-amber-200' : 'text-amber-900'}`}>
                {isNe ? 'वास्तुशास्त्र तथा भवन परिक्षण' : 'Vastu Shastra & Direction Analysis'}
              </h1>
            </div>
            <p className={`text-sm max-w-2xl ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              {isNe 
                ? 'तपाईंको घर, फ्ल्याट वा कार्यालयको दिशा, पञ्चमहाभूत (पञ्चतत्व) र वास्तु दोष निवारणका लागि शास्त्रीय मार्गदर्शन।'
                : 'Classical guidance for house, flat or office directional alignment, five elements, and Vastu defect remediation.'}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-2xl border text-xs font-mono font-semibold ${isDark ? 'bg-amber-950/80 border-amber-700/60 text-amber-300' : 'bg-amber-100 border-amber-300 text-amber-900'}`}>
            {isNe ? 'दिशा तथा ऊर्जा संतुलन' : 'Energy & Directional Balance'}
          </div>
        </div>
      </div>

      {/* Main Grid: Zone Selector & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Direction / Zone Tabs (5 cols) */}
        <div className={`lg:col-span-5 ${isDark ? 'bg-slate-900 border-amber-900/40 text-slate-100' : 'bg-white border-amber-200 text-slate-900 shadow-xl'} border rounded-3xl p-5 space-y-4`}>
          <h2 className={`text-lg font-serif font-bold flex items-center gap-2 ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
            <Home className="w-5 h-5 text-amber-500" />
            {isNe ? 'मुख्य वास्तु क्षेत्रहरू (Zones)' : 'Primary Vastu Zones'}
          </h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {isNe ? 'विस्तृत जानकारी लिन तलको दिशा वा क्षेत्र चयन गर्नुहोस्:' : 'Select a zone below for detailed guidelines:'}
          </p>

          <div className="space-y-2">
            {zones.map((zone) => {
              const isSelected = selectedZone === zone.id;
              return (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZone(zone.id)}
                  className={`w-full text-left p-3.5 rounded-2xl transition-all flex items-center justify-between border ${
                    isSelected
                      ? isDark 
                        ? 'bg-amber-950/70 border-amber-600 text-amber-200 shadow-lg shadow-amber-950/50' 
                        : 'bg-amber-50 border-amber-500 text-amber-950 shadow-md'
                      : isDark 
                        ? 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800' 
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="font-medium text-sm">
                    {isNe ? zone.nameNe : zone.nameEn}
                  </span>
                  <ArrowRight className={`w-4 h-4 ${isSelected ? 'text-amber-500' : 'text-slate-400'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Zone Details & Remediation (7 cols) */}
        <div className={`lg:col-span-7 ${isDark ? 'bg-slate-900 border-amber-900/40 text-slate-100' : 'bg-white border-amber-200 text-slate-900 shadow-xl'} border rounded-3xl p-6 space-y-6`}>
          <div className="flex items-center justify-between pb-4 border-b border-amber-900/30">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-amber-500 font-semibold">
                {isNe ? 'क्षेत्र विश्लेषण' : 'Zone Analysis'}
              </span>
              <h3 className={`text-xl font-serif font-bold ${isDark ? 'text-amber-200' : 'text-amber-900'}`}>
                {isNe ? currentZoneData.nameNe : currentZoneData.nameEn}
              </h3>
            </div>
            <div className={`p-3 rounded-2xl ${isDark ? 'bg-amber-950/60 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
              <Sun className="w-6 h-6" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className={`${isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-slate-50 border-slate-200'} p-4 rounded-2xl border space-y-1.5`}>
              <span className={`text-xs font-semibold ${isDark ? 'text-amber-400' : 'text-amber-700'} flex items-center gap-1.5`}>
                <Sparkles className="w-4 h-4" /> {isNe ? 'अधिपति देवता / ग्रह' : 'Ruling Deity / Planet'}
              </span>
              <p className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {isNe ? currentZoneData.deityNe : currentZoneData.deityEn}
              </p>
            </div>

            <div className={`${isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-slate-50 border-slate-200'} p-4 rounded-2xl border space-y-1.5`}>
              <span className={`text-xs font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'} flex items-center gap-1.5`}>
                <CheckCircle2 className="w-4 h-4" /> {isNe ? 'उत्तम प्रयोजन (Best For)' : 'Recommended Use'}
              </span>
              <p className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {isNe ? currentZoneData.bestForNe : currentZoneData.bestForEn}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className={`${isDark ? 'bg-rose-950/30 border-rose-900/50' : 'bg-rose-50 border-rose-200'} p-4 rounded-2xl border space-y-1.5`}>
              <span className={`text-xs font-semibold ${isDark ? 'text-rose-400' : 'text-rose-700'} flex items-center gap-1.5`}>
                <AlertTriangle className="w-4 h-4" /> {isNe ? 'वर्जित वस्तुहरू (Avoid)' : 'Things to Avoid'}
              </span>
              <p className={`font-medium ${isDark ? 'text-rose-200' : 'text-rose-900'}`}>
                {isNe ? currentZoneData.avoidNe : currentZoneData.avoidEn}
              </p>
            </div>

            <div className={`${isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-slate-50 border-slate-200'} p-4 rounded-2xl border space-y-1.5`}>
              <span className={`text-xs font-semibold ${isDark ? 'text-sky-400' : 'text-sky-700'} flex items-center gap-1.5`}>
                <Info className="w-4 h-4" /> {isNe ? 'शुभ रङ्ग (Auspicious Colors)' : 'Auspicious Colors'}
              </span>
              <p className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                {isNe ? currentZoneData.colorNe : currentZoneData.colorEn}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vastu Compliance Checklist */}
      <div className={`${isDark ? 'bg-slate-900 border-amber-900/40 text-slate-100' : 'bg-white border-amber-200 text-slate-900 shadow-xl'} border rounded-3xl p-6 space-y-4`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className={`text-lg font-serif font-bold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
              {isNe ? 'वास्तु पालना जाँचसूची (Vastu Checklist)' : 'Vastu Compliance Checklist'}
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {isNe ? 'तपाईंको घरमा रहेका मुख्य कक्षहरूको अवस्था जाँच गर्नुहोस्:' : 'Check the status of key rooms in your home:'}
            </p>
          </div>
          <span className={`text-xs px-3 py-1.5 rounded-xl font-mono ${isDark ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-amber-100 text-amber-900 border border-amber-300'}`}>
            {isNe ? 'आत्म-मूल्याङ्कन' : 'Self Assessment'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { key: 'pujaRoomNE', labelNe: 'पूजा कोठा ईशान (उत्तर-पूर्व) मा छ?', labelEn: 'Prayer room in North-East?' },
            { key: 'kitchenSE', labelNe: 'भान्सा कोठा आग्नेय (दक्षिण-पूर्व) मा छ?', labelEn: 'Kitchen in South-East?' },
            { key: 'masterBedSW', labelNe: 'मुख्य बेडरूम नैऋत्य (दक्षिण-पश्चिम) मा छ?', labelEn: 'Master bedroom in South-West?' },
            { key: 'toiletNE', labelNe: 'शौचालय ईशान (उत्तर-पूर्व) मा छ? (वर्जित)', labelEn: 'Toilet in North-East? (Avoid)' },
            { key: 'mainDoorEast', labelNe: 'मुख्य ढोका पूर्व वा उत्तर फर्केको छ?', labelEn: 'Main door facing East or North?' },
            { key: 'waterTankUndergroundNE', labelNe: 'भूमिगत पानी ट्यांकी ईशान कोणमा छ?', labelEn: 'Underground water tank in NE?' },
          ].map((item) => {
            const isChecked = checklist[item.key];
            return (
              <button
                key={item.key}
                onClick={() => toggleCheck(item.key)}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start justify-between gap-3 ${
                  isChecked
                    ? isDark ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200' : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : isDark ? 'bg-slate-800/60 border-slate-700/60 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span className="text-xs font-medium leading-relaxed">
                  {isNe ? item.labelNe : item.labelEn}
                </span>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                  isChecked 
                    ? 'bg-emerald-500 border-emerald-600 text-slate-950' 
                    : isDark ? 'border-slate-600 bg-slate-900' : 'border-slate-300 bg-white'
                }`}>
                  {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-slate-950 font-bold" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
