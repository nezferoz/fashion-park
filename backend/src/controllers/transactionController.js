const transactionModel = require('../models/transactionModel');

const getAll = async (req, res) => {
  try {
    let transactions;
    if (req.user.role === 'pelanggan') {
          console.log('Getting transactions for pelanggan, userId:', req.user.user_id);
    transactions = await transactionModel.getAllTransactionsByUserId(req.user.user_id);
      console.log('Found transactions:', transactions);
    } else {
      transactions = await transactionModel.getAllTransactions();
    }
    res.json(transactions);
  } catch (err) {
    console.error('TRANSACTION ERROR:', err);
    res.status(500).json({ message: 'Gagal mengambil data transaksi', error: err.message });
  }
};

// Endpoint untuk transaksi SUCCESS saja
const getSuccessTransactions = async (req, res) => {
  try {
    let transactions;
    if (req.user.role === 'pelanggan') {
      console.log('Getting SUCCESS transactions for pelanggan, userId:', req.user.user_id);
      transactions = await transactionModel.getAllTransactionsByUserId(req.user.user_id);
    } else {
      transactions = await transactionModel.getAllTransactions();
    }
    
    // Filter hanya transaksi dengan payment_status SUCCESS
    const successTransactions = transactions.filter(t => t.payment_status === 'SUCCESS');
    
    console.log('Found SUCCESS transactions:', successTransactions.length);
    res.json(successTransactions);
  } catch (err) {
    console.error('TRANSACTION ERROR:', err);
    res.status(500).json({ message: 'Gagal mengambil data transaksi SUCCESS', error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const trx = await transactionModel.getTransactionById(id);
    if (!trx) return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    res.json(trx);
  } catch (err) {
    console.error('TRANSACTION ERROR:', err);
    res.status(500).json({ message: 'Gagal mengambil data transaksi', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    console.log('Creating transaction:', req.body);
    const id = await transactionModel.createTransaction(req.body);
    res.status(201).json({ message: 'Transaksi ditambahkan', transaction_id: id });
  } catch (err) {
    console.error('TRANSACTION ERROR:', err);
    res.status(500).json({ message: 'Gagal menambah transaksi', error: err.message });
  }
};

const getStatusByOrderId = async (req, res) => {
  try {
    const { order_id } = req.params;
    const trx = await transactionModel.getByOrderId(order_id);
    if (!trx) return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    res.json({ transaction_status: trx.midtrans_status, transaction: trx });
  } catch (err) {
    console.error('TRANSACTION ERROR:', err);
    res.status(500).json({ message: 'Gagal mengambil status transaksi', error: err.message });
  }
};

// Endpoint untuk transaksi kasir
const getByKasirId = async (req, res) => {
  try {
    // Handle both old and new JWT token formats
    const kasirId = req.user.user_id || req.user.userId;
    console.log('Getting transactions for kasir_id:', kasirId);
    console.log('Full user object from JWT:', req.user);
    
    if (!kasirId) {
      return res.status(400).json({ message: 'User ID tidak ditemukan dalam token' });
    }
    
    // Kasir melihat semua transaksi yang dia tangani (tunai + digital)
    const transactions = await transactionModel.getCashTransactionsForKasir(kasirId);
    console.log('Found transactions for kasir:', transactions);
    res.json(transactions);
  } catch (err) {
    console.error('TRANSACTION ERROR:', err);
    res.status(500).json({ message: 'Gagal mengambil data transaksi kasir', error: err.message });
  }
};

// Controller khusus untuk admin - hanya transaksi online
const getOnlineTransactionsForAdmin = async (req, res) => {
  try {
    console.log('Getting online transactions for admin');
    
    const transactions = await transactionModel.getOnlineTransactionsForAdmin();
    console.log('Found online transactions:', transactions);
    res.json(transactions);
  } catch (err) {
    console.error('TRANSACTION ERROR:', err);
    res.status(500).json({ message: 'Gagal mengambil data transaksi online', error: err.message });
  }
};

// Controller khusus untuk admin - hanya transaksi web (bukan dari kasir)
const getWebOnlyTransactions = async (req, res) => {
  try {
    console.log('Getting web-only transactions for admin');
    
    const transactions = await transactionModel.getWebOnlyTransactions();
    console.log('Found web-only transactions:', transactions);
    res.json(transactions);
  } catch (err) {
    console.error('TRANSACTION ERROR:', err);
    res.status(500).json({ message: 'Gagal mengambil data transaksi web', error: err.message });
  }
};

const getByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Getting transactions for user_id:', userId);
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID tidak ditemukan' });
    }
    
    const transactions = await transactionModel.getAllTransactionsByUserId(userId);
    console.log('Found transactions for user:', transactions);
    res.json(transactions);
  } catch (err) {
    console.error('TRANSACTION ERROR:', err);
    res.status(500).json({ message: 'Gagal mengambil data transaksi user', error: err.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    console.log('getDashboardStats called');
    
    // Get new orders count (orders with status 'new' or 'paid')
    const newOrdersCount = await transactionModel.getNewOrdersCount();
    console.log('New orders count:', newOrdersCount);
    
    // Get recent orders (last 5 orders)
    const recentOrders = await transactionModel.getRecentOrders();
    console.log('Recent orders:', recentOrders);
    
    const response = {
      newOrders: newOrdersCount,
      recentOrders: recentOrders
    };
    
    console.log('Dashboard stats response:', response);
    res.json(response);
  } catch (err) {
    console.error('DASHBOARD STATS ERROR:', err);
    res.status(500).json({ message: 'Gagal mengambil statistik dashboard', error: err.message });
  }
};

const getKPIData = async (req, res) => {
  try {
    console.log('getKPIData called');
    
    // Get all transactions for KPI calculation
    const allTransactions = await transactionModel.getAllTransactions();
    const allUsers = await transactionModel.getAllUsers();
    const allProducts = await transactionModel.getAllProducts();
    
    console.log('Sample transaction data:', allTransactions.slice(0, 2));
    console.log('Total transactions:', allTransactions.length);
    console.log('Total users:', allUsers.length);
    console.log('Total products:', allProducts.length);
    
    // Calculate current month and last month data
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Current month transactions
    const currentMonthTransactions = allTransactions.filter(t => {
      if (!t.transaction_date) return false;
      const transactionDate = new Date(t.transaction_date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });
    
    // Last month transactions
    const lastMonthTransactions = allTransactions.filter(t => {
      if (!t.transaction_date) return false;
      const transactionDate = new Date(t.transaction_date);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return transactionDate.getMonth() === lastMonth && 
             transactionDate.getFullYear() === lastMonthYear;
    });
    
    // Calculate KPIs - Only include SUCCESS payment transactions
    const successTransactions = allTransactions.filter(t => t.payment_status === 'SUCCESS');
    const currentMonthSuccessTransactions = currentMonthTransactions.filter(t => t.payment_status === 'SUCCESS');
    const lastMonthSuccessTransactions = lastMonthTransactions.filter(t => t.payment_status === 'SUCCESS');
    
    const totalRevenue = successTransactions.reduce((sum, t) => sum + Number(t.final_amount || 0), 0);
    const currentMonthRevenue = currentMonthSuccessTransactions.reduce((sum, t) => sum + Number(t.final_amount || 0), 0);
    const lastMonthRevenue = lastMonthSuccessTransactions.reduce((sum, t) => sum + Number(t.final_amount || 0), 0);
    
    const totalTransactions = allTransactions.length;
    const successTransactionsCount = successTransactions.length;
    const currentMonthTransactionsCount = currentMonthTransactions.length;
    const lastMonthTransactionsCount = lastMonthTransactions.length;
    
    const averageTransactionValue = successTransactionsCount > 0 ? totalRevenue / successTransactionsCount : 0;
    
    // Count customers (users with role 'pelanggan')
    const customers = allUsers.filter(u => u.role === 'PELANGGAN');
    const newCustomers = customers.length;
    
    // Calculate month-over-month changes with better handling
    const revenueChange = lastMonthRevenue > 0 ? 
      ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 
      (currentMonthRevenue > 0 ? 100 : 0); // If no last month data, show 100% if current month has data
    
    const transactionChange = lastMonthTransactionsCount > 0 ? 
      ((currentMonthTransactionsCount - lastMonthTransactionsCount) / lastMonthTransactionsCount) * 100 : 
      (currentMonthTransactionsCount > 0 ? 100 : 0); // If no last month data, show 100% if current month has data
    
    const averageTransactionChange = lastMonthRevenue > 0 && lastMonthTransactionsCount > 0 ? 
      (((currentMonthRevenue / currentMonthTransactionsCount) - (lastMonthRevenue / lastMonthTransactionsCount)) / (lastMonthRevenue / lastMonthTransactionsCount)) * 100 : 
      (currentMonthRevenue > 0 ? 100 : 0); // If no last month data, show 100% if current month has data
    
    // Calculate conversion rate
    const conversionRate = newCustomers > 0 ? (totalTransactions / newCustomers) * 100 : 0;
    
    // Estimate customer acquisition cost (simplified)
    const customerAcquisitionCost = newCustomers > 0 ? 1000000 : 0;
    
    // Get top product based on actual sales quantity
    let topProduct = 'N/A';
    let topProductQuantity = 0;
    
    try {
      // Get transaction details to calculate product sales (only from SUCCESS transactions)
      const transactionDetails = await transactionModel.getAllTransactionDetails();
      
      // Group by product and sum quantities (only from SUCCESS payment transactions)
      const productSales = {};
      transactionDetails.forEach(detail => {
        // Find the transaction for this detail to check payment status
        const transaction = allTransactions.find(t => t.transaction_id === detail.transaction_id);
        if (transaction && transaction.payment_status === 'SUCCESS' && detail.product && detail.product.product_name) {
          const productName = detail.product.product_name;
          if (!productSales[productName]) {
            productSales[productName] = 0;
          }
          productSales[productName] += detail.quantity || 0;
        }
      });
      
      // Find top selling product
      Object.entries(productSales).forEach(([productName, quantity]) => {
        if (quantity > topProductQuantity) {
          topProductQuantity = quantity;
          topProduct = productName;
        }
      });
      
      console.log('Top product calculated:', topProduct, 'with quantity:', topProductQuantity);
    } catch (error) {
      console.log('Error calculating top product, using fallback:', error.message);
      topProduct = allProducts.length > 0 ? allProducts[0].product_name : 'N/A';
    }
    
    // Calculate retention rate (simplified)
    const retentionRate = 65;
    
    // Prepare chart data for last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const chartLabels = last7Days.map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
    });

    const chartRevenueData = last7Days.map(date => {
      const dayTransactions = allTransactions.filter(t => {
        if (!t.transaction_date || t.payment_status !== 'SUCCESS') return false;
        
        // Handle both Date objects and strings
        let transactionDate;
        if (t.transaction_date instanceof Date) {
          transactionDate = t.transaction_date.toISOString().split('T')[0];
        } else if (typeof t.transaction_date === 'string') {
          transactionDate = t.transaction_date.split('T')[0];
        } else {
          return false;
        }
        
        return transactionDate === date;
      });
      return dayTransactions.reduce((sum, t) => sum + Number(t.final_amount || 0), 0);
    });

    const kpiData = {
      totalRevenue,
      currentMonthRevenue,
      lastMonthRevenue,
      revenueChange,
      newCustomers,
      averageTransactionValue,
      averageTransactionChange,
      totalTransactions,
      successTransactionsCount,
      currentMonthTransactionsCount,
      lastMonthTransactionsCount,
      transactionChange,
      totalProducts: allProducts.length,
      totalUsers: allUsers.length,
      conversionRate,
      customerAcquisitionCost,
      retentionRate,
      topProduct,
      topProductQuantity,
      chartLabels,
      chartRevenueData
    };
    
    console.log('KPI Data calculated:', kpiData);
    res.json(kpiData);
  } catch (err) {
    console.error('KPI DATA ERROR:', err);
    res.status(500).json({ message: 'Gagal mengambil data KPI', error: err.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const { transaction_id } = req.params;
    const { status, waybill_number, courier } = req.body;
    
    // Get transaction details first to check payment method
    const transaction = await transactionModel.getTransactionById(transaction_id);
    if (!transaction) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }
    
    // Prepare update data based on payment method
    let updateData = { status };
    
    // Only add waybill and courier for online transactions (DIGITAL/QRIS)
    if (transaction.payment_method === 'DIGITAL' || transaction.payment_method === 'QRIS') {
      updateData.waybill_number = waybill_number;
      updateData.courier = courier;
    } else if (transaction.payment_method === 'CASH') {
      // For cash transactions, ignore waybill and courier (set to null)
      updateData.waybill_number = null;
      updateData.courier = null;
    }
    
    const result = await transactionModel.updateOrder(transaction_id, updateData);
    
    if (result) {
      // Jika dibatalkan oleh admin, kembalikan stok ke semula
      if ((status || '').toLowerCase() === 'dibatalkan' || (status || '').toLowerCase() === 'cancel') {
        const details = await transactionModel.getTransactionDetailsById(transaction_id);
        for (const d of details) {
          if (d.variant_id && d.quantity) {
            await require('../config/db').query(
              `UPDATE product_variants SET stock_quantity = stock_quantity + ? WHERE variant_id = ?`,
              [d.quantity, d.variant_id]
            );
          }
        }
      }
      res.json({ 
        message: 'Pesanan berhasil diupdate', 
        transaction: result,
        note: transaction.payment_method === 'CASH' ? 
          'Transaksi tunai - tidak memerlukan resi/kurir' : 
          'Transaksi online - resi dan kurir telah ditambahkan'
      });
    } else {
      res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }
  } catch (err) {
    console.error('UPDATE ORDER ERROR:', err);
    res.status(500).json({ message: 'Gagal mengupdate pesanan', error: err.message });
  }
};

const getTransactionDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const details = await transactionModel.getTransactionDetailsById(id);
    if (!details || details.length === 0) {
      return res.status(404).json({ message: 'Detail transaksi tidak ditemukan' });
    }
    res.json(details);
  } catch (err) {
    console.error('TRANSACTION DETAILS ERROR:', err);
    res.status(500).json({ message: 'Gagal mengambil detail transaksi', error: err.message });
  }
};

const getTransactionDetailsForUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== DEBUGGING getTransactionDetailsForUser ===');
    console.log('Transaction ID:', id);
    console.log('User from JWT:', req.user);
    
    // Check if user is authenticated
          if (!req.user || (!req.user.user_id && !req.user.userId)) {
      console.error('User not authenticated or userId missing');
      return res.status(401).json({ message: 'User tidak terautentikasi' });
    }
    
    // Ambil transaksi lengkap dengan detail
    const transaction = await transactionModel.getTransactionById(id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaksi tidak ditemukan' });
    }
    
    // Verifikasi bahwa transaksi milik user yang request
          const currentUserId = req.user.user_id || req.user.userId;
      if (transaction.user_id != currentUserId) {
      return res.status(403).json({ message: 'Tidak dapat mengakses transaksi orang lain' });
    }
    
    // Ambil transaction details dengan nama produk
    const details = await transactionModel.getTransactionDetailsById(id);
    
    // Gabungkan data
    const result = {
      ...transaction,
      transaction_details: details
    };
    
    console.log('Final result:', result);
    res.json(result);
    
  } catch (err) {
    console.error('TRANSACTION DETAILS FOR USER ERROR:', err);
    res.status(500).json({ message: 'Gagal mengambil detail transaksi', error: err.message });
  }
};

module.exports = { 
  getAll, 
  getById, 
  create, 
  getStatusByOrderId, 
  getByKasirId, 
  getOnlineTransactionsForAdmin,
  getWebOnlyTransactions,
  getByUserId, 
  getDashboardStats,
  getKPIData,
  updateOrder,
  getTransactionDetails,
  getTransactionDetailsForUser,
  getSuccessTransactions
}; 