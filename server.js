'use strict';
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      frameSrc: ['https://www.facebook.com', 'https://www.google.com'],
      connectSrc: ["'self'"],
      formAction: ["'self'"]
    }
  }
}));
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: false, limit: '50kb' }));
app.use(cookieParser());

// Admin first, so /admin always asks for the password before any static file.
app.use('/admin', adminRoutes);
app.use('/api', publicRoutes);
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'], maxAge: '1h' }));

app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', '404.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Carl's & Son Flooring running on :${PORT}`));
