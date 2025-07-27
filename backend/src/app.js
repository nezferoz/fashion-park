const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
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

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/transaction-details', require('./routes/transactionDetailRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/payment-logs', require('./routes/paymentLogRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/stock-movements', require('./routes/stockMovementRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/shipping', require('./routes/shippingRoutes'));
app.use('/api/rajaongkir', require('./routes/rajaongkirRoutes'));

// Routing dasar
app.get('/', (req, res) => {
  res.json({ message: 'API Distro Fashion Park ready!' });
});

module.exports = app; 