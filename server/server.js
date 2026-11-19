const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = require('./config/db');
connectDB();

// Routes - specific routes FIRST, then generic
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
