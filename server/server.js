const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:10000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(allowed => origin?.startsWith(allowed))) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in production (you can restrict this later)
    }
  },
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
const connectDB = require('./config/db');
const { autoSetup } = require('./utils/autoSetup');

// Connect to MongoDB and run auto-setup
connectDB().then(() => {
  // Run auto-setup after DB connection is established
  autoSetup();
});

// Routes - specific routes FIRST, then generic
app.use('/api/setup', require('./routes/setup'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/quotations', require('./routes/quotations'));
app.use('/api', require('./routes/api'));

// Basic API route
app.get('/', (req, res) => {
  res.send('API running');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
