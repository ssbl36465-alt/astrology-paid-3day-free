// File Name: src/components/CallHandler.js
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import {
  Wallet,
  AlertTriangle,
  FileText,
  Calendar,
  Clock,
  MapPin,
  User,
  Send,
  Sparkles,
  PhoneCall,
  Loader2,
  X
} from 'lucide-react';

/**
 * Utility: Check Wallet Balance in Firebase or localStorage
 */
export async function checkWalletBalance(customerId = 'default_user', minRequired = 20) {
  let balance = 0;
  try {
    if (db) {
      const userSnap = await getDoc(doc(db, 'users', String(customerId)));
      if (userSnap.exists() && userSnap.data().walletBalance !== undefined) {
        balance = Number(userSnap.data().walletBalance);
      } else {
        const local = localStorage.getItem('vaidik_client_wallet_balance');
        balance = local !== null ? parseFloat(local) : 500;
      }
    } else {
      const local = localStorage.getItem('vaidik_client_wallet_balance');
      balance = local !== null ? parseFloat(local) : 500;
    }
  } catch (e) {
    const local = localStorage.getItem('vaidik_client_wallet_balance');
    balance = local !== null ? parseFloat(local) : 500;
  }

  return {
    balance,
    isSufficient: balance > 0 && balance >= minRequired,
  };
}

/**
 * Utility: Send Birth Details directly to Guru's Firestore Inbox
 */
export async function sendBirthDetailsToGuruInbox({
  guru,
  customerId,
  customerName,
  callType,
  birthDetails,
}) {
  const safeCustomerId = String(customerId || `cust_${Date.now()}`);
  const roomId = `room_${guru.id}_${safeCustomerId}`;
  const requestId = `req_${guru.id}_${safeCustomerId}_${Date.now()}`;

  const payload = {
    id: requestId,
    guruId: String(guru.id),
    guruName: guru.name,
    customerId: safeCustomerId,
    customerName: customerName || 'Seeker',
    callType,
    roomId,
    birthDetails,
    status: 'preparing', // 'preparing' | 'accepted' | 'rejected'
    prepDurationSeconds: 120,
    createdAt: new Date().toISOString(),
  };

  try {
    if (db) {
      // 1. Write to global consultation requests
      await setDoc(doc(db, 'consultation_requests', requestId), payload);
      // 2. Write to Guru's private inbox collection
      await setDoc(doc(db, 'gurus', String(guru.id), 'inbox', requestId), payload);
    }
  } catch (err) {
    console.warn('Firestore inbox dispatch note:', err);
  }

  // Backup in localStorage
  try {
    const localQueue = JSON.parse(localStorage.getItem('vaidik_consultation_requests') || '[]');
    localStorage.setItem('vaidik_consultation_requests', JSON.stringify([payload, ...localQueue]));
  } catch (e) {}

  return { requestId, roomId, payload };
}

/**
 * CallHandler Component
 * Manages the complete 4-step workflow:
 * 1. Wallet Check
 * 2. Birth Details Modal
 * 3. 2-Minute Preparation Delay
 * 4. Call Trigger
 */
export default function CallHandler({
  guru,
  callType = 'audio',
  isOpen,
  onClose,
  onStartZegoCall,
  onOpenWallet,
  currentUserId,
  currentUserName,
}) {
  const [step, setStep] = useState('check_wallet'); // 'wallet_insufficient' | 'birth_form' | 'prep_timer'
  const [walletBalance, setWalletBalance] = useState(0);

  // Birth Details State
  const [name, setName] = useState(currentUserName || localStorage.getItem('vaidik_client_name') || '');
  const [dateType, setDateType] = useState('BS');
  const [year, setYear] = useState(localStorage.getItem('vaidik_client_dob_year') || '2055');
  const [month, setMonth] = useState(localStorage.getItem('vaidik_client_dob_month') || '05');
  const [day, setDay] = useState(localStorage.getItem('vaidik_client_dob_day') || '15');
  const [time, setTime] = useState(localStorage.getItem('vaidik_client_dob_time') || '08:30 AM');
  const [place, setPlace] = useState(localStorage.getItem('vaidik_client_dob_place') || 'Kathmandu');
  const [gender, setGender] = useState('male');
  const [topic, setTopic] = useState('कुण्डली विश्लेषण तथा फलादेश');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2-Minute Timer State
  const [timeLeft, setTimeLeft] = useState(120);
  const [activeReqId, setActiveReqId] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setStep('check_wallet');
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    // Step 1: Check Wallet Balance
    const verifyWallet = async () => {
      const minAmount = callType === 'video' ? 25 : callType === 'audio' ? 20 : 10;
      const { balance, isSufficient } = await checkWalletBalance(currentUserId, minAmount);
      setWalletBalance(balance);

      if (!isSufficient) {
        setStep('wallet_insufficient');
      } else {
        setStep('birth_form');
      }
    };

    verifyWallet();
  }, [isOpen, callType, currentUserId]);

  // Timer effect for 2-Minute preparation
  useEffect(() => {
    let unsubscribe = null;

    if (step === 'prep_timer') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Listen for Guru's acceptance
      if (db && activeReqId) {
        try {
          const snapRef = doc(db, 'consultation_requests', activeReqId);
          unsubscribe = onSnapshot(snapRef, (snapshot) => {
            if (snapshot.exists() && snapshot.data().status === 'accepted') {
              if (timerRef.current) clearInterval(timerRef.current);
              handleTriggerCall();
            }
          });
        } catch (e) {}
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [step, activeReqId]);

  // Step 2 -> 3 Submission
  const handleSubmitDetails = async (e) => {
    e.preventDefault();
    if (!name.trim() || !year || !time || !place.trim()) {
      alert('कृपया सबै अनिवार्य विवरणहरू भर्नुहोस्।');
      return;
    }

    setIsSubmitting(true);
    const birthData = {
      fullName: name.trim(),
      dateType,
      birthDate: `${year}-${month}-${day} (${dateType})`,
      birthTime: time,
      birthPlace: place,
      gender,
      topic,
    };

    const { requestId } = await sendBirthDetailsToGuruInbox({
      guru,
      customerId: currentUserId,
      customerName: name.trim(),
      callType,
      birthDetails: birthData,
    });

    setIsSubmitting(false);
    setActiveReqId(requestId);
    setTimeLeft(120);
    setStep('prep_timer');
  };

  // Step 4: Trigger Call
  const handleTriggerCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const customerId = String(currentUserId || `cust_${Date.now()}`);
    const roomId = `room_${guru.id}_${customerId}`;
    const birthData = {
      fullName: name.trim(),
      dateType,
      birthDate: `${year}-${month}-${day} (${dateType})`,
      birthTime: time,
      birthPlace: place,
      gender,
      topic,
    };

    onClose();
    if (typeof onStartZegoCall === 'function') {
      onStartZegoCall({
        guru,
        callType,
        roomId,
        customerId,
        customerName: name.trim() || 'Seeker',
        birthDetails: birthData,
      });
    }
  };

  const handleInstantAccept = async () => {
    if (db && activeReqId) {
      try {
        await updateDoc(doc(db, 'consultation_requests', activeReqId), {
          status: 'accepted',
        });
      } catch (e) {}
    }
    handleTriggerCall();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-4 animate-fadeIn">
      {/* 1. Wallet Insufficient Popup */}
      {step === 'wallet_insufficient' && (
        <div className="bg-slate-900 border border-rose-500/50 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-100">
          <div className="flex items-center justify-between pb-2 border-b border-rose-900/40">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              <span>वालेट ब्यालेन्स अपुग</span>
            </div>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-4 text-center space-y-2">
            <Wallet className="w-10 h-10 text-rose-400 mx-auto" />
            <p className="text-sm font-semibold text-rose-200">
              तपाईंको वालेटमा पर्याप्त ब्यालेन्स छैन। कृपया रिचार्ज गर्नुहोस्।
            </p>
            <p className="text-xs text-slate-400">
              हालको ब्यालेन्स: <strong className="text-amber-300">रु {walletBalance}</strong>
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onOpenWallet) onOpenWallet();
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
            >
              <Wallet className="w-4 h-4" />
              <span>Recharge Wallet (वालेट रिचार्ज)</span>
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs">
              रद्द
            </button>
          </div>
        </div>
      )}

      {/* 2. Pre-Call Birth Details Form */}
      {step === 'birth_form' && (
        <div className="bg-slate-900 border border-amber-600/60 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 text-slate-100 max-h-[92vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-amber-900/40">
            <div className="flex items-center gap-2 text-amber-300 font-bold text-base">
              <FileText className="w-5 h-5 text-amber-400" />
              <span>कुण्डली विवरण पेश गर्नुहोस् (Pre-Call Birth Form)</span>
            </div>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmitDetails} className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-300 mb-1 block">पूरा नाम (Full Name) *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="तपाईंको नाम"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-300">जन्म मिति (Date of Birth) *</label>
                <div className="flex gap-1 bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setDateType('BS')}
                    className={`px-2 py-0.5 rounded font-bold ${dateType === 'BS' ? 'bg-amber-600 text-slate-950' : 'text-slate-400'}`}
                  >
                    वि.सं. (BS)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDateType('AD')}
                    className={`px-2 py-0.5 rounded font-bold ${dateType === 'AD' ? 'bg-amber-600 text-slate-950' : 'text-slate-400'}`}
                  >
                    ई.सं. (AD)
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  required
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="Year (साल)"
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-center"
                />
                <input
                  type="number"
                  required
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  placeholder="Month (महिना)"
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-center"
                />
                <input
                  type="number"
                  required
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  placeholder="Day (गते/दिन)"
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-300 mb-1 block">जन्म समय (Birth Time) *</label>
                <input
                  type="text"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="उदा. 08:30 AM"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-300 mb-1 block">जन्मस्थान / जिल्ला *</label>
                <input
                  type="text"
                  required
                  value={place}
                  onChange={(e) => setPlace(e.target.value)}
                  placeholder="उदा. काठमाडौं"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 font-bold py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>इनबक्समा पठाउँदै...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>विवरण गुरुलाई पठाउनुहोस् (Send Details)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. 2-Minute Preparation Waiting Screen */}
      {step === 'prep_timer' && (
        <div className="bg-slate-900 border border-amber-600/60 rounded-3xl max-w-md w-full p-6 shadow-2xl text-center space-y-4 text-slate-100">
          <div className="w-20 h-20 mx-auto relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
            <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>

          <div>
            <h3 className="text-base font-serif font-bold text-amber-200">
              गुरुजीले तपाईंको कुण्डली तयार पार्दै हुनुहुन्छ, कृपया १-२ मिनेट पर्खनुहोस्...
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              जन्म विवरण गुरु <strong className="text-amber-300">{guru.name}</strong> को इनबक्समा पुगिसकेको छ।
            </p>
          </div>

          <div className="bg-slate-950 border border-amber-600/40 rounded-2xl p-3 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>काउन्टडाउन:</span>
              <span className="font-mono font-bold text-amber-300 text-sm">
                ⏱️ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-1000"
                style={{ width: `${((120 - timeLeft) / 120) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={handleInstantAccept}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-slate-950 font-bold py-3 rounded-xl shadow-lg text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span>Accept & Call Now (कुण्डली तयार भयो, कल सुरु गर्नुहोस्)</span>
            </button>
            <button type="button" onClick={onClose} className="text-xs text-slate-400 hover:underline">
              रद्द गर्नुहोस्
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
