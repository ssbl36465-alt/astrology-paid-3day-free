import React from 'react';
import { Sparkles, Phone, MessageSquare, BookOpen, Smartphone, ShieldCheck, CheckCircle } from 'lucide-react';
import { Language } from '../types/astrology';

interface AppServiceCardProps {
  language: Language;
}

export const AppServiceCard: React.FC<AppServiceCardProps> = ({ language }) => {
  const isNe = language === 'ne';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-br from-amber-950/90 via-slate-900 to-amber-950/80 border-2 border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-100">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-amber-900/50">
            <div className="flex items-center space-x-3 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/30">
                <Smartphone className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {isNe ? 'विशेष व्यावसायिक सेवा' : 'Special Professional Service'}
                </span>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-amber-200 mt-1 leading-snug">
                  {isNe ? '३००+ पेज फलित चिना बनाउने एप' : '300+ Page Falit China Banaune App'}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 px-3 py-1.5 rounded-xl font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {isNe ? 'सम्पर्क खुला (24/7)' : 'Active Support'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-slate-900/80 p-5 rounded-2xl border border-amber-900/40">
              <h3 className="text-lg font-serif font-bold text-amber-300 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                {isNe ? 'एपका मुख्य विशेषताहरू:' : 'Key App Features:'}
              </h3>
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{isNe ? 'जन्मदेखि मृत्युसम्मको सम्पूर्ण जीवनकाल समेटिएको ३००+ पेजको विस्तृत फलित (जन्मपत्रिका, गोचर, दशा, महादशा, वर्षफल आदि)।' : 'Complete 300+ page comprehensive life predictions from birth to death.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{isNe ? 'सटीक नेपाली चिना, कुण्डली चक्र (उत्तर भारतीय, दक्षिण भारतीय, पूर्वीय शैली) र गृह दशा गणना।' : 'Accurate Nepali Chinas, Kundali charts and planetary dasha calculations.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{isNe ? 'तपाईंको आफ्नै ब्रान्ड, नाम र लोगो अनुसार एन्ड्रोइड एप (APK) तथा वेब सिस्टम निर्माण गरिदिने।' : 'Custom branded Android app (APK) & web system developed for your business.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{isNe ? '३००+ पेज फलित चिना, वास्तुशास्त्र (Vastu) घर/कार्यालय परिक्षण, कुण्डली चक्र तथा गृह दशा गणनासहितको पूर्ण सफ्टवेयर।' : 'Complete software with 300+ page falit chinas, Vastu Shastra home/office analysis, kundali charts & dasha calculations.'}</span>
                </li>
              </ul>
            </div>

            <div className="space-y-5 bg-gradient-to-b from-amber-900/30 to-slate-900/90 p-6 rounded-2xl border border-amber-600/40 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-lg font-serif font-bold text-amber-200 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  {isNe ? 'आजै सम्पर्क गर्नुहोस्:' : 'Contact Us Today:'}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {isNe 
                    ? 'तपाईंलाई आफ्नै ज्योतिष केन्द्र, पण्डित सेवा वा व्यावसायिक उद्देश्यका लागि उच्च गुणस्तरको नेपाली चिना तथा फलित एप आवश्यक परेमा तल दिइएको नम्बरमा WhatsApp वा Call गर्नुहोस।'
                    : 'If you need a high-quality Nepali chinas or falit app for your astrology center, contact us via WhatsApp or Call.'}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="bg-slate-950/90 border border-amber-500/40 rounded-xl p-4 text-center">
                  <p className="text-xs text-amber-400 font-mono tracking-wider mb-1">
                    {isNe ? 'WhatsApp / Call सम्पर्क नम्बर' : 'WhatsApp / Call Number'}
                  </p>
                  <a 
                    href="tel:+9779863991384" 
                    className="text-2xl sm:text-3xl font-mono font-bold text-amber-200 hover:text-white transition-colors tracking-wide"
                  >
                    +977 9863991384
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="https://wa.me/9779863991384?text=नमस्ते,%20मलाई%20नेपाली%20चिना%20तथा%20३००+%20पेजको%20फलित%20ज्योतिष%20एप%20बनाउनु%20छ।"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all text-sm"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href="tel:+9779863991384"
                    className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg transition-all text-sm"
                  >
                    <Phone className="w-5 h-5" />
                    <span>{isNe ? 'थुप्रै कल गर्नुहोस्' : 'Direct Call'}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
