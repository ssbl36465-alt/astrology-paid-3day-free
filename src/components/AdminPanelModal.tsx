import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Key, Trash2, Smartphone, UserCheck, DollarSign, Award, Users, FileText, Image as ImageIcon, Wallet } from 'lucide-react';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
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
}

interface ClientBooking {
  id: string;
  clientName: string;
  clientPhone: string;
  guruId: string;
  guruName: string;
  serviceType: string;
  amountPaid: number;
  voucherUrl: string;
  createdAt: string;
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
  status: string;
}

interface ClientRecharge {
  id: string;
  clientName: string;
  clientPhone: string;
  amount: number;
  paymentMethod: string;
  voucherUrl: string;
  createdAt: string;
  status: string;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ isOpen, onClose }) => {
  const isNe = true;
  const [adminPass, setAdminPass] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('jyotish_admin_auth') === 'true');
  const [activeAdminTab, setActiveAdminTab] = useState<'recharges' | 'applications' | 'gurus' | 'bookings'>('recharges');
  const [gurusReport, setGurusReport] = useState<GuruReport[]>([]);
  const [clientBookings, setClientBookings] = useState<ClientBooking[]>([]);
  const [guruApplications, setGuruApplications] = useState<GuruApplication[]>([]);
  const [clientRecharges, setClientRecharges] = useState<ClientRecharge[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      const savedGurus = localStorage.getItem('vaidik_jyotish_gurus');
      if (savedGurus) {
        try { setGurusReport(JSON.parse(savedGurus)); } catch (e) { setGurusReport([]); }
      }
      const savedBookings = localStorage.getItem('vaidik_client_bookings');
      if (savedBookings) {
        try { setClientBookings(JSON.parse(savedBookings)); } catch (e) { setClientBookings([]); }
      }
      const savedApps = localStorage.getItem('vaidik_guru_applications');
      if (savedApps) {
        try { setGuruApplications(JSON.parse(savedApps)); } catch (e) { setGuruApplications([]); }
      }
      const savedRecharges = localStorage.getItem('vaidik_client_recharges');
      if (savedRecharges) {
        try { setClientRecharges(JSON.parse(savedRecharges)); } catch (e) { setClientRecharges([]); }
      }
    }
  }, [isAuthenticated, isOpen]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPass.trim() === '2m2du6hkx9') {
      setIsAuthenticated(true);
      localStorage.setItem('jyotish_admin_auth', 'true');
    } else {
      alert('गलत एडमिन कोड! (Incorrect Code)');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jyotish_admin_auth');
    setIsAuthenticated(false);
    setAdminPass('');
  };

  // Reset Guru Earnings to 0 after payment
  const handleResetEarnings = (guruId: string) => {
    if (window.confirm('के तपाईंले यस गुरुलाई भुक्तानी गरिसक्नुभयो? कमाई शून्य (0) बनाउने?')) {
      const updated = gurusReport.map((g) => (g.id === guruId ? { ...g, totalEarningsRs: 0, consultationMinutes: 0, audioCallsCount: 0, videoCallsCount: 0, chatRepliesCount: 0 } : g));
      setGurusReport(updated);
      localStorage.setItem('vaidik_jyotish_gurus', JSON.stringify(updated));
      alert('गुरुको आम्दानी सफलतापूर्वक शून्य (0) बनाइयो।');
    }
  };

  const handleApproveRecharge = (rechargeId: string) => {
    const updated = clientRecharges.map((r) => r.id === rechargeId ? { ...r, status: 'approved' } : r);
    setClientRecharges(updated);
    localStorage.setItem('vaidik_client_recharges', JSON.stringify(updated));
    alert('ग्राहकको रिचार्ज भौचर प्रमाणित तथा स्वीकृत गरियो।');
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
              ग्राहक रिचार्ज, गुरु आवेदन, कमाई तथा बुकिङ भौचर व्यवस्थापन गर्न एडमिन कोड प्रविष्ट गर्नुहोस्। (कोड: <code className="text-amber-300 font-mono">2m2du6hkx9</code>)
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
                  ग्राहक रिचार्ज भौचर, गुरु आवेदन, कमाई र बुकिङ रिपोर्ट।
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                  title="Lock Admin Panel"
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
                💳 ग्राहक रिचार्ज ({clientRecharges.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveAdminTab('applications')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeAdminTab === 'applications' ? 'bg-amber-600 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                📋 गुरु आवेदन ({guruApplications.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveAdminTab('gurus')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeAdminTab === 'gurus' ? 'bg-amber-600 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                👥 गुरु कमाई & भुक्तानी
              </button>
              <button
                type="button"
                onClick={() => setActiveAdminTab('bookings')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${activeAdminTab === 'bookings' ? 'bg-amber-600 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
              >
                🧾 ग्राहक बुकिङ & भौचर
              </button>
            </div>

            {activeAdminTab === 'recharges' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-serif font-bold text-amber-200">
                    {isNe ? 'ग्राहकहरूले वालेट रिचार्जका लागि पठाएका भौचरहरू' : 'Client Wallet Recharge Vouchers'}
                  </h4>
                  <span className="text-xs bg-amber-950 text-amber-300 border border-amber-700 px-3 py-1 rounded-full font-mono font-semibold">
                    Total: {clientRecharges.length}
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                  {clientRecharges.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      {isNe ? 'हाल कुनै पनि ग्राहक रिचार्ज भौचर प्राप्त भएको छैन।' : 'No client recharge vouchers found.'}
                    </div>
                  ) : (
                    clientRecharges.map((r) => (
                      <div key={r.id} className="bg-slate-800/90 border border-amber-600/40 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-200 text-sm">{r.clientName}</span>
                            <span className="text-xs text-slate-400">({r.clientPhone})</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${r.status === 'approved' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
                              {r.status === 'approved' ? 'प्रमाणित (Approved)' : 'पेन्डिङ (Pending)'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">
                            भुक्तानी माध्यम: <strong className="text-amber-300">{r.paymentMethod}</strong> | रकम: <strong className="text-emerald-400 font-mono">रु {r.amount}</strong>
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
                              className="block w-20 h-20 rounded-xl overflow-hidden border-2 border-amber-500 shadow-md hover:scale-105 transition-transform"
                            >
                              <img src={r.voucherUrl} alt="Recharge Voucher" className="w-full h-full object-cover" />
                            </a>
                          )}
                          {r.status !== 'approved' && (
                            <button
                              type="button"
                              onClick={() => handleApproveRecharge(r.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs shadow transition-all cursor-pointer whitespace-nowrap"
                            >
                              स्वीकृत गर्नुहोस्
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : activeAdminTab === 'applications' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-serif font-bold text-amber-200">
                    {isNe ? 'गुरुहरूले भरेका आवेदन फारमहरू (Guru Applications)' : 'Guru Registration Applications'}
                  </h4>
                  <span className="text-xs bg-amber-950 text-amber-300 border border-amber-700 px-3 py-1 rounded-full font-mono font-semibold">
                    Total Applications: {guruApplications.length}
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                  {guruApplications.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      {isNe ? 'हाल कुनै पनि नयाँ गुरु आवेदन प्राप्त भएको छैन।' : 'No guru applications found.'}
                    </div>
                  ) : (
                    guruApplications.map((app) => (
                      <div key={app.id} className="bg-slate-800/90 border border-amber-600/40 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-amber-200 text-sm">{app.name}</span>
                            <span className="text-xs text-slate-400">({app.phone})</span>
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-mono">
                              अनुभव: {app.experienceYears} वर्ष | उमेर: {app.age}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">
                            योग्यता: <strong className="text-amber-300">{app.qualifications}</strong>
                          </p>
                          <p className="text-xs text-slate-300">
                            विशेषज्ञता: <strong className="text-slate-200">{app.specializations?.join(', ')}</strong>
                          </p>
                          <p className="text-xs text-slate-400 italic">
                            थप विवरण: {app.otherDetails}
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            आवेदन मिति: {new Date(app.createdAt).toLocaleString()}
                          </span>
                        </div>

                        {app.certificateUrl && (
                          <div className="flex items-center gap-3">
                            <a
                              href={app.certificateUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="block w-20 h-20 rounded-xl overflow-hidden border-2 border-amber-500 shadow-md hover:scale-105 transition-transform"
                            >
                              <img src={app.certificateUrl} alt="Certificate" className="w-full h-full object-cover" />
                            </a>
                            <span className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                              <ImageIcon className="w-4 h-4" /> प्रमाणपत्र
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : activeAdminTab === 'gurus' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-serif font-bold text-amber-200">
                    {isNe ? 'सबै गुरुहरूको कमाई तथा भुक्तानी व्यवस्थापन (Reset Earnings to 0)' : 'All Gurus Earnings & Clear to 0'}
                  </h4>
                  <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-700 px-3 py-1 rounded-full font-mono font-semibold">
                    Total Gurus: {gurusReport.length}
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                  {gurusReport.map((guru) => (
                    <div key={guru.id} className="bg-slate-800/90 border border-amber-600/40 rounded-2xl p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-2">
                        <div>
                          <h5 className="font-serif font-bold text-amber-200 text-sm">{guru.name}</h5>
                          <p className="text-[11px] text-slate-400">{guru.qualifications}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-xs text-emerald-300 font-mono font-bold block">रु {guru.totalEarningsRs || 0}</span>
                            <span className="text-[10px] text-slate-400">कुल आम्दानी (Earnings)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleResetEarnings(guru.id)}
                            className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap shadow"
                            title="Reset earnings to 0 after payment"
                          >
                            भुक्तानी गरियो - ० बनाउनुहोस्
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60">
                          <span className="text-slate-400 block text-[10px]">परामर्श समय (Time)</span>
                          <span className="font-mono font-bold text-amber-300">{guru.consultationMinutes || 0} मिनेट</span>
                        </div>
                        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60">
                          <span className="text-slate-400 block text-[10px]">अडियो कल (रु २५)</span>
                          <span className="font-mono font-bold text-slate-200">{guru.audioCallsCount || 0} पटक</span>
                        </div>
                        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60">
                          <span className="text-slate-400 block text-[10px]">भिडियो कल (रु ५०)</span>
                          <span className="font-mono font-bold text-slate-200">{guru.videoCallsCount || 0} पटक</span>
                        </div>
                        <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700/60">
                          <span className="text-slate-400 block text-[10px]">च्याट उत्तर (रु १०)</span>
                          <span className="font-mono font-bold text-slate-200">{guru.chatRepliesCount || 0} वटा</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-serif font-bold text-amber-200">
                    {isNe ? 'ग्राहकहरूले भुक्तानी गरी बुकिङ गरेका भौचर तथा विवरणहरू' : 'Client Bookings & Payment Vouchers'}
                  </h4>
                  <span className="text-xs bg-amber-950 text-amber-300 border border-amber-700 px-3 py-1 rounded-full font-mono font-semibold">
                    Total Bookings: {clientBookings.length}
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                  {clientBookings.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      {isNe ? 'हाल कुनै पनि ग्राहक बुकिङ तथा भौचर प्राप्त भएको छैन।' : 'No client bookings or vouchers found.'}
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
                            <span>भुक्तानी रकम: <strong className="text-emerald-400">रु {b.amountPaid}</strong></span>
                            <span>मिति: {new Date(b.createdAt).toLocaleString()}</span>
                          </div>
                        </div>

                        {b.voucherUrl ? (
                          <div className="flex items-center gap-3">
                            <a
                              href={b.voucherUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="block w-20 h-20 rounded-xl overflow-hidden border-2 border-amber-500 shadow-md hover:scale-105 transition-transform"
                            >
                              <img src={b.voucherUrl} alt="Voucher" className="w-full h-full object-cover" />
                            </a>
                            <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                              <ImageIcon className="w-4 h-4" /> भौचर स्क्रिनसट
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">भौचर छैन</span>
                        )}
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
