'use strict';
const nodemailer = require('nodemailer');

let transport = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

async function notifyNewLead(lead) {
  if (!transport || !process.env.NOTIFY_EMAIL) return false;
  const lines = [
    `Name: ${lead.name}`, `Phone: ${lead.phone || '-'}`, `Email: ${lead.email || '-'}`,
    `Property: ${lead.property_type || '-'}`, `Service: ${lead.service || '-'}`,
    `Approx. sq ft: ${lead.sqft || '-'}`, `Location: ${lead.location || '-'}`,
    `Timeline: ${lead.timeline || '-'}`, '', lead.message || ''
  ];
  await transport.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: process.env.NOTIFY_EMAIL,
    replyTo: lead.email || undefined,
    subject: `New flooring quote request — ${lead.name}`,
    text: lines.join('\n')
  });
  return true;
}

module.exports = { notifyNewLead };
