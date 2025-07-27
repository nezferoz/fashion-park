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
    
    // Format data untuk laporan penjualan
    const salesReport = transactions.map(transaction => ({
      transaction_id: transaction.transaction_id,
      transaction_date: transaction.transaction_date,
      total_amount: transaction.final_amount || transaction.total_amount,
      kasir_name: transaction.cashier_name || 'N/A',
      status: transaction.payment_status || 'Pending'
    }));
    
    res.json(salesReport);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil laporan penjualan', error: err.message });
  }
};

const getBestSellersReport = async (req, res) => {
  try {
    // Hanya owner yang boleh akses laporan produk terlaris
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Forbidden: only owner can access best sellers reports' });
    }
    
    const products = await productModel.getAllProducts();
    
    // Untuk sementara, kita akan menggunakan data dummy untuk best sellers
    // karena tidak ada data penjualan detail di sistem saat ini
    const bestSellers = products.slice(0, 5).map((product, index) => ({
      product_id: product.product_id,
      product_name: product.product_name,
      total_sold: Math.floor(Math.random() * 100) + 10 // Dummy data
    }));
    
    // Sort by total_sold descending
    bestSellers.sort((a, b) => b.total_sold - a.total_sold);
    
    res.json(bestSellers);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil laporan produk terlaris', error: err.message });
  }
};

const getFinanceSummary = async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ message: 'Forbidden: only owner can access financial summary' });
    }
    const transactions = await transactionModel.getAllTransactions();
    const totalIncome = transactions.reduce((sum, trx) => sum + Number(trx.final_amount || 0), 0);
    const totalExpenses = transactions.reduce((sum, trx) => sum + Number(trx.midtrans_fee || 0), 0);
    const grossProfit = totalIncome - totalExpenses;
    const netProfit = grossProfit * 0.85; // Asumsi biaya operasional 15%
    res.json({
      totalIncome,
      totalExpenses,
      grossProfit,
      netProfit,
      transactions
    });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil ringkasan keuangan', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const id = await reportModel.createReport(req.body);
    res.status(201).json({ message: 'Laporan ditambahkan', report_id: id });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menambah laporan', error: err.message });
  }
};

module.exports = { getAll, create, getSalesReport, getBestSellersReport, getFinanceSummary }; 