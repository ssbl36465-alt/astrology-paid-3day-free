import React, { useState } from 'react';
import { KundaliCalculationOutput, Language } from '../types/astrology';
import { Bot, Send, Sparkles, User, RefreshCw, MessageSquare, Award } from 'lucide-react';

interface PanditShambhuAIAssistantProps {
  data: KundaliCalculationOutput;
  language: Language;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export const PanditShambhuAIAssistant: React.FC<PanditShambhuAIAssistantProps> = ({ data, language }) => {
  const isNe = language === 'ne';
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: isNe
        ? 'नमस्कार! म ज्योतिष युवा पण्डित शम्भु प्रसाद लम्साल (Binay) को आधिकारिक AI ज्योतिषीय सहायक हुँ। तपाईंको कुण्डली (लग्न: ' + (data.ascendant.signNameNe) + ', राशी: ' + (data.grahas.find(g => g.name === 'Moon')?.signNameNe || 'चन्द्र') + ') का आधारमा यहाँलाई जीवन, करियर, स्वास्थ्य, धन वा ग्रह शान्तिबारे के जान्नु छ? कृपया सोध्नुहोस्।'
        : 'Namaste! I am the official AI Astrology Assistant of Youth Astrologer Pandit Shambhu Prasad Lamsal (Binay). Based on your Kundali (Ascendant: ' + data.ascendant.signNameEn + ', Moon Sign: ' + (data.grahas.find(g => g.name === 'Moon')?.signNameEn || 'Moon') + '), how may I assist you with career, health, wealth, or planetary remedies today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickPrompts = isNe ? [
    'मेरो कुण्डली अनुसार करियर र व्यवसायमा सफलताको योग कस्तो छ?',
    'मेरो हालको महादशा र जीवनको आगामी समय कस्तो रहनेछ?',
    'स्वास्थ्य, धन र वैवाहिक जीवन सुधार गर्न के उपाय गर्नुपर्छ?',
    'कुन ग्रहको शान्ति वा मन्त्र जप गर्ने?'
  ] : [
    'How is my career and business prospect according to my chart?',
    'What can you tell me about my current dasha and upcoming periods?',
    'What remedies should I follow for health, wealth and marriage?',
    'Which planetary mantras should I chant for peace?'
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let replyText = '';
      const qLower = query.toLowerCase();
      const lagna = isNe ? data.ascendant.signNameNe : data.ascendant.signNameEn;
      const moon = data.grahas.find(g => g.name === 'Moon');
      const moonSign = isNe ? moon?.signNameNe : moon?.signNameEn;

      if (qLower.includes('करियर') || qLower.includes('व्यापार') || qLower.includes('career') || qLower.includes('business')) {
        replyText = isNe
          ? `पण्डित शम्भु प्रसाद लम्सालको विश्लेषण: तपाईंको लग्न '${lagna}' हो र चन्द्रमा '${moonSign}' राशीमा स्थित हुनुहुन्छ। दशम भाव (कर्म भाव) र लाभ भावको स्थिति अनुसार तपाईंले नेतृत्वदायी क्षेत्र, व्यवस्थापन, परामर्श, वा आफ्नै व्यापारमा ठूलो सफलता प्राप्त गर्न सक्नुहुन्छ। कडा मेहनत र इमानदारीले तपाईंलाई ३५ वर्षपछि विशेष उच्च पद दिलाउनेछ।`
          : `Pandit Shambhu Prasad Lamsal's Analysis: With your Ascendant in '${lagna}' and Moon in '${moonSign}', your 10th house of career indicates strong potential in leadership, consultancy, enterprise, or administrative roles. Consistency and perseverance will bring remarkable achievements in your professional life.`;
      } else if (qLower.includes('दशा') || qLower.includes('समय') || qLower.includes('dasha') || qLower.includes('time')) {
        replyText = isNe
          ? `पण्डित शम्भु प्रसाद लम्सालको विश्लेषण: तपाईंको जन्मकालीन कुण्डलीमा ग्रहहरूको गोचर र महादशा चक्र अनुसार यो समय आत्मनिरीक्षण र धैर्य राख्ने समय हो। आगामी महिनाहरूमा विशेषगरी देवगुरु वृहस्पति र सूर्यको प्रभावले नयाँ अवसरहरू खुल्नेछन्। धैर्यतापूर्वक कर्म गर्नुहोला।`
          : `Pandit Shambhu Prasad Lamsal's Analysis: According to your planetary dasha and transit cycle, this is a phase for focused effort and strategic planning. Favorable alignments of Jupiter and Sun in upcoming transits will open new doors of prosperity.`;
      } else if (qLower.includes('उपाय') || qLower.includes('शान्ति') || qLower.includes('मन्त्र') || qLower.includes('remedy') || qLower.includes('mantra')) {
        replyText = isNe
          ? `पण्डित शम्भु प्रसाद लम्सालको उपाय: तपाईंको कुण्डलीको दोष निवारण तथा सकारात्मक ऊर्जा वृद्धिको लागि नियमित रूपमा सूर्योदयको समयमा सूर्य अर्घ्य दिनु, बिहानीमा इष्टदेवको पूजा गर्नु तथा 'ॐ नमः शिवाय' वा 'ॐ बृं बृहस्पतये नमः' मन्त्रको १०८ पटक जप गर्नु अत्यन्त फलदायी हुन्छ। प्रत्येक शनिबार वा बिहिबार गरिब तथा असहायलाई दान दिनुहोस्।`
          : `Pandit Shambhu Prasad Lamsal's Remedies: To enhance positive cosmic energies and pacify malefic influences, offer water to the Sun at sunrise, perform daily meditation, and chant 'Om Namah Shivaya' or 'Om Brihaspataye Namah' 108 times daily. Acts of charity on Thursdays bring immense peace.`;
      } else {
        replyText = isNe
          ? `पण्डित शम्भु प्रसाद लम्सालको मार्गदर्शन: तपाईंको लग्न '${lagna}' र '${moonSign}' राशीको प्रभावले तपाईंलाई दृढ निश्चयी, मिलनसार र उच्च विचारयुक्त बनाएको छ। जीवनमा आइपर्ने सानातिना चुनौतीहरूलाई कर्म र आध्यात्मिक साधनाद्वारा सहजै पार गर्न सकिन्छ। नियमित ध्यान र सकारात्मक सोच राख्नुहोला।`
          : `Pandit Shambhu Prasad Lamsal's Guidance: Your Ascendant '${lagna}' and Moon sign '${moonSign}' bless you with determination, empathy, and intuitive wisdom. Overcome temporary hurdles with dedicated effort, positive mindset, and mindfulness.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="mt-8 bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Astrologer Profile Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-amber-900/50 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-lg flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center text-amber-300 font-serif font-bold text-lg">
              शं
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-serif font-bold text-amber-200">
                {isNe ? 'ज्योतिष युवा पण्डित शम्भु प्रसाद लम्साल (Binay)' : 'Youth Astrologer Pandit Shambhu Prasad Lamsal (Binay)'}
              </h3>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> AI Astrologer
              </span>
            </div>
            <p className="text-xs text-amber-400/80 font-medium">
              {isNe ? 'वैदिक ज्योतिष, कुण्डली तथा हस्तरेखा विशेषज्ञ' : 'Vedic Astrology, Kundali & Palmistry Specialist'}
            </p>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-xs text-slate-400 block font-mono">Status</span>
          <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 justify-end">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Online & Ready
          </span>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-4 h-80 overflow-y-auto space-y-4 shadow-inner">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
              msg.sender === 'user' 
                ? 'bg-amber-600 text-slate-950 shadow-md' 
                : 'bg-gradient-to-tr from-amber-700 to-amber-500 text-slate-950 shadow-md'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : 'शं'}
            </div>
            <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-md ${
              msg.sender === 'user'
                ? 'bg-amber-600 text-slate-950 rounded-tr-none font-medium'
                : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none font-sans'
            }`}>
              <p className="whitespace-pre-line">{msg.text}</p>
              <span className={`block text-[10px] mt-1 text-right font-mono ${msg.sender === 'user' ? 'text-slate-900/70' : 'text-slate-400'}`}>
                {msg.time}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-600 text-slate-950 flex items-center justify-center font-bold text-xs">शं</div>
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl rounded-tl-none p-3 text-xs text-amber-300 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>पण्डितजी कुण्डली विश्लेषण गर्दै हुनुहुन्छ...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompt Buttons */}
      <div className="space-y-2">
        <span className="text-xs text-slate-400 font-medium block flex items-center gap-1">
          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
          {isNe ? 'द्रुत प्रश्नहरू (Quick Questions):' : 'Suggested Questions:'}
        </span>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(promptText)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-200 border border-amber-600/30 hover:border-amber-500 px-3 py-1.5 rounded-lg transition-colors text-left flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span>{promptText}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isNe ? "तपाईंको कुण्डली वा जीवनसम्बन्धी जिज्ञासा यहाँ लेख्नुहोस्..." : "Ask any question about your chart or life..."}
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
        />
        <button
          onClick={() => handleSend()}
          className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-lg transition-all shrink-0 cursor-pointer"
        >
          <span>{isNe ? 'सोध्नुहोस्' : 'Ask'}</span>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
