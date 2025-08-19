const reportModel = require('../models/reportModel');
const transactionModel = require('../models/transactionModel');
const productModel = require('../models/productModel');

const getAll = async (req, res) => {
  try {
    const { type } = req.query;
    if (!type) return res.status(400).json({ message: 'Tipe laporan wajib diisi' });
    // Hanya owner yang boleh akses laporan keuangan
    if (type === 'finance' && req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Forbidden: only owner can access financial reports' });
    }
    const reports = await reportModel.getAllReports(type);
    res.json(reports);
  } catch (err) {
    console.error('REPORT ERROR:', err);
    res.status(500).json({ message: 'Gagal mengambil laporan', error: err.message });
  }
};

const getSalesReport = async (req, res) => {
  try {
    // Hanya owner yang boleh akses laporan penjualan
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Forbidden: only owner can access sales reports' });
    }
    
    const transactions = await transactionModel.getAllTransactions();
    
    // Filter hanya transaksi dengan payment_status SUCCESS
    const successTransactions = transactions.filter(t => t.payment_status === 'SUCCESS');
    
    // Format data untuk laporan penjualan
    const salesReport = successTransactions.map(transaction => ({
      transaction_id: transaction.transaction_id,
      transaction_date: transaction.transaction_date,
      total_amount: transaction.final_amount || transaction.total_amount,
      kasir_name: transaction.cashier_name || 'N/A',
      status: transaction.payment_status || 'SUCCESS'
    }));
    
    res.json(salesReport);
  } catch (err) {
    console.error('REPORT ERROR:', err);
    res.status(500).json({ message: 'Gagal mengambil laporan penjualan', error: err.message });
  }
};

const getBestSellersReport = async (req, res) => {
  try {
    // Hanya owner yang boleh akses laporan produk terlaris
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Forbidden: only owner can access best sellers reports' });
    }
    
    // Get all transactions first
    const transactions = await transactionModel.getAllTransactions();
    
    // Filter hanya transaksi SUCCESS
    const successTransactions = transactions.filter(t => t.payment_status === 'SUCCESS');
    
    // Get transaction details untuk transaksi SUCCESS
    const productSales = {};
    
    for (const transaction of successTransactions) {
      try {
        const details = await transactionModel.getTransactionDetailsById(transaction.transaction_id);
        
        details.forEach(detail => {
          if (detail.product && detail.product.product_name) {
            const productName = detail.product.product_name;
            if (!productSales[productName]) {
              productSales[productName] = 0;
            }
            productSales[productName] += detail.quantity || 0;
          }
        });
      } catch (error) {
        console.log(`Error getting details for transaction ${transaction.transaction_id}:`, error.message);
        // Continue with next transaction
      }
    }
    
    // Convert to array and sort by total_sold descending
    const bestSellers = Object.entries(productSales)
      .map(([product_name, total_sold]) => ({
        product_name,
        total_sold
      }))
      .sort((a, b) => b.total_sold - a.total_sold)
      .slice(0, 5); // Top 5 products
    
    res.json(bestSellers);
  } catch (err) {
    console.error('REPORT ERROR:', err);
    res.status(500).json({ message: 'Gagal mengambil laporan produk terlaris', error: err.message });
  }
};

const getFinanceSummary = async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Forbidden: only owner can access financial summary' });
    }
    
    const transactions = await transactionModel.getAllTransactions();
    
    // Filter hanya transaksi dengan payment_status SUCCESS
    const successTransactions = transactions.filter(t => t.payment_status === 'SUCCESS');
    
    const totalIncome = successTransactions.reduce((sum, trx) => sum + Number(trx.final_amount || 0), 0);
    const totalExpenses = successTransactions.reduce((sum, trx) => sum + Number(trx.midtrans_fee || 0), 0);
    const grossProfit = totalIncome - totalExpenses;
    const netProfit = grossProfit * 0.85; // Asumsi biaya operasional 15%
    
    res.json({
      totalIncome,
      totalExpenses,
      grossProfit,
      netProfit,
      totalTransactions: transactions.length,
      successTransactions: successTransactions.length,
      pendingTransactions: transactions.filter(t => t.payment_status === 'PENDING').length
    });
  } catch (err) {
    console.error('REPORT ERROR:', err);
    res.status(500).json({ message: 'Gagal mengambil ringkasan keuangan', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const id = await reportModel.createReport(req.body);
    res.status(201).json({ message: 'Laporan ditambahkan', report_id: id });
  } catch (err) {
    console.error('REPORT ERROR:', err);
    res.status(500).json({ message: 'Gagal menambah laporan', error: err.message });
  }
};

module.exports = { getAll, create, getSalesReport, getBestSellersReport, getFinanceSummary }; 