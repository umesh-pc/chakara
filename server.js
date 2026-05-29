const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');
const { connectDB, sequelize } = require('./config/db');
const { Setting } = require('./models');

// Connect and Sync Database
const initDB = async () => {
  await connectDB();
  try {
    // Synchronize schemas
    await sequelize.sync();
    console.log('Database tables synchronized successfully.');
  } catch (error) {
    console.error('Database Synchronization Warning:', error.message);
  }
};
initDB();

const app = express();

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body Parser Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'chakra_art_industries_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000, // 24 Hours
    secure: false // Set to true if running on HTTPS
  }
}));

// Global Variables middleware (for templates)
app.use(async (req, res, next) => {
  res.locals.adminId = req.session.adminId || null;
  res.locals.adminUsername = req.session.username || null;
  res.locals.currentYear = new Date().getFullYear();
  
  let settings = null;
  try {
    settings = await Setting.findByPk(1);
  } catch (error) {
    // Graceful error logging (e.g. during seeding or before sync completes)
  }

  res.locals.whatsappNum = settings ? settings.whatsappNum : (process.env.CONTACT_WHATSAPP || '919446577541');
  res.locals.phoneNum = settings ? settings.phoneNum : (process.env.CONTACT_PHONE || '+91 94465 77541');
  res.locals.emailAddr = settings ? settings.emailAddr : (process.env.CONTACT_EMAIL || 'info@chakraart.com');
  res.locals.address = settings ? settings.address : 'Chakra Art Industries, Statue Street, Divine Nagar, Thrissur, Kerala - 680001';
  res.locals.openingTime = settings ? settings.openingTime : '9:00 AM';
  res.locals.closingTime = settings ? settings.closingTime : '6:00 PM';
  res.locals.workingDays = settings ? settings.workingDays : 'Mon - Sat';
  res.locals.mapEmbedUrl = settings && settings.mapEmbedUrl ? settings.mapEmbedUrl : 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125528.29340625345!2d76.13611893888358!3d10.519847116744888!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1m3!1d3926.3533479006093!2d76.2238478!3d10.5198471!5e0!3m2!1sen!2sin!4v1716912345678!5m2!1sen!2sin';

  // Compatibility bindings
  res.locals.whatsappNumber = res.locals.whatsappNum;
  res.locals.phoneNumber = res.locals.phoneNum;
  res.locals.emailAddress = res.locals.emailAddr;
  
  next();
});

// Routes
app.use('/', require('./routes/homeRoutes'));
app.use('/admin', require('./routes/adminRoutes'));

// 404 Route Handler
app.use((req, res) => {
  res.status(404).render('frontend/404', {
    meta: {
      title: "Page Not Found | Chakra Art Industries",
      description: "The statue collection or page you are looking for could not be found."
    }
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('frontend/404', {
    meta: {
      title: "Server Error | Chakra Art Industries",
      description: "An unexpected error occurred. Please try again later."
    },
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});
