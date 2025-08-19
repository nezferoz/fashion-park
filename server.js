// =====================================================
// FASHION PARK INVENTORY SYSTEM - SERVER
// Self-Hosted Backend
// =====================================================

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ================= MIDDLEWARE =================
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= DATABASE CONNECTION =================
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'fashion_park',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

let pool;

async function createConnection() {
    try {
        pool = mysql.createPool(dbConfig);
        console.log('✅ Database connected successfully!');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
}

// ================= AUTHENTICATION MIDDLEWARE =================
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// ================= ROUTES =================

// Health Check
app.get('/', (req, res) => {
    res.json({
        message: 'Fashion Park Inventory System API',
        status: 'Running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// ================= AUTH ROUTES =================

// User Registration
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, phone, role = 'pelanggan' } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, hashedPassword, phone, role]
        );

        res.status(201).json({
            message: 'User registered successfully',
            user_id: result.insertId
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const [users] = await pool.execute(
            'SELECT * FROM users WHERE email = ? AND is_active = 1',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { user_id: user.user_id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// ================= PRODUCT ROUTES =================

// Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const [categories] = await pool.execute('SELECT * FROM categories ORDER BY category_name');
        res.json(categories);
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Failed to get categories' });
    }
});

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const [products] = await pool.execute(`
            SELECT p.*, c.category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.category_id 
            WHERE p.is_active = 1 
            ORDER BY p.created_at DESC
        `);
        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Failed to get products' });
    }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [products] = await pool.execute(`
            SELECT p.*, c.category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.category_id 
            WHERE p.product_id = ? AND p.is_active = 1
        `, [id]);

        if (products.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Get product variants
        const [variants] = await pool.execute(
            'SELECT * FROM product_variants WHERE product_id = ? AND is_active = 1',
            [id]
        );

        const product = products[0];
        product.variants = variants;

        res.json(product);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Failed to get product' });
    }
});

// Create product (Admin only)
app.post('/api/products', authenticateToken, async (req, res) => {
    try {
        const { name, description, price, category_id, stock_quantity, barcode, image_url } = req.body;
        
        if (!name || !price || !category_id) {
            return res.status(400).json({ error: 'Name, price, and category are required' });
        }

        const [result] = await pool.execute(
            'INSERT INTO products (product_name, description, price, category_id, stock_quantity, barcode, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, description, price, category_id, stock_quantity || 0, barcode, image_url]
        );

        res.status(201).json({
            message: 'Product created successfully',
            product_id: result.insertId
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// ================= TRANSACTION ROUTES =================

// Create transaction
app.post('/api/transactions', authenticateToken, async (req, res) => {
    try {
        const { user_id, total_amount, discount, final_amount, payment_method, items } = req.body;
        
        if (!total_amount || !final_amount || !payment_method || !items) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Create transaction
            const [transactionResult] = await connection.execute(
                'INSERT INTO transactions (transaction_code, user_id, cashier_id, total_amount, discount, final_amount, payment_method) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [`TXN${Date.now()}`, user_id, req.user.user_id, total_amount, discount || 0, final_amount, payment_method]
            );

            const transaction_id = transactionResult.insertId;

            // Create transaction details
            for (const item of items) {
                await connection.execute(
                    'INSERT INTO transaction_details (transaction_id, product_id, variant_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?, ?)',
                    [transaction_id, item.product_id, item.variant_id, item.quantity, item.unit_price, item.subtotal]
                );

                // Update stock
                if (item.variant_id) {
                    await connection.execute(
                        'UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE variant_id = ?',
                        [item.quantity, item.variant_id]
                    );
                } else {
                    await connection.execute(
                        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE product_id = ?',
                        [item.quantity, item.product_id]
                    );
                }
            }

            await connection.commit();
            res.status(201).json({
                message: 'Transaction created successfully',
                transaction_id
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
});

// Get user transactions
app.get('/api/transactions/user', authenticateToken, async (req, res) => {
    try {
        const [transactions] = await pool.execute(
            'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.user_id]
        );
        res.json(transactions);
    } catch (error) {
        console.error('Get user transactions error:', error);
        res.status(500).json({ error: 'Failed to get transactions' });
    }
});

// ================= CART ROUTES =================

// Get user cart
app.get('/api/cart', authenticateToken, async (req, res) => {
    try {
        const [cartItems] = await pool.execute(`
            SELECT c.*, p.product_name, p.price, p.image_url, pv.size, pv.stock_quantity
            FROM cart c
            JOIN products p ON c.product_id = p.product_id
            LEFT JOIN product_variants pv ON c.variant_id = pv.variant_id
            WHERE c.user_id = ?
        `, [req.user.user_id]);
        res.json(cartItems);
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ error: 'Failed to get cart' });
    }
});

// Add to cart
app.post('/api/cart', authenticateToken, async (req, res) => {
    try {
        const { product_id, variant_id, quantity } = req.body;
        
        if (!product_id || !quantity) {
            return res.status(400).json({ error: 'Product ID and quantity are required' });
        }

        const [result] = await pool.execute(
            'INSERT INTO cart (user_id, product_id, variant_id, quantity) VALUES (?, ?, ?, ?)',
            [req.user.user_id, product_id, variant_id, quantity]
        );

        res.status(201).json({
            message: 'Item added to cart',
            cart_id: result.insertId
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ error: 'Failed to add to cart' });
    }
});

// ================= ERROR HANDLING =================
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// ================= START SERVER =================
async function startServer() {
    await createConnection();
    
    app.listen(PORT, () => {
        console.log('🚀 Fashion Park Inventory System Server');
        console.log(`📍 Server running on port ${PORT}`);
        console.log(`🌐 Local: http://localhost:${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/`);
        console.log('✅ Ready to handle requests!');
    });
}

startServer().catch(console.error);
