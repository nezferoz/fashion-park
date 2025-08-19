import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { FaKey, FaEye, FaEyeSlash, FaPlus, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

const ApiKeyManagement = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [showPassword, setShowPassword] = useState({});
  const [formData, setFormData] = useState({
    service_name: '',
    api_key: ''
  });

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api-keys');
      setApiKeys(response.data);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      setError('Gagal mengambil data API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingKey) {
        await api.put(`/api-keys/${editingKey.id}`, { api_key: formData.api_key });
        setSuccess('API key berhasil diperbarui');
      } else {
        await api.post('/api-keys', formData);
        setSuccess('API key berhasil ditambahkan');
      }
      setShowAddForm(false);
      setEditingKey(null);
      setFormData({ service_name: '', api_key: '' });
      fetchApiKeys();
    } catch (error) {
      console.error('Error saving API key:', error);
      setError(error.response?.data?.message || 'Gagal menyimpan API key');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menonaktifkan API key ini?')) {
      return;
    }
    try {
      await api.delete(`/api-keys/${id}`);
      setSuccess('API key berhasil dinonaktifkan');
      fetchApiKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      setError('Gagal menonaktifkan API key');
    }
  };

  const handleTestApi = async (serviceName) => {
    try {
      setLoading(true);
      const response = await api.get(`/api-keys/test/${serviceName}`);
      setSuccess(`Test API ${serviceName} berhasil: ${response.data.message}`);
    } catch (error) {
      console.error('Error testing API:', error);
      setError(`Test API ${serviceName} gagal: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (id) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleEdit = (apiKey) => {
    setEditingKey(apiKey);
    setFormData({
      service_name: apiKey.service_name,
      api_key: apiKey.api_key
    });
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingKey(null);
    setFormData({ service_name: '', api_key: '' });
  };

  if (loading && apiKeys.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data API keys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Manajemen API Keys</h1>
            <p className="text-gray-600 mt-2">Kelola API keys untuk layanan eksternal</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <FaPlus />
            Tambah API Key
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingKey ? 'Edit API Key' : 'Tambah API Key Baru'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name
                </label>
                <input
                  type="text"
                  value={formData.service_name}
                  onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Contoh: rajaongkir, midtrans"
                  disabled={editingKey}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="text"
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Masukkan API key"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : (editingKey ? 'Update' : 'Simpan')}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {/* API Keys List */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Daftar API Keys</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    API Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {apiKeys.map((apiKey) => (
                  <tr key={apiKey.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FaKey className="text-blue-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {apiKey.service_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 font-mono">
                          {showPassword[apiKey.id] 
                            ? apiKey.api_key 
                            : apiKey.api_key.substring(0, 8) + '...' + apiKey.api_key.substring(apiKey.api_key.length - 4)
                          }
                        </span>
                        <button
                          onClick={() => togglePasswordVisibility(apiKey.id)}
                          className="ml-2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword[apiKey.id] ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        apiKey.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {apiKey.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(apiKey.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleTestApi(apiKey.service_name)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Test API"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => handleEdit(apiKey)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(apiKey.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManagement; 