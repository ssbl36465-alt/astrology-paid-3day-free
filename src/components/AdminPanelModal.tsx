// File Name: src/components/AdminPanelModal.tsx
import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Key, Trash2, Smartphone, UserCheck, DollarSign, Award, Users, FileText, Image as ImageIcon, Wallet, Check, Ban, AlertTriangle, RefreshCw } from 'lucide-react';
import { 
  db,
  GURU_APPLICATIONS_COLLECTION,
  GURUS_COLLECTION,
  CLIENT_RECHARGES_COLLECTION,
  CLIENT_BOOKINGS_COLLECTION,
  saveGuruToFirestore, 
  saveApplicationToFirestore, 
  deleteApplicationFromFirestore,
  saveRechargeToFirestore,
  setUserRole,
  syncGurusFromFirestore,
  syncApplicationsFromFirestore 
} from '../firebase';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GuruApplication {
  id: string;
  name: string;
  age: number;
  experienceYears: number;
  qualifications: string;
  specializations: string[];
  otherDetails: string;
  phone: string;
  certificateUrl: string;
  createdAt: string;
  status: string; // 'pending' | 'approved' | 'rejected'
}

interface ClientRecharge {
  id: string;
  clientName: string;
  clientPhone: string;
  amount: number;
  paymentMethod: string;
  voucherUrl: string;
  createdAt: string;
  status: string; // 'pending' | 'approved' | 'rejected'
}

interface GuruReport {
  id: string;
  name: string;
  qualifications: string;
  consultationMinutes: number;
  consultationCount: number;
  audioCallsCount: number;
  videoCallsCount: number;
  chatRepliesCount: number;
  totalEarningsRs: number;
  status?: string;
  adminStatus?: 'active' | 'banned_24h' | 'banned_permanent';
  bannedUntil?: number | null;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ isOpen, onClose }) => {
  const isNe = true;
  const [adminPass, setAdminPass] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('jyotish_admin_auth') === 'true');
  const [activeAdminTab, setActiveAdminTab] = useState<'recharges' | 'applications' | 'gurus' | 'bookings'>('recharges');
  
  const [gurusReport, setGurusReport] = useState<GuruReport[]>([]);
  const [clientBookings, setClientBookings] = useState<any[]>([]);
  const [guruApplications, setGuruApplications] = useState<GuruApplication[]>([]);
  const [clientRecharges, setClientRecharges] = useState<ClientRecharge[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !isOpen) return;

    loadAdminData();

    // Real-time live listener for Guru Applications directly from Firebase (/guru_applications)
    const unsubApps = onSnapshot(collection(db, GURU_APPLICATIONS_COLLECTION), (snap) => {
      const list: GuruApplication[] = [];
      snap.forEach((d) => list.push({ ...(d.data() as GuruApplication), id: d.id }));
      setGuruApplications(list);
    }, (err) => console.warn('Realtime guru_applications sync warning:', err));

    // Real-time live listener for Gurus directly from Firebase (/gurus)
    const unsubGurus = onSnapshot(collection(db, GURUS_COLLECTION), (snap) => {
      const list: GuruReport[] = [];
      snap.forEach((d) => {
        const data = d.data() as any;
        list.push({
          ...data,
          id: d.id,
          adminStatus: data.adminStatus || 'active',
          bannedUntil: data.bannedUntil || null,
        });
      });
      setGurusReport(list);
    }, (err) => console.warn('Realtime gurus sync warning:', err));

    // Real-time live listener for Recharges directly from Firebase
    const unsubRecharges = onSnapshot(collection(db, CLIENT_RECHARGES_COLLECTION), (snap) => {
      const list: ClientRecharge[] = [];
      snap.forEach((d) => list.push({ ...(d.data() as ClientRecharge), id: d.id }));
      if (list.length > 0) {
        setClientRecharges(list);
        localStorage.setItem('vaidik_client_recharges', JSON.stringify(list));
      }
    }, (err) => console.warn('Realtime recharges sync warning:', err));

    // Real-time live listener for Bookings directly from Firebase
    const unsubBookings = onSnapshot(collection(db, CLIENT_BOOKINGS_COLLECTION), (snap) => {
      const list: any[] = [];
      snap.forEach((d) => list.push({ ...d.data(), id: d.id }));
      if (list.length > 0) {
        setClientBookings(list);
        localStorage.setItem('vaidik_client_bookings', JSON.stringify(list));
      }
    }, (err) => console.warn('Realtime bookings sync warning:', err));

    return () => {
      unsubApps();
      unsubGurus();
      unsubRecharges();
      unsubBookings();
    };
  }, [isAuthenticated, isOpen]);

  const loadAdminData = () => {
    // Local data load
    const savedGurus = localStorage.getItem('vaidik_jyotish_gurus');
    if (savedGurus) {
      try {
        const parsed = JSON.parse(savedGurus);
        setGurusReport(parsed.map((g: any) => ({
          ...g,
          adminStatus: g.adminStatus || 'active',
          bannedUntil: g.bannedUntil || null,
        })));
      } catch (e) { setGurusReport([]); }
    } else {
      setGurusReport([]);
    }

    const savedBookings = localStorage.getItem('vaidik_client_bookings');
    if (savedBookings) {
      try { setClientBookings(JSON.parse(savedBookings)); } catch (e) { setClientBookings([]); }
    } else {
      setClientBookings([]);
    }

    const savedApps = localStorage.getItem('vaidik_guru_applications');
    if (savedApps) {
      try { setGuruApplications(JSON.parse(savedApps)); } catch (e) { setGuruApplications([]); }
    } else {
      setGuruApplications([]);
    }

    const savedRecharges = localStorage.getItem('vaidik_client_recharges');
    if (savedRecharges) {
      try { setClientRecharges(JSON.parse(savedRecharges)); } catch (e) { setClientRecharges([]); }
    } else {
      setClientRecharges([]);
    }

    // Cloud Firestore load
    syncGurusFromFirestore().then((remote) => {
      if (remote && remote.length > 0) {
        setGurusReport((prev) => {
          const map = new Map<string, GuruReport>();
          prev.forEach((g) => map.set(g.id, g));
          remote.forEach((g) => map.set(g.id, { ...g, adminStatus: g.adminStatus || 'active', bannedUntil: g.bannedUntil || null }));
          return Array.from(map.values());
        });
      }
    });

    syncApplicationsFromFirestore().then((remoteApps) => {
      if (remoteApps && remoteApps.length > 0) {
        setGuruApplications((prev) => {
          const map = new Map<string, GuruApplication>();
          prev.forEach((a) => map.set(a.id, a));
          remoteApps.forEach((a) => map.set(a.id, a));
          return Array.from(map.values());
        });
      }
    });
  };

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPass.trim() === '2m2du6hkx9') {
      setIsAuthenticated(true);
      localStorage.setItem('jyotish_admin_auth', 'true');
      loadAdminData();
    } else {
      alert('गलत एडमिन कोड! (Incorrect Admin Code)');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jyotish_admin_auth');
    setIsAuthenticated(false);
    setAdminPass('');
  };

  // 1. ASTROLOGER APPLICATION APPROVAL / REJECTION / DELETE (Directly in Firebase)
  const handleApproveGuruApp = async (appId: string) => {
    if (!window.confirm('के तपाईं यो गुरुको आवेदन स्वीकृत (Approve) गर्न चाहनुहुन्छ?')) return;

    const appToApprove = guruApplications.find(a => a.id === appId);
    if (!appToApprove) return;

    const guruId = appToApprove.id.replace('app-', 'guru-');

    // 1. Update application status to approved in Firebase /guru_applications
    await saveApplicationToFirestore({ ...appToApprove, status: 'approved' });

    // 2. Update their status to approved in Firebase under /gurus
    const newGuruProfile = {
      id: guruId,
      name: appToApprove.name,
      age: appToApprove.age,
      experienceYears: appToApprove.experienceYears,
      qualifications: appToApprove.qualifications,
      specializations: appToApprove.specializations,
      otherDetails: appToApprove.otherDetails,
      certificateUrl: appToApprove.certificateUrl,
      status: 'approved', // Status set to 'approved' in Firebase under /gurus
      adminStatus: 'active' as const,
      bannedUntil: null,
      rating: 5.0,
      ratingCount: 1,
      consultationCount: 0,
      consultationMinutes: 0,
      audioCallsCount: 0,
      videoCallsCount: 0,
      chatRepliesCount: 0,
      totalEarningsRs: 0,
      phone: appToApprove.phone,
    };
    await saveGuruToFirestore(newGuruProfile);

    // 3. Update /users/{uid}/role as guru in Firebase
    await setUserRole(guruId, 'guru', {
      guruId,
      name: appToApprove.name,
      phone: appToApprove.phone,
      status: 'approved',
    });

    alert(`गुरु ${appToApprove.name} को आवेदन स्वीकृत गरियो र Firebase मा 'guru' रोल सहित प्रोफाइल सक्रिय भयो!`);
  };

  const handleRejectGuruApp = async (appId: string) => {
    if (!window.confirm('के तपाईं यो गुरुको आवेदन अस्वीकार (Reject) गर्न चाहनुहुन्छ?')) return;

    const appToReject = guruApplications.find(a => a.id === appId);
    if (appToReject) {
      await saveApplicationToFirestore({ ...appToReject, status: 'rejected' });
    }
    alert('गुरु आवेदन अस्वीकार गरियो।');
  };

  const handleDeleteGuruApp = async (appId: string) => {
    if (window.confirm('के तपाईं यो आवेदन स्थायी रूपमा हटाउन (Delete) चाहनुहुन्छ?')) {
      await deleteApplicationFromFirestore(appId);
    }
  };

  // 2. GURU BAN (24H OR PERMANENT) & RE-ACCEPT
  const handleBanGuru = (guruId: string, type: '24h' | 'permanent') => {
    const msg = type === '24h' 
      ? 'के तपाईं यो गुरुलाई २४ घण्टाका लागि प्रतिबन्ध (24h Ban) गर्न चाहनुहुन्छ?' 
      : 'के तपाईं यो गुरुलाई स्थायी रूपमा प्रतिबन्ध (Permanent Ban) गर्न चाहनुहुन्छ?';
    
    if (window.confirm(msg)) {
      const bannedUntilTime = type === '24h' ? Date.now() + 24 * 3600 * 1000 : null;
      const adminStatusVal = type === '24h' ? 'banned_24h' : 'banned_permanent';

      const updated = gurusReport.map(g => {
        if (g.id === guruId) {
          return {
            ...g,
            adminStatus: adminStatusVal,
            bannedUntil: bannedUntilTime,
            status: 'offline',
          };
        }
        return g;
      });

      setGurusReport(updated);
      localStorage.setItem('vaidik_jyotish_gurus', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      alert(type === '24h' ? 'गुरु २४ घण्टाका लागि प्रतिबन्धित गरियो।' : 'गुरु स्थायी रूपमा प्रतिबन्धित गरियो।');
    }
  };

  const handleReAcceptGuru = (guruId: string) => {
    if (window.confirm('के तपाईं यो गुरुको प्रतिबन्ध फुकुवा गरी पुनः स्वीकृति (Re-Accept) दिन चाहनुहुन्छ?')) {
      const updated = gurusReport.map(g => {
        if (g.id === guruId) {
          return {
            ...g,
            adminStatus: 'active',
            bannedUntil: null,
            status: 'online',
          };
        }
        return g;
      });

      setGurusReport(updated);
      localStorage.setItem('vaidik_jyotish_gurus', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      alert('गुरुको प्रतिबन्ध फुकुवा गरियो र पुनः सक्रिय (Re-Accepted) बनाइयो!');
    }
  };

  // 3. RECHARGE VOUCHER APPROVAL / REJECTION / DELETE (With Confirmations)
  const handleApproveRecharge = (rechargeId: string) => {
    if (!window.confirm('के तपाईं यो रिचार्ज भौचर स्वीकृत (Approve) गरी ग्राहकको वालेटमा ब्यालेन्स जम्मा गर्न चाहनुहुन्छ?')) return;

    const recharge = clientRecharges.find(r => r.id === rechargeId);
    if (!recharge) return;

    const updatedRecharges = clientRecharges.map(r => r.id === rechargeId ? { ...r, status: 'approved' } : r);
    setClientRecharges(updatedRecharges);
    localStorage.setItem('vaidik_client_recharges', JSON.stringify(updatedRecharges));
    saveRechargeToFirestore({ ...recharge, status: 'approved' });

    const currentBal = parseFloat(localStorage.getItem('vaidik_client_wallet_balance') || '500');
    const newBal = currentBal + Number(recharge.amount);
    localStorage.setItem('vaidik_client_wallet_balance', newBal.toString());
    window.dispatchEvent(new Event('storage'));

    alert(`ग्राहक ${recharge.clientName} को वालेटमा रु ${recharge.amount} सफलतापूर्वक जम्मा गरियो!`);
  };

  const handleRejectRecharge = (rechargeId: string) => {
    if (!window.confirm('के तपाईं यो रिचार्ज भौचर अस्वीकार (Reject) गर्न चाहनुहुन्छ?')) return;

    const recharge = clientRecharges.find(r => r.id === rechargeId);
    const updated = clientRecharges.map(r => r.id === rechargeId ? { ...r, status: 'rejected' } : r);
    setClientRecharges(updated);
    localStorage.setItem('vaidik_client_recharges', JSON.stringify(updated));
    if (recharge) {
      saveRechargeToFirestore({ ...recharge, status: 'rejected' });
    }
    window.dispatchEvent(new Event('storage'));
    alert('रिचार्ज भौचर अस्वीकार गरियो।');
  };

  const handleDeleteRecharge = (rechargeId: string) => {
    if (window.confirm('के तपाईं यो रिचार्ज रेकर्ड स्थायी रूपमा मेटाउन (Delete) चाहनुहुन्छ?')) {
      const updated = clientRecharges.filter(r => r.id !== rechargeId);
      setClientRecharges(updated);
      localStorage.setItem('vaidik_client_recharges', JSON.stringify(updated));
      deleteDoc(doc(db, CLIENT_RECHARGES_COLLECTION, rechargeId)).catch((e) => console.warn(e));
      window.dispatchEvent(new Event('storage'));
    }
  };

  // 4. BOOKING DELETE
  const handleDeleteBooking = (bookingId: string) => {
    if (window.confirm('के तपाईं यो बुकिङ रेकर्ड स्थायी रूपमा मेटाउन (Delete) चाहनुहुन्छ?')) {
      const updated = clientBookings.filter(b => b.id !== bookingId);
      setClientBookings(updated);
      localStorage.setItem('vaidik_client_bookings', JSON.stringify(updated));
      deleteDoc(doc(db, CLIENT_BOOKINGS_COLLECTION, bookingId)).catch((e) => console.warn(e));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleResetEarnings = (guruId: string) => {
    if (window.confirm('के तपाईंले यस गुरुलाई भुक्तानी गरिसक्नुभयो? कमाई शून्य (0) बनाउन चाहनुहुन्छ?')) {
      const updated = gurusReport.map((g) => (g.id === guruId ? { ...g, totalEarningsRs: 0, consultationMinutes: 0, audioCallsCount: 0, videoCallsCount: 0, chatRepliesCount: 0 } : g));
      setGurusReport(updated);
      localStorage.setItem('vaidik_jyotish_gurus', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      alert('गुरुको आम्दानी सफलतापूर्वक शून्य (0) बनाइयो।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-amber-600/50 rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/80 p-2 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!isAuthenticated ? (
          <div className="py-8 px-4 text-center space-y-4 max-w-md mx-auto">
            <div className="inline-flex p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/30">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-amber-200">
              प्रशासक (Admin) लगइन
            </h3>
            <p className="text-xs text-slate-300">
              गुरु आवेदन स्वीकृति, प्रतिबन्ध (24h/Permanent), रिचार्ज र वित्तीय लग व्यवस्थापन गर्न एडमिन कोड प्रविष्ट गर्नुहोस्।
            </p>

            <form onSubmit={handleLogin} className="space-y-4 pt-2">
              <input
                type="password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="Admin Password"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 text-center font-mono tracking-widest"
              />
              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold py-3 rounded-xl shadow-lg transition-all text-sm cursor-pointer"
              >
                लगइन गर्नुहोस् (Login)
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between pb-4 border-b border-amber-900/40 gap-2">
              <div>
                <h3 className="text-xl font-serif font-bold text-amber-200 flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-400" /> एडमिन नियन्त्रण तथा रिपोर्ट प्यानल
                </h3>
                <p className="text-xs text-slate-400">
                  गुरु प्रतिबन्ध (24h/Permanent), पुनः स्वीकृति (Re-Accept), रिचार्ज भौचर र कमाई व्यवस्थापन।
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  लगआउट (Lock)
                </button>
              </div>
            </div>

            {/* Admin Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
              <button
                type="button"
                onClick={() => setActiveAdminTab('recharges')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeAdminTab === 'recharges' ? 'bg-amber-600 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                💳 ग्राहक रिचार्ज भौचर ({clientRecharges.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveAdminTab('applications')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeAdminTab === 'applications' ? 'bg-amber-600 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                📋 गुरु आवेदन ({guruApplications.filter(a => a.status === 'pending' || !a.status).length} पेन्डिङ)
              </button>
              <button
                type="button"
                onClick={() => setActiveAdminTab('gurus')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeAdminTab === 'gurus' ? 'bg-amber-600 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                👥 गुरु प्रतिबन्ध & कमाई ({gurusReport.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveAdminTab('bookings')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeAdminTab === 'bookings' ? 'bg-amber-600 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                🧾 बुकिङ रिपोर्ट ({clientBookings.length})
              </button>
            </div>

            {/* TAB 1: RECHARGE VOUCHERS */}
            {activeAdminTab === 'recharges' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-serif font-bold text-amber-200">
                    ग्राहक वालेट रिचार्ज भौचर प्रमाणीकरण (Wallet Recharge Approval & History Delete)
                  </h4>
                  <span className="text-xs bg-amber-950 text-amber-300 border border-amber-700 px-3 py-1 rounded-full font-mono font-semibold">
                    Total: {clientRecharges.length}
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                  {clientRecharges.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      हाल कुनै पनि ग्राहक रिचार्ज भौचर प्राप्त भएको छैन।
                    </div>
                  ) : (
                    clientRecharges.map((r) => (
                      <div key={r.id} className="bg-slate-800/90 border border-amber-600/40 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-200 text-sm">{r.clientName}</span>
                            <span className="text-xs text-slate-400">({r.clientPhone})</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              r.status === 'approved' 
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                                : r.status === 'rejected' 
                                ? 'bg-red-950 text-red-300 border border-red-800' 
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}>
                              {r.status === 'approved' ? 'स्वीकृत (Approved)' : r.status === 'rejected' ? 'अस्वीकृत (Rejected)' : 'पेन्डिङ (Pending)'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">
                            माध्यम: <strong className="text-amber-300">{r.paymentMethod}</strong> | रकम: <strong className="text-emerald-400 font-mono">रु {r.amount}</strong>
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            मिति: {new Date(r.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {r.voucherUrl && (
                            <a
                              href={r.voucherUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="block w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-500 shadow-md hover:scale-105 transition-transform"
                            >
                              <img src={r.voucherUrl} alt="Voucher" className="w-full h-full object-cover" />
                            </a>
                          )}
                          <div className="flex flex-col gap-1.5">
                            {r.status !== 'approved' && (
                              <button
                                type="button"
                                onClick={() => handleApproveRecharge(r.id)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs shadow transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" /> स्वीकृत (Approve)
                              </button>
                            )}
                            {r.status !== 'rejected' && (
                              <button
                                type="button"
                                onClick={() => handleRejectRecharge(r.id)}
                                className="bg-amber-900/60 hover:bg-amber-900 text-amber-200 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Ban className="w-3.5 h-3.5" /> अस्वीकार (Reject)
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteRecharge(r.id)}
                              className="bg-red-950/60 hover:bg-red-900 text-red-300 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> मेटाउनुहोस् (Delete)
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : activeAdminTab === 'applications' ? (
              /* TAB 2: GURU APPLICATIONS - Separate Independent Options for Approve, Reject, and Delete */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-serif font-bold text-amber-200">
                    नयाँ गुरु दर्ता आवेदन (अलग-अलग स्वीकृत, अस्वीकृत र मेटाउने विकल्पहरू)
                  </h4>
                  <span className="text-xs bg-amber-950 text-amber-300 border border-amber-700 px-3 py-1 rounded-full font-mono font-semibold">
                    Total: {guruApplications.length}
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                  {guruApplications.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      हाल कुनै पनि गुरु आवेदन प्राप्त भएको छैन।
                    </div>
                  ) : (
                    guruApplications.map((app) => (
                      <div key={app.id} className="bg-slate-800/90 border border-amber-600/40 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-200 text-sm">{app.name}</span>
                            <span className="text-xs text-slate-400">({app.phone})</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              app.status === 'approved' 
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                                : app.status === 'rejected' 
                                ? 'bg-red-950 text-red-300 border border-red-800' 
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}>
                              {app.status === 'approved' ? 'स्वीकृत (Approved)' : app.status === 'rejected' ? 'अस्वीकृत (Rejected)' : 'पेन्डिङ (Pending)'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">
                            योग्यता: <strong className="text-amber-300">{app.qualifications}</strong> ({app.experienceYears} वर्ष अनुभव)
                          </p>
                          <p className="text-xs text-slate-300">
                            विशेषज्ञता: <strong className="text-slate-200">{app.specializations?.join(', ')}</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {app.certificateUrl && (
                            <a
                              href={app.certificateUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="block w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-500 shadow-md hover:scale-105"
                            >
                              <img src={app.certificateUrl} alt="Cert" className="w-full h-full object-cover" />
                            </a>
                          )}
                          <div className="flex flex-col gap-1.5">
                            {/* Separate Dedicated Buttons for Approve, Reject, and Delete */}
                            <button
                              type="button"
                              onClick={() => handleApproveGuruApp(app.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs shadow cursor-pointer flex items-center gap-1"
                              title="स्वीकृत गर्नुहोस् (Approve)"
                            >
                              <Check className="w-3.5 h-3.5" /> स्वीकृत (Approve)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectGuruApp(app.id)}
                              className="bg-amber-900/60 hover:bg-amber-900 text-amber-200 px-3 py-1.5 rounded-xl text-xs cursor-pointer flex items-center gap-1"
                              title="अस्वीकार गर्नुहोस् (Reject)"
                            >
                              <Ban className="w-3.5 h-3.5" /> अस्वीकार (Reject)
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteGuruApp(app.id)}
                              className="bg-red-950/60 hover:bg-red-900 text-red-300 px-3 py-1.5 rounded-xl text-xs cursor-pointer flex items-center gap-1"
                              title="स्थायी रूपमा मेटाउनुहोस् (Delete)"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> मेटाउनुहोस् (Delete)
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : activeAdminTab === 'gurus' ? (
              /* TAB 3: GURUS BAN & EARNINGS MANAGEMENT */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-serif font-bold text-amber-200">
                    गुरु प्रतिबन्ध (24h / Permanent) तथा कमाई व्यवस्थापन
                  </h4>
                  <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-700 px-3 py-1 rounded-full font-mono font-semibold">
                    Total Gurus: {gurusReport.length}
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                  {gurusReport.map((guru) => {
                    const isBanned24h = guru.adminStatus === 'banned_24h';
                    const isBannedPerm = guru.adminStatus === 'banned_permanent';
                    const isRestricted = isBannedPerm || (isBanned24h && guru.bannedUntil && Date.now() < guru.bannedUntil);

                    return (
                      <div key={guru.id} className={`border rounded-2xl p-4 space-y-3 ${isRestricted ? 'bg-red-950/30 border-red-800/60' : 'bg-slate-800/90 border-amber-600/40'}`}>
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-serif font-bold text-amber-200 text-sm">{guru.name}</h5>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                isBannedPerm 
                                  ? 'bg-red-950 text-red-300 border border-red-800' 
                                  : isBanned24h && isRestricted 
                                  ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              }`}>
                                {isBannedPerm ? '🚫 स्थायी प्रतिबन्धित (Permanent Ban)' : isBanned24h && isRestricted ? '⏳ २४ घण्टा प्रतिबन्धित (24h Ban)' : '✅ सक्रिय (Active)'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">{guru.qualifications} | Phone: {guru.phone || 'N/A'}</p>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Ban Options or Re-Accept Option */}
                            {isRestricted ? (
                              <button
                                type="button"
                                onClick={() => handleReAcceptGuru(guru.id)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1 shadow"
                                title="प्रतिबन्ध फुकुवा गरी पुनः स्वीकृति दिनुहोस्"
                              >
                                <RefreshCw className="w-3.5 h-3.5" /> पुनः स्वीकृति (Re-Accept)
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleBanGuru(guru.id, '24h')}
                                  className="bg-amber-900/60 hover:bg-amber-900 text-amber-200 px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1"
                                  title="२४ घण्टा प्रतिबन्ध"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5" /> २४ घं. प्रतिबन्ध
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleBanGuru(guru.id, 'permanent')}
                                  className="bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 px-2.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1"
                                  title="स्थायी प्रतिबन्ध"
                                >
                                  <Ban className="w-3.5 h-3.5" /> स्थायी प्रतिबन्ध
                                </button>
                              </>
                            )}

                            <button
                              type="button"
                              onClick={() => handleResetEarnings(guru.id)}
                              className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap shadow"
                            >
                              कमाई शून्य बनाउनुहोस् (रु {guru.totalEarningsRs || 0})
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60">
                            <span className="text-slate-400 block text-[10px]">परामर्श समय</span>
                            <span className="font-mono font-bold text-amber-300">{guru.consultationMinutes || 0} मिनेट</span>
                          </div>
                          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60">
                            <span className="text-slate-400 block text-[10px]">अडियो कल</span>
                            <span className="font-mono font-bold text-slate-200">{guru.audioCallsCount || 0} पटक</span>
                          </div>
                          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60">
                            <span className="text-slate-400 block text-[10px]">भिडियो कल</span>
                            <span className="font-mono font-bold text-slate-200">{guru.videoCallsCount || 0} पटक</span>
                          </div>
                          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60">
                            <span className="text-slate-400 block text-[10px]">च्याट उत्तर</span>
                            <span className="font-mono font-bold text-slate-200">{guru.chatRepliesCount || 0} वटा</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* TAB 4: BOOKINGS */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-serif font-bold text-amber-200">
                    ग्राहक बुकिङ तथा भुक्तानी भौचर विवरण (Bookings)
                  </h4>
                  <span className="text-xs bg-amber-950 text-amber-300 border border-amber-700 px-3 py-1 rounded-full font-mono font-semibold">
                    Total Bookings: {clientBookings.length}
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                  {clientBookings.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      हाल कुनै पनि बुकिङ प्राप्त भएको छैन।
                    </div>
                  ) : (
                    clientBookings.map((b) => (
                      <div key={b.id} className="bg-slate-800/90 border border-amber-600/40 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-200 text-sm">{b.clientName}</span>
                            <span className="text-xs text-slate-400">({b.clientPhone})</span>
                          </div>
                          <p className="text-xs text-slate-300">
                            गुरु: <strong className="text-amber-300">{b.guruName}</strong> | सेवा: <strong className="text-slate-200">{b.serviceType}</strong>
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                            <span>रकम: <strong className="text-emerald-400">रु {b.amountPaid}</strong></span>
                            <span>मिति: {new Date(b.createdAt).toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {b.voucherUrl && (
                            <a
                              href={b.voucherUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="block w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-500 shadow-md hover:scale-105"
                            >
                              <img src={b.voucherUrl} alt="Voucher" className="w-full h-full object-cover" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteBooking(b.id)}
                            className="bg-red-950/60 hover:bg-red-900 text-red-300 px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> मेटाउनुहोस्
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
