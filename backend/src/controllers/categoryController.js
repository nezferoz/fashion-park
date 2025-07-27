const categoryModel = require('../models/categoryModel');

const getAll = async (req, res) => {
  try {
    const categories = await categoryModel.getAllCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil kategori', error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { category_name, description } = req.body;
    if (!category_name) return res.status(400).json({ message: 'Nama kategori wajib diisi' });
    const id = await categoryModel.createCategory({ category_name, description });
    res.status(201).json({ message: 'Kategori ditambahkan', category_id: id });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menambah kategori', error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { category_name, description } = req.body;
    await categoryModel.updateCategory(id, { category_name, description });
    res.json({ message: 'Kategori diupdate' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal update kategori', error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    await categoryModel.deleteCategory(id);
    res.json({ message: 'Kategori dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal hapus kategori', error: err.message });
  }
};

module.exports = { getAll, create, update, remove }; 