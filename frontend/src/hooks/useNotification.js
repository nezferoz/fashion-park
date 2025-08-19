import { useState, useCallback } from 'react';

const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  // Fungsi untuk menambah notifikasi
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      ...notification,
      show: true
    };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto remove setelah duration
    if (notification.autoClose !== false && notification.duration !== 0) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration || 5000);
    }
    
    return id;
  }, []);

  // Fungsi untuk menghapus notifikasi
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  // Fungsi untuk menampilkan notifikasi sukses
  const showSuccess = useCallback((message, title = 'Berhasil', options = {}) => {
    return addNotification({
      type: 'success',
      title,
      message,
      position: 'top-right',
      ...options
    });
  }, [addNotification]);

  // Fungsi untuk menampilkan notifikasi error
  const showError = useCallback((message, title = 'Error', options = {}) => {
    return addNotification({
      type: 'error',
      title,
      message,
      position: 'top-right',
      ...options
    });
  }, [addNotification]);

  // Fungsi untuk menampilkan notifikasi warning
  const showWarning = useCallback((message, title = 'Peringatan', options = {}) => {
    return addNotification({
      type: 'warning',
      title,
      message,
      position: 'top-right',
      ...options
    });
  }, [addNotification]);

  // Fungsi untuk menampilkan notifikasi info
  const showInfo = useCallback((message, title = 'Informasi', options = {}) => {
    return addNotification({
      type: 'info',
      title,
      message,
      position: 'top-right',
      ...options
    });
  }, [addNotification]);

  // Fungsi untuk menampilkan notifikasi toast
  const showToast = useCallback((type, message, title, options = {}) => {
    return addNotification({
      type,
      title,
      message,
      position: 'top-right',
      autoClose: true,
      duration: 3000,
      ...options
    });
  }, [addNotification]);

  // Fungsi untuk menampilkan notifikasi inline
  const showInline = useCallback((type, message, title, options = {}) => {
    return addNotification({
      type,
      title,
      message,
      position: 'inline',
      autoClose: false,
      ...options
    });
  }, [addNotification]);

  // Fungsi untuk membersihkan semua notifikasi
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Fungsi untuk membersihkan notifikasi berdasarkan tipe
  const clearByType = useCallback((type) => {
    setNotifications(prev => prev.filter(notif => notif.type !== type));
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showToast,
    showInline,
    clearAll,
    clearByType
  };
};

export default useNotification;
