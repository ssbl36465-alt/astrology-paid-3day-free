// File Name: src/components/GuruCard.js
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import {
  Video,
  Phone,
  MessageSquare,
  Star,
  Award,
  Clock,
  Calendar,
  MapPin,
  User,
  AlertTriangle,
  Wallet,
  Sparkles,
  CheckCircle2,
  X,
  FileText,
  Send,
  Loader2,
  PhoneCall
} from 'lucide-react';

/**
 * GuruCard Component
 * Complete 4-Step Consultation Workflow:
 * 1. Wallet Balance Verification (Block if <= 0)
 * 2. Pre-Call Birth Details Modal (BS/AD, Time, Place)
 * 3. Auto-Send to Guru Firestore Inbox + 2-Minute Kundali Preparation Delay (Waiting Screen)
 * 4. Call Initiation via ZegoCloud with Synchronized Room ID
 */
export default function GuruCard({
  guru,
  currentUserId,
  currentUserName,
  onStartCall,
  onStartChat,
  onOpenWallet,
}) {
  // Real-time Online Status
  const [isOnline, setIsOnline] = useState(
    guru?.isOnline !== undefined ? Boolean(guru.isOnline) : guru?.status === 'online'
  );
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Workflow Modals State
  const [activeWorkflowModal, setActiveWorkflowModal] = useState(null); 
  // 'wallet_low' | 'birth_form' | 'prep_waiting' | null
  const [pendingCallType, setPendingCallType] = useState('audio'); // 'audio' | 'video' | 'chat'
  const [userWalletBalance, setUserWalletBalance] = useState(500);

  // Birth Details Form State
  const [clientName, setClientName] = useState(
    currentUserName || localStorage.getItem('vaidik_client_name') || ''
  );
  const [dateType, setDateType] = useState('BS'); // 'BS' | 'AD'
  const [birthYear, setBirthYear] = useState(
    localStorage.getItem('vaidik_client_dob_year') || '2055'
  );
  const [birthMonth, setBirthMonth] = useState(
    localStorage.getItem('vaidik_client_dob_month') || '05'
  );
  const [birthDay, setBirthDay] = useState(
    localStorage.getItem('vaidik_client_dob_day') || '15'
  );
  const [birthTime, setBirthTime] = useState(
    localStorage.getItem('vaidik_client_dob_time') || '08:30 AM'
  );
  const [birthPlace, setBirthPlace] = useState(
    localStorage.getItem('vaidik_client_dob_place') || 'Kathmandu, Nepal'
  );
  const [gender, setGender] = useState('male');
  const [topic, setTopic] = useState('कुण्डली विश्लेषण तथा फलादेश (Kundali Analysis)');
  const [isSubmittingDetails, setIsSubmittingDetails] = useState(false);

  // 2-Minute Prep Countdown Timer State
  const [countdownSeconds, setCountdownSeconds] = useState(120); // 2 minutes (120s)
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [requestStatus, setRequestStatus] = useState('preparing'); // 'preparing' | 'accepted'
  const timerRef = useRef(null);

  // 1. Listen for Real-Time Online Status from Firestore
  useEffect(() => {
    let unsubscribe = null;
    let isMounted = true;

    if (!guru?.id) {
      setLoadingStatus(false);
      return;
    }

    try {
      if (db) {
        const guruDocRef = doc(db, 'gurus', String(guru.id));
        unsubscribe = onSnapshot(
          guruDocRef,
          (snapshot) => {
            if (isMounted) {
              if (snapshot.exists()) {
                const data = snapshot.data();
                const onlineVal =
                  data.isOnline !== undefined
                    ? Boolean(data.isOnline)
                    : data.status === 'online';
                setIsOnline(onlineVal);
              } else {
                setIsOnline(
                  guru.isOnline !== undefined
                    ? Boolean(guru.isOnline)
                    : guru.status === 'online'
                );
              }
              setLoadingStatus(false);
            }
          },
          (err) => {
            console.warn('Firestore real-time subscription note:', err);
            if (isMounted) {
              setIsOnline(guru?.status === 'online' || guru?.isOnline === true);
              setLoadingStatus(false);
            }
          }
        );
      } else {
        setIsOnline(guru?.status === 'online' || guru?.isOnline === true);
        setLoadingStatus(false);
      }
    } catch (e) {
      setIsOnline(guru?.status === 'online' || guru?.isOnline === true);
      setLoadingStatus(false);
    }

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [guru?.id, guru?.isOnline, guru?.status]);

  // Fetch or sync wallet balance
  const checkCurrentWalletBalance = async () => {
    const customerId = String(
      currentUserId ||
      localStorage.getItem('vaidik_current_user_id') ||
      'cust_default'
    );

    let balance = 0;
    try {
      if (db) {
        const userDoc = await getDoc(doc(db, 'users', customerId));
        if (userDoc.exists() && userDoc.data().walletBalance !== undefined) {
          balance = Number(userDoc.data().walletBalance);
        } else {
          const localBal = localStorage.getItem('vaidik_client_wallet_balance');
          balance = localBal !== null ? parseFloat(localBal) : 500;
        }
      } else {
        const localBal = localStorage.getItem('vaidik_client_wallet_balance');
        balance = localBal !== null ? parseFloat(localBal) : 500;
      }
    } catch (e) {
      const localBal = localStorage.getItem('vaidik_client_wallet_balance');
      balance = localBal !== null ? parseFloat(localBal) : 500;
    }

    setUserWalletBalance(balance);
    return balance;
  };

  /**
   * STEP 1: Click Handler with Wallet Balance Verification
   */
  const handleActionClick = async (callType) => {
    // Online check
    if (!isOnline) {
      alert('गुरुजी हाल अफलाइन (Offline) हुनुहुन्छ। कृपया अनलाइन हुनुभएपछि सम्पर्क गर्नुहोस्।');
      return;
    }

    setPendingCallType(callType);

    // Verify wallet balance
    const currentBalance = await checkCurrentWalletBalance();
    const minRequired = callType === 'video' ? 25 : callType === 'audio' ? 20 : 10;

    if (currentBalance <= 0 || currentBalance < minRequired) {
      // Step 1: Show insufficient balance popup and block call/chat
      setActiveWorkflowModal('wallet_low');
      return;
    }

    // Step 2: Balance exists -> Open Pre-Call Birth Details Modal
    setActiveWorkflowModal('birth_form');
  };

  /**
   * STEP 2 & 3: Submit Birth Details, Save to Guru's Inbox, and Start 2-Minute Prep Countdown
   */
  const handleBirthDetailsSubmit = async (e) => {
    e.preventDefault();

    if (!clientName.trim() || !birthYear || !birthTime || !birthPlace.trim()) {
      alert('कृपया सबै अनिवार्य विवरणहरू (नाम, जन्म मिति, समय र स्थान) भर्नुहोस्।');
      return;
    }

    setIsSubmittingDetails(true);

    const customerId = String(
      currentUserId ||
      localStorage.getItem('vaidik_current_user_id') ||
      `cust_${Math.floor(100000 + Math.random() * 900000)}`
    );
    const customerName = clientName.trim();
    const roomId = `room_${guru.id}_${customerId}`;
    const requestId = `req_${guru.id}_${customerId}_${Date.now()}`;

    // Store in localStorage for user convenience
    localStorage.setItem('vaidik_client_name', customerName);
    localStorage.setItem('vaidik_client_dob_year', birthYear);
    localStorage.setItem('vaidik_client_dob_month', birthMonth);
    localStorage.setItem('vaidik_client_dob_day', birthDay);
    localStorage.setItem('vaidik_client_dob_time', birthTime);
    localStorage.setItem('vaidik_client_dob_place', birthPlace);

    const birthData = {
      fullName: customerName,
      dateType,
      birthDate: `${birthYear}-${birthMonth}-${birthDay} (${dateType})`,
      birthTime,
      birthPlace,
      gender,
      topic,
    };

    const requestPayload = {
      id: requestId,
      guruId: String(guru.id),
      guruName: guru.name,
      customerId,
      customerName,
      callType: pendingCallType,
      roomId,
      birthDetails: birthData,
      status: 'preparing', // 'preparing' -> 'accepted'
      createdAt: new Date().toISOString(),
      prepDurationSeconds: 120,
    };

    // Step 3: Push immediately into Guru's Firestore Inbox / Requests Collection
    try {
      if (db) {
        // Write to global consultation requests
        await setDoc(doc(db, 'consultation_requests', requestId), requestPayload);
        // Also write to Guru's personal inbox collection
        await setDoc(doc(db, 'gurus', String(guru.id), 'inbox', requestId), requestPayload);
      }
    } catch (err) {
      console.warn('Firestore inbox write notice (using fallback):', err);
    }

    // Save in local storage queue
    try {
      const existing = JSON.parse(localStorage.getItem('vaidik_consultation_requests') || '[]');
      localStorage.setItem(
        'vaidik_consultation_requests',
        JSON.stringify([requestPayload, ...existing])
      );
    } catch (e) {}

    setIsSubmittingDetails(false);
    setActiveRequestId(requestId);
    setRequestStatus('preparing');
    setCountdownSeconds(120); // Reset to 2 minutes
    setActiveWorkflowModal('prep_waiting'); // Move to 2-minute waiting screen
  };

  /**
   * STEP 3: 2-Minute Preparation Countdown Timer & Firestore Real-Time Listener
   */
  useEffect(() => {
    let unsubscribe = null;

    if (activeWorkflowModal === 'prep_waiting') {
      // Countdown interval
      timerRef.current = setInterval(() => {
        setCountdownSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Time expired -> Automatically ready to connect
            setRequestStatus('accepted');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Listen to Firestore if Guru clicks "Accept & Call Now"
      if (db && activeRequestId) {
        try {
          const reqRef = doc(db, 'consultation_requests', activeRequestId);
          unsubscribe = onSnapshot(reqRef, (snap) => {
            if (snap.exists()) {
              const data = snap.data();
              if (data.status === 'accepted') {
                setRequestStatus('accepted');
                if (timerRef.current) clearInterval(timerRef.current);
              }
            }
          });
        } catch (e) {}
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [activeWorkflowModal, activeRequestId]);

  /**
   * STEP 4: Launch Call when Guru Accepts or Timer Completes
   */
  const handleLaunchCall = () => {
    const customerId = String(
      currentUserId ||
      localStorage.getItem('vaidik_current_user_id') ||
      `cust_${Math.floor(100000 + Math.random() * 900000)}`
    );
    const roomId = `room_${guru.id}_${customerId}`;
    const customerName = clientName.trim() || 'Seeker';

    const birthData = {
      fullName: customerName,
      dateType,
      birthDate: `${birthYear}-${birthMonth}-${birthDay} (${dateType})`,
      birthTime,
      birthPlace,
      gender,
      topic,
    };

    // Close workflow modal
    setActiveWorkflowModal(null);

    // If chat type
    if (pendingCallType === 'chat') {
      if (typeof onStartChat === 'function') {
        onStartChat(guru, birthData);
      }
      return;
    }

    // Launch ZegoCloud Voice / Video Call
    if (typeof onStartCall === 'function') {
      onStartCall({
        guru,
        callType: pendingCallType, // 'audio' | 'video'
        roomId,
        customerId,
        customerName,
        birthDetails: birthData,
      });
    }
  };

  /**
   * Simulates Guru clicking "Accept & Call Now" immediately (for testing & instant Guru accept)
   */
  const handleGuruInstantAccept = async () => {
    setRequestStatus('accepted');
    if (timerRef.current) clearInterval(timerRef.current);

    if (db && activeRequestId) {
      try {
        await updateDoc(doc(db, 'consultation_requests', activeRequestId), {
          status: 'accepted',
          acceptedAt: new Date().toISOString(),
        });
      } catch (e) {}
    }

    handleLaunchCall();
  };

  // Format seconds to mm:ss
  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4">
      {/* Guru Header Info */}
      <div className="flex items-start gap-3.5">
        <div className="relative shrink-0">
          <img
            src={
              guru.certificateUrl ||
              guru.image ||
              'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'
            }
            alt={guru.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/60 shadow-md"
          />
          <span
            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
              isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'
            }`}
            title={isOnline ? 'Online' : 'Offline'}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h3 className="font-serif font-bold text-base text-amber-200 truncate">
              {guru.name}
            </h3>
            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{guru.rating || '4.9'}</span>
            </div>
          </div>
          <p className="text-xs text-amber-400/80 font-medium truncate mt-0.5">
            {Array.isArray(guru.specializations)
              ? guru.specializations.join(', ')
              : guru.specialty || 'Vedic Astrology & Vastu'}
          </p>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              {guru.experienceYears || guru.experience || '10+'} Years Exp
            </span>
          </div>
        </div>
      </div>

      {/* Online / Offline Status Badge */}
      <div className="py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
        <span className="text-slate-400 font-medium">Status:</span>
        {loadingStatus ? (
          <span className="text-slate-500 animate-pulse text-[11px]">Checking...</span>
        ) : isOnline ? (
          <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Guru Online (उपलब्ध)
          </span>
        ) : (
          <span className="text-rose-400 font-bold flex items-center gap-1.5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Guru Offline (अफलाइन)
          </span>
        )}
      </div>

      {/* Action Buttons: Chat, Audio Call, Video Call */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {/* Chat Button */}
        <button
          type="button"
          disabled={!isOnline}
          onClick={() => handleActionClick('chat')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition-all ${
            isOnline
              ? 'bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 cursor-pointer shadow hover:border-amber-500/50'
              : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed opacity-60'
          }`}
          title={isOnline ? 'Chat with Guru' : 'Guru is Offline'}
        >
          <MessageSquare className="w-4 h-4 mb-1 text-amber-400" />
          <span>Chat</span>
        </button>

        {/* Audio Call Button */}
        <button
          type="button"
          disabled={!isOnline}
          onClick={() => handleActionClick('audio')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition-all ${
            isOnline
              ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 cursor-pointer shadow hover:border-emerald-500'
              : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed opacity-60'
          }`}
          title={isOnline ? 'Direct Voice Call' : 'Guru is Offline'}
        >
          <Phone className="w-4 h-4 mb-1 text-emerald-400 animate-pulse" />
          <span>Audio Call</span>
        </button>

        {/* Video Call Button */}
        <button
          type="button"
          disabled={!isOnline}
          onClick={() => handleActionClick('video')}
          className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition-all ${
            isOnline
              ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 cursor-pointer shadow-lg hover:scale-[1.02]'
              : 'bg-slate-950 text-slate-600 border border-slate-900 cursor-not-allowed opacity-60'
          }`}
          title={isOnline ? 'Direct Video Call' : 'Guru is Offline'}
        >
          <Video className="w-4 h-4 mb-1 text-slate-950" />
          <span>Video Call</span>
        </button>
      </div>

      {/* =========================================================================
          WORKFLOW MODAL 1: WALLET INSUFFICIENT POPUP (Requirement 1)
         ========================================================================= */}
      {activeWorkflowModal === 'wallet_low' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-rose-500/50 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-rose-900/40">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-serif font-bold text-rose-200">
                  वालेट ब्यालेन्स अपुग (Insufficient Balance)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveWorkflowModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-4 text-center space-y-2">
              <Wallet className="w-10 h-10 text-rose-400 mx-auto" />
              <p className="text-sm font-semibold text-rose-200 leading-relaxed">
                तपाईंको वालेटमा पर्याप्त ब्यालेन्स छैन। कृपया पहिले रिचार्ज गर्नुहोस्।
              </p>
              <p className="text-xs text-slate-400">
                हालको ब्यालेन्स: <strong className="text-amber-300 font-mono">रु {userWalletBalance}</strong> (आवश्यक: कम्तीमा रु २०)
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveWorkflowModal(null);
                  if (typeof onOpenWallet === 'function') {
                    onOpenWallet();
                  } else {
                    alert('कृपया वालेट मेनुबाट eSewa वा Khalti मार्फत वालेट रिचार्ज गर्नुहोस्।');
                  }
                }}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
              >
                <Wallet className="w-4 h-4" />
                <span>वालेट रिचार्ज गर्नुहोस् (Recharge Wallet)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveWorkflowModal(null)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
              >
                रद्द
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          WORKFLOW MODAL 2: PRE-CALL BIRTH DETAILS SUBMISSION (Requirement 2)
         ========================================================================= */}
      {activeWorkflowModal === 'birth_form' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-3 sm:p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-amber-600/60 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative text-slate-100 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-900/40">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-serif font-bold text-amber-200 text-base">
                    कुण्डली विवरण पेश गर्नुहोस् (Birth Details)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    गुरु <strong className="text-amber-300">{guru.name}</strong> सँग कल/च्याट सुरु हुनुपूर्व जन्म विवरण अनिवार्य छ।
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveWorkflowModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBirthDetailsSubmit} className="space-y-3 text-xs">
              {/* Full Name */}
              <div>
                <label className="font-semibold text-slate-300 flex items-center gap-1 mb-1">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>पूरा नाम (Full Name) *</span>
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="तपाईंको पूरा नाम लेख्नुहोस्"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Date of Birth with BS / AD Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>जन्म मिति (Date of Birth) *</span>
                  </label>
                  {/* BS / AD Toggle */}
                  <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setDateType('BS')}
                      className={`px-2 py-0.5 rounded font-bold transition-all ${
                        dateType === 'BS'
                          ? 'bg-amber-600 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      वि.सं. (BS)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDateType('AD')}
                      className={`px-2 py-0.5 rounded font-bold transition-all ${
                        dateType === 'AD'
                          ? 'bg-amber-600 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      ई.सं. (AD)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    required
                    value={birthYear}
                    onChange={(e) => setBirthYear(e.target.value)}
                    placeholder={dateType === 'BS' ? 'साल (२०५५)' : 'Year (1998)'}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-center focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <input
                    type="number"
                    required
                    value={birthMonth}
                    onChange={(e) => setBirthMonth(e.target.value)}
                    placeholder="महिना (१-१२)"
                    min={1}
                    max={12}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-center focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <input
                    type="number"
                    required
                    value={birthDay}
                    onChange={(e) => setBirthDay(e.target.value)}
                    placeholder="गते/दिन (१-३२)"
                    min={1}
                    max={32}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 text-center focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Birth Time & Place */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-300 flex items-center gap-1 mb-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>जन्म समय (Birth Time) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={birthTime}
                    onChange={(e) => setBirthTime(e.target.value)}
                    placeholder="उदा. 08:30 AM / बिहान ८:३०"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 flex items-center gap-1 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>जन्मस्थान / जिल्ला (Place/District) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    placeholder="उदा. काठमाडौं / पोखरा"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Gender & Topic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-300 mb-1 block">लिङ्ग (Gender)</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="male">पुरुष (Male)</option>
                    <option value="female">महिला (Female)</option>
                    <option value="other">अन्य (Other)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 mb-1 block">परामर्शको मुख्य विषय</label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="कुण्डली विश्लेषण तथा फलादेश">कुण्डली विश्लेषण तथा फलादेश</option>
                    <option value="विवाह तथा गुण मिलान (Matchmaking)">विवाह तथा गुण मिलान (Matchmaking)</option>
                    <option value="करियर, जागिर तथा व्यवसाय">करियर, जागिर तथा व्यवसाय</option>
                    <option value="विदेश यात्रा तथा अध्ययन">विदेश यात्रा तथा अध्ययन</option>
                    <option value="स्वास्थ्य तथा ग्रह दशा निवारण">स्वास्थ्य तथा ग्रह दशा निवारण</option>
                  </select>
                </div>
              </div>

              {/* Submit Details Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingDetails}
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold py-2.5 rounded-xl shadow-xl flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  {isSubmittingDetails ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>गुरुको इनबक्समा पठाउँदै...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>विवरण गुरुलाई पठाउनुहोस् (Send Details to Guru)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          WORKFLOW MODAL 3: 2-MINUTE KUNDALI PREPARATION DELAY (Requirement 3 & 4)
         ========================================================================= */}
      {activeWorkflowModal === 'prep_waiting' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-amber-600/60 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-slate-100 text-center space-y-5">
            {/* Spinning Astro Mandala Icon */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin"></div>
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
                <Sparkles className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            {/* Waiting Status Copy */}
            <div className="space-y-1.5">
              <h3 className="text-lg font-serif font-bold text-amber-200">
                गुरुजीले तपाईंको कुण्डली तयार पार्दै हुनुहुन्छ...
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                तपाईंको जन्म विवरण गुरु <strong className="text-amber-300">{guru.name}</strong> को इनबक्समा सुरक्षित रूपमा पुगिसकेको छ। कुण्डली र ग्रह दशा हेर्न १-२ मिनेट समय लाग्नेछ।
              </p>
            </div>

            {/* 2-Minute Live Countdown Timer */}
            <div className="bg-slate-950 border border-amber-600/40 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>तयारी समय (Countdown):</span>
                <span className="font-mono font-bold text-amber-300 text-sm">
                  ⏱️ {formatTimer(countdownSeconds)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-amber-600 to-emerald-500 h-full transition-all duration-1000"
                  style={{ width: `${((120 - countdownSeconds) / 120) * 100}%` }}
                />
              </div>

              <p className="text-[11px] text-emerald-400 font-mono">
                {requestStatus === 'accepted'
                  ? '✨ कुण्डली तयार भयो! अब कल जोडिँदै छ...'
                  : 'गुरुजी कम्प्युटर / पञ्चाङ्गमा कुण्डली कोरिरहनुभएको छ...'}
              </p>
            </div>

            {/* Simulated / Guru "Accept & Call Now" Button (Requirement 3 & 4) */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleGuruInstantAccept}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-slate-950 font-bold py-3 rounded-xl shadow-xl text-xs flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] transition-all"
              >
                <PhoneCall className="w-4 h-4 animate-bounce" />
                <span>Accept & Call Now (कुण्डली तयार भयो, कल सुरु गर्नुहोस्)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (timerRef.current) clearInterval(timerRef.current);
                  setActiveWorkflowModal(null);
                }}
                className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
              >
                परामर्श रद्द गर्नुहोस् (Cancel Request)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
