import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { FaEdit, FaTrash, FaPlus, FaEye, FaToggleOn, FaToggleOff, FaFilter } from "react-icons/fa";

const ManajemenUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filterRole, setFilterRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "pelanggan"
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Gagal mengambil data user");
    }
    setLoading(false);
  };

  const handleAdd = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      role: "pelanggan"
    });
    setShowAddModal(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: "",
      phone: user.phone || "",
      address: user.address || "",
      role: user.role || "pelanggan"
    });
    setShowEditModal(true);
  };

  const handleDetail = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      try {
        await api.delete(`/users/${userId}`);
        fetchUsers();
      } catch (err) {
        alert("Gagal menghapus user");
      }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await api.patch(`/users/${userId}/status`, {
        isActive: !currentStatus
      });
      fetchUsers();
    } catch (err) {
      alert("Gagal mengubah status user");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (showEditModal) {
        // Jika password kosong, hapus dari data yang dikirim
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await api.put(`/users/${selectedUser.userId}`, updateData);
      } else {
        await api.post("/users", formData);
      }
      setShowAddModal(false);
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      alert("Gagal menyimpan user");
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: "bg-purple-100 text-purple-800",
      owner: "bg-red-100 text-red-800",
      kasir: "bg-green-100 text-green-800",
      pelanggan: "bg-blue-100 text-blue-800"
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role] || "bg-gray-100 text-gray-800"}`}>
        {role}
      </span>
    );
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
        {isActive ? "Aktif" : "Nonaktif"}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter dan search users
  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getRoleDescription = (role) => {
    const descriptions = {
      admin: "Administrator - Akses penuh ke semua fitur sistem dan manajemen user",
      kasir: "Kasir - Akses ke transaksi dan manajemen pesanan",
      pelanggan: "Pelanggan - Akses ke pembelian dan riwayat belanja"
    };
    return descriptions[role] || "Role tidak dikenal";
  };

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="bg-white rounded-xl shadow p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Manajemen User</h2>
          <button 
            onClick={handleAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <FaPlus /> Tambah User
          </button>
        </div>

        {/* Filter dan Search */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cari user berdasarkan nama atau email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Role</option>
              <option value="admin">Admin</option>
              <option value="kasir">Kasir</option>
              <option value="pelanggan">Pelanggan</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat data user...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 font-semibold">{error}</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">No</th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Nama</th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">Role</th>
                  <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Telepon</th>
                  <th className="border border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-700">Alamat</th>
                  <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">Tanggal Daftar</th>
                  <th className="border border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="border border-gray-200 px-4 py-8 text-center text-gray-500">
                      {searchTerm || filterRole !== "all" ? "Tidak ada user yang sesuai dengan filter" : "Belum ada data user"}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => (
                    <tr key={user.userId} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                      <td className="border border-gray-200 px-4 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">{user.email}</td>
                      <td className="border border-gray-200 px-4 py-3 text-center">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-center">
                        {getStatusBadge(user.isActive)}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                        {user.phone || "-"}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={user.address || "-"}>
                          {user.address || "-"}
                        </div>
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-sm text-gray-900 text-center">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="border border-gray-200 px-4 py-3 text-center">
                        <div className="flex space-x-2 justify-center">
                          <button 
                            onClick={() => handleDetail(user)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium px-2 py-1 rounded bg-blue-100 hover:bg-blue-200 transition"
                            title="Detail"
                          >
                            <FaEye />
                          </button>
                          <button 
                            onClick={() => handleEdit(user)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium px-2 py-1 rounded bg-green-100 hover:bg-green-200 transition"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(user.userId, user.isActive)}
                            className={`text-sm font-medium px-2 py-1 rounded transition ${
                              user.isActive 
                                ? "text-orange-600 hover:text-orange-800 bg-orange-100 hover:bg-orange-200" 
                                : "text-green-600 hover:text-green-800 bg-green-100 hover:bg-green-200"
                            }`}
                            title={user.isActive ? "Nonaktifkan" : "Aktifkan"}
                          >
                            {user.isActive ? <FaToggleOff /> : <FaToggleOn />}
                          </button>
                          <button 
                            onClick={() => handleDelete(user.userId)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 rounded bg-red-100 hover:bg-red-200 transition"
                            title="Hapus"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">
                {showAddModal ? "Tambah User" : "Edit User"}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {showAddModal ? "Password" : "Password (kosongkan jika tidak diubah)"}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={showAddModal}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pelanggan">Pelanggan</option>
                    <option value="kasir">Kasir</option>
                    <option value="admin">Admin</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">{getRoleDescription(formData.role)}</p>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    {showAddModal ? "Tambah User" : "Update User"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                    }}
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-lg font-bold mb-4">Detail User</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Nama:</span>
                  <span>{selectedUser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Email:</span>
                  <span>{selectedUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Role:</span>
                  <span>{getRoleBadge(selectedUser.role)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Deskripsi Role:</span>
                  <span className="text-right max-w-xs text-sm text-gray-600">{getRoleDescription(selectedUser.role)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span>{getStatusBadge(selectedUser.isActive)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Telepon:</span>
                  <span>{selectedUser.phone || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Alamat:</span>
                  <span className="text-right max-w-xs">{selectedUser.address || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Tanggal Daftar:</span>
                  <span>{formatDate(selectedUser.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Terakhir Update:</span>
                  <span>{formatDate(selectedUser.updatedAt)}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManajemenUser; 