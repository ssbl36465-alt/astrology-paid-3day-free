import React, { useState } from 'react';
import { Scroll, ShieldCheck, CheckCircle2, AlertTriangle, Key, Sparkles, X, Phone, MessageSquare, Clock } from 'lucide-react';
import { redeemCode, startFreeTrial, hasTrialBeenUsed, SubscriptionData } from '../utils/subscriptionEngine';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subscription: SubscriptionData;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  subscription,
}) => {
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const trialUsed = hasTrialBeenUsed();

  if (!isOpen) return null;

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!code.trim()) {
      setErrorMsg('कृपया सक्रियता कोड (Activation Code) हाल्नुहोस्।');
      return;
    }

    const res = redeemCode(code);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleTrial = () => {
    setErrorMsg('');
    setSuccessMsg('');
    const res = startFreeTrial();
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-amber-600/50 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/80 p-2 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/30 mb-1">
            <Scroll className="w-8 h-8" />
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-amber-200">
            परम्परागत नेपाली पत्रिका सदस्यता
          </h3>
          <p className="text-xs sm:text-sm text-slate-300">
            यो विशेष सुविधा हेर्नको लागि कृपया सदस्यता लिनुहोस् र एडमिनबाट प्राप्त कोड प्रयोग गर्नुहोस्।
          </p>
        </div>

        {/* 3 Days Free Trial Banner */}
        <div className="bg-gradient-to-r from-amber-950/70 to-amber-900/40 border border-amber-500/40 rounded-2xl p-4 mb-6 text-center space-y-2.5">
          <div className="flex items-center justify-center gap-1.5 text-amber-300 font-bold text-sm">
            <Clock className="w-4 h-4 text-amber-400" /> ३ दिनको निःशुल्क ट्रायल (3 Days Free Trial)
          </div>
          <p className="text-xs text-slate-300">
            कुनै पनि कोड बिना सिधै ३ दिनसम्म सम्पूर्ण सुविधाहरू निःशुल्क प्रयोग गर्नुहोस् (प्रत्येक डिभाइसमा १ पटक मात्र)।
          </p>
          <button
            type="button"
            onClick={handleTrial}
            disabled={trialUsed}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow ${
              trialUsed
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-600/30'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            {trialUsed ? 'फ्री ट्रायल पहिले नै प्रयोग भइसकेको छ' : '३ दिन फ्री ट्रायल सुरु गर्नुहोस् (Start Free Trial)'}
          </button>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-800/90 border border-amber-500/30 rounded-2xl p-3 text-center relative overflow-hidden">
            <span className="absolute top-1 right-1 text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">लोकप्रिय</span>
            <span className="text-xs text-slate-400 block font-medium">३ महिना</span>
            <span className="text-lg font-serif font-bold text-amber-300">रु ३५१</span>
          </div>

          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3 text-center">
            <span className="text-xs text-slate-400 block font-medium">६ महिना</span>
            <span className="text-lg font-serif font-bold text-amber-300">रु ६५१</span>
          </div>

          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3 text-center">
            <span className="text-xs text-slate-400 block font-medium">१ वर्ष</span>
            <span className="text-lg font-serif font-bold text-amber-300">रु १,१११</span>
          </div>

          <div className="bg-amber-950/40 border border-amber-600/60 rounded-2xl p-3 text-center">
            <span className="text-[10px] text-amber-400 block font-bold">आजीवन (Lifetime)</span>
            <span className="text-lg font-serif font-bold text-amber-200">रु ३,९९९</span>
          </div>
        </div>

        {/* Payment / Contact Box */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 mb-6 text-xs space-y-2 text-slate-300">
          <p className="font-semibold text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" /> सदस्यता कोड कसरी लिने?
          </p>
          <p>
            माथिको प्याकेज अनुसार eSewa वा Khalti वा Bank Transfer मार्फत भुक्तानी गरेपछि एडमिनलाई सम्पर्क गरी सक्रियता कोड (Activation Code) प्राप्त गर्नुहोस्।
          </p>
          <div className="flex items-center gap-4 pt-1 font-mono text-amber-200 font-semibold flex-wrap">
            <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-amber-400" /> +977-9863991384</span>
            <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5 text-amber-400" /> WhatsApp / Call</span>
          </div>
        </div>

        {/* Code Activation Form */}
        <form onSubmit={handleRedeem} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-amber-300 mb-1.5 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-400" /> कोड प्रविष्ट गर्नुहोस् (Enter Code):
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="यहाँ कोड प्रविष्ट गर्नुहोस (उदा. JYOTISH-1Y-9911)"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-amber-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 uppercase tracking-wider"
            />
          </div>

          {errorMsg && (
            <div className="bg-red-950/80 border border-red-800/80 text-red-200 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 px-3 py-2 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" /> सदस्यता सक्रिय गर्नुहोस् (Activate)
          </button>
        </form>
      </div>
    </div>
  );
};
