'use strict';
const path = require('path');
const express = require('express');
const db = require('../lib/db');
const auth = require('../lib/auth');

const router = express.Router();
const VIEWS = path.join(__dirname, '..', 'views');
const STATUSES = ['new', 'contacted', 'estimate sent', 'won', 'lost'];
const attempts = new Map();

router.use((req, res, next) => { res.set('Cache-Control', 'no-store'); res.set('X-Robots-Tag', 'noindex'); next(); });

router.get('/login', (req, res) => {
  if (auth.isAuthed(req)) return res.redirect('/admin');
  res.sendFile(path.join(VIEWS, 'login.html'));
});

router.get('/login.js', (req, res) => res.sendFile(path.join(VIEWS, 'login.js')));

router.post('/login', (req, res) => {
  const now = Date.now();
  const list = (attempts.get(req.ip) || []).filter(t => now - t < 15 * 60 * 1000);
  if (list.length >= 10) return res.status(429).json({ error: 'Too many attempts. Try again in a few minutes.' });
  if (!auth.enabled()) return res.status(503).json({ error: 'Admin login is disabled until ADMIN_PASSWORD is set on the server.' });
  if (!auth.checkPassword(req.body && req.body.password)) {
    list.push(now); attempts.set(req.ip, list);
    return res.status(401).json({ error: 'Wrong password.' });
  }
  attempts.delete(req.ip);
  auth.issue(res);
  res.json({ ok: true });
});

router.post('/logout', (req, res) => { auth.clear(res); res.json({ ok: true }); });

router.use(auth.requireAuth);

router.get('/', (req, res) => res.sendFile(path.join(VIEWS, 'dashboard.html')));
router.get('/admin.js', (req, res) => res.sendFile(path.join(VIEWS, 'admin.js')));

router.get('/api/leads', (req, res) => {
  const leads = db.prepare('SELECT * FROM leads ORDER BY datetime(created_at) DESC, id DESC').all();
  res.json({ leads, statuses: STATUSES });
});

router.patch('/api/leads/:id', (req, res) => {
  const id = Number(req.params.id);
  const { status, notes } = req.body || {};
  const lead = db.prepare('SELECT id FROM leads WHERE id = ?').get(id);
  if (!lead) return res.status(404).json({ error: 'Not found' });
  if (status !== undefined) {
    if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Bad status' });
    db.prepare('UPDATE leads SET status = ? WHERE id = ?').run(status, id);
  }
  if (typeof notes === 'string') db.prepare('UPDATE leads SET notes = ? WHERE id = ?').run(notes.slice(0, 4000), id);
  res.json({ ok: true });
});

router.delete('/api/leads/:id', (req, res) => {
  const info = db.prepare('DELETE FROM leads WHERE id = ?').run(Number(req.params.id));
  if (!info.changes) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

router.use((req, res) => res.status(404).json({ error: 'Not found' }));

module.exports = router;
