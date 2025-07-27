import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix leaflet's default icon path
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function getUserId() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.user_id;
  } catch {
    return null;
  }
}

function MapPicker({ lat, lng, onChange }) {
  const [position, setPosition] = useState(lat && lng ? [lat, lng] : [-6.2, 106.8]);
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onChange(e.latlng.lat, e.latlng.lng);
    }
  });
  return <Marker position={position} />;
}

const Sidebar = ({ tab, setTab, notifCount, children }) => (
  <div className="w-full md:w-64 max-w-xs min-h-[500px] bg-blue-600 flex flex-col items-center py-8 px-4 rounded-2xl shadow-xl mb-6 md:mb-0 md:mr-10">
    <div className="flex flex-col items-center mb-12">
      <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-4xl text-blue-600 mb-3 shadow-lg">
        <span role="img" aria-label="user">👤</span>
      </div>
      <div className="font-bold text-xl mb-1 tracking-wide text-white">Fashion Park</div>
      <div className="text-white text-sm opacity-80">Akun Saya</div>
    </div>
    <nav className="flex-1 w-full space-y-2 mb-8">
      <button onClick={() => setTab('profil')} className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg transition-all duration-200 text-base font-semibold ${tab === 'profil' ? 'bg-white text-blue-700 shadow' : 'text-white hover:bg-blue-500/80'}`}><span role="img" aria-label="Profil">👤</span> Profil</button>
      <button onClick={() => setTab('pesanan')} className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg transition-all duration-200 text-base font-semibold ${tab === 'pesanan' ? 'bg-white text-blue-700 shadow' : 'text-white hover:bg-blue-500/80'}`}><span role="img" aria-label="Pesanan">📦</span> Pesanan & Riwayat</button>
      <button onClick={() => setTab('notifikasi')} className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg transition-all duration-200 text-base font-semibold ${tab === 'notifikasi' ? 'bg-white text-blue-700 shadow' : 'text-white hover:bg-blue-500/80'}`}> <span role="img" aria-label="Notifikasi">🔔</span> Notifikasi {notifCount > 0 && <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-bounce">{notifCount}</span>} </button>
    </nav>
    <div className="w-full mt-auto">
      {children}
    </div>
  </div>
);

const TabProfil = ({ user, editing, form, handleChange, handleEdit, handleCancel, handleSubmit, success, wilayah, onWilayahChange, onMapChange, wilayahLoading, wilayahError, geoLoading, geoError, handleDetectLocation, mapCenter }) => (
  <div className="bg-white rounded-2xl shadow-xl p-10 max-w-2xl mx-auto transition-all duration-300">
    <h2 className="text-2xl font-bold mb-8 text-blue-800 tracking-wide">Profil Saya</h2>
    {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center font-semibold">{success}</div>}
    {editing ? (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-semibold mb-1 text-blue-700">Nama</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} className="w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition" required />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-blue-700">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition" required />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-blue-700">Provinsi</label>
          {wilayahLoading.provinces ? <div>Loading provinsi...</div> : wilayahError.provinces ? <div className="text-red-500 text-sm">{wilayahError.provinces}</div> : (
            <select name="province_id" value={form.province_id || ''} onChange={onWilayahChange} className="w-full border-2 border-blue-100 rounded-lg px-4 py-2" required>
              <option value="">Pilih Provinsi</option>
              {wilayah.provinces.map(p => <option key={p.province_id} value={p.province_id}>{p.province}</option>)}
            </select>
          )}
        </div>
        <div>
          <label className="block font-semibold mb-1 text-blue-700">Kota/Kabupaten</label>
          {wilayahLoading.cities ? <div>Loading kota...</div> : wilayahError.cities ? <div className="text-red-500 text-sm">{wilayahError.cities}</div> : (
            <select name="city_id" value={form.city_id || ''} onChange={onWilayahChange} className="w-full border-2 border-blue-100 rounded-lg px-4 py-2" required disabled={!form.province_id}>
              <option value="">Pilih Kota/Kabupaten</option>
              {wilayah.cities.map(c => <option key={c.city_id} value={c.city_id}>{c.city_name}</option>)}
            </select>
          )}
        </div>
        <div>
          <label className="block font-semibold mb-1 text-blue-700">Kecamatan</label>
          <select name="district_id" value={form.district_id || ''} onChange={onWilayahChange} className="w-full border-2 border-blue-100 rounded-lg px-4 py-2" required disabled={!form.city_id}>
            <option value="">Pilih Kecamatan</option>
            {wilayah.districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-semibold mb-1 text-blue-700">Kode Pos</label>
          <input type="text" name="postal_code" value={form.postal_code || ''} onChange={handleChange} className="w-full border-2 border-blue-100 rounded-lg px-4 py-2" required />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-blue-700">Alamat Detail</label>
          <input type="text" name="address_detail" value={form.address_detail || ''} onChange={handleChange} className="w-full border-2 border-blue-100 rounded-lg px-4 py-2" required />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-blue-700">Pilih Lokasi di Peta</label>
          <div className="flex items-center gap-3 mb-2">
            <button type="button" onClick={handleDetectLocation} className="bg-cyan-500 text-white px-4 py-1 rounded hover:bg-cyan-600 transition disabled:opacity-60" disabled={geoLoading}>
              {geoLoading ? 'Mendeteksi...' : 'Deteksi Lokasi Saya'}
            </button>
            {geoError && <span className="text-red-500 text-sm">{geoError}</span>}
          </div>
          <div className="h-60 w-full rounded-lg overflow-hidden mb-2">
            <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapPicker lat={form.latitude} lng={form.longitude} onChange={onMapChange} />
            </MapContainer>
          </div>
          <div className="text-xs text-gray-500">Klik pada peta atau gunakan tombol di atas untuk memilih lokasi. Lat: {form.latitude || '-'} | Lng: {form.longitude || '-'}</div>
        </div>
        <div>
          <label className="block font-semibold mb-1 text-blue-700">No HP</label>
          <input type="text" name="phone" value={form.phone} onChange={handleChange} className="w-full border-2 border-blue-100 rounded-lg px-4 py-2 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition" required />
        </div>
        <div className="flex gap-3 mt-6">
          <button type="submit" className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-8 py-2 rounded-lg font-bold shadow hover:from-blue-600 hover:to-cyan-500 transition">Simpan</button>
          <button type="button" onClick={handleCancel} className="bg-gray-200 text-gray-700 px-8 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">Batal</button>
        </div>
      </form>
    ) : (
      <div className="space-y-5">
        <div><span className="font-semibold text-blue-700">Nama:</span> {user.name}</div>
        <div><span className="font-semibold text-blue-700">Email:</span> {user.email}</div>
        <div><span className="font-semibold text-blue-700">Alamat:</span> {user.address_detail || user.address} <br />
          {user.district_name}, {user.city_name}, {user.province_name}, {user.postal_code} <br />
          <span className="text-xs">Lat: {user.latitude} | Lng: {user.longitude}</span>
        </div>
        <div><span className="font-semibold text-blue-700">No HP:</span> {user.phone}</div>
        <button onClick={handleEdit} className="mt-8 bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-8 py-2 rounded-lg font-bold shadow hover:from-blue-600 hover:to-cyan-500 transition w-full">Edit Profil</button>
      </div>
    )}
  </div>
);

const TabPesanan = ({ userId }) => {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRiwayat = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get('/transactions');
        setRiwayat(res.data);
      } catch {
        setError("Gagal mengambil riwayat pesanan");
      }
      setLoading(false);
    };
    if (userId) fetchRiwayat();
  }, [userId]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-10 transition-all duration-300">
      <h2 className="text-2xl font-bold mb-2 text-blue-800 tracking-wide">Pesanan & Riwayat Transaksi</h2>
      <p className="mb-8 text-gray-600">Lihat status pesanan aktif dan riwayat transaksi Anda di sini.</p>
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">{error}</div>
      ) : riwayat.length === 0 ? (
        <div className="text-center text-gray-500 py-12">Belum ada pesanan</div>
      ) : (
        <table className="w-full mb-6 border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-gradient-to-r from-blue-100 to-cyan-100">
              <th className="text-left rounded-l-xl px-4 py-2">Tanggal</th>
              <th className="text-right px-4 py-2">Total</th>
              <th className="text-center rounded-r-xl px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {riwayat.map((trx) => (
              <tr key={trx.transaction_id} className="bg-white shadow hover:shadow-lg transition rounded-xl">
                <td className="rounded-l-xl px-4 py-2">{trx.transaction_date?.slice(0, 10)}</td>
                <td className="text-right px-4 py-2">Rp{Number(trx.total_amount).toLocaleString()}</td>
                <td className="text-center rounded-r-xl px-4 py-2">
                  {trx.status === 'Selesai' ? <span className="text-green-600 font-bold">✔️ Selesai</span> : trx.status === 'Dikirim' ? <span className="text-blue-600 font-bold">🚚 Dikirim</span> : <span className="text-gray-600">{trx.status || '-'}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const TabNotifikasi = ({ userId, setNotifCount }) => {
  const [notif, setNotif] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotif = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/notifications?user_id=${userId}`);
        setNotif(res.data);
        setNotifCount(res.data.filter(n => !n.is_read).length);
      } catch {
        setError("Gagal mengambil notifikasi");
      }
      setLoading(false);
    };
    if (userId) fetchNotif();
  }, [userId, setNotifCount]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-10 transition-all duration-300">
      <h2 className="text-2xl font-bold mb-8 text-blue-800 tracking-wide">Notifikasi</h2>
      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">{error}</div>
      ) : notif.length === 0 ? (
        <div className="text-center text-gray-500 py-12">Belum ada notifikasi</div>
      ) : (
        <ul className="space-y-4">
          {notif.map((n) => (
            <li key={n.notification_id} className={`border-b pb-2 flex items-center gap-3 ${n.is_read ? 'opacity-60' : ''}`}>
              <span className={`text-xl ${n.type === 'order' ? 'text-blue-500' : n.type === 'promo' ? 'text-pink-500' : 'text-gray-400'}`}>{n.type === 'order' ? '📦' : n.type === 'promo' ? '🎉' : '🔔'}</span>
              <div>
                <div className="font-semibold">{n.message}</div>
                <div className="text-xs text-gray-500">{new Date(n.created_at).toLocaleString()}</div>
              </div>
              {!n.is_read && <span className="ml-auto bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">Baru</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const Profile = () => {
  const userId = getUserId();
  if (!userId) {
    window.location.href = '/login';
    return null;
  }
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "", email: "", address: "", phone: "",
    province_id: '', province_name: '', city_id: '', city_name: '',
    district_id: '', district_name: '', postal_code: '', address_detail: '',
    latitude: '', longitude: ''
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tab, setTab] = useState("profil");
  const [notifCount, setNotifCount] = useState(0);
  const [wilayah, setWilayah] = useState({ provinces: [], cities: [], districts: [] });
  const [wilayahLoading, setWilayahLoading] = useState({ provinces: false, cities: false });
  const [wilayahError, setWilayahError] = useState({ provinces: '', cities: '' });
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');
  const [mapCenter, setMapCenter] = useState([form.latitude || -6.2, form.longitude || 106.8]);

  // Polling notif count real-time
  useEffect(() => {
    let interval;
    async function fetchNotifCount() {
      if (userId) {
        try {
          const res = await api.get(`/notifications?user_id=${userId}`);
          setNotifCount(res.data.filter(n => !n.is_read).length);
        } catch {
          setNotifCount(0);
        }
      } else {
        setNotifCount(0);
      }
    }
    fetchNotifCount();
    interval = setInterval(fetchNotifCount, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/users/${userId}`);
        setUser(res.data);
        setForm(f => ({
          ...f,
          name: res.data.name || "",
          email: res.data.email || "",
          address: res.data.address || "",
          phone: res.data.phone || "",
          province_id: res.data.province_id || '',
          province_name: res.data.province_name || '',
          city_id: res.data.city_id || '',
          city_name: res.data.city_name || '',
          district_id: res.data.district_id || '',
          district_name: res.data.district_name || '',
          postal_code: res.data.postal_code || '',
          address_detail: res.data.address_detail || '',
          latitude: res.data.latitude || '',
          longitude: res.data.longitude || ''
        }));
        setWilayah(w => ({ ...w, cities: res.data.province ? res.data.province.cities : [], districts: res.data.city ? res.data.city.districts : [] }));
      } catch {
        setError("Gagal mengambil data profil");
      }
      setLoading(false);
    };
    fetchProfile();
  }, [userId]);

  useEffect(() => {
    if (editing) {
      setWilayahLoading(w => ({ ...w, provinces: true }));
      api.get('/rajaongkir/provinces')
        .then(res => setWilayah(w => ({ ...w, provinces: res.data })))
        .catch(() => setWilayahError(e => ({ ...e, provinces: 'Gagal mengambil data provinsi' })))
        .finally(() => setWilayahLoading(w => ({ ...w, provinces: false })));
    }
  }, [editing]);

  useEffect(() => {
    if (form.province_id) {
      setWilayahLoading(w => ({ ...w, cities: true }));
      api.get(`/rajaongkir/cities?province_id=${form.province_id}`)
        .then(res => setWilayah(w => ({ ...w, cities: res.data })))
        .catch(() => setWilayahError(e => ({ ...e, cities: 'Gagal mengambil data kota' })))
        .finally(() => setWilayahLoading(w => ({ ...w, cities: false })));
    } else {
      setWilayah(w => ({ ...w, cities: [] }));
    }
  }, [form.province_id]);

  useEffect(() => {
    if (form.latitude && form.longitude) {
      setMapCenter([form.latitude, form.longitude]);
    }
  }, [form.latitude, form.longitude]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = () => {
    setEditing(true);
    setSuccess("");
    setError("");
  };

  const handleCancel = () => {
    setEditing(false);
    setForm({
      name: user.name || "",
      email: user.email || "",
      address: user.address || "",
      phone: user.phone || "",
      province_id: user.province_id || '',
      province_name: user.province_name || '',
      city_id: user.city_id || '',
      city_name: user.city_name || '',
      district_id: user.district_id || '',
      district_name: user.district_name || '',
      postal_code: user.postal_code || '',
      address_detail: user.address_detail || '',
      latitude: user.latitude || '',
      longitude: user.longitude || ''
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await api.put(`/users/${userId}`, form);
      setUser({ ...user, ...form });
      setEditing(false);
      setSuccess("Profil berhasil diperbarui!");
    } catch (err) {
      setError("Gagal memperbarui profil");
    }
    setLoading(false);
  };

  const onWilayahChange = (e) => {
    const { name, value } = e.target;
    let next = { ...form, [name]: value };
    if (name === 'province_id') {
      const prov = wilayah.provinces.find(p => p.province_id == value);
      next.province_name = prov?.province || '';
      next.city_id = '';
      next.city_name = '';
      next.district_id = '';
      next.district_name = '';
      setWilayah(w => ({ ...w, cities: [] }));
    } else if (name === 'city_id') {
      const city = wilayah.cities.find(c => c.city_id == value);
      next.city_name = city?.city_name || '';
      next.district_id = '';
      next.district_name = '';
    }
    setForm(next);
  };
  const onMapChange = (lat, lng) => {
    setForm(f => ({ ...f, latitude: lat, longitude: lng }));
  };

  const handleDetectLocation = () => {
    setGeoLoading(true);
    setGeoError('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm(f => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
          setMapCenter([pos.coords.latitude, pos.coords.longitude]);
          setGeoLoading(false);
        },
        (err) => {
          setGeoError('Gagal mendeteksi lokasi: ' + err.message);
          setGeoLoading(false);
        }
      );
    } else {
      setGeoError('Browser tidak mendukung geolokasi');
      setGeoLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (error) return <div className="text-center text-red-500 py-12">{error}</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-1 flex flex-col md:flex-row gap-10 container mx-auto px-4 py-12">
        <Sidebar tab={tab} setTab={setTab} notifCount={notifCount}>
          <button
            onClick={handleLogout}
            className="mt-8 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition w-full font-bold text-lg shadow"
          >
            Logout
          </button>
        </Sidebar>
        <div className="flex-1 flex justify-center items-start">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 md:p-10">
            {tab === 'profil' && (
              <TabProfil
                user={user}
                editing={editing}
                form={form}
                handleChange={handleChange}
                handleEdit={handleEdit}
                handleCancel={handleCancel}
                handleSubmit={handleSubmit}
                success={success}
                wilayah={wilayah}
                onWilayahChange={onWilayahChange}
                onMapChange={onMapChange}
                wilayahLoading={wilayahLoading}
                wilayahError={wilayahError}
                geoLoading={geoLoading}
                geoError={geoError}
                handleDetectLocation={handleDetectLocation}
                mapCenter={mapCenter}
              />
            )}
            {tab === 'pesanan' && <TabPesanan userId={userId} />}
            {tab === 'notifikasi' && <TabNotifikasi userId={userId} setNotifCount={setNotifCount} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 