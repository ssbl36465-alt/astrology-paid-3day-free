import React, { useState } from 'react';
import { Wallet, CreditCard, Upload, CheckCircle, QrCode, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

interface WalletRechargeViewProps {
  language: 'ne' | 'en';
  theme: 'dark' | 'light';
}

export const WalletRechargeView: React.FC<WalletRechargeViewProps> = ({ language, theme }) => {
  const isNe = language === 'ne';
  const isDark = theme === 'dark';

  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem('vaidik_client_wallet_balance');
    return saved ? parseFloat(saved) : 500; // Default welcome balance Rs 500
  });

  const [amount, setAmount] = useState<string>('500');
  const [selectedMethod, setSelectedMethod] = useState<'esewa' | 'khalti' | 'bank'>('esewa');
  const [voucherUrl, setVoucherUrl] = useState<string>('');
  const [customQrs, setCustomQrs] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('vaidik_custom_qrs');
    return saved ? JSON.parse(saved) : {};
  });
  const [successMsg, setSuccessMsg] = useState<string>('');

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updated = { ...customQrs, [selectedMethod]: reader.result as string };
        setCustomQrs(updated);
        localStorage.setItem('vaidik_custom_qrs', JSON.stringify(updated));
      };
      reader.readAsDataURL(file);
    }
  };
  const [transactions, setTransactions] = useState<Array<{ id: string; amount: number; method: string; date: string; status: string }>>(() => {
    const saved = localStorage.getItem('vaidik_client_transactions');
    return saved ? JSON.parse(saved) : [
      { id: 'TXN-1001', amount: 500, method: 'Welcome Bonus', date: new Date().toLocaleDateString(), status: 'Completed' }
    ];
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVoucherUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRechargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const topupAmount = parseFloat(amount);
    if (!topupAmount || topupAmount <= 0) {
      alert(isNe ? 'कृपया सही रकम छान्नुहोस् वा लेख्नुहोस्।' : 'Please enter valid recharge amount.');
      return;
    }
    if (!voucherUrl) {
      alert(isNe ? 'कृपया भुक्तानी भौचर वा स्क्रिनसट अपलोड गर्नुहोस्।' : 'Please upload payment voucher screenshot.');
      return;
    }

    const newBalance = balance + topupAmount;
    setBalance(newBalance);
    localStorage.setItem('vaidik_client_wallet_balance', newBalance.toString());

    const newTxn = {
      id: 'TXN-' + Math.floor(1000 + Math.random() * 9000),
      amount: topupAmount,
      method: selectedMethod.toUpperCase(),
      date: new Date().toLocaleString(),
      status: 'Approved & Credited',
    };

    const updatedTxns = [newTxn, ...transactions];
    setTransactions(updatedTxns);
    localStorage.setItem('vaidik_client_transactions', JSON.stringify(updatedTxns));

    // Save to admin client recharges
    const rechargeRecord = {
      id: newTxn.id,
      clientName: localStorage.getItem('vaidik_client_name') || 'Valued Client',
      clientPhone: localStorage.getItem('vaidik_client_phone') || '+977 9863991384',
      amount: topupAmount,
      paymentMethod: selectedMethod.toUpperCase(),
      voucherUrl: voucherUrl,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    const existingRecharges = JSON.parse(localStorage.getItem('vaidik_client_recharges') || '[]');
    localStorage.setItem('vaidik_client_recharges', JSON.stringify([rechargeRecord, ...existingRecharges]));

    // Open WhatsApp
    const waText = encodeURIComponent(`रिचार्ज प्रमाणित गरी ब्यालेन्स जोड्नुहोस्, छिटो गर्न WhatsApp मा SMS गर्नुहोला।\n\n*Recharge Details:*\n- ID: ${newTxn.id}\n- Amount: रु ${topupAmount}\n- Method: ${selectedMethod.toUpperCase()}\n- Date: ${newTxn.date}\n- Voucher: Attached`);
    window.open(`https://wa.me/9863991384?text=${waText}`, '_blank');

    setSuccessMsg(isNe ? `रु ${topupAmount} को भौचर एडमिन प्यानलमा पठाइयो र WhatsApp मा सन्देश खुल्दैछ!` : `Rs ${topupAmount} voucher sent to Admin Panel & WhatsApp opened!`);
    setVoucherUrl('');
    setTimeout(() => setSuccessMsg(''), 6000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border border-amber-600/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Wallet className="w-4 h-4 text-amber-400" /> {isNe ? 'ग्राहक वालेट तथा रिचार्ज' : 'Client Wallet & Recharge'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-200">
            {isNe ? 'परामर्शका लागि वालेट टपअप गर्नुहोस्' : 'Top-up Wallet for Consultations'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            {isNe 
              ? 'गुरुहरूसँग प्रत्यक्ष अडियो/भिडियो कल र च्याट परामर्श गर्न आफ्नो वालेटमा रुकम जम्मा गर्नुहोस्।' 
              : 'Add funds to your wallet for seamless audio, video calls and chat consultations with expert gurus.'}
          </p>
        </div>

        {/* Current Balance Card */}
        <div className="bg-slate-900/90 border border-amber-500/60 p-5 rounded-2xl text-center min-w-[220px] shadow-xl">
          <span className="text-xs text-amber-300 font-semibold uppercase">{isNe ? 'हालको वालेट ब्यालेन्स' : 'Current Wallet Balance'}</span>
          <h3 className="text-3xl font-mono font-bold text-amber-400 my-1">रु {balance}</h3>
          <span className="text-[11px] text-emerald-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> {isNe ? 'सुरक्षित तथा प्रमाणित' : 'Secure & Verified'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recharge Form (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-amber-600/30 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <h3 className="text-lg font-serif font-bold text-amber-200 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" /> {isNe ? 'वालेट रिचार्ज फारम' : 'Wallet Recharge Form'}
          </h3>

          {successMsg && (
            <div className="bg-emerald-950/80 border border-emerald-600 text-emerald-200 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleRechargeSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-amber-300 block mb-1.5">
                {isNe ? 'रिचार्ज रकम छान्नुहोस् वा लेख्नुहोस् (रु):' : 'Select or Enter Amount (Rs):'}
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {['200', '500', '1000', '2500'].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      amount === val 
                        ? 'bg-amber-600 text-slate-950 shadow-md' 
                        : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    रु {val}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                placeholder="रकम लेख्नुहोस्..."
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-amber-300 block mb-1.5">
                {isNe ? 'भुक्तानी माध्यम (Payment Method):' : 'Payment Method:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'esewa', label: 'eSewa' },
                  { id: 'khalti', label: 'Khalti' },
                  { id: 'bank', label: 'Bank Transfer' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m.id as any)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedMethod === m.id
                        ? 'bg-amber-600 text-slate-950 font-bold shadow'
                        : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Methods - Separate Individual Cards (Without top WhatsApp buttons) */}
            <div className="space-y-4">
              <label className="text-xs font-semibold text-amber-300 block">
                {isNe ? 'आधिकारिक भुक्तानी माध्यमहरू (Official Payment Details):' : 'Official Payment Methods:'}
              </label>

              {/* 1. eSewa Card */}
              <div className="bg-slate-950 border border-emerald-500/40 p-4 rounded-2xl shadow-lg space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> eSewa Wallet
                  </span>
                  <span className="text-[11px] text-slate-300 font-medium">नाम: Shambhu Lamsal</span>
                </div>
                <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div>
                    <p className="text-[10px] text-slate-400">{isNe ? 'मोबाइल नम्बर:' : 'Mobile Number:'}</p>
                    <p className="font-mono font-bold text-amber-300 text-sm select-all">9863991384</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('9863991384');
                      alert(isNe ? 'eSewa नम्बर कपी भयो!' : 'eSewa number copied!');
                    }}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium cursor-pointer border border-slate-700"
                  >
                    {isNe ? 'कपी' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* 2. Khalti Card */}
              <div className="bg-slate-950 border border-purple-500/40 p-4 rounded-2xl shadow-lg space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Khalti Wallet
                  </span>
                  <span className="text-[11px] text-slate-300 font-medium">नाम: Shambu Lamsal</span>
                </div>
                <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div>
                    <p className="text-[10px] text-slate-400">{isNe ? 'मोबाइल नम्बर:' : 'Mobile Number:'}</p>
                    <p className="font-mono font-bold text-amber-300 text-sm select-all">9810465055</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('9810465055');
                      alert(isNe ? 'Khalti नम्बर कपी भयो!' : 'Khalti number copied!');
                    }}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium cursor-pointer border border-slate-700"
                  >
                    {isNe ? 'कपी' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* 3. Nabil Bank Card */}
              <div className="bg-slate-950 border border-cyan-500/40 p-4 rounded-2xl shadow-lg space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Nabil Bank A/C
                  </span>
                  <span className="text-[11px] text-slate-300 font-medium">SHAMBU LAMSAL</span>
                </div>
                <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <div>
                    <p className="text-[10px] text-slate-400">{isNe ? 'खाता नम्बर (A/C No):' : 'Account Number:'}</p>
                    <p className="font-mono font-bold text-amber-300 text-sm select-all">04110017507343</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">NABIL GEN N ACCOUNT</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('04110017507343');
                      alert(isNe ? 'बैंक खाता नम्बर कपी भयो!' : 'Bank account number copied!');
                    }}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium cursor-pointer border border-slate-700"
                  >
                    {isNe ? 'कपी' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            {/* Voucher Screenshot Upload */}
            <div>
              <label className="text-xs font-semibold text-amber-300 block mb-1.5">
                {isNe ? 'भुक्तानी भौचर / स्क्रिनसट अपलोड गर्नुहोस् (Voucher Upload):' : 'Upload Payment Voucher Screenshot:'}
              </label>
              <div className="border-2 border-dashed border-amber-600/40 rounded-2xl p-4 text-center hover:border-amber-500 transition-colors bg-slate-950">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="wallet-voucher-upload"
                />
                <label htmlFor="wallet-voucher-upload" className="cursor-pointer space-y-2 block">
                  <Upload className="w-8 h-8 text-amber-400 mx-auto" />
                  <span className="text-xs font-semibold text-slate-200 block">
                    {voucherUrl ? (isNe ? '✅ भौचर अपलोड भयो' : '✅ Voucher Uploaded') : (isNe ? 'फाइल चयन गर्न यहाँ क्लिक गर्नुहोस्' : 'Click here to upload voucher image')}
                  </span>
                </label>
                {voucherUrl && (
                  <div className="mt-2">
                    <img src={voucherUrl} alt="Voucher preview" className="w-20 h-20 object-cover rounded-xl mx-auto border border-amber-500" />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold py-3 rounded-2xl shadow-xl transition-all text-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span>{isNe ? 'रिचार्ज प्रमाणित गरी ब्यालेन्स जोड्नुहोस्' : 'Verify & Add to Wallet'}</span>
            </button>
          </form>
        </div>

        {/* Transaction History (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-amber-600/30 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-lg font-serif font-bold text-amber-200 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" /> {isNe ? 'कारोबार इतिहास (Transactions)' : 'Transaction History'}
          </h3>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {transactions.map((txn, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-mono font-bold text-amber-300">{txn.id}</span>
                  <p className="text-[11px] text-slate-400">{txn.method} • {txn.date}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-emerald-400">+ रु {txn.amount}</span>
                  <span className="block text-[10px] text-slate-400">{txn.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
