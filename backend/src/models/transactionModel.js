const db = require('../config/db');
const productModel = require('./productModel');

const getAllTransactions = async () => {
  const [rows] = await db.query(
    `SELECT t.*, u.name as customer_name, c.name as cashier_name,
            CASE 
              WHEN t.cashier_id IS NOT NULL THEN c.name
              WHEN t.payment_method IN ('DIGITAL', 'QRIS') THEN 'Admin'
              ELSE 'System'
            END as transaction_handler
     FROM transactions t
     LEFT JOIN users u ON t.user_id = u.userId
     LEFT JOIN users c ON t.cashier_id = c.userId
     ORDER BY t.transaction_date DESC`
  );
  return rows;
};

const formatFullAddress = (address, province, city, district, village, postalCode) => {
  const parts = [];
  
  if (address) parts.push(address);
  if (village) parts.push(village);
  if (district) parts.push(district);
  if (city) parts.push(city);
  if (province) parts.push(province);
  if (postalCode) parts.push(postalCode);
  
  return parts.length > 0 ? parts.join(', ') : 'Alamat tidak tersedia';
};

const getTransactionById = async (id) => {
  const [rows] = await db.query(
    `SELECT t.*, 
            u.name as customer_name, 
            u.email as customer_email,
            u.address as customer_address,
            u.phone as customer_phone,
            u.province_id,
            u.city_id,
            u.district_id,
            u.village_id,
            u.postal_code,
            c.name as cashier_name,
            COALESCE(t.shipping_cost, 0) as shipping_cost,
            COALESCE(t.fee_amount, 0) as fee_amount,
            (t.total_amount + COALESCE(t.shipping_cost, 0) + COALESCE(t.fee_amount, 0)) as grand_total,
            CASE 
              WHEN t.cashier_id IS NOT NULL THEN c.name
              WHEN t.payment_method IN ('DIGITAL', 'QRIS') THEN 'Admin'
              ELSE 'System'
            END as transaction_handler
     FROM transactions t
     LEFT JOIN users u ON t.user_id = u.userId
     LEFT JOIN users c ON t.cashier_id = c.userId
     WHERE t.transaction_id = ?`,
    [id]
  );
  
  if (rows[0]) {
    const transaction = rows[0];
    
    // Jika ada data lokasi, ambil nama lokasi lengkap
    if (transaction.province_id || transaction.city_id || transaction.district_id || transaction.village_id) {
      try {
        const [locationData] = await db.query(
          `SELECT 
            p.name as province_name,
            c.name as city_name,
            d.name as district_name,
            v.name as village_name
           FROM users u
           LEFT JOIN provinces p ON u.province_id = p.id
           LEFT JOIN cities c ON u.city_id = c.id
           LEFT JOIN districts d ON u.district_id = d.id
           LEFT JOIN villages v ON u.village_id = v.id
           WHERE u.userId = ?`,
          [transaction.user_id]
        );
        
        if (locationData[0]) {
          transaction.province_name = locationData[0].province_name;
          transaction.city_name = locationData[0].city_name;
          transaction.district_name = locationData[0].district_name;
          transaction.village_name = locationData[0].village_name;
        }
      } catch (error) {
        console.log('Error getting location data:', error.message);
        // Jika error, lanjutkan tanpa data lokasi
      }
    }
    
    // Format alamat lengkap
    transaction.formatted_address = formatFullAddress(
      transaction.customer_address,
      transaction.province_name,
      transaction.city_name,
      transaction.district_name,
      transaction.village_name,
      transaction.postal_code
    );
    
    return transaction;
  }
  
  return null;
};

const createTransaction = async (trx) => {
  const {
    transaction_code, user_id, cashier_id, total_amount, discount, final_amount,
    payment_method, payment_status, payment_reference, transaction_details,
    reduce_stock_now, shipping_cost, courier, waybill_number
  } = trx;
  
  console.log('=== CREATE TRANSACTION DEBUG ===', {
    transaction_code,
    user_id,
    total_amount,
    shipping_cost,
    courier,
    waybill_number,
    full_trx: trx
  });
  
  // Mulai transaksi database
  const connection = await db.getConnection();
  await connection.beginTransaction();
  
  try {
    // Insert transaksi utama
    const [result] = await connection.query(
      `INSERT INTO transactions (transaction_code, user_id, cashier_id, total_amount, discount, final_amount, payment_method, payment_status, payment_reference, shipping_cost, courier)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [transaction_code, user_id, cashier_id, total_amount, discount, final_amount, payment_method, payment_status, payment_reference, shipping_cost || 0, courier || null]
    );
    
    const transactionId = result.insertId;
    
    // Insert transaction details jika ada
    if (transaction_details && transaction_details.length > 0) {
      for (const detail of transaction_details) {
        await connection.query(
          `INSERT INTO transaction_details (transaction_id, product_id, variant_id, quantity, unit_price, subtotal)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [transactionId, detail.product_id, detail.variant_id || null, detail.quantity, detail.unit_price, detail.subtotal]
        );
        
        // Kurangi stok hanya jika diinstruksikan (untuk transaksi kasir). Untuk online, tunda hingga payment success
        if (reduce_stock_now && detail.variant_id && detail.quantity) {
          await connection.query(
            `UPDATE product_variants SET stock_quantity = stock_quantity - ? WHERE variant_id = ?`,
            [detail.quantity, detail.variant_id]
          );
        }
      }
    }
    
    // Commit transaksi
    await connection.commit();
    connection.release();
    
    return transactionId;
  } catch (error) {
    // Rollback jika ada error
    await connection.rollback();
    connection.release();
    throw error;
  }
};

const updateMidtransFeeAndStatus = async (order_id, fee, status) => {
  // Map midtrans status to our payment_status
  let paymentStatus = 'Pending';
  let orderStatus = 'menunggu pembayaran';
  const s = (status || '').toLowerCase();
  
  if (s === 'settlement' || s === 'capture' || s === 'success') {
    paymentStatus = 'Selesai';
    orderStatus = 'diproses';
  } else if (s === 'pending') {
    paymentStatus = 'Pending';
    orderStatus = 'menunggu pembayaran';
  } else if (s === 'deny' || s === 'cancel' || s === 'expire' || s === 'failure') {
    paymentStatus = 'Gagal';
    orderStatus = 'dibatalkan';
  }

  await db.query(
    `UPDATE transactions SET payment_status = ?, status = ? WHERE transaction_code = ?`,
    [paymentStatus, orderStatus, order_id]
  );

  // Jika success/settlement, kurangi stok berdasarkan detail transaksi dan clear cart
  if (paymentStatus === 'Selesai') {
    const [rows] = await db.query(`SELECT transaction_id, user_id FROM transactions WHERE transaction_code = ?`, [order_id]);
    if (rows.length > 0) {
      const trxId = rows[0].transaction_id;
      const userId = rows[0].user_id;
      
      // Kurangi stok
      const [details] = await db.query(`SELECT variant_id, quantity FROM transaction_details WHERE transaction_id = ?`, [trxId]);
      for (const d of details) {
        if (d.variant_id && d.quantity) {
          await db.query(`UPDATE product_variants SET stock_quantity = GREATEST(stock_quantity - ?, 0) WHERE variant_id = ?`, [d.quantity, d.variant_id]);
        }
      }
      
      // Clear cart user setelah pembayaran berhasil
      if (userId) {
        await db.query(`DELETE FROM cart WHERE user_id = ?`, [userId]);
      }
    }
  }
};

const getByOrderId = async (order_id) => {
  const [rows] = await db.query(
    `SELECT * FROM transactions WHERE transaction_code = ?`,
    [order_id]
  );
  return rows[0];
};

// Fungsi untuk menghitung ongkir berdasarkan alamat user
const calculateShippingCost = (userAddress) => {
  // Default ongkir untuk area lokal
  let baseCost = 15000;
  
  // Jika ada alamat user, hitung berdasarkan provinsi
  if (userAddress) {
    const address = userAddress.toLowerCase();
    
    // Area Kalimantan Barat (ongkir lebih murah)
    if (address.includes('kalimantan') || address.includes('pontianak') || 
        address.includes('sintang') || address.includes('sekadau')) {
      baseCost = 10000;
    }
    // Area luar Kalimantan (ongkir lebih mahal)
    else if (address.includes('jakarta') || address.includes('bandung') || 
             address.includes('surabaya') || address.includes('medan')) {
      baseCost = 25000;
    }
    // Area lain di Indonesia
    else if (address.includes('indonesia') || address.includes('jawa') || 
             address.includes('sumatera') || address.includes('sulawesi')) {
      baseCost = 20000;
    }
  }
  
  return baseCost;
};

const getAllTransactionsByUserId = async (user_id) => {
  try {
    console.log('=== DEBUGGING getAllTransactionsByUserId ===');
    console.log('User ID:', user_id);
    
    // 1. Ambil transaksi utama dengan ongkir dan biaya
    const [transactions] = await db.query(
      `SELECT t.*, u.name as customer_name, u.address as user_address, c.name as cashier_name,
              COALESCE(t.shipping_cost, 0) as shipping_cost,
              COALESCE(t.fee_amount, 0) as fee_amount,
              (t.total_amount + COALESCE(t.shipping_cost, 0) + COALESCE(t.fee_amount, 0)) as grand_total,
              CASE 
                WHEN t.cashier_id IS NOT NULL THEN c.name
                WHEN t.payment_method IN ('digital', 'qris') THEN 'Admin'
                ELSE 'System'
              END as transaction_handler
       FROM transactions t
       LEFT JOIN users u ON t.user_id = u.userId
       LEFT JOIN users c ON t.cashier_id = c.userId
       WHERE t.user_id = ?
       ORDER BY t.transaction_date DESC`,
      [user_id]
    );
    
    console.log('Found transactions:', transactions);
    
    // 2. Ambil transaction details untuk setiap transaksi
    for (let transaction of transactions) {
      const [details] = await db.query(
        `SELECT td.*, p.product_name, p.image_url
         FROM transaction_details td
         LEFT JOIN products p ON td.product_id = p.product_id
         WHERE td.transaction_id = ?`,
        [transaction.transaction_id]
      );
      
      // Transform data untuk frontend
      transaction.transaction_details = details.map(detail => ({
        ...detail,
        product: {
          product_id: detail.product_id,
          product_name: detail.product_name,
          image_url: detail.image_url
        }
      }));
      
      // 3. Hitung ongkir otomatis jika belum ada
      if (!transaction.shipping_cost || transaction.shipping_cost == 0) {
        const calculatedShipping = calculateShippingCost(transaction.user_address);
        transaction.shipping_cost = calculatedShipping;
        transaction.grand_total = Number(transaction.total_amount) + calculatedShipping + Number(transaction.fee_amount || 0);
        
        // Update database dengan ongkir yang dihitung
        await db.query(
          `UPDATE transactions SET shipping_cost = ? WHERE transaction_id = ?`,
          [calculatedShipping, transaction.transaction_id]
        );
        console.log(`Updated transaction ${transaction.transaction_id} with shipping cost: ${calculatedShipping}`);
      }
      
      console.log(`Transaction ${transaction.transaction_id} details:`, details);
    }
    
    console.log('Final result:', transactions);
    return transactions;
    
  } catch (error) {
    console.error('Error in getAllTransactionsByUserId:', error);
    throw error;
  }
};

const getTransactionsByKasirId = async (kasir_id) => {
  const [rows] = await db.query(
    `SELECT t.*, u.name as customer_name, c.name as cashier_name,
            CASE 
              WHEN t.cashier_id IS NOT NULL THEN c.name
              WHEN t.payment_method IN ('DIGITAL', 'QRIS') THEN 'Admin'
              ELSE 'System'
            END as transaction_handler
     FROM transactions t
     LEFT JOIN users u ON t.user_id = u.userId
     LEFT JOIN users c ON t.cashier_id = c.userId
     WHERE t.cashier_id = ?
     ORDER BY t.transaction_date DESC`,
    [kasir_id]
  );
  return rows;
};

// Fungsi khusus untuk admin - hanya transaksi online tanpa kasir
const getOnlineTransactionsForAdmin = async () => {
  const [rows] = await db.query(
    `SELECT t.*, u.name as customer_name, c.name as cashier_name,
            COALESCE(t.status, 'pending') as status,
            CASE 
              WHEN t.cashier_id IS NOT NULL THEN c.name
              WHEN t.payment_method IN ('DIGITAL', 'QRIS') THEN 'Admin'
              ELSE 'System'
            END as transaction_handler
     FROM transactions t
     LEFT JOIN users u ON t.user_id = u.userId
     LEFT JOIN users c ON t.cashier_id = c.userId
     WHERE t.payment_method IN ('DIGITAL', 'QRIS', 'TRANSFER', 'MIDTRANS')
     ORDER BY t.transaction_date DESC`
  );
  return rows;
};

// Method untuk mengambil transaksi web saja (bukan dari kasir)
const getWebOnlyTransactions = async () => {
  const [rows] = await db.query(
    `SELECT t.*, u.name as customer_name, c.name as cashier_name,
            COALESCE(t.status, 'pending') as status,
            CASE 
              WHEN t.cashier_id IS NOT NULL THEN 'POS'
              ELSE 'Web'
            END as transaction_type,
            COALESCE((
              SELECT SUM(td.quantity)
              FROM transaction_details td
              WHERE td.transaction_id = t.transaction_id
            ), 0) as item_count
     FROM transactions t
     LEFT JOIN users u ON t.user_id = u.userId
     LEFT JOIN users c ON t.cashier_id = c.userId
     WHERE t.cashier_id IS NULL 
       AND t.payment_method NOT IN ('CASH', 'TUNAI')
       AND t.payment_method IS NOT NULL
     ORDER BY t.transaction_date DESC`
  );
  return rows;
};

// Fungsi khusus untuk kasir - semua transaksi yang dia tangani (tunai + digital)
const getCashTransactionsForKasir = async (kasir_id) => {
  try {
    console.log('=== DEBUGGING KASIR TRANSACTIONS ===');
    console.log('Kasir ID:', kasir_id);
    
    const [rows] = await db.query(
      `SELECT t.*, u.name as customer_name, c.name as cashier_name,
              c.name as transaction_handler,
              COALESCE((
                SELECT SUM(td.quantity)
                FROM transaction_details td
                WHERE td.transaction_id = t.transaction_id
              ), 0) as total_items
       FROM transactions t
       LEFT JOIN users u ON t.user_id = u.userId
       LEFT JOIN users c ON t.cashier_id = c.userId
       WHERE t.cashier_id = ?
       ORDER BY t.transaction_date DESC`,
      [kasir_id]
    );
    
    console.log('Found transactions for kasir:', rows.length);
    console.log('Sample transaction with item_count:', rows[0]);
    
    // Debug: Check if transaction_details table has data
    const [detailsCount] = await db.query(
      `SELECT COUNT(*) as count FROM transaction_details`
    );
    console.log('Total transaction_details records:', detailsCount[0].count);
    
    // Debug: Check transaction_details for this kasir's transactions
    const [detailsForKasir] = await db.query(
      `SELECT td.transaction_id, td.quantity, t.transaction_code
       FROM transaction_details td
       JOIN transactions t ON td.transaction_id = t.transaction_id
       WHERE t.cashier_id = ?
       ORDER BY t.transaction_date DESC
       LIMIT 5`,
      [kasir_id]
    );
    console.log('Transaction details for kasir:', detailsForKasir);
    
    return rows;
  } catch (err) {
    console.error('GET CASH TRANSACTIONS FOR KASIR ERROR:', err);
    throw err;
  }
};

const getTransactionDetailsById = async (transactionId) => {
  const [rows] = await db.query(
    `SELECT td.*, p.product_name, p.description as product_description, p.image_url,
            pv.size as variant_name, pv.barcode as variant_barcode, pv.variant_id,
            pi.image_id as main_image_id
     FROM transaction_details td
     LEFT JOIN products p ON td.product_id = p.product_id
     LEFT JOIN product_variants pv ON td.variant_id = pv.variant_id
     LEFT JOIN product_images pi ON p.product_id = pi.product_id
     WHERE td.transaction_id = ?
     ORDER BY td.detail_id`,
    [transactionId]
  );
  
  // Transform data untuk frontend
  return rows.map(row => ({
    ...row,
    product: {
      product_id: row.product_id,
      product_name: row.product_name,
      description: row.product_description,
      image_url: row.image_url,
      main_image_id: row.main_image_id
    },
    variant: {
      variant_id: row.variant_id,
      size: row.variant_name,
      barcode: row.variant_barcode
    }
  }));
};

const getNewOrdersCount = async () => {
  try {
    // Count orders that match EXACTLY what KelolaPesanan shows
    // Only online transactions (DIGITAL, QRIS) without cashier_id
    const [rows] = await db.query(
      `SELECT COUNT(*) as count 
       FROM transactions 
       WHERE payment_method IN ('DIGITAL', 'QRIS')
       AND cashier_id IS NULL`
    );
    console.log('NEW ORDERS COUNT (exactly like KelolaPesanan):', rows[0].count);
    
    // Debug: Let's also see what transactions exist
    const [allTransactions] = await db.query(
      `SELECT transaction_id, transaction_code, payment_method, cashier_id 
       FROM transactions 
       ORDER BY transaction_date DESC 
       LIMIT 10`
    );
    console.log('ALL TRANSACTIONS (last 10):', allTransactions);
    
    return rows[0].count;
  } catch (err) {
    console.error('GET NEW ORDERS COUNT ERROR:', err);
    throw err;
  }
};

const getRecentOrders = async () => {
  try {
    const [rows] = await db.query(
      `SELECT t.transaction_id, t.transaction_code, t.final_amount, t.payment_status, 
              t.payment_method, t.transaction_date,
              u.name as customer_name,
              CASE 
                WHEN t.cashier_id IS NOT NULL THEN 'POS'
                ELSE 'Web'
              END as transaction_type
       FROM transactions t 
       LEFT JOIN users u ON t.user_id = u.userId
       WHERE t.payment_method IN ('DIGITAL', 'QRIS')
       AND t.cashier_id IS NULL
       ORDER BY t.transaction_date DESC 
       LIMIT 5`
    );
    console.log('RECENT ORDERS (online only):', rows);
    return rows;
  } catch (err) {
    console.error('GET RECENT ORDERS ERROR:', err);
    throw err;
  }
};

const updateOrder = async (transaction_id, updateData) => {
  try {
    const { status, waybill_number, courier } = updateData;
    
    // Update status, waybill_number, and courier columns
    const [result] = await db.query(
      `UPDATE transactions 
       SET status = ?, waybill_number = ?, courier = ?, updated_at = NOW()
       WHERE transaction_id = ?`,
      [status, waybill_number || null, courier || null, transaction_id]
    );
    
    if (result.affectedRows > 0) {
      // Get updated transaction
      const [rows] = await db.query(
        `SELECT * FROM transactions WHERE transaction_id = ?`,
        [transaction_id]
      );
      return rows[0];
    }
    
    return null;
  } catch (err) {
    console.error('UPDATE ORDER ERROR:', err);
    throw err;
  }
};

const getAllUsers = async () => {
  const [rows] = await db.query(
    `SELECT * FROM users ORDER BY createdAt DESC`
  );
  return rows;
};

const getAllProducts = async () => {
  const [rows] = await db.query(
    `SELECT * FROM products WHERE is_active = 1 ORDER BY product_name ASC`
  );
  return rows;
};

module.exports = {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateMidtransFeeAndStatus,
  getByOrderId,
  getAllTransactionsByUserId,
  getTransactionsByKasirId,
  getOnlineTransactionsForAdmin,
  getWebOnlyTransactions,
  getCashTransactionsForKasir,
  getTransactionDetailsById,
  getNewOrdersCount,
  getRecentOrders,
  updateOrder,
  getAllUsers,
  getAllProducts
}; 