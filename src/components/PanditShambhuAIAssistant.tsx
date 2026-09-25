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
      const sun = data.grahas.find(g => g.name === 'Sun');
      const sunSign = isNe ? sun?.signNameNe : sun?.signNameEn;

      if (qLower.includes('करियर') || qLower.includes('व्यापार') || qLower.includes('नौकरी') || qLower.includes('job') || qLower.includes('business') || qLower.includes('career') || qLower.includes('work')) {
        replyText = isNe
          ? `पण्डित शम्भु प्रसाद लम्सालको विश्लेषण: तपाईंको लग्न '${lagna}' र चन्द्रमा '${moonSign}' राशीमा हुनुहुन्छ। दशम भाव (कर्म भाव) र सूर्य/शनि गोचरको प्रभाव अनुसार तपाईंले प्रशासनिक क्षेत्र, व्यवस्थापन, परामर्श सेवा (Consultancy), वा आफ्नै स्वतन्त्र व्यवसायमा असाधारण सफलता पाउन सक्नुहुन्छ। कडा मेहनत र इमानदारीले तपाईंको पेशागत जीवनमा ठूलो उन्नति गराउनेछ।`
          : `Pandit Shambhu Prasad Lamsal's Analysis: With Ascendant in '${lagna}' and Moon in '${moonSign}', your 10th house indicates stellar potential in leadership, enterprise, management, or professional consultancy. Dedication and ethical hard work will bring immense professional success.`;
      } else if (qLower.includes('बिहे') || qLower.includes('प्रेम') || qLower.includes('विवाह') || qLower.includes('marriage') || qLower.includes('love') || qLower.includes('spouse') || qLower.includes('relationship') || qLower.includes('vivah')) {
        replyText = isNe
          ? `पण्डित शम्भु प्रसाद लम्सालको विश्लेषण: सप्तम भाव (जीवनसाथी भाव) र शुक्र ग्रहको स्थिति अनुसार तपाईंको वैवाहिक जीवन र प्रेम सम्बन्धमा समझदारी र आपसी सहयोग महत्त्वपूर्ण हुन्छ। '${lagna}' लग्नको स्वभाव अनुसार धैर्य र प्रेमपूर्वक सम्बन्ध अगाडि बढाउँदा जीवनमा सुखमय पारिवारिक वातावरण प्राप्त हुन्छ।`
          : `Pandit Shambhu Prasad Lamsal's Analysis: Examining the 7th house and Venus placement, your marital and relationship harmony thrives on mutual respect and open communication. Your '${lagna}' ascendant nature ensures deep emotional bonding when patience is practiced.`;
      } else if (qLower.includes('धन') || qLower.includes('पैसा') || qLower.includes('आर्थिक') || qLower.includes('wealth') || qLower.includes('money') || qLower.includes('finance') || qLower.includes('dhan') || qLower.includes('profit')) {
        replyText = isNe
          ? `पण्डित शम्भु प्रसाद लम्सालको विश्लेषण: द्वितीय (धन भाव) र एकादश (लाभ भाव) को बल अनुसार तपाईंको आर्थिक स्थिति स्थिर र प्रगतितर्फ उन्मुख छ। उचित लगानी, सुनियोजित बचत र देवगुरु वृहस्पति तथा माता लक्ष्मीको कृपाले तपाईंलाई धन-सम्पत्ति र भौतिक सुखमा वृद्धिको योग बनाइरहेको छ।`
          : `Pandit Shambhu Prasad Lamsal's Analysis: Based on your 2nd and 11th houses, financial stability and prosperity are strongly favored through wise investments, disciplined savings, and auspicious planetary transits supporting steady wealth generation.`;
      } else if (qLower.includes('स्वास्थ्य') || qLower.includes('रोग') || qLower.includes('health') || qLower.includes('body') || qLower.includes('fitness')) {
        replyText = isNe
          ? `पण्डित शम्भु प्रसाद लम्सालको सुझाव: षष्ठ भाव र लग्नेशको स्थिति अनुसार स्वास्थ्यलाई उत्तम राख्न नियमित योगाभ्यास, सन्तुलित आहार, र मानसिक शान्ति अति आवश्यक छ। सूर्य उपासना र प्राणायमले तपाईंको शरीरमा प्राणवायु र ऊर्जा सधैं उच्च राख्नेछ।`
          : `Pandit Shambhu Prasad Lamsal's Guidance: To maintain robust health and vitality, regular yoga, balanced nutrition, and mindfulness are recommended. Solar meditation and breathing exercises will keep your physical energy high.`;
      } else if (qLower.includes('विदेश') || qLower.includes('यात्रा') || qLower.includes('foreign') || qLower.includes('travel') || qLower.includes('abroad') || qLower.includes('visa')) {
        replyText = isNe
          ? `पण्डित शम्भु प्रसाद लम्सालको विश्लेषण: द्वादश भाव (व्यय/विदेश भाव) र भाग्य भावको गोचर अनुसार तपाईंको विदेश यात्रा वा टाढाको स्थानबाट लाभ लिने योग प्रबल छ। उचित प्रयास र कागजी प्रक्रिया मिलाएर अगाडि बढ्नुहोस्, सफलता मिल्नेछ।`
          : `Pandit Shambhu Prasad Lamsal's Analysis: Your 12th house and relocation indicators suggest strong potential for foreign travel, higher studies abroad, or international ventures. Diligent efforts in the right direction will yield positive outcomes.`;
      } else if (qLower.includes('पढाइ') || qLower.includes('शिक्षा') || qLower.includes('study') || qLower.includes('education') || qLower.includes('exam')) {
        replyText = isNe
          ? `पण्डित शम्भु प्रसाद लम्सालको विश्लेषण: पंचम भाव (विद्या भाव) र बुद्धिको कारक ग्रहको प्रभावले उच्च शिक्षा, अनुसन्धान र प्रतिस्पर्धात्मक परीक्षामा तपाईंलाई उत्कृष्ट सफलता दिलाउनेछ। एकाग्रता र नियमित अध्ययनमा ध्यान दिनुहोला।`
          : `Pandit Shambhu Prasad Lamsal's Analysis: Your 5th house of intellect and education favors academic excellence, higher research, and competitive examinations. Dedicated focus and disciplined study habits will bring top honors.`;
      } else if (qLower.includes('रत्न') || qLower.includes('रुद्राक्ष') || qLower.includes('gemstone') || qLower.includes('rudraksha') || qLower.includes('remedy') || qLower.includes('upay') || qLower.includes('मन्त्र') || qLower.includes('mantra')) {
        replyText = isNe
          ? `पण्डित शम्भु प्रसाद लम्सालको सुझाव: तपाईंको लग्न '${lagna}' को स्वामी ग्रहलाई बलियो बनाउन र ग्रह शान्तिको लागि पुखराज वा माणिक्य धारण गर्नु, ५मुखी वा मुखी अनुसारको रुद्राक्ष लगाउनु तथा नियमित रूपमा 'ॐ नमो भगवते वासुदेवाय' वा इष्टदेवको मन्त्र जप गर्नु अत्यन्त फलदायी हुन्छ।`
          : `Pandit Shambhu Prasad Lamsal's Remedies: To strengthen your ascendant lord and harmonize planetary energies, wearing a favorable gemstone (consulting expert for weight), wearing authentic Rudraksha, and chanting daily mantras will bring immense peace and success.`;
      } else {
        replyText = isNe
          ? `पण्डित शम्भु प्रसाद लम्सालको मार्गदर्शन: तपाईंले सोध्नुभएको जिज्ञासा (${query}) को ज्योतिषीय विश्लेषण गर्दा, तपाईंको लग्न '${lagna}' र '${moonSign}' राशीको प्रभावले जीवनमा ठूला उपलब्धि हासिल गर्ने दृढ क्षमता दिएको छ। आउने समयमा सकारात्मक सोच, इमानदार प्रयास र आध्यात्मिक चिन्तनद्वारा तपाईंले आफ्ना सबै लक्ष्यहरू सहजै पूरा गर्नुहुनेछ। कुनै विशेष प्रश्न वा पूजा/दोष निवारण बारे जान्न चाहनुहुन्छ भने खुलेर सोध्नुहोला।`
          : `Pandit Shambhu Prasad Lamsal's Guidance: Regarding your inquiry (${query}), based on your '${lagna}' ascendant and '${moonSign}' Moon sign, your chart carries strong resilience and potential for success. With positive intent, persistent effort, and mindfulness, you will overcome all obstacles. Feel free to ask any further specific questions about your chart, dashas, or remedies!`;
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
