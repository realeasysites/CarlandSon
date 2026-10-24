'use strict';
const fs = require('fs');
const path = require('path');
const express = require('express');
const db = require('../lib/db');
const { notifyNewLead } = require('../lib/mailer');

const router = express.Router();
const GALLERY_DIR = path.join(__dirname, '..', 'public', 'images', 'gallery');
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter(t => now - t < 10 * 60 * 1000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 5;
}

const clean = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

router.post('/quote', async (req, res) => {
  const b = req.body || {};
  if (clean(b.company_website)) return res.json({ ok: true }); // honeypot
  if (rateLimited(req.ip)) return res.status(429).json({ error: 'Too many requests. Please call us instead.' });

  const lead = {
    name: clean(b.name, 120), phone: clean(b.phone, 40), email: clean(b.email, 160),
    property_type: clean(b.property_type, 40), service: clean(b.service, 80), sqft: clean(b.sqft, 40),
    location: clean(b.location, 120), timeline: clean(b.timeline, 60), message: clean(b.message, 2000)
  };
  if (!lead.name) return res.status(400).json({ error: 'Please add your name.' });
  if (!lead.phone && !lead.email) return res.status(400).json({ error: 'Please add a phone number or email so we can reach you.' });
  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) return res.status(400).json({ error: 'That email address looks off.' });

  db.prepare(`INSERT INTO leads (name, phone, email, property_type, service, sqft, location, timeline, message)
              VALUES (@name, @phone, @email, @property_type, @service, @sqft, @location, @timeline, @message)`).run(lead);
  notifyNewLead(lead).catch(err => console.error('Email notify failed:', err.message));
  res.json({ ok: true });
});

// Any photo dropped into public/images/gallery shows up in the Projects section.
router.get('/gallery', (req, res) => {
  let files = [];
  try {
    files = fs.readdirSync(GALLERY_DIR)
      .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
      .sort()
      .map(f => ({ src: `/images/gallery/${encodeURIComponent(f)}`, alt: f.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/^\d+\s*/, '') }));
  } catch (e) { /* folder missing */ }
  res.json(files);
});

module.exports = router;
