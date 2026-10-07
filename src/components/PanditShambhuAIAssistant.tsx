import React, { useState } from 'react';
import { KundaliCalculationOutput, Language } from '../types/astrology';
import { Send, Sparkles, User, RefreshCw, MessageSquare } from 'lucide-react';
import { generateIntelligentAnswer, KundaliContextData } from '../utils/aiKnowledgeEngine';

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
  const moon = data.grahas.find((g) => g.name === 'Moon');
  const sun = data.grahas.find((g) => g.name === 'Sun');

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: isNe
        ? 'नमस्कार! म वैदिक ज्योतिष पोर्टलको बौद्धिक AI सहायक हुँ। म हजुरलाई सामान्य ज्ञान, दैनिक जीवनका विविध प्रश्नहरूदेखि लिएर तपाईंको कुण्डली (लग्न: ' + (data.ascendant.signNameNe) + ', राशी: ' + (moon?.signNameNe || 'चन्द्र') + ') को विश्लेषण, दशा र उपायहरू सम्म सबै कुरामा ChatGPT र Gemini जस्तै सही र स्पष्ट उत्तर दिन सक्छु। हजुरको मनमा जे प्रश्न छ, निर्धक्क सोध्नुहोस्!'
        : 'Hello! I am the intelligent AI Assistant for the Vedic Jyotish portal. Just like ChatGPT and Gemini, I can assist you with all types of questions—from general knowledge, science, and everyday life to personalized Vedic astrological analysis of your chart (Ascendant: ' + data.ascendant.signNameEn + ', Moon Sign: ' + (moon?.signNameEn || 'Moon') + '). How may I assist you today?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const quickPrompts = isNe
    ? [
        'नमस्ते, तपाईंले मलाई के-के सहयोग गर्न सक्नुहुन्छ?',
        'मेरो कुण्डली अनुसार करियर र व्यवसायमा सफलताको योग कस्तो छ?',
        'नेपालका प्रमुख धार्मिक तथा पर्यटकीय गन्तव्यहरू के-के हुन्?',
        'मेरो हालको महादशा र जीवनको आगामी समय कस्तो रहनेछ?',
      ]
    : [
        'Hello, what can you help me with?',
        'How is my career and business prospect according to my chart?',
        'Tell me about key cultural and spiritual places in Nepal.',
        'What can you tell me about my current dasha and upcoming periods?',
      ];

  // Client-side intelligent engine with strict intent understanding (Never forcing astrology on greetings/general Qs)
  const kundaliContext: KundaliContextData = {
    name: data.birthDetails?.name,
    lagnaNe: data.ascendant?.signNameNe,
    lagnaEn: data.ascendant?.signNameEn,
    moonSignNe: moon?.signNameNe,
    moonSignEn: moon?.signNameEn,
    sunSignNe: sun?.signNameNe,
    sunSignEn: sun?.signNameEn,
    dob: data.birthDetails?.dob,
    tob: data.birthDetails?.tob,
    pob: data.birthDetails?.pob,
  };

  const getSmartClientFallback = (query: string): string => {
    return generateIntelligentAnswer(query, kundaliContext, language);
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      // Connect to Server-Side Gemini API Proxy with intent-understanding logic
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query,
          conversationHistory: newHistory.map((m) => ({ sender: m.sender, text: m.text })),
          kundaliContext: {
            name: data.birthDetails?.name,
            lagnaNe: data.ascendant?.signNameNe,
            lagnaEn: data.ascendant?.signNameEn,
            moonSignNe: moon?.signNameNe,
            moonSignEn: moon?.signNameEn,
            sunSignNe: sun?.signNameNe,
            sunSignEn: sun?.signNameEn,
            dob: data.birthDetails?.dob,
            tob: data.birthDetails?.tob,
            pob: data.birthDetails?.pob,
          },
          language,
        }),
      });

      let replyText = '';
      if (response.ok) {
        const resData = await response.json();
        replyText = resData.reply || getSmartClientFallback(query);
      } else {
        replyText = getSmartClientFallback(query);
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.warn('Chat request failed, using intelligent client logic:', err);
      const replyText = getSmartClientFallback(query);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: replyText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="mt-8 bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
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
                {isNe ? 'पण्डित शम्भु प्रसाद लम्साल (Binay) AI सहायक' : 'Pandit Shambhu Prasad Lamsal (Binay) AI Assistant'}
              </h3>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Gemini AI
              </span>
            </div>
            <p className="text-xs text-amber-400/80 font-medium">
              {isNe ? 'सामान्य ज्ञान, दैनिक प्रश्नहरू र वैदिक कुण्डली विश्लेषण सहायक' : 'General Knowledge & Vedic Astrology Intelligence'}
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
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-amber-600 text-slate-950 shadow-md'
                  : 'bg-gradient-to-tr from-amber-700 to-amber-500 text-slate-950 shadow-md'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : 'शं'}
            </div>
            <div
              className={`max-w-[80%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-md ${
                msg.sender === 'user'
                  ? 'bg-amber-600 text-slate-950 rounded-tr-none font-medium'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none font-sans'
              }`}
            >
              <p className="whitespace-pre-line">{msg.text}</p>
              <span
                className={`block text-[10px] mt-1 text-right font-mono ${
                  msg.sender === 'user' ? 'text-slate-900/70' : 'text-slate-400'
                }`}
              >
                {msg.time}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-600 text-slate-950 flex items-center justify-center font-bold text-xs">
              शं
            </div>
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl rounded-tl-none p-3 text-xs text-amber-300 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>{isNe ? 'AI सहायक सोच्दैछ...' : 'AI Assistant is thinking...'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompt Buttons */}
      <div className="space-y-2">
        <span className="text-xs text-slate-400 font-medium block flex items-center gap-1">
          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
          {isNe ? 'नमुना प्रश्नहरू (Sample Questions):' : 'Suggested Questions:'}
        </span>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(promptText)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-200 border border-amber-600/30 hover:border-amber-500 px-3 py-1.5 rounded-lg transition-colors text-left flex items-center gap-1.5 shadow-sm cursor-pointer"
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
          placeholder={
            isNe
              ? 'कुनै पनि प्रश्न सोध्नुहोस् (सामान्य ज्ञान, दैनिक सल्लाह वा कुण्डली विश्लेषण)...'
              : 'Ask any question (general knowledge, daily advice, or astrology)...'
          }
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
        />
        <button
          onClick={() => handleSend()}
          disabled={isTyping}
          className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-lg transition-all shrink-0 cursor-pointer"
        >
          <span>{isNe ? 'सोध्नुहोस्' : 'Ask'}</span>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
