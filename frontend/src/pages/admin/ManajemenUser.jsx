import React, { useEffect, useState } from "react";
import api from "../../utils/api";

const ManajemenUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", address: "", phone: "", role: "pelanggan" });
  const [editId, setEditId] = useState(null);
  const [success, setSuccess] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch {
      setError("Gagal mengambil data user");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    setForm({ name: "", email: "", password: "", address: "", phone: "", role: "pelanggan" });
    setEditId(null);
    setShowForm(true);
    setSuccess("");
    setError("");
  };

  const handleEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      address: user.address || "",
      phone: user.phone || "",
      role: user.role || "pelanggan",
    });
    setEditId(user.user_id);
    setShowForm(true);
    setSuccess("");
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin hapus user ini?")) return;
    try {
      await api.delete(`/users/${id}`);
      setSuccess("User berhasil dihapus");
      fetchUsers();
    } catch {
      setError("Gagal menghapus user");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const formData = { ...form };
    if (editId && !formData.password) {
      delete formData.password;
    }

    try {
      if (editId) {
        await api.put(`/users/${editId}`, formData);
        setSuccess("User berhasil diupdate");
      } else {
        await api.post("/users", formData);
        setSuccess("User berhasil ditambah");
      }
      setShowForm(false);
      fetchUsers();
    } catch {
      setError("Gagal menyimpan user");
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 flex-1">
      <div className="bg-white rounded-xl shadow p-8">
        <h2 className="text-2xl font-bold mb-6">Manajemen User</h2>
        {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center">{success}</div>}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</div>}
        <button onClick={handleAdd} className="mb-4 bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition">Tambah User</button>
        <table className="w-full mb-6">
          <thead>
            <tr>
              <th className="text-left">Nama</th>
              <th>Email</th>
              <th>Alamat</th>
              <th>No HP</th>
              <th>Role</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.user_id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.address}</td>
                <td>{user.phone}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => handleEdit(user)} className="text-blue-600 hover:underline mr-2">Edit</button>
                  <button onClick={() => handleDelete(user.user_id)} className="text-red-500 hover:underline">Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded-xl border border-blue-100">
            <div>
              <label className="block font-semibold mb-1">Nama</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block font-semibold mb-1">Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block font-semibold mb-1">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} className="w-full border rounded px-3 py-2" required={!editId} />
              {editId && <small className="text-gray-500">Kosongkan jika tidak ingin mengubah password.</small>}
            </div>
            <div>
              <label className="block font-semibold mb-1">Alamat</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block font-semibold mb-1">No HP</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block font-semibold mb-1">Role</label>
              <select name="role" value={form.role} onChange={handleChange} className="w-full border rounded px-3 py-2" required>
                <option value="pelanggan">Pelanggan</option>
                <option value="admin">Admin</option>
                <option value="kasir">Kasir</option>
                <option value="pemilik">Pemilik</option>
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 transition">Simpan</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-700 px-6 py-2 rounded font-semibold hover:bg-gray-300 transition">Batal</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ManajemenUser; 