'use strict';
const crypto = require('crypto');

const COOKIE = 'csf_admin';
const MAX_AGE_MS = 1000 * 60 * 60 * 12; // 12 hours
const secret = () => process.env.SESSION_SECRET || crypto.createHash('sha256').update('csf:' + (process.env.ADMIN_PASSWORD || '')).digest('hex');

function enabled() { return Boolean(process.env.ADMIN_PASSWORD); }

function checkPassword(input) {
  if (!enabled() || typeof input !== 'string') return false;
  const a = crypto.createHash('sha256').update(input).digest();
  const b = crypto.createHash('sha256').update(process.env.ADMIN_PASSWORD).digest();
  return crypto.timingSafeEqual(a, b);
}

function sign(value) { return crypto.createHmac('sha256', secret()).update(value).digest('hex'); }

function issue(res) {
  const exp = String(Date.now() + MAX_AGE_MS);
  res.cookie(COOKIE, `${exp}.${sign(exp)}`, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: MAX_AGE_MS, path: '/admin'
  });
}

function clear(res) { res.clearCookie(COOKIE, { path: '/admin' }); }

function isAuthed(req) {
  if (!enabled()) return false;
  const raw = req.cookies && req.cookies[COOKIE];
  if (!raw || !raw.includes('.')) return false;
  const [exp, sig] = raw.split('.');
  const expected = sign(exp);
  if (sig.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  return Number(exp) > Date.now();
}

function requireAuth(req, res, next) {
  if (isAuthed(req)) return next();
  if (req.path.startsWith('/api')) return res.status(401).json({ error: 'Not signed in' });
  return res.redirect('/admin/login');
}

module.exports = { enabled, checkPassword, issue, clear, isAuthed, requireAuth };
