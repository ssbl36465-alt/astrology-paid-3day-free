import React, { useState, useEffect } from 'react';
import { Language } from '../types/astrology';
import { LiveConsultationModal } from './LiveConsultationModal';
import { UserCheck, Award, Phone, Video, MessageSquare, Star, Check, CheckCircle, Upload, ShieldCheck, X, Send, Sparkles, AlertCircle, Clock, DollarSign, Wallet, FileText, Image as ImageIcon, Flag, Info } from 'lucide-react';

interface GuruProfile {
  id: string;
  name: string;
  age: number;
  experienceYears: number;
  qualifications: string;
  specializations: string[];
  otherDetails: string;
  certificateUrl: string;
  status: 'online' | 'offline' | 'busy';
  rating: number;
  ratingCount: number;
  consultationCount: number;
  consultationMinutes: number;
  audioCallsCount: number;
  videoCallsCount: number;
  chatRepliesCount: number;
  totalEarningsRs: number;
  phone: string;
}

interface GurusDirectoryProps {
  language: Language;
  onOpenWallet?: () => void;
}

const INITIAL_GURUS: GuruProfile[] = [
  {
    id: 'guru-1',
    name: 'आचार्य श्री माधवप्रसाद उपाध्याय',
    age: 48,
    experienceYears: 22,
    qualifications: 'वेद तथा ज्योतिष आचार्य (बाणेश्‍वर विद्यापीठ)',
    specializations: ['चिना तथा कुण्डली विश्लेषण', 'ग्रह शान्ति कर्मकाण्ड', 'वास्तु परामर्श'],
    otherDetails: 'विशेषतः मांगलिक दोष निवारण र रुद्राभिषेक पूजामा सिद्धहस्त।',
    certificateUrl: 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?auto=format&fit=crop&q=80&w=400',
    status: 'online',
    rating: 4.9,
    ratingCount: 15,
    consultationCount: 45,
    consultationMinutes: 225,
    audioCallsCount: 15,
    videoCallsCount: 10,
    chatRepliesCount: 50,
    totalEarningsRs: (15 * 25) + (10 * 50) + (50 * 10),
    phone: '+977 9841234567',
  },
  {
    id: 'guru-2',
    name: 'पं. कृष्णकान्त शर्मा',
    age: 55,
    experienceYears: 30,
    qualifications: 'ज्योतिष रत्न, कर्मकाण्ड भास्कर',
    specializations: ['गृहप्रवेश पूजा', 'विवाह मुहूर्त', 'वास्तु दोष निवारण', 'ई-पूजा'],
    otherDetails: 'देश तथा विदेशमा अनलाइन माध्यमबाट पनि नियमित पूजा तथा परामर्श दिँदै आउनुभएको छ।',
    certificateUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400',
    status: 'busy',
    rating: 5.0,
    ratingCount: 24,
    consultationCount: 60,
    consultationMinutes: 300,
    audioCallsCount: 20,
    videoCallsCount: 15,
    chatRepliesCount: 80,
    totalEarningsRs: (20 * 25) + (15 * 50) + (80 * 10),
    phone: '+977 9851098765',
  },
  {
    id: 'guru-3',
    name: 'डा. नारायणप्रसाद कोइराला',
    age: 42,
    experienceYears: 18,
    qualifications: 'पी.एच.डी. ज्योतिष शास्त्र, संस्कृत विश्वविद्यालय',
    specializations: ['दशा विश्लेषण', 'व्यापारिक वास्तु', 'रत्न परामर्श', 'पुराण वाचन'],
    otherDetails: 'वैज्ञानिक तथा शास्त्रीय दृष्टिकोणबाट ज्योतिषीय समाधान प्रदान गर्नुहुन्छ।',
    certificateUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    status: 'offline',
    rating: 4.8,
    ratingCount: 12,
    consultationCount: 30,
    consultationMinutes: 150,
    audioCallsCount: 10,
    videoCallsCount: 5,
    chatRepliesCount: 30,
    totalEarningsRs: (10 * 25) + (5 * 50) + (30 * 10),
    phone: '+977 9860112233',
  },
];

export const GurusDirectory: React.FC<GurusDirectoryProps> = ({ language, onOpenWallet }) => {
  const isNe = language === 'ne';
  const [gurus, setGurus] = useState<GuruProfile[]>(() => {
    const saved = localStorage.getItem('vaidik_jyotish_gurus');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        // Ensure status and ratingCount exist
        return parsed.map((g: any) => ({
          ...g,
          status: g.status || (g.isOnline ? 'online' : 'offline'),
          ratingCount: g.ratingCount || 10,
          adminStatus: g.adminStatus || 'active',
          bannedUntil: g.bannedUntil || null,
        }));
      } catch (e) { return INITIAL_GURUS; }
    }
    return INITIAL_GURUS;
  });

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('vaidik_jyotish_gurus');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setGurus(parsed.map((g: any) => ({
            ...g,
            status: g.status || 'online',
            ratingCount: g.ratingCount || 10,
            adminStatus: g.adminStatus || 'active',
            bannedUntil: g.bannedUntil || null,
          })));
        } catch (e) {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isMyDashboardOpen, setIsMyDashboardOpen] = useState(false);
  const [myGuruId, setMyGuruId] = useState<string>(() => localStorage.getItem('vaidik_my_guru_id') || '');

  const [selectedGuru, setSelectedGuru] = useState<GuruProfile | null>(null);
  const [activeModal, setActiveModal] = useState<'chat' | 'audio' | 'video' | null>(null);

  // Rating Modal State
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [ratingGuru, setRatingGuru] = useState<GuruProfile | null>(null);
  const [starScore, setStarScore] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [rateSuccess, setRateSuccess] = useState('');

  // Reviews Modal State
  const [reviewsGuru, setReviewsGuru] = useState<GuruProfile | null>(null);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);

  // Legal & About Us Modal State
  const [isLegalModalOpen, setIsLegalModalOpen] = useState(false);

  // Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportGuru, setReportGuru] = useState<GuruProfile | null>(null);
  const [reportReason, setReportReason] = useState('गलत जानकारी (Incorrect Information)');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingGuru, setBookingGuru] = useState<GuruProfile | null>(null);
  const [bookingClientName, setBookingClientName] = useState('');
  const [bookingClientPhone, setBookingClientPhone] = useState('');
  const [bookingServiceType, setBookingServiceType] = useState('ज्योतिष परामर्श (Astrology Consultation)');
  const [bookingAmount, setBookingAmount] = useState('500');
  const [bookingVoucherUrl, setBookingVoucherUrl] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  // Client Recharge Modal State
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [rechargeName, setRechargeName] = useState('');
  const [rechargePhone, setRechargePhone] = useState('');
  const [rechargeAmount, setRechargeAmount] = useState('500');
  const [rechargeMethod, setRechargeMethod] = useState('eSewa / Khalti');
  const [rechargeVoucherUrl, setRechargeVoucherUrl] = useState('');
  const [rechargeSuccess, setRechargeSuccess] = useState('');

  // Birth Details Modal State (Customer providing birth details before connecting with guru)
  const [isBirthDetailsModalOpen, setIsBirthDetailsModalOpen] = useState(false);
  const [pendingGuruAction, setPendingGuruAction] = useState<'chat' | 'audio' | 'video' | null>(null);
  const [pendingGuruTarget, setPendingGuruTarget] = useState<GuruProfile | null>(null);

  const [clientDobYear, setClientDobYear] = useState(() => localStorage.getItem('vaidik_client_dob_year') || '2050');
  const [clientDobMonth, setClientDobMonth] = useState(() => localStorage.getItem('vaidik_client_dob_month') || 'वैशाख');
  const [clientDobDay, setClientDobDay] = useState(() => localStorage.getItem('vaidik_client_dob_day') || '15');
  const [clientDobTime, setClientDobTime] = useState(() => localStorage.getItem('vaidik_client_dob_time') || '10:30 AM');
  const [clientDobPlace, setClientDobPlace] = useState(() => localStorage.getItem('vaidik_client_dob_place') || 'काठमाडौं, नेपाल');

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regExperience, setRegExperience] = useState('');
  const [regQualifications, setRegQualifications] = useState('');
  const [regSpecializations, setRegSpecializations] = useState('');
  const [regOtherDetails, setRegOtherDetails] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCertificateFile, setRegCertificateFile] = useState<string>('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regAgreed, setRegAgreed] = useState(false);
  const [isCodeOfConductModalOpen, setIsCodeOfConductModalOpen] = useState(false);

  // Chat/Call state
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'guru'; text: string; time: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    localStorage.setItem('vaidik_jyotish_gurus', JSON.stringify(gurus));
  }, [gurus]);

  const handleEndConsultation = (durationSeconds: number, wasConnected: boolean) => {
    if (selectedGuru) {
      if (wasConnected && durationSeconds > 0) {
        const minutesSpent = Math.max(1, Math.ceil(durationSeconds / 60));
        const isAudio = activeModal === 'audio';
        const earningsAdd = isAudio ? 10 * minutesSpent : 12 * minutesSpent;
        const customerDeduct = isAudio ? 20 * minutesSpent : 25 * minutesSpent;

        const currentBalance = parseFloat(localStorage.getItem('vaidik_client_wallet_balance') || '500');
        const newBalance = Math.max(0, currentBalance - customerDeduct);
        localStorage.setItem('vaidik_client_wallet_balance', newBalance.toString());

        setGurus((prev) =>
          prev.map((g) => {
            if (g.id === selectedGuru.id) {
              const newAudioCount = isAudio ? g.audioCallsCount + 1 : g.audioCallsCount;
              const newVideoCount = !isAudio ? g.videoCallsCount + 1 : g.videoCallsCount;
              const newMinutes = g.consultationMinutes + minutesSpent;
              const newEarnings = g.totalEarningsRs + earningsAdd;
              return {
                ...g,
                status: 'online', // set back to online after call ends
                consultationMinutes: newMinutes,
                consultationCount: g.consultationCount + 1,
                audioCallsCount: newAudioCount,
                videoCallsCount: newVideoCount,
                totalEarningsRs: newEarnings,
              };
            }
            return g;
          })
        );
      } else {
        // Did not connect or short call cancelled: set guru back online, zero wallet deduction
        setGurus((prev) =>
          prev.map((g) => (g.id === selectedGuru.id ? { ...g, status: 'online' } : g))
        );
      }
    }
    setActiveModal(null);
  };

  const checkGuruAvailable = (guru: any) => {
    const isBannedPerm = guru.adminStatus === 'banned_permanent';
    const isBanned24h = guru.adminStatus === 'banned_24h' && guru.bannedUntil && Date.now() < guru.bannedUntil;
    if (isBannedPerm || isBanned24h) {
      alert(isNe ? '⚠️ यो गुरु एडमिनद्वारा प्रतिबन्धित (Banned) हुनुहुन्छ। परामर्श लिन मिल्दैन।' : 'This guru is banned by admin.');
      return false;
    }
    if (guru.status === 'offline') {
      alert(isNe ? 'यो गुरु हाल अफलाइन (Offline) हुनुहुन्छ। कृपया अर्को अनलाइन गुरु छान्नुहोस्।' : 'This guru is currently offline. Cannot call.');
      return false;
    }
    if (guru.status === 'busy') {
      alert(isNe ? 'यो गुरु हाल अर्को परामर्शमा व्यस्त (Busy) हुनुहुन्छ। कृपया उहाँ फ्री भएपछि प्रयास गर्नुहोस्।' : 'This guru is currently busy on another call. Please try later.');
      return false;
    }
    return true;
  };

  const checkWalletBalance = (type: 'chat' | 'audio' | 'video') => {
    const savedBal = localStorage.getItem('vaidik_client_wallet_balance');
    let balance = savedBal !== null ? parseFloat(savedBal) : 500;
    const requiredMin = type === 'audio' ? 20 : type === 'video' ? 25 : 10;
    if (isNaN(balance) || balance < requiredMin) {
      // Auto top-up complimentary 200 Rs so user is never blocked from in-app chat/call
      balance = 200;
      localStorage.setItem('vaidik_client_wallet_balance', '200');
    }
    return true;
  };

  const handleInitiateInteraction = (guru: GuruProfile, type: 'chat' | 'audio' | 'video') => {
    if (!checkGuruAvailable(guru)) return;
    checkWalletBalance(type);
    setSelectedGuru(guru);
    setGurus((prev) => prev.map((g) => (g.id === guru.id ? { ...g, status: 'busy' } : g)));

    if (type === 'chat') {
      const savedDobYear = localStorage.getItem('vaidik_client_dob_year') || clientDobYear;
      const savedDobMonth = localStorage.getItem('vaidik_client_dob_month') || clientDobMonth;
      const savedDobDay = localStorage.getItem('vaidik_client_dob_day') || clientDobDay;
      const savedDobTime = localStorage.getItem('vaidik_client_dob_time') || clientDobTime;
      const savedDobPlace = localStorage.getItem('vaidik_client_dob_place') || clientDobPlace;

      const birthDetailsText =
        savedDobYear && savedDobPlace
          ? isNe
            ? `🙏 मेरो जन्म विवरण:\n• जन्म मिति: ${savedDobYear} साल ${savedDobMonth} महिना ${savedDobDay} गते\n• जन्म समय: ${savedDobTime}\n• जन्मस्थान: ${savedDobPlace}`
            : `🙏 My Birth Details:\n- DOB: ${savedDobYear} ${savedDobMonth} ${savedDobDay}\n- Time: ${savedDobTime}\n- Place: ${savedDobPlace}`
          : '';

      const initialMsgs = [
        ...(birthDetailsText
          ? [
              {
                sender: 'user' as const,
                text: birthDetailsText,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ]
          : []),
        {
          sender: 'guru' as const,
          text: isNe
            ? `नमस्कार! म ${guru.name} हुँ। वैदिक ज्योतिष इन-एप च्याट सेवामा स्वागत छ। तपाईंको कुण्डली वा जिज्ञासाको सम्बन्धमा म प्रत्यक्ष उपस्थित छु।`
            : `Hello! I am ${guru.name}. Welcome to in-app consultation. How can I assist you today?`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ];
      setChatMessages(initialMsgs);
      setActiveModal('chat');
    } else {
      // Direct in-app Audio or Video consultation
      setActiveModal(type);
    }
  };

  const handleBirthDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientDobYear || !clientDobMonth || !clientDobDay || !clientDobTime || !clientDobPlace) {
      alert(isNe ? 'कृपया सबै जन्म विवरणहरू (साल, महिना, गते, समय, स्थान) अनिवार्य रूपमा भर्नुहोस्।' : 'Please fill all birth details.');
      return;
    }
    localStorage.setItem('vaidik_client_dob_year', clientDobYear);
    localStorage.setItem('vaidik_client_dob_month', clientDobMonth);
    localStorage.setItem('vaidik_client_dob_day', clientDobDay);
    localStorage.setItem('vaidik_client_dob_time', clientDobTime);
    localStorage.setItem('vaidik_client_dob_place', clientDobPlace);

    const birthDetailsText = isNe
      ? `🙏 मेरो जन्म विवरण:\n• जन्म मिति: ${clientDobYear} साल ${clientDobMonth} महिना ${clientDobDay} गते\n• जन्म समय: ${clientDobTime}\n• जन्मस्थान: ${clientDobPlace}`
      : `🙏 My Birth Details:\n- DOB: ${clientDobYear} ${clientDobMonth} ${clientDobDay}\n- Time: ${clientDobTime}\n- Place: ${clientDobPlace}`;

    setIsBirthDetailsModalOpen(false);

    if (pendingGuruTarget && pendingGuruAction) {
      setSelectedGuru(pendingGuruTarget);
      setGurus((prev) => prev.map((g) => g.id === pendingGuruTarget.id ? { ...g, status: 'busy' } : g));

      if (pendingGuruAction === 'chat') {
        setChatMessages([
          {
            sender: 'user',
            text: birthDetailsText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          {
            sender: 'guru',
            text: isNe 
              ? `नमस्कार! म ${pendingGuruTarget.name} हुँ। तपाईंको जन्म विवरण (${clientDobYear} साल, ${clientDobMonth} ${clientDobDay} गते, ${clientDobPlace}) प्राप्त भयो। तपाईंलाई कसरी मद्दत गर्न सक्छु?`
              : `Hello! I am ${pendingGuruTarget.name}. Received your birth details. How can I assist you?`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setActiveModal('chat');
      } else {
        setActiveModal(pendingGuruAction);
      }
    }
  };

  const startChat = (guru: GuruProfile) => {
    if (!checkGuruAvailable(guru)) return;
    if (!checkWalletBalance('chat')) return;
    setSelectedGuru(guru);
    setGurus((prev) => prev.map((g) => g.id === guru.id ? { ...g, status: 'busy' } : g));
    setChatMessages([
      {
        sender: 'guru',
        text: isNe ? `नमस्कार! म ${guru.name} हुँ। तपाईंलाई ज्योतिषीय परामर्शमा कसरी मद्दत गर्न सक्छु?` : `Hello! I am ${guru.name}. How can I assist you with astrological consultation today?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setActiveModal('chat');
  };

  const startCall = (guru: GuruProfile, type: 'audio' | 'video') => {
    if (!checkGuruAvailable(guru)) return;
    if (!checkWalletBalance(type)) return;
    setSelectedGuru(guru);
    setGurus((prev) => prev.map((g) => g.id === guru.id ? { ...g, status: 'busy' } : g));
    setActiveModal(type);
  };

  const handleCloseChatModal = () => {
    if (selectedGuru) {
      setGurus((prev) => prev.map((g) => g.id === selectedGuru.id ? { ...g, status: 'online' } : g));
    }
    setActiveModal(null);
  };

  const handleToggleMyStatus = (newStatus: 'online' | 'busy' | 'offline') => {
    if (!myGuruId) return;
    const updated = gurus.map((g) => g.id === myGuruId ? { ...g, status: newStatus } : g);
    setGurus(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRegCertificateFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoucherFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBookingVoucherUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingGuru || !bookingClientName || !bookingClientPhone || !bookingAmount || !bookingVoucherUrl) {
      alert(isNe ? 'कृपया नाम, फोन, रकम र भुक्तानी भौचर स्क्रिनसट अनिवार्य रूपमा भर्नुहोस्।' : 'Please fill all required fields and upload voucher screenshot.');
      return;
    }
    const newBooking = {
      id: 'booking-' + Date.now(),
      clientName: bookingClientName,
      clientPhone: bookingClientPhone,
      guruId: bookingGuru.id,
      guruName: bookingGuru.name,
      serviceType: bookingServiceType,
      amountPaid: parseFloat(bookingAmount) || 500,
      voucherUrl: bookingVoucherUrl,
      createdAt: new Date().toISOString(),
    };

    const existingBookings = JSON.parse(localStorage.getItem('vaidik_client_bookings') || '[]');
    localStorage.setItem('vaidik_client_bookings', JSON.stringify([newBooking, ...existingBookings]));

    setBookingSuccess(isNe ? 'तपाईंको बुकिङ र भुक्तानी भौचर सफलतापूर्वक पेस भयो! एडमिनले प्रमाणित गर्नेछन्।' : 'Booking & Voucher successfully submitted!');
    setTimeout(() => {
      setIsBookingOpen(false);
      setBookingSuccess('');
      setBookingClientName('');
      setBookingClientPhone('');
      setBookingAmount('');
      setBookingVoucherUrl('');
    }, 2000);
  };

  const handleRechargeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRechargeVoucherUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRechargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rechargeName || !rechargePhone || !rechargeAmount || !rechargeVoucherUrl) {
      alert(isNe ? 'कृपया नाम, फोन, रकम र भुक्तानी भौचर अनिवार्य रूपमा भर्नुहोस्।' : 'Please fill all required fields.');
      return;
    }
    const newRecharge = {
      id: 'recharge-' + Date.now(),
      clientName: rechargeName,
      clientPhone: rechargePhone,
      amount: parseFloat(rechargeAmount) || 500,
      paymentMethod: rechargeMethod,
      voucherUrl: rechargeVoucherUrl,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    const existingRecharges = JSON.parse(localStorage.getItem('vaidik_client_recharges') || '[]');
    localStorage.setItem('vaidik_client_recharges', JSON.stringify([newRecharge, ...existingRecharges]));

    setRechargeSuccess(isNe ? 'तपाईंको वालेट रिचार्ज भौचर सफलतापूर्वक पेस भयो!' : 'Recharge voucher successfully submitted!');
    setTimeout(() => {
      setIsRechargeOpen(false);
      setRechargeSuccess('');
      setRechargeName('');
      setRechargePhone('');
      setRechargeAmount('');
      setRechargeVoucherUrl('');
    }, 2000);
  };

  const handleRateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingGuru) return;
    const currentRating = ratingGuru.rating || 4.5;
    const currentCount = ratingGuru.ratingCount || 10;
    const newCount = currentCount + 1;
    const newAvg = parseFloat((((currentRating * currentCount) + starScore) / newCount).toFixed(1));

    const newReview = {
      id: 'rev-' + Date.now(),
      guruId: ratingGuru.id,
      score: starScore,
      comment: reviewComment,
      createdAt: new Date().toISOString(),
    };
    const existingReviews = JSON.parse(localStorage.getItem('vaidik_guru_reviews') || '[]');
    localStorage.setItem('vaidik_guru_reviews', JSON.stringify([newReview, ...existingReviews]));

    const updatedGurus = gurus.map((g) => {
      if (g.id === ratingGuru.id) {
        return { ...g, rating: newAvg, ratingCount: newCount };
      }
      return g;
    });
    setGurus(updatedGurus);

    setRateSuccess(isNe ? 'तपाईंको अमूल्य रेटिङ तथा समीक्षा सफलतापूर्वक सेभ भयो!' : 'Rating & Review successfully submitted!');
    setTimeout(() => {
      setIsRateModalOpen(false);
      setRateSuccess('');
      setReviewComment('');
      setStarScore(5);
    }, 1500);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportGuru) return;
    const newReport = {
      id: 'rep-' + Date.now(),
      guruId: reportGuru.id,
      guruName: reportGuru.name,
      reason: reportReason,
      details: reportDetails,
      createdAt: new Date().toISOString(),
    };
    const existingReports = JSON.parse(localStorage.getItem('vaidik_guru_reports') || '[]');
    localStorage.setItem('vaidik_guru_reports', JSON.stringify([newReport, ...existingReports]));

    setReportSuccess(isNe ? 'गुरु विरुद्धको रिपोर्ट सफलतापूर्वक एडमिनमा पठाइयो। धन्यवाद!' : 'Guru report successfully submitted to admin. Thank you!');
    setTimeout(() => {
      setIsReportModalOpen(false);
      setReportSuccess('');
      setReportDetails('');
    }, 1500);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regAge || !regExperience || !regQualifications || !regSpecializations || !regPhone || !regCertificateFile) {
      setRegError(isNe ? 'कृपया सबै अनिवार्य विवरणहरू भर्नुहोस् र प्रमाणपत्र अपलोड गर्नुहोस्।' : 'Please fill in all required fields and upload certificate.');
      return;
    }
    if (!regAgreed) {
      setRegError(isNe ? 'कृपया गुरुहरूको आचारसंहिता तथा नियमहरूमा सहमति जनाउनुहोस् (I Agree चेक गर्नुहोला)।' : 'Please agree to the Astrologer Code of Conduct & Terms of Service.');
      return;
    }

    const newApp = {
      id: 'app-' + Date.now(),
      name: regName,
      age: parseInt(regAge) || 35,
      experienceYears: parseInt(regExperience) || 5,
      qualifications: regQualifications,
      specializations: regSpecializations.split(',').map((s) => s.trim()).filter(Boolean),
      otherDetails: regOtherDetails || 'विशेषज्ञ ज्योतिष सेवा।',
      phone: regPhone,
      certificateUrl: regCertificateFile,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    const existingApps = JSON.parse(localStorage.getItem('vaidik_guru_applications') || '[]');
    localStorage.setItem('vaidik_guru_applications', JSON.stringify([newApp, ...existingApps]));

    setRegSuccess(isNe ? 'तपाईंको आवेदन एडमिनसमक्ष पेस भयो! एडमिनबाट स्वीकृत भएपछि मात्र प्रोफाइल सक्रिय हुनेछ।' : 'Your application was submitted to Admin for approval.');
    setRegError('');
    setTimeout(() => {
      setIsRegisterOpen(false);
      setRegSuccess('');
      setRegName('');
      setRegAge('');
      setRegExperience('');
      setRegQualifications('');
      setRegSpecializations('');
      setRegOtherDetails('');
      setRegPhone('');
      setRegCertificateFile('');
      setRegAgreed(false);
    }, 2000);
  };

  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedGuru) return;

    const isGuru = myGuruId === selectedGuru.id;

    if (!isGuru) {
      const wordCount = chatInput.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount > 500) {
        alert(isNe 
          ? '⚠️ ग्राहकले एक सन्देशमा ५०० शब्दभन्दा बढी लेख्न मिल्दैन। कृपया ५०० शब्दभित्रै आफ्नो जिज्ञासा राख्नुहोला।' 
          : 'Customers cannot write more than 500 words in a single message.');
        return;
      }

      // Customer pays Rs 10 per message
      const currentBalance = parseFloat(localStorage.getItem('vaidik_client_wallet_balance') || '500');
      if (currentBalance < 10) {
        alert(isNe 
          ? '⚠️ च्याट सन्देश पठाउनको लागि वालेटमा पर्याप्त ब्यालेन्स (रु १०) छैन। कृपया रिचार्ज गर्नुहोस्।' 
          : 'Insufficient wallet balance (Rs 10 required per message). Please recharge.');
        if (onOpenWallet) onOpenWallet();
        return;
      }
      localStorage.setItem('vaidik_client_wallet_balance', (currentBalance - 10).toString());
    }

    const senderRole = isGuru ? 'guru' : 'user';
    const newMsg = {
      sender: senderRole as 'user' | 'guru',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    const txt = chatInput;
    setChatInput('');

    setGurus((prev) =>
      prev.map((g) => {
        if (g.id === selectedGuru.id) {
          return {
            ...g,
            chatRepliesCount: g.chatRepliesCount + 1,
            totalEarningsRs: g.totalEarningsRs + 5, // Guru earns Rs 5 per message
            consultationMinutes: g.consultationMinutes + 1,
          };
        }
        return g;
      })
    );

    if (!isGuru) {
      setTimeout(() => {
        const guruReply = {
          sender: 'guru' as const,
          text: isNe 
            ? `तपाईंको जिज्ञासा "${txt}" को सम्बन्धमा ग्रहहरूको स्थिति अनुकूल छ। विस्तृत कुण्डली विश्लेषणका लागि जन्म समय र स्थान आवश्यक छ।`
            : `Regarding your query "${txt}", planetary positions are favorable. A detailed chart analysis is recommended.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages((prev) => [...prev, guruReply]);
      }, 1000);
    }
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const myProfile = gurus.find((g) => g.id === myGuruId);

  return (
    <div className="space-y-3 max-w-7xl mx-auto py-1">
      {/* Ultra-slim minimalist header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 border border-amber-600/30 rounded-xl px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <h2 className="text-xs sm:text-sm font-serif font-bold text-amber-200">
            {isNe ? 'अनलाइन ज्योतिषी तथा पण्डितहरूसँग प्रत्यक्ष परामर्श' : 'Live Astrologer & Pandit Consultation'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsLegalModalOpen(true)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium px-3 py-1.5 rounded-xl transition-all text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>{isNe ? 'हाम्रो बारे / कानुनी' : 'About / Legal'}</span>
          </button>

          {myProfile ? (
            <button
              type="button"
              onClick={() => setIsMyDashboardOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 rounded-xl shadow transition-all text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{isNe ? 'मेरो कमाई' : 'My Earnings'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsRegisterOpen(true)}
              className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-xl shadow transition-all text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>{isNe ? 'गुरुको रूपमा दर्ता' : 'Register as Guru'}</span>
            </button>
          )}
        </div>
      </div>

      {/* In-App Direct Consultation Features Banner */}
      <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl px-3.5 py-2 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-bold text-amber-200">
            {isNe ? '✨ १००% एपभित्रै उपलब्ध सुविधाहरू:' : '✨ 100% In-App Services Available:'}
          </span>
          <span className="text-slate-300 hidden md:inline">
            {isNe ? 'च्याट, अडियो कल र भिडियो कल सिधै यही एपभित्रै चल्छ (कुनै बाह्य नम्बर/एप चाहिँदैन)' : 'Chat, Audio Call & Video Call directly in-app'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-bold text-[11px]">
          <span className="bg-slate-800 text-amber-300 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-1">
            <MessageSquare className="w-3 h-3 text-amber-400" /> {isNe ? 'च्याट' : 'Chat'}
          </span>
          <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 px-2.5 py-1 rounded-lg flex items-center gap-1">
            <Phone className="w-3 h-3 text-emerald-400" /> {isNe ? 'अडियो कल' : 'Audio Call'}
          </span>
          <span className="bg-amber-600/20 text-amber-300 border border-amber-500/50 px-2.5 py-1 rounded-lg flex items-center gap-1">
            <Video className="w-3 h-3 text-amber-400" /> {isNe ? 'भिडियो कल' : 'Video Call'}
          </span>
        </div>
      </div>

      {/* Ultra-Compact Gurus Grid */}
      <div className="max-h-[360px] overflow-y-auto pr-1 space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {gurus.map((guru) => {
            const isAvailable = guru.status === 'online';
            const isBusy = guru.status === 'busy';
            const isOffline = guru.status === 'offline';

            return (
              <div key={guru.id} className="bg-slate-900/95 border border-amber-600/35 hover:border-amber-500 rounded-2xl p-3.5 shadow-lg flex flex-col justify-between gap-3 transition-all duration-200">
                {/* Top Info */}
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={guru.certificateUrl}
                      alt={guru.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/80 shadow-md"
                    />
                    <span 
                      className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                        isAvailable ? 'bg-emerald-500 animate-pulse' : isBusy ? 'bg-red-500 animate-pulse' : 'bg-slate-500'
                      }`}
                    ></span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-serif font-bold text-amber-200 text-xs sm:text-sm truncate">{guru.name}</h3>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                        isAvailable ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                        isBusy ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse' :
                        'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {isAvailable ? 'अनलाइन' : isBusy ? 'व्यस्त' : 'अफलाइन'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{guru.qualifications}</p>

                    <div className="flex items-center flex-wrap gap-2 text-[10px] text-amber-400 mt-1">
                      <div className="flex items-center gap-1 font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{guru.rating || 5.0}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setRatingGuru(guru); setIsRateModalOpen(true); }}
                        className="text-amber-400 hover:underline cursor-pointer"
                      >
                        {isNe ? 'रेटिङ' : 'Rate'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setReviewsGuru(guru); setIsReviewsModalOpen(true); }}
                        className="text-emerald-400 hover:underline cursor-pointer font-medium"
                      >
                        {isNe ? 'समीक्षा' : 'Reviews'}
                      </button>
                      <span className="text-emerald-400 font-medium bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60 ml-auto">
                        {guru.experienceYears} वर्ष अनुभव
                      </span>
                    </div>
                  </div>
                </div>

                {/* In-App Direct Action Buttons: Chat, Audio Call, Video Call */}
                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800/90">
                  <button
                    type="button"
                    onClick={() => handleInitiateInteraction(guru, 'chat')}
                    disabled={!isAvailable}
                    className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                      isAvailable
                        ? 'bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 cursor-pointer shadow hover:border-amber-500/60'
                        : 'opacity-40 cursor-not-allowed bg-slate-950 text-slate-500'
                    }`}
                    title="एपभित्रै प्रत्यक्ष च्याट (In-App Chat)"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isNe ? 'च्याट' : 'Chat'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInitiateInteraction(guru, 'audio')}
                    disabled={!isAvailable}
                    className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                      isAvailable
                        ? 'bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 cursor-pointer shadow hover:border-emerald-500'
                        : 'opacity-40 cursor-not-allowed bg-slate-950 text-slate-500'
                    }`}
                    title="एपभित्रै प्रत्यक्ष अडियो कल (In-App Audio Call)"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    <span>{isNe ? 'अडियो कल' : 'Audio Call'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInitiateInteraction(guru, 'video')}
                    disabled={!isAvailable}
                    className={`py-2 px-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all shadow ${
                      isAvailable
                        ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 cursor-pointer hover:scale-[1.02]'
                        : 'opacity-40 cursor-not-allowed bg-slate-950 text-slate-600'
                    }`}
                    title="एपभित्रै प्रत्यक्ष भिडियो कल (In-App Video Call)"
                  >
                    <Video className="w-3.5 h-3.5 text-slate-950" />
                    <span>{isNe ? 'भिडियो कल' : 'Video Call'}</span>
                  </button>
                </div>
              </div>
            );
        })}
      </div>
    </div>

      {/* RATE GURU MODAL */}
      {isRateModalOpen && ratingGuru && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-amber-600/60 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-amber-900/40">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <h3 className="text-lg font-serif font-bold text-amber-200">
                  {isNe ? 'गुरुलाई स्टार रेटिङ दिनुहोस्' : 'Rate Guru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-full bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              गुरु <strong className="text-amber-300">{ratingGuru.name}</strong> ले प्रदान गर्नुभएको सही जानकारीको आधारमा स्टार रेटिङ (१ देखि ५) प्रदान गर्नुहोस्:
            </p>

            {rateSuccess && (
              <div className="p-3 bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs rounded-xl font-semibold text-center">
                {rateSuccess}
              </div>
            )}

            <form onSubmit={handleRateSubmit} className="space-y-4">
              <div className="flex items-center justify-center gap-3 py-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setStarScore(num)}
                    className="p-2 transition-transform hover:scale-125 cursor-pointer"
                  >
                    <Star className={`w-8 h-8 ${num <= starScore ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                  </button>
                ))}
              </div>
              <div className="text-center font-mono text-amber-300 text-sm font-bold">
                {starScore} / 5 Stars
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1">{isNe ? 'समीक्षा / प्रतिक्रिया (Review Comment)' : 'Review Comment'}</label>
                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={isNe ? 'गुरुको परामर्श अत्यन्त सटिक र लाभदायी थियो...' : 'Write your review...'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg transition-all text-xs cursor-pointer"
              >
                {isNe ? 'रेटिङ पेस गर्नुहोस् (Submit Rating)' : 'Submit Rating'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REPORT GURU MODAL */}
      {isReportModalOpen && reportGuru && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-red-600/60 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-red-900/40">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-serif font-bold text-red-200">
                  {isNe ? 'गुरुको गुनासो / रिपोर्ट गर्नुहोस्' : 'Report Guru'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-full bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              गुरु <strong className="text-red-300">{reportGuru.name}</strong> ले गलत जानकारी वा गाली-गलौज / अपशब्द प्रयोग गरेको भए तल कारण छान्नुहोस्:
            </p>

            {reportSuccess && (
              <div className="p-3 bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs rounded-xl font-semibold text-center">
                {reportSuccess}
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-red-300 mb-1">{isNe ? 'गुनासोको कारण (Reason)' : 'Reason'}</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-red-500"
                >
                  <option value="गलत जानकारी (Incorrect Information)">गलत जानकारी वा भ्रमपूर्ण ज्योतिषीय सल्लाह (Incorrect Information)</option>
                  <option value="गाली-गलौज / अपशब्द (Abusive Language)">गाली-गलौज वा अपशब्द प्रयोग (Abusive / Offensive Language)</option>
                  <option value="अनैतिक व्यवहार (Unethical Behavior)">अनैतिक व्यवहार (Unethical Behavior)</option>
                  <option value="अन्य (Other)">अन्य कारण (Other)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-red-300 mb-1">{isNe ? 'विस्तृत विवरण (Details)' : 'Details'}</label>
                <textarea
                  rows={3}
                  required
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder={isNe ? 'घटना वा कुराकानीको विवरण दिनुहोस्...' : 'Describe the issue...'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all text-xs cursor-pointer"
              >
                {isNe ? 'रिपोर्ट पठाउनुहोस् (Submit Report)' : 'Submit Report'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* BOOKING & VOUCHER UPLOAD MODAL */}
      {isBookingOpen && bookingGuru && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-amber-600/60 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-amber-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-amber-200">
                    {isNe ? 'परामर्श वा पूजा बुकिङ भौचर फारम' : 'Booking & Payment Voucher Form'}
                  </h3>
                  <p className="text-xs text-slate-400">गुरु: <strong className="text-amber-300">{bookingGuru.name}</strong></p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBookingOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">{isNe ? 'तपाईंको पूरा नाम (Client Full Name) *' : 'Client Full Name *'}</label>
                <input
                  type="text"
                  required
                  value={bookingClientName}
                  onChange={(e) => setBookingClientName(e.target.value)}
                  placeholder="उदा. रामप्रसाद अधिकारी"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">{isNe ? 'मोबाइल नम्बर (Phone Number) *' : 'Phone Number *'}</label>
                <input
                  type="text"
                  required
                  value={bookingClientPhone}
                  onChange={(e) => setBookingClientPhone(e.target.value)}
                  placeholder="उदा. 9841000000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">{isNe ? 'सेवा / पूजाको प्रकार (Service / Puja Type)' : 'Service Type'}</label>
                <select
                  value={bookingServiceType}
                  onChange={(e) => setBookingServiceType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="ज्योतिष परामर्श (Astrology Consultation)">ज्योतिष परामर्श (Astrology Consultation)</option>
                  <option value="कुण्डली मिलान (Horoscope Matching)">कुण्डली मिलान (Horoscope Matching)</option>
                  <option value="रुद्राभिषेक पूजा (Rudrabhishek Puja)">रुद्राभिषेक पूजा (Rudrabhishek Puja)</option>
                  <option value="ग्रह शान्ति पूजा (Planet Peace Puja)">ग्रह शान्ति पूजा (Planet Peace Puja)</option>
                  <option value="वास्तु परामर्श (Vastu Consultation)">वास्तु परामर्श (Vastu Consultation)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">{isNe ? 'तिरेको रकम (Amount Paid in Rs) *' : 'Amount Paid in Rs *'}</label>
                <input
                  type="number"
                  required
                  value={bookingAmount}
                  onChange={(e) => setBookingAmount(e.target.value)}
                  placeholder="उदा. 500"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-amber-400" /> {isNe ? 'भौचर वा स्क्रिनसट अपलोड (Payment Voucher Screenshot) *' : 'Upload Payment Voucher Screenshot *'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleVoucherFileChange}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-600 file:text-slate-955 hover:file:bg-amber-500 cursor-pointer bg-slate-950 border border-slate-700 rounded-xl p-2"
                />
                {bookingVoucherUrl && (
                  <div className="mt-2 flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <img src={bookingVoucherUrl} alt="Voucher Preview" className="w-16 h-16 object-cover rounded-lg border border-amber-500" />
                    <span className="text-[11px] text-emerald-400 font-semibold">भौचर सफलतापूर्वक अपलोड भयो!</span>
                  </div>
                )}
              </div>

              {bookingSuccess && (
                <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-200 p-3 rounded-xl text-xs font-semibold text-center">
                  {bookingSuccess}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold py-3 rounded-xl shadow-lg transition-all text-sm cursor-pointer"
              >
                {isNe ? 'बुकिङ र भौचर पेस गर्नुहोस् (Submit Booking)' : 'Submit Booking & Voucher'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MY EARNINGS & STATUS DASHBOARD MODAL */}
      {isMyDashboardOpen && myProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-emerald-600/60 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-amber-200">
                    {isNe ? 'मेरो कमाई तथा स्थिति (Status & Earnings)' : 'My Status & Earnings'}
                  </h3>
                  <p className="text-xs text-slate-400">{myProfile.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMyDashboardOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Guru Status Toggle */}
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
              <label className="text-xs font-semibold text-amber-300 block">
                {isNe ? 'तपाईंको हालको स्थिति (Your Status):' : 'Your Status:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleMyStatus('online')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    myProfile.status === 'online' ? 'bg-emerald-600 text-slate-950 font-bold shadow' : 'bg-slate-900 text-slate-300 border border-slate-700'
                  }`}
                >
                  🟢 अनलाइन (Online)
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleMyStatus('busy')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    myProfile.status === 'busy' ? 'bg-amber-600 text-slate-950 font-bold shadow' : 'bg-slate-900 text-slate-300 border border-slate-700'
                  }`}
                >
                  🔴 व्यस्त (Busy)
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleMyStatus('offline')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    myProfile.status === 'offline' ? 'bg-slate-700 text-white font-bold shadow' : 'bg-slate-900 text-slate-300 border border-slate-700'
                  }`}
                >
                  ⚫ अफलाइन (Offline)
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 p-5 rounded-2xl text-center space-y-2">
              <span className="text-xs text-emerald-300 font-semibold uppercase tracking-wider">{isNe ? 'कुल आम्दानी (Total Earnings)' : 'Total Earnings'}</span>
              <h2 className="text-3xl font-mono font-bold text-emerald-400">रु {myProfile.totalEarningsRs}</h2>
              <p className="text-xs text-slate-400">{isNe ? 'तपाईंको व्यक्तिगत खातामा जम्मा भएको रकम' : 'Credited to your account'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 space-y-1">
                <span className="text-slate-400 block">{isNe ? 'कुल परामर्श समय' : 'Total Consult Time'}</span>
                <span className="text-amber-300 font-mono font-bold text-sm">{myProfile.consultationMinutes} मिनेट (Minutes)</span>
              </div>
              <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 space-y-1">
                <span className="text-slate-400 block">{isNe ? 'कुल परामर्श संख्या' : 'Total Sessions'}</span>
                <span className="text-amber-300 font-mono font-bold text-sm">{myProfile.consultationCount} पटक</span>
              </div>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">अडियो कल ({myProfile.audioCallsCount} पटक):</span>
                <span className="font-mono text-slate-200">रु {myProfile.audioCallsCount * 25}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">भिडियो कल ({myProfile.videoCallsCount} पटक):</span>
                <span className="font-mono text-slate-200">रु {myProfile.videoCallsCount * 50}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">च्याट सन्देश ({myProfile.chatRepliesCount} वटा):</span>
                <span className="font-mono text-slate-200">रु {myProfile.chatRepliesCount * 10}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMyDashboardOpen(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl text-sm transition-all cursor-pointer"
            >
              {isNe ? 'बन्द गर्नुहोस्' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* REGISTRATION MODAL */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-amber-600/60 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-amber-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-amber-200">
                    {isNe ? 'ज्योतिषी / पण्डित / पुरोहित प्रोफाइल दर्ता' : 'Jyotish / Pandit / Purohit Registration'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isNe ? 'सबै विवरण अनिवार्य रूपमा भरेर प्रमाणपत्र अपलोड गर्नुहोस्।' : 'Fill in all required details and upload your certificate.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {regError && (
                <div className="bg-red-950/80 border border-red-800 text-red-200 p-3 rounded-xl text-xs font-semibold">
                  {regError}
                </div>
              )}
              {regSuccess && (
                <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-200 p-3 rounded-xl text-xs font-semibold">
                  {regSuccess}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">{isNe ? 'पुरा नाम (Full Name) *' : 'Full Name *'}</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="उदा. आचार्य रामप्रसाद"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">{isNe ? 'मोबाइल नम्बर (Phone) *' : 'Phone *'}</label>
                  <input
                    type="text"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="उदा. +977 9800000000"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">{isNe ? 'उमेर (Age)' : 'Age'}</label>
                  <input
                    type="number"
                    value={regAge}
                    onChange={(e) => setRegAge(e.target.value)}
                    placeholder="उदा. 40"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">{isNe ? 'अनुभव (वर्षमा)' : 'Experience (Years)'}</label>
                  <input
                    type="number"
                    value={regExperience}
                    onChange={(e) => setRegExperience(e.target.value)}
                    placeholder="उदा. 15"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">{isNe ? 'योग्यता / उपाधि (Qualifications) *' : 'Qualifications *'}</label>
                <input
                  type="text"
                  required
                  value={regQualifications}
                  onChange={(e) => setRegQualifications(e.target.value)}
                  placeholder="उदा. वेद तथा ज्योतिष आचार्य"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">{isNe ? 'विशेषज्ञता क्षेत्रहरू (Comma separated) *' : 'Specializations *'}</label>
                <input
                  type="text"
                  required
                  value={regSpecializations}
                  onChange={(e) => setRegSpecializations(e.target.value)}
                  placeholder="उदा. कुण्डली विश्लेषण, वास्तु, रुद्राभिषेक"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">{isNe ? 'थप विवरण वा परिचय (Other Details)' : 'Other Details'}</label>
                <textarea
                  rows={2}
                  value={regOtherDetails}
                  onChange={(e) => setRegOtherDetails(e.target.value)}
                  placeholder="तपाईंको सेवाबारे संक्षिप्त जानकारी..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-amber-400" /> {isNe ? 'प्रमाणपत्र वा परिचय पत्र फोटो अपलोड (Certificate) *' : 'Upload Certificate *'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-600 file:text-slate-955 hover:file:bg-amber-500 cursor-pointer bg-slate-950 border border-slate-700 rounded-xl p-2"
                />
                {regCertificateFile && (
                  <div className="mt-2 flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
                    <img src={regCertificateFile} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-amber-500" />
                    <span className="text-[11px] text-emerald-400 font-semibold">फाइल सफल रूपमा संलग्न गरियो!</span>
                  </div>
                )}
              </div>

              {/* Terms & Conditions / Code of Conduct Section (Requirement 1, 2, 3, 4) */}
              <div className="bg-slate-950 border border-amber-600/40 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    {isNe ? 'गुरु आचारसंहिता तथा सेवा नियमहरू (Code of Conduct & Terms)' : 'Astrologer Code of Conduct & Rules'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsCodeOfConductModalOpen(true)}
                    className="text-xs text-amber-400 hover:underline cursor-pointer font-medium"
                  >
                    {isNe ? 'नियमहरू पूरा हेर्नुहोस् (Read Rules)' : 'Read Full Rules'}
                  </button>
                </div>

                {/* Scrollable Summary of Rules */}
                <div className="max-h-24 overflow-y-auto bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
                  <p>• {isNe ? '१. ग्राहकहरूको कुण्डली, जन्म विवरण तथा व्यक्तिगत कुराकानी पूर्ण गोप्य रहनेछ।' : '1. Client birth charts and consultations remain 100% confidential.'}</p>
                  <p>• {isNe ? '२. कुनै पनि प्रकारको भ्रम, अन्धविश्वास वा आर्थिक शोषण गर्न पूर्ण रूपमा निषेध गरिएको छ।' : '2. No superstitious exploitation or misleading advice is permitted.'}</p>
                  <p>• {isNe ? '३. सबै च्याट, अडियो तथा भिडियो परामर्श एपभित्रै मर्यादित रूपमा सञ्चालन गर्नुपर्नेछ।' : '3. All consultations must strictly take place within the app.'}</p>
                  <p>• {isNe ? '४. पेश गरिएको शैक्षिक योग्यता तथा अनुभव प्रमाण वास्तविक हुनुपर्नेछ।' : '4. All submitted credentials and experience must be genuine.'}</p>
                </div>

                {/* I Agree Checkbox */}
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-200 pt-1 group">
                  <input
                    type="checkbox"
                    id="guru-terms-agreement-checkbox"
                    checked={regAgreed}
                    onChange={(e) => {
                      setRegAgreed(e.target.checked);
                      if (e.target.checked && regError) {
                        setRegError('');
                      }
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-slate-700 text-amber-600 focus:ring-amber-500 bg-slate-900 cursor-pointer accent-amber-500 shrink-0"
                  />
                  <span className="group-hover:text-amber-300 transition-colors">
                    {isNe
                      ? 'म गुरुहरूको आचारसंहिता, गोपनीयता तथा सेवा नियमहरूमा पूर्ण रूपमा सहमत छु (I Agree to Terms & Conditions) *'
                      : 'I have read and fully agree to the Astrologer Code of Conduct & Terms of Service (I Agree) *'}
                  </span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold py-3 rounded-xl shadow-xl transition-all text-sm cursor-pointer"
                >
                  {isNe ? 'प्रोफाइल सिर्जना गर्नुहोस् (Create ID)' : 'Create Guru ID'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHAT MODAL */}
      {activeModal === 'chat' && selectedGuru && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-amber-600/50 rounded-3xl max-w-lg w-full h-[80vh] flex flex-col shadow-2xl relative text-slate-100 overflow-hidden">
            {/* Chat Header */}
            <div className="p-3.5 sm:p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <img src={selectedGuru.certificateUrl} alt={selectedGuru.name} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-amber-500 shrink-0" />
                <div className="min-w-0">
                  <h4 className="font-serif font-bold text-amber-200 text-xs sm:text-sm truncate">{selectedGuru.name}</h4>
                  <p className="text-[10px] sm:text-[11px] text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> {isNe ? 'अनलाइन (Online)' : 'Online'}
                  </p>
                </div>
              </div>

              {/* Quick In-App Audio & Video Call Launchers */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveModal('audio')}
                  className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all shadow cursor-pointer hover:border-emerald-500"
                  title="एपभित्रै अडियो कल सुरु गर्नुहोस्"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="hidden sm:inline">{isNe ? 'अडियो कल' : 'Audio'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModal('video')}
                  className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 text-slate-950 px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all shadow cursor-pointer hover:scale-105"
                  title="एपभित्रै भिडियो कल सुरु गर्नुहोस्"
                >
                  <Video className="w-3.5 h-3.5 text-slate-950" />
                  <span className="hidden sm:inline">{isNe ? 'भिडियो कल' : 'Video'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCloseChatModal}
                  className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${msg.sender === 'user' ? 'bg-amber-600 text-slate-950 font-medium rounded-br-none' : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'}`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 px-1 font-mono">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Chat Input with Birth Info quick sender */}
            <form onSubmit={sendChatMessage} className="p-3 bg-slate-800 border-t border-slate-700 space-y-1.5">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsBirthDetailsModalOpen(true)}
                  className="bg-slate-900 hover:bg-slate-700 border border-slate-700 text-amber-300 p-2 rounded-xl text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                  title="जन्म विवरण पठाउनुहोस्"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline text-[11px]">{isNe ? 'जन्म विवरण' : 'Birth Info'}</span>
                </button>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={isNe ? 'सन्देश लेख्नुहोस् (ग्राहक: अधिकतम ५०० शब्द, गुरु: असीमित)...' : 'Type message...'}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 sm:px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center transition-all cursor-pointer shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="text-[10px] text-slate-400 px-1 flex items-center justify-between">
                <span>{myGuruId === selectedGuru.id ? (isNe ? '🟢 गुरु मोड: असीमित शब्दहरू' : 'Guru Mode: Unlimited words') : (isNe ? '👤 ग्राहक मोड: एक सन्देशमा अधिकतम ५०० शब्द' : 'Customer Mode: Max 500 words/msg')}</span>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REAL LIVE AUDIO / VIDEO CONSULTATION MODAL */}
      {(activeModal === 'audio' || activeModal === 'video') && selectedGuru && (
        <LiveConsultationModal
          guru={selectedGuru}
          callType={activeModal}
          language={language}
          onClose={handleEndConsultation}
          onOpenWallet={onOpenWallet}
        />
      )}

      {/* CLIENT WALLET RECHARGE MODAL */}
      {isRechargeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-amber-600/50 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsRechargeOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/80 p-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="border-b border-amber-900/40 pb-3">
                <h3 className="text-xl font-serif font-bold text-amber-200 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-amber-400" /> ग्राहक वालेट रिचार्ज भौचर पेस गर्नुहोस्
                </h3>
                <p className="text-xs text-slate-300">
                  eSewa / Khalti वा बैंक मार्फत रकम पठाएर भौचर/स्क्रिनसट अपलोड गर्नुहोस्।
                </p>
              </div>

              {rechargeSuccess && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs rounded-xl font-semibold">
                  {rechargeSuccess}
                </div>
              )}

              <form onSubmit={handleRechargeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">तपाईंको पूरा नाम (Client Name) *</label>
                  <input
                    type="text"
                    required
                    value={rechargeName}
                    onChange={(e) => setRechargeName(e.target.value)}
                    placeholder="जस्तै: रामचन्द्र अधिकारी"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">सम्पर्क फोन नम्बर (Phone Number) *</label>
                  <input
                    type="text"
                    required
                    value={rechargePhone}
                    onChange={(e) => setRechargePhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-amber-300 mb-1">रिचार्ज रकम (रु) *</label>
                    <input
                      type="number"
                      required
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                      placeholder="500"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-300 mb-1">भुक्तानी माध्यम (Method)</label>
                    <select
                      value={rechargeMethod}
                      onChange={(e) => setRechargeMethod(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    >
                      <option value="eSewa">eSewa (9863991384)</option>
                      <option value="Khalti">Khalti (9863991384)</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1">भुक्तानी भौचर वा स्क्रिनसट (Payment Voucher Screenshot) *</label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleRechargeFileChange}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-600 file:text-slate-955 hover:file:bg-amber-500 cursor-pointer bg-slate-950 border border-slate-700 rounded-xl p-2"
                  />
                  {rechargeVoucherUrl && (
                    <div className="mt-2 flex items-center gap-3 bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <img src={rechargeVoucherUrl} alt="Voucher Preview" className="w-12 h-12 object-cover rounded-lg border border-amber-500" />
                      <span className="text-[11px] text-emerald-400 font-semibold">भौचर स्क्रिनसट सफलतापूर्वक संलग्न गरियो!</span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-amber-300 font-semibold mb-1">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{isNe ? 'भौचर प्रमाणीकरण' : 'Voucher Verification'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isNe
                      ? 'तपाईंले पेस गर्नुभएको भौचरको आधारमा एडमिन टोलीले प्रमाणीकरण गरी केही मिनेटभित्र वालेटमा ब्यालेन्स थप गर्नेछ।'
                      : 'Our team will verify the payment voucher and credit your wallet within a few minutes.'}
                  </p>
                </div>

               <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold py-3 rounded-xl shadow-xl transition-all text-xs cursor-pointer"
                  >
                    {isNe ? 'रिचार्ज भौचर पेस गर्नुहोस् (Submit Recharge)' : 'Submit Recharge Voucher'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* BIRTH DETAILS MODAL BEFORE CONNECTING WITH GURU */}
      {isBirthDetailsModalOpen && pendingGuruTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-amber-600/60 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-amber-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-amber-200">
                    {isNe ? 'गुरुलाई आफ्नो जन्म विवरण प्रदान गर्नुहोस्' : 'Provide Birth Details to Guru'}
                  </h3>
                  <p className="text-xs text-slate-400">चयनित गुरु: <strong className="text-amber-300">{pendingGuruTarget.name}</strong></p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBirthDetailsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBirthDetailsSubmit} className="space-y-4">
              <p className="text-xs text-slate-300 bg-amber-950/30 border border-amber-600/30 p-3 rounded-xl leading-relaxed">
                {isNe 
                  ? 'ज्योतिषीय परामर्श वा कुण्डली विश्लेषणका लागि कृपया आफ्नो जन्म मिति (साल, महिना, गते), जन्म समय र जन्मस्थान सही रूपमा भर्नुहोस्। यो विवरण सिधै गुरुलाई पठाइनेछ।'
                  : 'Please enter your birth date (year, month, day), time, and place name accurately for astrological consultation.'}
              </p>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-amber-300">{isNe ? 'साल (Year) *' : 'Year *'}</label>
                  <input
                    type="text"
                    required
                    value={clientDobYear}
                    onChange={(e) => setClientDobYear(e.target.value)}
                    placeholder="उदा. 2050"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-amber-300">{isNe ? 'महिना (Month) *' : 'Month *'}</label>
                  <input
                    type="text"
                    required
                    value={clientDobMonth}
                    onChange={(e) => setClientDobMonth(e.target.value)}
                    placeholder="उदा. वैशाख"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-amber-300">{isNe ? 'गते (Day) *' : 'Day *'}</label>
                  <input
                    type="text"
                    required
                    value={clientDobDay}
                    onChange={(e) => setClientDobDay(e.target.value)}
                    placeholder="उदा. 15"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-amber-300">{isNe ? 'जन्म समय (Birth Time) *' : 'Birth Time *'}</label>
                  <input
                    type="text"
                    required
                    value={clientDobTime}
                    onChange={(e) => setClientDobTime(e.target.value)}
                    placeholder="उदा. 10:30 AM"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-amber-300">{isNe ? 'जन्मस्थान (Birth Place Name) *' : 'Birth Place Name *'}</label>
                  <input
                    type="text"
                    required
                    value={clientDobPlace}
                    onChange={(e) => setClientDobPlace(e.target.value)}
                    placeholder="उदा. काठमाडौं, नेपाल"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold py-3.5 rounded-xl shadow-xl transition-all text-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isNe ? 'जन्म विवरण पेस गरी परामर्श सुरु गर्नुहोस्' : 'Submit Birth Details & Start'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW REVIEWS & RATINGS MODAL */}
      {isReviewsModalOpen && reviewsGuru && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-amber-600/60 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[85vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-amber-900/40">
              <div className="flex items-center gap-3">
                <img src={reviewsGuru.certificateUrl} alt={reviewsGuru.name} className="w-12 h-12 rounded-full object-cover border-2 border-amber-500 shadow" />
                <div>
                  <h3 className="text-lg font-serif font-bold text-amber-200">
                    {reviewsGuru.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-amber-400 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-amber-200">{reviewsGuru.rating || 5.0}</span>
                    <span className="text-slate-400">({reviewsGuru.ratingCount || 0} {isNe ? 'समीक्षाहरू' : 'reviews'})</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewsModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-300/80">
                {isNe ? 'ग्राहकहरूद्वारा दिइएका रेटिङ तथा समीक्षा (All User Reviews & Ratings)' : 'All User Reviews & Ratings'}
              </h4>

              {(() => {
                const allReviews = JSON.parse(localStorage.getItem('vaidik_guru_reviews') || '[]');
                const guruReviews = allReviews.filter((r: any) => r.guruId === reviewsGuru.id);

                if (guruReviews.length === 0) {
                  return (
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center text-slate-400 text-xs space-y-2">
                      <Star className="w-8 h-8 text-amber-500/40 mx-auto" />
                      <p>{isNe ? 'यस गुरुको लागि हालसम्म कुनै समीक्षा उपलब्ध छैन। पहिलो समीक्षा दिनुहोस्!' : 'No reviews available yet for this guru. Be the first to review!'}</p>
                    </div>
                  );
                }

                return guruReviews.map((rev: any, idx: number) => (
                  <div key={rev.id || idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3.5 h-3.5 ${i < (rev.score || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} 
                          />
                        ))}
                        <span className="text-xs font-bold text-amber-300 ml-1.5 font-mono">{rev.score}.0</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                      "{rev.comment || (isNe ? 'उत्कृष्ट परामर्श सेवा!' : 'Excellent consultation service!')}"
                    </p>
                  </div>
                ));
              })()}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsReviewsModalOpen(false);
                  setRatingGuru(reviewsGuru);
                  setIsRateModalOpen(true);
                }}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow cursor-pointer"
              >
                {isNe ? '⭐ नयाँ रेटिङ दिनुहोस् (Write a Review)' : 'Write a Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEGAL INFO & ABOUT US MODAL */}
      {isLegalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-amber-600/60 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[85vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-amber-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-amber-200">
                    {isNe ? 'हाम्रो बारे तथा कानुनी जानकारी (About Us & Legal Info)' : 'About Us & Legal Information'}
                  </h3>
                  <p className="text-xs text-slate-400">Vaidik Jyotish & Puja Consultation Platform</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLegalModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                <h4 className="font-serif font-bold text-amber-300 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  {isNe ? 'हाम्रो बारेमा (About Us)' : 'About Us'}
                </h4>
                <p>
                  {isNe 
                    ? 'हामी वैदिक ज्योतिष, कर्मकाण्ड, र सनातन संस्कृतिमा आधारित भरपर्दो तथा प्रमाणित परामर्श सेवा प्रदान गर्ने अग्रणी डिजिटल प्लेटफर्म हौं। यस प्लेटफर्ममार्फत देश तथा विदेशमा रहनुहुने सम्पूर्ण जिज्ञासु महानुभावहरूले नेपालका अनुभवी तथा योग्य ज्योतिषी र पण्डितहरूसँग प्रत्यक्ष कुराकानी (च्याट, अडियो तथा भिडियो कल) गर्न सक्नुहुन्छ।' 
                    : 'We are a premier digital platform connecting seekers with certified and experienced Vedic astrologers, pandits, and spiritual guides for authentic consultations via chat, audio, and video calls.'}
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                <h4 className="font-serif font-bold text-amber-300 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  {isNe ? 'कानूनी तथा सम्पर्क विवरण (Legal & Contact Info)' : 'Legal & Contact Info'}
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li><strong>{isNe ? 'संस्थाको नाम:' : 'Organization Name:'}</strong> Vaidik Jyotish & Puja Sewa</li>
                  <li><strong>{isNe ? 'मुख्य कार्यालय:' : 'Head Office:'}</strong> Kathmandu, Bagmati Province, Nepal</li>
                  <li><strong>{isNe ? 'सम्पर्क इमेल १:' : 'Contact Email 1:'}</strong> astrologyconsultant2@gmail.com</li>
                  <li><strong>{isNe ? 'सम्पर्क इमेल २:' : 'Contact Email 2:'}</strong> guruastro130@gmail.com</li>
                </ul>
              </div>



              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                <h4 className="font-serif font-bold text-amber-300 text-sm flex items-center gap-2">
                  <Flag className="w-4 h-4 text-amber-400" />
                  {isNe ? 'गोपनीयता नीति (Privacy Policy)' : 'Privacy Policy'}
                </h4>
                <p>
                  {isNe 
                    ? 'तपाईंको जन्म विवरण (जन्म मिति, समय, स्थान) तथा भुक्तानी भौचर पूर्ण रूपमा सुरक्षित राखिन्छ र तेस्रो पक्षलाई बिक्री वा साझा गरिंदैन। सेवा सुधार र परामर्शका लागि मात्र प्रयोग गरिन्छ।' 
                    : 'Your birth details and payment verification vouchers are stored securely and never shared with third parties.'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsLegalModalOpen(false)}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-xs transition-all shadow cursor-pointer"
              >
                {isNe ? 'बुझियो / बन्द गर्नुहोस् (Close)' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CODE OF CONDUCT & TERMS OF SERVICE MODAL FOR GURUS */}
      {isCodeOfConductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-amber-600/60 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 max-h-[85vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-amber-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-amber-200">
                    {isNe ? 'गुरुहरूका लागि आचारसंहिता तथा नियमहरू' : 'Terms of Service & Code of Conduct for Astrologers'}
                  </h3>
                  <p className="text-xs text-slate-400">Vaidik Jyotish & Puja Sewa</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCodeOfConductModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                <h4 className="font-serif font-bold text-amber-300 text-sm">
                  १. गोपनीयता र सुरक्षा (Privacy & Confidentiality):
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li>ग्राहकका सबै विवरणहरू (नाम, जन्म मिति, समय, स्थान) र च्याट/फोनमा भएका कुराकानीहरू पूर्ण रूपमा गोप्य राखिनुपर्छ।</li>
                  <li>कुनै पनि ग्राहकको विवरण अन्य कुनै व्यक्ति, सामाजिक सञ्जाल वा बाह्य माध्यममा शेयर गर्न पाइने छैन।</li>
                </ul>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                <h4 className="font-serif font-bold text-amber-300 text-sm">
                  २. निजी सम्पर्कमा प्रतिबन्ध (No Personal Contact Sharing):
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li>गुरुहरूले ग्राहकलाई आफ्नो व्यक्तिगत फोन नम्बर, WhatsApp, Facebook, eSewa/Khalti, वा व्यक्तिगत ठेगाना माग्न वा दिन सख्त मनाही छ।</li>
                  <li>ग्राहकलाई एप बाहिर लगेर परामर्श दिन खोजेमा वा व्यक्तिगत सम्पर्क विवरण आदान-प्रदान गरेमा प्रोफाइल स्थायी रूपमा ब्लक/सस्पेन्ड गरिनेछ।</li>
                </ul>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                <h4 className="font-serif font-bold text-amber-300 text-sm">
                  ३. परामर्श र भविष्यवाणी सम्बन्धी नियम (Ethics & Consultation Rules):
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li><strong>डर र त्रास देखाउन नपाइने:</strong> "दुर्घटना हुन्छ", "मृत्यु हुन्छ" वा "अति ठूलो सङ्कट आउँछ" जस्ता डर देखाएर ग्राहकलाई मानसिक तनाव वा त्रास दिन पाइने छैन।</li>
                  <li><strong>अन्धविश्वास र अनैतिक उपाय:</strong> कसैलाई हानी पुर्याउने (वशीकरण, जादुटुना) जस्ता अनैतिक कार्य गर्न वा गराउन प्रोत्साहन गर्न पाइने छैन।</li>
                  <li><strong>उपचार/रत्न बिक्री:</strong> एप बाहिरका महँगा पत्थर, बुटी, पूजा वा सामान किन्न ग्राहकलाई बाध्य पार्न पाइने छैन।</li>
                  <li><strong>स्वास्थ्य र कानुनी परामर्श:</strong> गम्भीर स्वास्थ्य समस्या वा अदालत/कानुनी मामिलामा डाक्टरी वा कानुनी सल्लाह जस्तै दाबी गरेर ग्यारेन्टी दिन पाइने छैन।</li>
                </ul>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                <h4 className="font-serif font-bold text-amber-300 text-sm">
                  ४. सेवा र अनलाइन उपस्थिति (Online Availability & Service Level):
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li>अनलाइन बसेको बेला ग्राहकको च्याट रिक्वेस्ट आएमा तुरुन्तै (अधिकतम १-२ मिनेटभित्र) उत्तर दिनुपर्छ।</li>
                  <li>च्याट सुरु गरेपछि ग्राहकलाई बिना कारण होल्डमा राख्न वा उत्तर नदिई छोड्न पाइने छैन।</li>
                  <li>काम नगर्ने वा उपलब्ध नहुने समयमा अनलाइन स्टेटस अनिवार्य रूपमा 'Offline' राख्नुपर्छ।</li>
                </ul>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                <h4 className="font-serif font-bold text-amber-300 text-sm">
                  ५. भुक्तानी, बक्सिस र रिभ्यु (Payments & Reviews):
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li>परामर्श शुल्क एपको नीति अनुसार प्रति-मिनेट वा प्रति-परामर्श निर्धारण हुनेछ। <strong>(च्याटमा प्रति सन्देश रु ५, अडियो कलमा प्रति मिनेट रु १०, र भिडियो कलमा प्रति मिनेट रु १२ गुरुको वालेटमा जम्मा हुनेछ)।</strong> ग्राहकसँग थप पैसा वा बक्सिस (Tip) को माग गर्न पाइने छैन।</li>
                  <li>ग्राहकले दिने रेटिङ र रिभ्युमा निष्पक्षता कायम गर्नुपर्छ। खराब रिभ्यु दिएबापत ग्राहकसँग विवाद वा अभद्र व्यवहार गर्न पाइने छैन।</li>
                  <li>आफ्ना साथीभाइलाई ग्राहक बनाएर नक्कली (Fake) रेटिङ बढाउने वा ब्यालेन्स मनिप्युलेट गर्ने काम गरेमा एकाउन्ट टर्मिनेट गरिनेछ।</li>
                </ul>
              </div>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                <h4 className="font-serif font-bold text-amber-300 text-sm">
                  ६. प्रमाणीकरण र कानुनी दायित्व (KYC & Liability):
                </h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li>गुरुहरूले आफ्नो सक्कली नाम, नागरिकता र ज्योतिष सम्बन्धी योग्यता/अनुभवको प्रमाण (KYC) बुझाउनुपर्नेछ।</li>
                  <li>ज्योतिष परामर्श सम्भावना र अनुमानमा आधारित विषय भएकाले गुरुले दिएको सल्लाह वा परामर्शका कारण हुने कुनै पनि निर्णय वा परिणामको जिम्मेवारी सम्बन्धित गुरुको नै हुनेछ।</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setRegAgreed(true);
                  setIsCodeOfConductModalOpen(false);
                }}
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow cursor-pointer"
              >
                {isNe ? 'पढेँ र सहमत छु (I Agree)' : 'I Agree & Accept'}
              </button>
              <button
                type="button"
                onClick={() => setIsCodeOfConductModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
              >
                {isNe ? 'बन्द गर्नुहोस् (Close)' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
