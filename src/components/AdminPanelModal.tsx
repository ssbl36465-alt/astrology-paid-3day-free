import React, { useState } from 'react';
import { X, ShieldAlert, Key, Plus, Trash2, CheckCircle2, Clock, Smartphone, UserCheck, Edit3 } from 'lucide-react';
import { getAdminCodes, saveAdminCodes, generateActivationCode, createManualActivationCode, ActivationCode } from '../utils/subscriptionEngine';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({ isOpen, onClose }) => {
  const [adminPass, setAdminPass] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('jyotish_admin_auth') === 'true');
  const [codes, setCodes] = useState<ActivationCode[]>(getAdminCodes());
  const [selectedPackage, setSelectedPackage] = useState<'3months' | '6months' | '1year' | 'lifetime'>('1year');
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [manualCodeText, setManualCodeText] = useState('');
  const [generatedMsg, setGeneratedMsg] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPass.trim() === '2m2du6hkx9') {
      setIsAuthenticated(true);
      localStorage.setItem('jyotish_admin_auth', 'true');
      setCodes(getAdminCodes());
    } else {
      alert('गलत एडमिन कोड! (Incorrect Code)');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jyotish_admin_auth');
    setIsAuthenticated(false);
    setAdminPass('');
  };

  const handleGenerate = () => {
    const newCode = generateActivationCode(selectedPackage);
    setCodes(getAdminCodes());
    setGeneratedMsg(`अटो कोड तयार भयो: ${newCode.code}`);
  };

  const handleManualCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createManualActivationCode(manualCodeText, selectedPackage);
    if (res.success) {
      setCodes(getAdminCodes());
      setGeneratedMsg(res.message);
      setManualCodeText('');
    } else {
      alert(res.message);
    }
  };

  const handleDelete = (codeStr: string) => {
    const currentCodes = getAdminCodes();
    const updated = currentCodes.filter((c) => c.code.trim().toUpperCase() !== codeStr.trim().toUpperCase());
    saveAdminCodes(updated);
    setCodes(updated);
    setGeneratedMsg(`कोड ${codeStr} सफलतापूर्वक मेटाइयो।`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-amber-600/50 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/80 p-2 rounded-full transition-colors"
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
              सदस्यता कोडहरू व्यवस्थापन गर्न एडमिन कोड प्रविष्ट गर्नुहोस्। (कोड: <code className="text-amber-300 font-mono">2m2du6hkx9</code>)
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
                  <Key className="w-5 h-5 text-amber-400" /> एडमिन कोड व्यवस्थापन प्यानल
                </h3>
                <p className="text-xs text-slate-400">
                  ग्राहकहरूको लागि नयाँ सक्रियता कोड (Activation Codes) जेनेरेट गर्नुहोस्।
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-amber-950 text-amber-300 border border-amber-700/60 px-3 py-1 rounded-full font-mono">
                  Total Codes: {codes.length}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 px-3 py-1 rounded-full transition-colors cursor-pointer"
                  title="Lock Admin Panel"
                >
                  लगआउट (Lock)
                </button>
              </div>
            </div>

            {/* Code Generator / Manual Creation Controls */}
            <div className="bg-slate-800/90 border border-amber-600/30 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-2">
                <span className="text-xs font-semibold text-amber-300">नयाँ कोड बनाउने तरिका (Method):</span>
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setMode('auto')}
                    className={`px-3 py-1 rounded-lg transition-all ${mode === 'auto' ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    अटो जेनेरेट (Auto)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('manual')}
                    className={`px-3 py-1 rounded-lg transition-all ${mode === 'manual' ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                  >
                    आफैं लेख्ने (Manual)
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="3months">३ महिना (रु ३५१)</option>
                  <option value="6months">६ महिना (रु ६५१)</option>
                  <option value="1year">१ वर्ष (रु १,१११)</option>
                  <option value="lifetime">आजीवन / Lifetime (रु ३,९९९)</option>
                </select>

                {mode === 'auto' ? (
                  <button
                    onClick={handleGenerate}
                    className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> अटो कोड जेनेरेट गर्नुहोस्
                  </button>
                ) : (
                  <form onSubmit={handleManualCreate} className="flex flex-1 items-center gap-2">
                    <input
                      type="text"
                      value={manualCodeText}
                      onChange={(e) => setManualCodeText(e.target.value)}
                      placeholder="उदा. MYCUSTOMCODE123"
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-200 placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono uppercase"
                    />
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Edit3 className="w-4 h-4" /> कोड सेभ गर्नुहोस्
                    </button>
                  </form>
                )}
              </div>

              {generatedMsg && (
                <div className="bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 px-3 py-2 rounded-xl text-xs font-mono">
                  {generatedMsg}
                </div>
              )}
            </div>

            {/* Codes List Table */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">सक्रिय र प्रयोग गरिएका कोडहरूको सूची:</span>
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {codes.map((c, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs ${
                      c.status === 'used'
                        ? 'bg-slate-950/60 border-slate-800 text-slate-400'
                        : 'bg-slate-800/70 border-amber-600/40 text-slate-200'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-300 tracking-wider text-sm">{c.code}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            c.status === 'used'
                              ? 'bg-red-950 text-red-300 border border-red-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {c.status === 'used' ? '🔒 प्रयोग भइसकेको (Locked)' : '🟢 उपलब्ध (Active)'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-3">
                        <span>प्याकेज: <strong className="text-amber-200">{c.packageType}</strong></span>
                        <span>मिति: {new Date(c.createdAt).toLocaleDateString()}</span>
                        {c.usedByDeviceId && (
                          <span className="flex items-center gap-1 text-slate-500 font-mono">
                            <Smartphone className="w-3 h-3" /> {c.usedByDeviceId.substring(0, 10)}...
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(c.code)}
                      className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-950/50 transition-colors cursor-pointer"
                      title="Delete Code"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
