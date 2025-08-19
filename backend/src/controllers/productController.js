const productModel = require('../models/productModel');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bwipjs = require('bwip-js');
const PDFDocument = require('pdfkit');
const db = require('../db'); // Added for getLowStockProducts

// Setup multer untuk simpan file ke folder uploads/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });

const getAll = async (req, res) => {
  try {
    const products = await productModel.getAllProducts();
    // Ambil semua product_id
    const productIds = products.map(p => p.product_id);
    // Ambil semua varian sekaligus
    const allVariants = await productModel.getVariantsByProductIds(productIds);
    // Gabungkan variants ke masing-masing produk
    const productsWithVariants = products.map(p => ({
      ...p,
      variants: allVariants.filter(v => v.product_id === p.product_id)
    }));
    res.json(productsWithVariants);
  } catch (err) {
    console.error('GET ALL PRODUCTS ERROR:', err); // Pastikan baris ini ada!
    res.status(500).json({ message: 'Gagal mengambil produk', error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    let product = await productModel.getProductWithVariantsById(id);
    if (!product) return res.status(404).json({ message: 'Produk tidak ditemukan' });
    // Pastikan images selalu ada
    if (!product.images) {
      const images = await productModel.getProductImages(id);
      product.images = images;
    }
    console.log('PRODUCT DETAIL:', product); // Debug log
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil produk', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const id = await productModel.createProduct(req.body);
    res.status(201).json({ message: 'Produk ditambahkan', product_id: id });
  } catch (err) {
    console.error('CREATE PRODUCT ERROR:', err);
    res.status(500).json({ message: 'Gagal menambah produk', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    await productModel.updateProduct(id, req.body);
    res.json({ message: 'Produk diupdate' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal update produk', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await productModel.deleteProduct(id);
    res.json({ message: 'Produk dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal hapus produk', error: err.message });
  }
};

// Upload multiple images for a product
const uploadImages = [
  multer().array('images'),
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No images uploaded' });
      }
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        await productModel.addProductImage(id, file.buffer, file.mimetype);
      }
      res.status(201).json({ message: 'Images uploaded' });
    } catch (err) {
      console.error('UPLOAD IMAGE ERROR:', err);
      res.status(500).json({ message: 'Gagal upload gambar', error: err.message });
    }
  }
];

// Get all image ids for a product
const getImages = async (req, res) => {
  try {
    const { id } = req.params;
    const images = await productModel.getProductImages(id);
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil gambar', error: err.message });
  }
};

// Get image binary by image_id
const getImageById = async (req, res) => {
  try {
    const { image_id } = req.params;
    const image = await productModel.getProductImageById(image_id);
    if (!image) return res.status(404).json({ message: 'Gambar tidak ditemukan' });
    
    // Set headers untuk image dengan CORS yang benar
    res.set('Content-Type', image.mime_type);
    res.set('Content-Length', image.image.length);
    res.set('Cache-Control', 'public, max-age=31536000'); // Cache 1 tahun
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'ngrok-skip-browser-warning, Content-Type, Authorization');
    res.set('Access-Control-Expose-Headers', 'Content-Length, Content-Type');
    
    console.log(`Serving image ${image_id}, mime_type: ${image.mime_type}, size: ${image.image.length} bytes`);
    
    // Gunakan res.end() untuk binary data
    res.end(image.image);
  } catch (err) {
    console.error(`Error serving image ${image_id}:`, err);
    res.status(500).json({ message: 'Gagal mengambil gambar', error: err.message });
  }
};

const addVariant = async (req, res) => {
  try {
    const { product_id, size, stock_quantity } = req.body;
    const id = await productModel.addProductVariant(product_id, size, stock_quantity);
    res.status(201).json({ message: 'Varian ditambahkan', variant_id: id });
  } catch (err) {
    console.error('ADD VARIANT ERROR:', err); // Tambahkan log error detail
    res.status(500).json({ message: 'Gagal menambah varian', error: err.message });
  }
};

const updateVariant = async (req, res) => {
  try {
    const { variant_id, size, stock_quantity } = req.body;
    await productModel.updateProductVariant(variant_id, size, stock_quantity);
    res.json({ message: 'Varian diupdate' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal update varian', error: err.message });
  }
};

const deleteVariant = async (req, res) => {
  try {
    const { variant_id } = req.params;
    await productModel.deleteProductVariant(variant_id);
    res.json({ message: 'Varian dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal hapus varian', error: err.message });
  }
};

const deleteImageById = async (req, res) => {
  try {
    const { image_id } = req.params;
    await productModel.deleteProductImageById(image_id);
    res.json({ message: 'Gambar dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal hapus gambar', error: err.message });
  }
};



// Print barcode horizontal untuk produk (0,3x0,7 cm)
const printBarcodesHorizontal = async (req, res) => {
  try {
    const { variant_ids, product_ids } = req.body;
    if ((!Array.isArray(variant_ids) || variant_ids.length === 0) && (!Array.isArray(product_ids) || product_ids.length === 0)) {
      return res.status(400).json({ message: 'variant_ids atau product_ids harus array dan tidak boleh kosong' });
    }
    
    // Ambil data varian
    let variants = [];
    if (Array.isArray(variant_ids) && variant_ids.length > 0) {
      variants = await productModel.getVariantsByIds(variant_ids);
    }
    // Ambil data produk tanpa varian
    let products = [];
    if (Array.isArray(product_ids) && product_ids.length > 0) {
      products = await productModel.getProductsByIds(product_ids);
    }
    
    // Gabungkan semua label
    const allLabels = [
      ...variants.map(v => ({
        product_name: v.product_name,
        barcode: v.barcode,
        size: v.size
      })),
      ...products.map(p => ({
        product_name: p.product_name,
        barcode: p.barcode && p.barcode.trim() !== '' ? p.barcode : `P${String(p.product_id).padStart(4, '0')}`,
        size: null
      }))
    ];
    
    if (allLabels.length === 0) {
      return res.status(404).json({ message: 'Tidak ada data label yang ditemukan' });
    }
    
    // Siapkan PDF
    const doc = new PDFDocument({ margin: 5, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="barcodes-horizontal.pdf"');
    doc.pipe(res);
    
    // Konversi mm ke points (1 mm = 2.83465 points)
    const mmToPoints = 2.83465;
    const labelWidth = 19.8 * mmToPoints; // 19.8 mm (0,7 cm) - horizontal
    const labelHeight = 8.5 * mmToPoints;  // 8.5 mm (0,3 cm) - horizontal
    const labelMargin = 2 * mmToPoints;    // 2 mm margin antar label
    
    // Hitung berapa label per baris (A4 width = 595.28 points)
    const a4Width = 595.28;
    const labelsPerRow = Math.floor((a4Width - 10) / (labelWidth + labelMargin));
    
    let x = 5, y = 5, col = 0;
    
    for (let i = 0; i < allLabels.length; i++) {
      const v = allLabels[i];
      
      // Nama produk - tampilkan lebih lengkap, maksimal 20 karakter untuk horizontal
      let namaProduk = v.product_name || '';
      if (namaProduk.length > 20) namaProduk = namaProduk.slice(0, 18) + '..';
      
      // Generate barcode PNG buffer
      const png = await bwipjs.toBuffer({
        bcid: 'code128',
        text: v.barcode,
        scale: 2,
        height: 8,
        includetext: false,
        textxalign: 'center',
        backgroundcolor: 'FFFFFF',
        padding: 0
      });
      
      // Draw label box
      doc.rect(x, y, labelWidth, labelHeight).stroke();
      
      // Layout horizontal: Semua teks rata tengah dengan jarak yang lebih lega
      
      // 1. Nama produk - font 4pt, di bagian atas, rata tengah
      doc.fontSize(4).font('Helvetica-Bold').text(namaProduk, x + 1, y + 2, { 
        width: labelWidth - 2, 
        align: 'center' 
      });
      
      // 2. Ukuran - font 3pt, di bawah nama produk, rata tengah
      if (v.size && v.size !== '-') {
        doc.fontSize(3).font('Helvetica').text(`${v.size}`, x + 1, y + 6, { 
          width: labelWidth - 2, 
          align: 'center' 
        });
      }
      
      // 3. Barcode image - di bagian bawah, rata tengah
      const barcodeWidth = 14 * mmToPoints;   // 14 mm area barcode
      const barcodeHeight = 3 * mmToPoints;   // 3 mm area barcode
      const barcodeX = x + (labelWidth - barcodeWidth) / 2; // Posisi di tengah horizontal
      const barcodeY = y + 10; // Posisi di bawah nama dan ukuran dengan jarak lebih lega
      doc.image(png, barcodeX, barcodeY, { 
        width: barcodeWidth, 
        height: barcodeHeight 
      });
      
      // 4. Barcode text (ID) - font 3pt, di bawah barcode, rata tengah
      doc.fontSize(3).font('Helvetica').text(v.barcode, x + 1, barcodeY + barcodeHeight + 2, { 
        width: labelWidth - 2, 
        align: 'center' 
      });
      
      // Pindah ke label berikutnya
      col++;
      if (col >= labelsPerRow) {
        col = 0;
        x = 5;
        y += labelHeight + labelMargin;
        
        // Cek apakah perlu halaman baru
        if (y + labelHeight > 842) { // A4 height = 842 points
          doc.addPage();
          y = 5;
        }
      } else {
        x += labelWidth + labelMargin;
      }
    }
    
    doc.end();
  } catch (err) {
    console.error('PRINT BARCODES HORIZONTAL ERROR:', err);
    res.status(500).json({ message: 'Gagal generate barcode horizontal', error: err.message });
  }
};

const getLowStockProducts = async (req, res) => {
  try {
    // Get products with total stock <= 10
    const [rows] = await db.query(`
      SELECT p.product_id, p.product_name, 
             COALESCE(SUM(pv.stock_quantity), 0) as total_stock
      FROM products p
      LEFT JOIN product_variants pv ON p.product_id = pv.product_id
      GROUP BY p.product_id, p.product_name
      HAVING total_stock <= 10
      ORDER BY total_stock ASC
      LIMIT 10
    `);
    
    res.json({
      count: rows.length,
      products: rows
    });
  } catch (err) {
    console.error('GET LOW STOCK PRODUCTS ERROR:', err);
    res.status(500).json({ message: 'Gagal mengambil produk stok rendah', error: err.message });
  }
};

// Update stock for a specific product variant
const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { variant_size, stock_quantity, action } = req.body;
    
    console.log('UPDATE STOCK REQUEST:', { id, variant_size, stock_quantity, action });
    
    if (!variant_size || stock_quantity === undefined || !action) {
      return res.status(400).json({ 
        message: 'variant_size, stock_quantity, dan action harus diisi' 
      });
    }
    
    // Get current stock - check both product_variants and products tables
    const [currentStock] = await db.query(
      `SELECT pv.stock_quantity, pv.variant_id, pv.size 
       FROM product_variants pv 
       WHERE pv.product_id = ? AND pv.size = ?`,
      [id, variant_size]
    );
    
    console.log('CURRENT STOCK QUERY RESULT:', currentStock);
    
    if (currentStock.length === 0) {
      // Try to find variant by product_id only (for accessories without size)
      const [variantCheck] = await db.query(
        `SELECT pv.stock_quantity, pv.variant_id, pv.size 
         FROM product_variants pv 
         WHERE pv.product_id = ?`,
        [id]
      );
      
      if (variantCheck.length === 0) {
        return res.status(404).json({ 
          message: 'Produk atau varian tidak ditemukan. Pastikan produk sudah memiliki varian.' 
        });
      }
      
      // Use the first variant found
      const variant = variantCheck[0];
      console.log('USING EXISTING VARIANT:', variant);
      
      let newStock;
      const currentQuantity = variant.stock_quantity || 0;
      
      switch (action) {
        case 'add':
          newStock = currentQuantity + stock_quantity;
          break;
        case 'subtract':
          newStock = Math.max(0, currentQuantity - stock_quantity);
          break;
        case 'set':
          newStock = stock_quantity;
          break;
        default:
          return res.status(400).json({ 
            message: 'Action harus add, subtract, atau set' 
          });
      }
      
      // Update stock for the found variant
      await db.query(
        `UPDATE product_variants 
         SET stock_quantity = ?, updated_at = NOW() 
         WHERE variant_id = ?`,
        [newStock, variant.variant_id]
      );
      
      console.log('STOCK UPDATED FOR VARIANT:', { variant_id: variant.variant_id, old_stock: currentQuantity, new_stock: newStock });
      
      res.json({ 
        message: 'Stok berhasil diupdate', 
        product_id: id,
        variant_id: variant.variant_id,
        variant_size: variant.size,
        old_stock: currentQuantity,
        new_stock: newStock,
        action
      });
      return;
    }
    
    // Original logic for products with specific sizes
    let newStock;
    const currentQuantity = currentStock[0].stock_quantity;
    const variantId = currentStock[0].variant_id;
    
    switch (action) {
      case 'add':
        newStock = currentQuantity + stock_quantity;
        break;
      case 'subtract':
        newStock = Math.max(0, currentQuantity - stock_quantity);
        break;
      case 'set':
        newStock = stock_quantity;
        break;
      default:
        return res.status(400).json({ 
          message: 'Action harus add, subtract, atau set' 
        });
    }
    
    // Update stock
    await db.query(
      `UPDATE product_variants 
       SET stock_quantity = ?, updated_at = NOW() 
       WHERE variant_id = ?`,
      [newStock, variantId]
    );
    
    console.log('STOCK UPDATED:', { variant_id: variantId, old_stock: currentQuantity, new_stock: newStock });
    
    res.json({ 
      message: 'Stok berhasil diupdate', 
      product_id: id,
      variant_id: variantId,
      variant_size,
      old_stock: currentQuantity,
      new_stock: newStock,
      action
    });
    
  } catch (err) {
    console.error('UPDATE STOCK ERROR:', err);
    res.status(500).json({ 
      message: 'Gagal update stok', 
      error: err.message 
    });
  }
};

// Create default placeholder image for products without images
const createDefaultImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const [productRows] = await db.query('SELECT product_id, product_name FROM products WHERE product_id = ?', [id]);
    if (productRows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }
    
    // Check if product already has images
    const [imageRows] = await db.query('SELECT COUNT(*) as count FROM product_images WHERE product_id = ?', [id]);
    if (imageRows[0].count > 0) {
      return res.status(400).json({ message: 'Produk sudah memiliki gambar' });
    }
    
    // Create a simple SVG placeholder image
    const svgContent = `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#f3f4f6"/>
      <text x="100" y="100" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#9ca3af">
        ${productRows[0].product_name}
      </text>
      <text x="100" y="120" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="#9ca3af">
        No Image
      </text>
    </svg>`;
    
    // Convert SVG to buffer
    const imageBuffer = Buffer.from(svgContent, 'utf8');
    
    // Add the placeholder image
    const imageId = await productModel.addProductImage(id, imageBuffer, 'image/svg+xml');
    
    res.json({ 
      message: 'Gambar placeholder berhasil dibuat', 
      image_id: imageId,
      product_id: id 
    });
    
  } catch (err) {
    console.error('CREATE DEFAULT IMAGE ERROR:', err);
    res.status(500).json({ 
      message: 'Gagal membuat gambar placeholder', 
      error: err.message 
    });
  }
};

module.exports = { 
  getAll, 
  getById, 
  create, 
  update, 
  remove, 
  uploadImages, 
  getImages, 
  getImageById, 
  addVariant, 
  updateVariant, 
  deleteVariant, 
  deleteImageById, 
  printBarcodesHorizontal, 
  getLowStockProducts,
  updateStock,
  createDefaultImage
}; 