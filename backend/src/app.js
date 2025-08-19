const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS configuration with logging
const corsOptions = {
  origin: function (origin, callback) {
    console.log('CORS request from origin:', origin);
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow ngrok domains
    if (origin.match(/\.ngrok-free\.app$/)) {
      console.log('CORS: Allowing ngrok domain:', origin);
      return callback(null, true);
    }
    
    // Allow localhost
    if (origin === 'http://localhost:3000' || origin === 'https://localhost:3000') {
      console.log('CORS: Allowing localhost:', origin);
      return callback(null, true);
    }
    
    console.log('CORS: Blocking origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','ngrok-skip-browser-warning','X-Requested-With']
};

app.use(cors(corsOptions));
// Note: In Express 5, '*' in route paths is invalid for path-to-regexp.
// Preflight requests are already handled by the CORS middleware above.
app.use(express.json());

// Global request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Import routes
const authRoutes = require('./routes/authRoutesSimple'); // Gunakan routes sederhana
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const rajaongkirRoutes = require('./routes/rajaongkirRoutes');
const binderbyteRoutes = require('./routes/binderbyteRoutes');
const reportRoutes = require('./routes/reportRoutes');
const stockMovementRoutes = require('./routes/stockMovementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentLogRoutes = require('./routes/paymentLogRoutes');
const apiKeyRoutes = require('./routes/apiKeyRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/transaction-details', require('./routes/transactionDetailRoutes'));
app.use('/api/reports', reportRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/payment-logs', paymentLogRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stock-movements', stockMovementRoutes);
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/shipping', require('./routes/shippingRoutes'));
app.use('/api/rajaongkir', rajaongkirRoutes);
app.use('/api/binderbyte', binderbyteRoutes);
app.use('/api/api-keys', apiKeyRoutes);


// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Fashion Park API',
    version: '1.0.0'
  });
});

// Routing dasar
app.get('/', (req, res) => {
  res.json({ message: 'API Distro Fashion Park ready!' });
});

module.exports = app; 