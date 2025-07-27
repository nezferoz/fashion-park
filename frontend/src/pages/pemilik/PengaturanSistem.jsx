import React from 'react';
import { FaSave, FaStore, FaKey, FaTruck, FaPercentage } from 'react-icons/fa';

const PengaturanSistem = () => {

  const SettingSection = ({ title, icon, children }) => (
    <div className="bg-white p-8 rounded-2xl shadow-lg mb-8">
      <div className="flex items-center text-2xl font-bold text-gray-800 mb-6">
        {icon}
        <h2 className="ml-4">{title}</h2>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );

  const InputField = ({ label, type = 'text', name, defaultValue, helpText }) => (
    <div>
      <label htmlFor={name} className="block text-lg font-semibold text-gray-700 mb-2">{label}</label>
      <input 
        type={type} 
        id={name} 
        name={name}
        defaultValue={defaultValue}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {helpText && <p className="text-sm text-gray-500 mt-2">{helpText}</p>}
    </div>
  );

  return (
    <div className="flex-1 p-8 bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">Pengaturan Sistem</h1>
        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center gap-2 text-lg">
          <FaSave />
          Simpan Perubahan
        </button>
      </div>
      
      <SettingSection title="Informasi Toko" icon={<FaStore className="text-blue-600" />}>
        <InputField label="Nama Toko" name="store_name" defaultValue="Fashion Park" />
        <InputField label="Alamat Toko" name="store_address" defaultValue="Jl. Sudirman No. 123, Jakarta" />
        <InputField label="Email Kontak" name="store_email" type="email" defaultValue="kontak@fashionpark.com" />
      </SettingSection>

      <SettingSection title="Integrasi Pembayaran" icon={<FaKey className="text-blue-600" />}>
        <InputField label="API Key Midtrans" name="midtrans_api_key" type="password" defaultValue="a_very_secret_key" helpText="Kunci ini digunakan untuk menghubungkan dengan payment gateway."/>
        <InputField label="Client Key Midtrans" name="midtrans_client_key" type="password" defaultValue="another_secret_key" />
      </SettingSection>

      <SettingSection title="Pengaturan Pajak & Pengiriman" icon={<FaPercentage className="text-blue-600" />}>
        <InputField label="Persentase Pajak (PPN)" name="tax_rate" type="number" defaultValue="11" helpText="Masukkan nilai dalam persen (%)." />
        <InputField label="Biaya Pengiriman Flat" name="shipping_cost" type="number" defaultValue="20000" helpText="Biaya pengiriman tetap untuk semua pesanan." />
      </SettingSection>

    </div>
  );
};

export default PengaturanSistem; 