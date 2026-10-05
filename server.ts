import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

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
