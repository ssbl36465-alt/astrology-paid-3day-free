import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';

async function startServer() {
  const app = express();
  app.use(express.json());

  const GURUS_FILE = path.resolve(process.cwd(), 'gurus_store.json');

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
