import React, { useState } from 'react';
import { Phone, Mail, MessageCircle, Calendar, MapPin, Sparkles, CheckCircle, Send, X, User, Award, Shield } from 'lucide-react';

interface BookingFormData {
  clientName: string;
  whatsappNumber: string;
  location: string;
  serviceType: string;
  mode: 'Online (अनलाइन)' | 'Offline (प्रत्यक्ष/भौतिक)';
  dateTime: string;
}

export function DigitalVisitingCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    clientName: '',
    whatsappNumber: '',
    location: '',
    serviceType: 'चिना हेराउने तथा बनाउने',
    mode: 'Online (अनलाइन)',
    dateTime: '',
  });

  const services = [
    'चिना टिपण हेराउने तथा बनाउने',
    'ग्रह शान्ति पूजा-पाठ सम्पूर्ण कर्मकाण्ड',
    'वास्तु परामर्श तथा वास्तु दोष निवारण',
    'पूजा / ई-पूजा (Puja / e-Puja Online)',
    'पुराण वाचन तथा अन्य सेवाहरू',
  ];

  const serviceOptions = [
    'चिना हेराउने तथा बनाउने',
    'ग्रह शान्ति तथा कर्मकाण्ड',
    'वास्तु परामर्श',
    'पूजा / ई-पूजा (Online Puja)',
    'पुराण वाचन',
    'अन्य ज्योतिषीय सेवा',
  ];

  const handleWhatsAppBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `नमस्ते गुरुज्यू, म ${formData.clientName} बोलिरहेको छु।\nमलाई ${formData.serviceType} सेवासम्बन्धी बुक गर्नु थियो।\n- माध्यम: ${formData.mode}\n- स्थान: ${formData.location || 'उल्लेख छैन'}\n- समय/मिति: ${formData.dateTime || 'शीघ्र'}\n- मेरो सम्पर्क नम्बर: ${formData.whatsappNumber}`;
    
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/9779863991384?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Digital Business Card Header / Banner */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> आधिकारिक डिजिटल कार्ड & बुकिङ सेवा
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-200">
          ज्योतिष परामर्श केन्द्र
        </h2>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          वैदिक ज्योतिष, कर्मकाण्ड, वास्तुशास्त्र तथा आध्यात्मिक परामर्शको लागि भरपर्दो केन्द्र।
        </p>
      </div>

      {/* Main Visiting Card Container */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden">
        {/* Background Decorative Glows */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-yellow-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left: Astrologer Avatar & Branding (4 cols) */}
          <div className="md:col-span-5 flex flex-col items-center text-center space-y-4 border-b md:border-b-0 md:border-r border-amber-900/40 pb-6 md:pb-0 md:pr-8">
            <div className="relative">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-full blur opacity-75 animate-pulse"></div>
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-slate-950 border-2 border-amber-400 p-1 flex items-center justify-center overflow-hidden shadow-xl">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-950 to-slate-900 flex items-center justify-center text-amber-300">
                  <span className="text-5xl font-serif font-bold text-amber-400 animate-pulse">ॐ</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-bold font-serif text-amber-100">
                ज्योतिष युवा पण्डित शम्भु प्रसाद लम्साल (Binay)
              </h3>
              <p className="text-xs text-amber-400 font-medium">
                वैदिक ज्योतिषी तथा कर्मकाण्ड विशेषज्ञ
              </p>
              <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 pt-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> प्रमाणित वैदिक परामर्शदाता
              </div>
            </div>

            {/* Quick WhatsApp Direct Button */}
            <a
              href="https://wa.me/9779863991384"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/40 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" /> सिधा ह्वाट्सएप च्याट (Chat Now)
            </a>
          </div>

          {/* Right: Services & Contact Info (7 cols) */}
          <div className="md:col-span-7 space-y-6">
            {/* Services List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> उपलब्ध सेवाहरू (Services Offered)
              </h4>
              <ul className="grid grid-cols-1 gap-2">
                {services.map((service, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm text-slate-200 bg-slate-950/60 border border-slate-800/80 p-2.5 rounded-xl hover:border-amber-500/50 transition-all"
                  >
                    <CheckCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-900/30 text-xs">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium flex items-center gap-1.5 text-[11px]">
                  <Phone className="w-3.5 h-3.5 text-amber-400" /> सम्पर्क नम्बरहरू (Phones)
                </span>
                <div className="flex items-center gap-1 font-mono font-bold text-amber-200 text-sm">
                  <a href="tel:9863991384" className="hover:underline text-amber-300">9863991384</a>
                  <span>/</span>
                  <a href="tel:9805674119" className="hover:underline text-amber-300">9805674119</a>
                </div>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 font-medium flex items-center gap-1.5 text-[11px]">
                  <Mail className="w-3.5 h-3.5 text-amber-400" /> इमेल ठेगाना (Email)
                </span>
                <a href="mailto:astrologyconsultant2@gmail.com" className="font-mono text-slate-200 hover:text-amber-300 hover:underline truncate text-[11px] pt-0.5 block">
                  astrologyconsultant2@gmail.com
                </a>
              </div>
            </div>

            {/* Book Now Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-600/30 cursor-pointer transform hover:scale-[1.01]"
            >
              <Calendar className="w-5 h-5 text-slate-950" />
              📅 Booking
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal / Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-slate-900 border border-amber-600/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-amber-900/40">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif text-amber-200">ज्योतिष सेवा बुकिङ फारम</h3>
                  <p className="text-xs text-slate-400">Fill details to send instant WhatsApp booking request</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWhatsAppBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300/90 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" /> १. ग्राहकको नाम (Client Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="तपाईंको पूरा नाम लेख्नुहोस्"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 focus:border-amber-500 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300/90 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-amber-400" /> २. सम्पर्क ह्वाट्सएप नम्बर (WhatsApp Number) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="98XXXXXXXX"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="w-full bg-slate-800/80 border border-slate-700 focus:border-amber-500 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300/90 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" /> ३. स्थान / ठेगाना (Location)
                  </label>
                  <input
                    type="text"
                    placeholder="शहर वा जिल्ला"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 focus:border-amber-500 text-slate-100 rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300/90 mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> ४. सेवाको प्रकार (Service Type) *
                  </label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 focus:border-amber-500 text-slate-100 rounded-xl px-3 py-2.5 text-xs outline-none"
                  >
                    {serviceOptions.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300/90 mb-1.5">
                    ५. सेवाको माध्यम (Mode)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, mode: 'Online (अनलाइन)' })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        formData.mode === 'Online (अनलाइन)'
                          ? 'bg-amber-600 text-slate-950 border-amber-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      Online (अनलाइन)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, mode: 'Offline (प्रत्यक्ष/भौतिक)' })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        formData.mode === 'Offline (प्रत्यक्ष/भौतिक)'
                          ? 'bg-amber-600 text-slate-950 border-amber-500'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      Offline (प्रत्यक्ष)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300/90 mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" /> ६. इच्छित मिति र समय (Date & Time)
                  </label>
                  <input
                    type="text"
                    placeholder="مثلاً: भोलि दिउँसो २ बजे"
                    value={formData.dateTime}
                    onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                    className="w-full bg-slate-800/80 border border-slate-700 focus:border-amber-500 text-slate-100 rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Confirm & Send to WhatsApp (ह्वाट्सएपमा पठाउनुहोस्)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
