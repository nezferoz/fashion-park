const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log('Auth middleware - Authorization header:', authHeader);
  
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  
  const token = authHeader.split(' ')[1];
  console.log('Auth middleware - Token:', token);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_default');
    console.log('Auth middleware - Decoded token:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth middleware - Token verification failed:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware; 