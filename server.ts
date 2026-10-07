import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { generateIntelligentAnswer } from './src/utils/aiKnowledgeEngine';

function generateSmartFallback(message: string, context: any, language: string): string {
  return generateIntelligentAnswer(message, context, language);
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

    // Fast path for instant greetings & math (ensures zero latency and 100% adherence to prompt)
    const trimmed = (message || '').trim().toLowerCase();
    const isPureGreeting = ['hello', 'hi', 'hey', 'नमस्ते', 'नमस्कार', 'हेलो', 'ह्यालो', 'good morning', 'kasto cha', 'कस्तो छ'].some(
      (g) => trimmed === g || trimmed === g + '!' || trimmed === g + ' sir'
    );
    if (isPureGreeting || /^[0-9०-९\s\+\-\*\/÷xX×=]+$/.test(trimmed)) {
      const immediateAns = generateSmartFallback(message, kundaliContext, language);
      return res.json({ reply: immediateAns });
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

6. NO PREAMBLE / DIRECT ANSWER ONLY (भूमिका नबाँध्नुहोस्):
   - कहिल्यै पनि लामो भूमिका, पृष्ठभूमि वा अनावश्यक व्याख्या नबाँध्नुहोस्।
   - सिधै मुख्य विषयवस्तु र प्रश्नको ठोस उत्तर मात्र दिनुहोस्। Do not build introductory fluff or preamble.

${contextSummary}
`;

      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI response timeout')), 3500)
      );

      const response = await Promise.race([generatePromise, timeoutPromise]);
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
