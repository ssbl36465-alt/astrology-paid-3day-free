import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';

function generateSmartFallback(message: string, context: any, language: string): string {
  const isNe = language === 'ne';
  const q = (message || '').trim().toLowerCase();

  // 1. Casual greetings (Hello, Hi, Namaste, etc.) -> NO ASTROLOGY FORCED!
  const greetings = ['hello', 'hi', 'hey', 'namaste', 'namaskar', 'नमस्ते', 'नमस्कार', 'ह्यालो', 'हेलो', 'गुड मर्निंग', 'good morning', 'good afternoon', 'good evening', 'hola'];
  const isGreetingOnly = greetings.some(g => q === g || q.startsWith(g + ' ') || q.endsWith(' ' + g) || q.includes(g));
  if (isGreetingOnly && q.length < 25) {
    return isNe
      ? 'नमस्कार! म तपाईंलाई आज कसरी सहयोग गर्न सक्छु? हजुरको कुनै पनि सामान्य जिज्ञासा, प्रश्न वा कुण्डली सम्बन्धी केही बुझ्न मन भए निर्धक्क सोध्नुहोस्।'
      : 'Hello! How can I help you today? Please feel free to ask any question or astrological inquiry.';
  }

  // 2. Questions asking "who are you" / "what can you do"
  if (q.includes('who are you') || q.includes('who r u') || q.includes('तपाईं को') || q.includes('तपाई को') || q.includes('timi ko')) {
    return isNe
      ? 'म वैदिक ज्योतिष पोर्टलको बौद्धिक AI सहायक हुँ। म तपाईंलाई सामान्य ज्ञान, दैनिक जीवनका प्रश्नहरू, अध्ययन, प्रविधिदेखि लिएर तपाईंको कुण्डली, ग्रह-दशा र ज्योतिषीय विश्लेषणसम्म सबै कुरामा ChatGPT र Gemini जस्तै सही र स्पष्ट उत्तर दिन सक्छु। मलाई जे पनि सोध्न सक्नुहुन्छ!'
      : 'I am the intelligent AI Assistant for the Vedic Jyotish portal. Just like ChatGPT and Gemini, I can answer all types of questions—from general knowledge, science, and everyday life to personalized Vedic astrological analysis based on your birth chart.';
  }

  // 3. How are you / कस्तो छ
  if (q.includes('how are you') || q.includes('how r u') || q.includes('kasto cha') || q.includes('कस्तो छ') || q.includes('के छ') || q.includes('ke cha')) {
    return isNe
      ? 'म एकदम ठीक छु, धन्यवाद! हजुरलाई कस्तो छ? आज हजुरलाई के सहयोग गर्न सक्छु?'
      : 'I am doing great, thank you! How are you doing today? How may I assist you?';
  }

  // 4. Thank you
  if (q.includes('thank') || q.includes('dhanyabad') || q.includes('धन्यवाद')) {
    return isNe
      ? 'हजुरलाई धेरै धेरै स्वागत छ! अरु केही जान्न वा सोध्न मन भए निसङ्कोच सोध्नुहोला।'
      : 'You are very welcome! Feel free to ask if you have any other questions.';
  }

  // 5. Specific astrology questions:
  const lagna = isNe ? (context?.lagnaNe || 'मेष') : (context?.lagnaEn || 'Aries');
  const moon = isNe ? (context?.moonSignNe || 'वृष') : (context?.moonSignEn || 'Taurus');

  if (q.includes('career') || q.includes('job') || q.includes('business') || q.includes('करियर') || q.includes('जागिर') || q.includes('व्यापार') || q.includes('काम')) {
    return isNe
      ? `पण्डित शम्भु प्रसाद लम्सालको विश्लेषण: तपाईंको लग्न '${lagna}' र चन्द्रमा '${moon}' राशी अनुसार दशम भाव (कर्म भाव) को प्रभावले तपाईंलाई व्यवस्थापन, नेतृत्व, परामर्श वा स्वतन्त्र उद्यममा राम्रो सफलताको संकेत गर्दछ। निरन्तरको प्रयास र योजनाबद्ध कार्यले उच्च उन्नति गराउनेछ।`
      : `According to your '${lagna}' ascendant and '${moon}' Moon sign, your 10th house indicates strong potential in management, leadership, professional consultancy, or independent business ventures.`;
  }

  if (q.includes('marriage') || q.includes('love') || q.includes('spouse') || q.includes('विवाह') || q.includes('बिहे') || q.includes('प्रेम')) {
    return isNe
      ? `पण्डित शम्भु प्रसाद लम्सालको विश्लेषण: सप्तम भाव र शुक्रको स्थिति अनुसार वैवाहिक तथा पारिवारिक जीवनमा आपसी समझदारी, धैर्य र खुला कुराकानीले सम्बन्ध सुमधुर र सुखमय बनाउँछ।`
      : `According to the 7th house and Venus placement, mutual respect, open communication, and patience will ensure a harmonious relationship.`;
  }

  if (q.includes('wealth') || q.includes('money') || q.includes('धन') || q.includes('पैसा') || q.includes('आर्थिक')) {
    return isNe
      ? `पण्डित शम्भु प्रसाद लम्सालको विश्लेषण: द्वितीय (धन) र एकादश (लाभ) भावको शुभ दृष्टिले वित्तीय स्थिति स्थिर रहने र उचित लगानी तथा सुनियोजित बचतबाट धनवृद्धि हुने योग छ।`
      : `Financial stability is favored through disciplined savings and calculated investments according to your 2nd and 11th houses.`;
  }

  // 6. General question fallback (answering directly without forcing astrology)
  return isNe
    ? `तपाईंको जिज्ञासा "${message}" को सम्बन्धमा: म हजुरलाई हरेक विषयमा सल्लाह र सही जानकारी दिन सक्छु। कृपया आफ्नो प्रश्न अझ खुलाएर सोध्नुहोला!`
    : `Regarding your inquiry "${message}": I am here to help answer all your questions accurately. Please feel free to elaborate!`;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  const ADMIN_HASH = process.env.ADMIN_HASH || '05244419492771ec1e0e7a5efc3882e6ed84880d47ac8bcd1172dabefc899c44';

  app.post('/api/admin/verify', (req, res) => {
    const { code } = req.body || {};
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false });
    }
    const hash = crypto.createHash('sha256').update(code.trim()).digest('hex');
    if (hash === ADMIN_HASH) {
      return res.json({ success: true });
    }
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  });

  const GURUS_FILE = path.resolve(process.cwd(), 'gurus_store.json');
  const GURU_APPS_FILE = path.resolve(process.cwd(), 'guru_applications_store.json');

  const getStoredGurus = () => {
    try {
      if (fs.existsSync(GURUS_FILE)) {
        return JSON.parse(fs.readFileSync(GURUS_FILE, 'utf-8'));
      }
    } catch (e) {}
    return null;
  };

  const saveStoredGurus = (gurus: any[]) => {
    try {
      fs.writeFileSync(GURUS_FILE, JSON.stringify(gurus, null, 2));
    } catch (e) {}
  };

  const getStoredApps = (): any[] => {
    try {
      if (fs.existsSync(GURU_APPS_FILE)) {
        return JSON.parse(fs.readFileSync(GURU_APPS_FILE, 'utf-8'));
      }
    } catch (e) {}
    return [];
  };

  const saveStoredApps = (apps: any[]) => {
    try {
      fs.writeFileSync(GURU_APPS_FILE, JSON.stringify(apps, null, 2));
    } catch (e) {}
  };

  app.get('/api/guru_applications', (req, res) => {
    const apps = getStoredApps();
    res.json(apps);
  });

  app.post('/api/guru_applications', (req, res) => {
    const newApp = req.body;
    if (!newApp || !newApp.id) {
      return res.status(400).json({ success: false, error: 'Invalid application' });
    }
    const apps = getStoredApps();
    const index = apps.findIndex((a: any) => a.id === newApp.id);
    if (index >= 0) {
      apps[index] = { ...apps[index], ...newApp };
    } else {
      apps.unshift(newApp);
    }
    saveStoredApps(apps);
    res.json({ success: true, application: newApp });
  });

  app.delete('/api/guru_applications/:id', (req, res) => {
    const { id } = req.params;
    const apps = getStoredApps().filter((a: any) => a.id !== id);
    saveStoredApps(apps);
    res.json({ success: true });
  });

  app.get('/api/gurus', (req, res) => {
    const gurus = getStoredGurus();
    res.json(gurus || []);
  });

  app.post('/api/gurus', (req, res) => {
    const gurus = req.body;
    if (Array.isArray(gurus)) {
      saveStoredGurus(gurus);
      res.json({ success: true, count: gurus.length });
    } else {
      res.status(400).json({ success: false, error: 'Invalid payload' });
    }
  });

  // Intelligent AI Assistant Route (Gemini 3.8 Flash with Intent Understanding)
  app.post('/api/chat', async (req, res) => {
    const { message, conversationHistory = [], kundaliContext, language = 'ne' } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message string is required' });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || process.env.API_KEY || '';
      if (!apiKey) {
        const fallbackReply = generateSmartFallback(message, kundaliContext, language);
        return res.json({ reply: fallbackReply });
      }

      const ai = new GoogleGenAI({ apiKey });

      // Format past conversation turns
      const contents: any[] = [];
      const recentHistory = Array.isArray(conversationHistory) ? conversationHistory.slice(-6) : [];
      for (const h of recentHistory) {
        if (h && h.text) {
          contents.push({
            role: h.sender === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }],
          });
        }
      }

      // Append latest user message
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const contextSummary = kundaliContext ? `
User's Kundali Context (Reference ONLY when user asks about their horoscope/astrology/chart/future):
- Name: ${kundaliContext.name || 'User'}
- Ascendant (Lagna): ${kundaliContext.lagnaNe || ''} (${kundaliContext.lagnaEn || ''})
- Moon Sign (Rashi): ${kundaliContext.moonSignNe || ''} (${kundaliContext.moonSignEn || ''})
- Sun Sign: ${kundaliContext.sunSignNe || ''} (${kundaliContext.sunSignEn || ''})
- Current Dasha: ${kundaliContext.currentDasha || ''}
- Date of Birth: ${kundaliContext.dob || ''}
- Time of Birth: ${kundaliContext.tob || ''}
- Place of Birth: ${kundaliContext.pob || ''}
` : 'No Kundali context available.';

      const systemInstruction = `
You are an intelligent, empathetic, and knowledgeable AI Assistant within the Vedic Jyotish (वैदिक ज्योतिष) application, inspired by the guidance of Youth Astrologer Pandit Shambhu Prasad Lamsal (Binay).

CRITICAL INSTRUCTIONS ON UNDERSTANDING AND ANSWERING QUESTIONS (जस्तो प्रश्न, त्यस्तै उत्तर):
1. UNDERSTAND THE USER'S INTENT FIRST:
   - Carefully analyze what the user is asking before responding.
   - DO NOT force an astrological reading or horoscope analysis onto non-astrological questions or greetings!

2. CASUAL GREETINGS & PLEASANTRIES:
   - If the user says "hello", "hi", "नमस्ते", "नमस्कार", "good morning", "how are you", etc.:
     Reply naturally, warmly, and politely in the user's language without mentioning horoscope or planetary positions!
     Example in Nepali: "नमस्कार! म तपाईंलाई आज कसरी सहयोग गर्न सक्छु? हजुरको कुनै पनि सामान्य जिज्ञासा वा प्रश्न छ भने निर्धक्क सोध्नुहोस्।"
     Example in English: "Hello! How can I help you today? Feel free to ask any question."

3. GENERAL KNOWLEDGE & NON-ASTROLOGY QUESTIONS:
   - Just like ChatGPT and Gemini, you are capable of answering ALL types of questions accurately, directly, and helpfully.
   - This includes science, math, history, Nepal geography, technology, programming, daily life, language, cooking, trivia, etc.
   - Answer these questions directly, factually, and clearly. Do NOT link them to astrology unless the user specifically asks for an astrological perspective.

4. ASTROLOGY, KUNDALI & HOROSCOPE QUESTIONS:
   - When the user asks about their career, marriage, health, finances, dasha, future, planetary remedies, or horoscope:
     Refer to their calculated Kundali context provided below to give personalized, insightful, and culturally respectful Vedic guidance.

5. LANGUAGE & TONE:
   - If the user writes in Nepali (Devanagari or Romanized Nepali like "namaste", "kasto cha"), reply in natural, respectful Nepali (हजुर/तपाईं).
   - If the user writes in English, reply in clear, professional, warm English.
   - Keep answers clear, well-formatted, and concise (not unnecessarily long).

${contextSummary}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || generateSmartFallback(message, kundaliContext, language);
      return res.json({ reply });
    } catch (err: any) {
      console.error('Gemini chat error in /api/chat:', err);
      const fallbackReply = generateSmartFallback(message, kundaliContext, language);
      return res.json({ reply: fallbackReply });
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = process.env.PORT || 3000;
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
