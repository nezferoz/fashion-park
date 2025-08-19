import React, { useState } from 'react';
import { Notification, InlineNotification, ToastNotification, StatusNotification } from './index';
import useNotification from '../hooks/useNotification';

const NotificationTest = () => {
  const [showInline, setShowInline] = useState(false);
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Test Komponen Notifikasi</h1>
      
      {/* Test Inline Notifications */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Inline Notifications</h2>
        <div className="space-y-4">
          <button
            onClick={() => setShowInline(!showInline)}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Toggle Inline Notification
          </button>
          
          {showInline && (
            <InlineNotification
              type="success"
              title="Berhasil!"
              message="Ini adalah contoh notifikasi inline yang berhasil"
              onClose={() => setShowInline(false)}
            />
          )}
          
          <InlineNotification
            type="error"
            title="Error!"
            message="Ini adalah contoh notifikasi inline error"
            onClose={() => {}}
          />
          
          <InlineNotification
            type="warning"
            title="Peringatan!"
            message="Ini adalah contoh notifikasi inline warning"
            onClose={() => {}}
          />
          
          <InlineNotification
            type="info"
            title="Informasi!"
            message="Ini adalah contoh notifikasi inline info"
            onClose={() => {}}
          />
        </div>
      </div>

      {/* Test Toast Notifications */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Toast Notifications</h2>
        <div className="flex gap-4">
          <button
            onClick={() => showSuccess('Berhasil!', 'Success', { duration: 3000 })}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Show Success Toast
          </button>
          
          <button
            onClick={() => showError('Error!', 'Error', { duration: 3000 })}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Show Error Toast
          </button>
          
          <button
            onClick={() => showWarning('Warning!', 'Warning', { duration: 3000 })}
            className="bg-yellow-600 text-white px-4 py-2 rounded"
          >
            Show Warning Toast
          </button>
          
          <button
            onClick={() => showInfo('Info!', 'Info', { duration: 3000 })}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Show Info Toast
          </button>
        </div>
      </div>

      {/* Test Status Notifications */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Status Notifications</h2>
        <div className="space-y-4">
          <StatusNotification
            type="success"
            message="Status berhasil diproses"
          />
          
          <StatusNotification
            type="error"
            message="Status error terjadi"
          />
          
          <StatusNotification
            type="warning"
            message="Status warning muncul"
          />
          
          <StatusNotification
            type="info"
            message="Status info ditampilkan"
          />
        </div>
      </div>

      {/* Test Manual Notification */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Manual Notification</h2>
        <Notification
          type="success"
          title="Manual Success"
          message="Ini adalah notifikasi manual yang dapat dikustomisasi"
          position="bottom-right"
          duration={5000}
          onClose={() => console.log('Manual notification closed')}
        />
      </div>
    </div>
  );
};

export default NotificationTest;
