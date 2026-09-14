import React, { useState, useEffect } from 'react';
import { Language } from '../types/astrology';
import { UserCheck, Award, Phone, Video, MessageSquare, Star, CheckCircle, Upload, ShieldCheck, X, Send, Sparkles, AlertCircle, Clock, DollarSign, Wallet, FileText, Image as ImageIcon, Flag } from 'lucide-react';

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

export const GurusDirectory: React.FC<GurusDirectoryProps> = ({ language }) => {
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
        }));
      } catch (e) { return INITIAL_GURUS; }
    }
    return INITIAL_GURUS;
  });

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

  // Chat/Call state
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'guru'; text: string; time: string }[]>([]);
  const [chatInput, setChatInput] = useState('');

  // Call simulation timer
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    localStorage.setItem('vaidik_jyotish_gurus', JSON.stringify(gurus));
  }, [gurus]);

  useEffect(() => {
    let timer: any = null;
    if (activeModal === 'audio' || activeModal === 'video') {
      setCallDuration(0);
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (callDuration > 0 && selectedGuru) {
        const minutesSpent = Math.max(1, Math.ceil(callDuration / 60));
        const earningsAdd = activeModal === 'audio' ? 25 * minutesSpent : 50 * minutesSpent;
        setGurus((prev) =>
          prev.map((g) => {
            if (g.id === selectedGuru.id) {
              const newAudioCount = activeModal === 'audio' ? g.audioCallsCount + 1 : g.audioCallsCount;
              const newVideoCount = activeModal === 'video' ? g.videoCallsCount + 1 : g.videoCallsCount;
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
      }
    }
    return () => clearInterval(timer);
  }, [activeModal]);

  const checkGuruAvailable = (guru: GuruProfile) => {
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

  const startChat = (guru: GuruProfile) => {
    if (!checkGuruAvailable(guru)) return;
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

    const newId = 'guru-' + Date.now();
    const newGuru: GuruProfile = {
      id: newId,
      name: regName,
      age: parseInt(regAge) || 35,
      experienceYears: parseInt(regExperience) || 5,
      qualifications: regQualifications,
      specializations: regSpecializations.split(',').map((s) => s.trim()).filter(Boolean),
      otherDetails: regOtherDetails || (isNe ? 'विशेषज्ञ ज्योतिष तथा कर्मकाण्ड सेवा।' : 'Expert astrology and rituals service.'),
      certificateUrl: regCertificateFile,
      status: 'online',
      rating: 5.0,
      ratingCount: 1,
      consultationCount: 0,
      consultationMinutes: 0,
      audioCallsCount: 0,
      videoCallsCount: 0,
      chatRepliesCount: 0,
      totalEarningsRs: 0,
      phone: regPhone,
    };

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

    const whatsappMsg = `🙏 *नयाँ गुरु आवेदन (Guru Application)* %0A` +
      `नाम: ${regName}%0A` +
      `उमेर: ${regAge}%0A` +
      `अनुभव: ${regExperience} वर्ष%0A` +
      `योग्यता: ${regQualifications}%0A` +
      `विशेषज्ञता: ${regSpecializations}%0A` +
      `फोन: ${regPhone}%0A` +
      `विवरण: ${regOtherDetails || 'N/A'}`;
    window.open(`https://wa.me/9779863991384?text=${whatsappMsg}`, '_blank');

    const updated = [newGuru, ...gurus];
    setGurus(updated);
    setMyGuruId(newId);
    localStorage.setItem('vaidik_my_guru_id', newId);
    setRegSuccess(isNe ? 'तपाईंको प्रोफाइल सफलतापूर्वक सिर्जना भयो!' : 'Your profile was successfully created!');
    setRegError('');
    setTimeout(() => {
      setIsRegisterOpen(false);
      setRegSuccess('');
      setIsMyDashboardOpen(true);
      setRegName('');
      setRegAge('');
      setRegExperience('');
      setRegQualifications('');
      setRegSpecializations('');
      setRegOtherDetails('');
      setRegPhone('');
      setRegCertificateFile('');
    }, 1500);
  };

  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedGuru) return;
    const userMsg = {
      sender: 'user' as const,
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    const txt = chatInput;
    setChatInput('');

    setGurus((prev) =>
      prev.map((g) => {
        if (g.id === selectedGuru.id) {
          return {
            ...g,
            chatRepliesCount: g.chatRepliesCount + 1,
            totalEarningsRs: g.totalEarningsRs + 10,
            consultationMinutes: g.consultationMinutes + 1,
          };
        }
        return g;
      })
    );

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

      {/* Ultra-Compact Gurus Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {gurus.map((guru) => {
          const isAvailable = guru.status === 'online';
          const isBusy = guru.status === 'busy';
          const isOffline = guru.status === 'offline';

          return (
            <div key={guru.id} className="bg-slate-900/90 border border-amber-600/30 rounded-xl p-3 shadow flex items-center justify-between gap-3 hover:border-amber-500 transition-all">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={guru.certificateUrl}
                    alt={guru.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-amber-500/80 shadow-sm"
                  />
                  <span 
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                      isAvailable ? 'bg-emerald-500 animate-pulse' : isBusy ? 'bg-red-500 animate-pulse' : 'bg-slate-500'
                    }`}
                  ></span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-serif font-bold text-amber-200 text-xs truncate">{guru.name}</h3>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold shrink-0 ${
                      isAvailable ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      isBusy ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse' :
                      'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}>
                      {isAvailable ? 'अनलाइन' : isBusy ? 'व्यस्त' : 'अफलाइन'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">{guru.qualifications} • {guru.experienceYears} वर्ष</p>
                  <div className="flex items-center gap-1 text-[10px] text-amber-400 mt-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-amber-200">{guru.rating || 5.0}</span>
                    <button
                      type="button"
                      onClick={() => { setRatingGuru(guru); setIsRateModalOpen(true); }}
                      className="text-amber-400 hover:underline ml-2 cursor-pointer"
                    >
                      {isNe ? 'रेटिङ' : 'Rate'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Compact Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => startChat(guru)}
                  disabled={!isAvailable}
                  className={`p-2 rounded-lg text-[10px] font-semibold flex items-center justify-center transition-all ${
                    isAvailable ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 cursor-pointer' : 'opacity-40 cursor-not-allowed bg-slate-900'
                  }`}
                  title="Chat (रु १०)"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                </button>

                <button
                  type="button"
                  onClick={() => startCall(guru, 'audio')}
                  disabled={!isAvailable}
                  className={`p-2 rounded-lg text-[10px] font-semibold flex items-center justify-center transition-all ${
                    isAvailable ? 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 cursor-pointer' : 'opacity-40 cursor-not-allowed bg-slate-900'
                  }`}
                  title="Audio (रु २५)"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                </button>

                <button
                  type="button"
                  onClick={() => startCall(guru, 'video')}
                  disabled={!isAvailable}
                  className={`p-2 rounded-lg text-[10px] font-bold flex items-center justify-center transition-all shadow-sm ${
                    isAvailable ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 cursor-pointer' : 'opacity-40 cursor-not-allowed bg-slate-900 text-slate-600'
                  }`}
                  title="Video (रु ५०)"
                >
                  <Video className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
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
            <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={selectedGuru.certificateUrl} alt={selectedGuru.name} className="w-10 h-10 rounded-full object-cover border border-amber-500" />
                <div>
                  <h4 className="font-serif font-bold text-amber-200 text-sm">{selectedGuru.name}</h4>
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online (रु १० प्रति सन्देश)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseChatModal}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
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

            {/* Chat Input */}
            <form onSubmit={sendChatMessage} className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={isNe ? 'सन्देश लेख्नुहोस् (रु १० प्रति उत्तर)...' : 'Type message...'}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center justify-center transition-all cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AUDIO / VIDEO CALL SIMULATION MODAL */}
      {(activeModal === 'audio' || activeModal === 'video') && selectedGuru && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-lg p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-amber-600/60 rounded-3xl max-w-md w-full p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative w-28 h-28 mx-auto">
              <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping"></div>
              <img
                src={selectedGuru.certificateUrl}
                alt={selectedGuru.name}
                className="relative w-28 h-28 rounded-full object-cover border-4 border-amber-500 shadow-xl"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-serif font-bold text-amber-200">{selectedGuru.name}</h3>
              <p className="text-xs text-emerald-400 font-medium">
                {activeModal === 'video' ? (isNe ? 'भिडियो कल जोडिएको छ (रु ५०)' : 'Video Call Connected (Rs 50)') : (isNe ? 'अडियो कल जोडिएको छ (रु २५)' : 'Audio Call Connected (Rs 25)')}
              </p>
              <p className="text-lg font-mono font-bold text-amber-400">{formatDuration(callDuration)}</p>
            </div>

            {activeModal === 'video' && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl h-36 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 to-amber-950/30 flex items-center justify-center">
                  <Video className="w-10 h-10 text-amber-500/40 animate-pulse" />
                </div>
                <span className="text-[11px] text-slate-400 z-10 font-mono">Live Video Feed (Secure Stream)</span>
              </div>
            )}

            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-8 py-3 rounded-2xl shadow-xl transition-all text-sm flex items-center gap-2 cursor-pointer"
              >
                <X className="w-5 h-5" />
                <span>{isNe ? 'कल काट्नुहोस् (End & Save Earnings)' : 'End Call'}</span>
              </button>
            </div>
          </div>
        </div>
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
    </div>
  );
};
